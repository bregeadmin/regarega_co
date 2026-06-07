/* rega-map.js — shared Google Maps renderer for rega rega + bre.
   Framework-agnostic vanilla JS, no build step. Exposes window.RegaMap.
   The caller is responsible for loading the Google Maps JS API and pointing
   its &callback= at a function that calls RegaMap.stays()/RegaMap.single().

   Coordinates come from the shared Supabase record, so the same flat renders
   identically on every surface; edit lat/lng once -> all sites update.

   stays() returns a small controller: { map, locate(), setFilter(fn),
   clearFilter(), refit() } so a page can wire "near me" / "open now" chrome. */
(function () {
  // cream brand style (matches site palette; orange pins, muted POIs)
  var STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#f4f0e7' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6b6256' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f4f0e7' }, { weight: 2 }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cdd9dd' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8aa0a6' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#efe2d2' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dde6d4' }] },
    { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi', elementType: 'labels.icon', stylers: [{ saturation: -50 }, { lightness: 5 }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] }
  ];

  function icon(d, r, fill, stroke) {
    fill = fill || '#ff5e1a'; stroke = stroke || '#ffffff';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + d + '" height="' + d +
      '" viewBox="0 0 ' + d + ' ' + d + '"><circle cx="' + (d / 2) + '" cy="' + (d / 2) +
      '" r="' + r + '" fill="' + fill + '" stroke="' + stroke + '" stroke-width="2.5"/></svg>';
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(d, d),
      anchor: new google.maps.Point(d / 2, d / 2)
    };
  }
  function dot(on, fill, stroke) { return on ? icon(26, 10, fill, stroke) : icon(18, 7, fill, stroke); }

  // "you are here" marker — blue, with a soft halo so it reads as the viewer
  function userIcon() {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 34 34">' +
      '<circle cx="17" cy="17" r="15" fill="#3D5AFE" opacity="0.16"/>' +
      '<circle cx="17" cy="17" r="7" fill="#3D5AFE" stroke="#ffffff" stroke-width="3"/></svg>';
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(34, 34), anchor: new google.maps.Point(17, 17)
    };
  }

  // free walking-directions deep-link to a coordinate
  function directionsUrl(lat, lng) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      lat + ',' + lng + '&travelmode=walking';
  }

  /* shared "open now" evaluator. hours = array of "Monday: 9:00 AM - 5:00 PM"
     strings (Google Places style). Evaluated in Asia/Tbilisi. Returns true/false;
     returns null when there are no hours to judge (caller decides how to treat). */
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  function pt(s) { var m = s.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i); if (!m) return null; var h = (+m[1]) % 12; if (/pm/i.test(m[3])) h += 12; return h * 60 + (+m[2]); }
  function ranges(str) {
    if (!str || /closed/i.test(str)) return [];
    if (/24/.test(str) && /hour/i.test(str)) return [{ o: 0, c: 1440 }];
    return str.split(',').map(function (r) {
      var p = r.split(/[–—-]/); if (p.length < 2) return null;
      var o = pt(p[0]), c = pt(p[1]); if (o == null || c == null) return null;
      if (c <= o) c += 1440; return { o: o, c: c };
    }).filter(Boolean);
  }
  function isOpenNow(hours) {
    if (!hours || !hours.length) return null;
    var map = {};
    hours.forEach(function (line) { var i = line.indexOf(':'); if (i < 0) return; map[line.slice(0, i).trim()] = line.slice(i + 1).trim(); });
    var now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tbilisi' }));
    var dow = now.getDay(), t = now.getHours() * 60 + now.getMinutes();
    function chk(d, tt) { var rs = ranges(map[DAYS[d]]); for (var i = 0; i < rs.length; i++) { if (tt >= rs[i].o && tt < rs[i].c) return true; } return false; }
    return chk(dow, t) || chk((dow + 6) % 7, t + 1440);
  }

  /* multi-pin list map. data = [{slug,title,lat,lng,photo,href,sub,cta,color,ring,...}].
     opts: { cardSel:'.apts .apt', resizeBtn:'viewMap', zoom, center }
     returns { map, markers, locate(cb), setFilter(fn), clearFilter(), refit() } */
  function stays(elId, data, opts) {
    opts = opts || {};
    var cardSel = opts.cardSel || '.apts .apt';
    var elc = document.getElementById(elId);
    if (!elc || elc.dataset.init) return; elc.dataset.init = '1';
    var map = new google.maps.Map(elc, {
      center: opts.center || { lat: 41.64, lng: 41.62 }, zoom: opts.zoom || 13, disableDefaultUI: true,
      zoomControl: true, gestureHandling: 'greedy', clickableIcons: false, styles: STYLE
    });
    var info = new google.maps.InfoWindow();
    var canHover = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
    var closeT = null;
    function shut() { clearTimeout(closeT); closeT = setTimeout(function () { info.close(); }, 160); }
    google.maps.event.addListener(info, 'domready', function () {
      var el = document.querySelector('.gm-style-iw .map-mini');
      if (el) { el.addEventListener('mouseenter', function () { clearTimeout(closeT); }); el.addEventListener('mouseleave', shut); }
    });
    var byslug = {};
    var markers = [];
    function card(s) { return document.querySelector(cardSel + '[data-slug="' + s + '"]'); }
    data.forEach(function (a) {
      if (a.lat == null || a.lng == null) return;
      var fill = a.color || '#ff5e1a', stroke = a.ring || '#ffffff';
      var pos = { lat: a.lat, lng: a.lng };
      var m = new google.maps.Marker({ position: pos, map: map, icon: dot(false, fill, stroke), title: a.title, zIndex: 1 });
      byslug[a.slug] = { m: m, fill: fill, stroke: stroke };
      markers.push({ m: m, item: a, fill: fill, stroke: stroke, pos: pos, on: true });
      var html = '<a class="map-mini" href="' + a.href + '"><div class="mm-ph"><img src="' + a.photo + '" alt=""></div><div class="mm-info"><h5>' + a.title + '</h5><div class="mm-sub">' + a.sub + '</div><div class="mm-cta">' + a.cta + ' →</div></div></a>';
      function on() { m.setIcon(dot(true, fill, stroke)); m.setZIndex(20); var c = card(a.slug); if (c) c.classList.add('active'); }
      function off() { m.setIcon(dot(false, fill, stroke)); m.setZIndex(1); var c = card(a.slug); if (c) c.classList.remove('active'); }
      if (canHover) {
        m.addListener('mouseover', function () { clearTimeout(closeT); on(); info.setContent(html); info.open(map, m); });
        m.addListener('mouseout', function () { off(); shut(); });
        m.addListener('click', function () { window.location.href = a.href; });
      } else {
        m.addListener('click', function () { on(); info.setContent(html); info.open(map, m); });
      }
    });

    function refit(extra) {
      var b = new google.maps.LatLngBounds(), n = 0;
      markers.forEach(function (mk) { if (mk.on) { b.extend(mk.pos); n++; } });
      if (extra) { b.extend(extra); n++; }
      if (n === 1 && !extra) { map.setCenter(markers.filter(function (m) { return m.on; })[0].pos); map.setZoom(15); }
      else if (n > 0) map.fitBounds(b, 64);
    }
    refit();

    document.querySelectorAll(cardSel + '[data-slug]').forEach(function (c) {
      var ref = byslug[c.dataset.slug]; if (!ref) return;
      c.addEventListener('mouseenter', function () { ref.m.setIcon(dot(true, ref.fill, ref.stroke)); ref.m.setZIndex(20); });
      c.addEventListener('mouseleave', function () { ref.m.setIcon(dot(false, ref.fill, ref.stroke)); ref.m.setZIndex(1); });
    });
    window.__staysMap = map;
    var mb = document.getElementById(opts.resizeBtn || 'viewMap');
    if (mb) mb.addEventListener('click', function () { setTimeout(function () { google.maps.event.trigger(map, 'resize'); refit(); }, 120); });

    var userMarker = null;
    function setFilter(fn) {
      markers.forEach(function (mk) { var vis = !!fn(mk.item); mk.on = vis; mk.m.setMap(vis ? map : null); });
      refit(userMarker ? userMarker.getPosition() : null);
    }
    function clearFilter() { markers.forEach(function (mk) { mk.on = true; mk.m.setMap(map); }); refit(userMarker ? userMarker.getPosition() : null); }
    function locate(cb) {
      if (!navigator.geolocation) { if (cb) cb(null, 'unsupported'); return; }
      navigator.geolocation.getCurrentPosition(function (p) {
        var u = { lat: p.coords.latitude, lng: p.coords.longitude };
        if (userMarker) userMarker.setPosition(u);
        else userMarker = new google.maps.Marker({ position: u, map: map, icon: userIcon(), title: 'you are here', zIndex: 40 });
        // frame the viewer + their nearest few visible spots
        var vis = markers.filter(function (m) { return m.on; })
          .map(function (m) { return { m: m, d: Math.pow(m.pos.lat - u.lat, 2) + Math.pow(m.pos.lng - u.lng, 2) }; })
          .sort(function (a, b) { return a.d - b.d; }).slice(0, 6);
        var b = new google.maps.LatLngBounds(); b.extend(u);
        vis.forEach(function (v) { b.extend(v.m.pos); });
        map.fitBounds(b, 70);
        if (cb) cb(u);
      }, function (err) { if (cb) cb(null, err && err.message); }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 });
    }

    return { map: map, markers: markers, locate: locate, setFilter: setFilter, clearFilter: clearFilter, refit: refit };
  }

  /* single-pin apartment map. geo = {lat,lng,title}.
     opts: { zoom:15, routeLabel:'↗ get directions' } — routeLabel adds a
     free walking-directions link right after the map element. */
  function single(elId, geo, opts) {
    opts = opts || {};
    if (!geo || geo.lat == null || geo.lng == null) return;
    var el = document.getElementById(elId); if (!el || el.dataset.init) return; el.dataset.init = '1';
    var pos = { lat: geo.lat, lng: geo.lng };
    var map = new google.maps.Map(el, {
      center: pos, zoom: opts.zoom || 15, disableDefaultUI: true, zoomControl: true,
      gestureHandling: 'cooperative', clickableIcons: false, styles: STYLE
    });
    new google.maps.Marker({ position: pos, map: map, title: geo.title || '', icon: icon(24, 9) });
    if (opts.routeLabel) {
      var a = document.createElement('a');
      a.className = 'map-route';
      a.target = '_blank'; a.rel = 'noopener';
      a.href = directionsUrl(geo.lat, geo.lng);
      a.textContent = opts.routeLabel;
      el.insertAdjacentElement('afterend', a);
    }
  }

  window.RegaMap = { STYLE: STYLE, stays: stays, single: single, directionsUrl: directionsUrl, isOpenNow: isOpenNow };
})();
