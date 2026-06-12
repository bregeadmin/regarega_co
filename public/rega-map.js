/* rega-map.js — shared Google Maps renderer for rega rega + bre.
   Framework-agnostic vanilla JS, no build step. Exposes window.RegaMap.
   The caller is responsible for loading the Google Maps JS API and pointing
   its &callback= at a function that calls RegaMap.stays()/RegaMap.single().

   Coordinates come from the shared Supabase record, so the same flat renders
   identically on every surface; edit lat/lng once -> all sites update.

   stays() returns a small controller: { map, locate(), setFilter(fn),
   clearFilter(), refit() } so a page can wire "near me" / "open now" chrome. */
(function () {
  // Vercel image optimizer for runtime-built photo thumbnails (map popups)
  function optImg(u, w) {
    return (u && /^https:\/\/(qkzinjawtumhjbezlyog\.supabase\.co|images\.unsplash\.com|static\.tildacdn\.(?:com|one)|picsum\.photos)\//.test(u))
      ? '/_vercel/image?url=' + encodeURIComponent(u) + '&w=' + (w || 640) + '&q=72'
      : (u || '');
  }
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
  function dot(on, fill, stroke, outline) { var d = on ? 26 : 18, r = on ? 10 : 7; if (outline) return icon(d, r, '#FAF7F0', fill); return icon(d, r, fill, stroke); }

  // certified flat = the LOGO itself (orange holey dot)
  function logoIcon(on) {
    var d = on ? 34 : 26, c = d / 2, R = c - 2, hr = R * 0.24, h = c + R * 0.30;
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + d + '" height="' + d + '" viewBox="0 0 ' + d + ' ' + d + '">' +
      '<circle cx="' + c + '" cy="' + c + '" r="' + R + '" fill="#ff5e1a" stroke="#ffffff" stroke-width="2.5"/>' +
      '<circle cx="' + h + '" cy="' + h + '" r="' + hr + '" fill="#ffffff"/></svg>';
    return { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new google.maps.Size(d, d), anchor: new google.maps.Point(c, c) };
  }

  // airbnb-style price pill marker (used when a pin carries a label, e.g. "GEL 240")
  function priceIcon(text, active) {
    text = String(text);
    var fs = 12.5, padX = 13, h = 30;
    var w = Math.max(42, Math.round(text.length * 7.6) + padX * 2);
    var bg = active ? '#0a0908' : '#ffffff', fg = active ? '#ffffff' : '#0a0908';
    var safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<rect x="1" y="1" width="' + (w - 2) + '" height="' + (h - 2) + '" rx="' + ((h - 2) / 2) + '" fill="' + bg + '" stroke="#0a0908" stroke-width="1.3"/>' +
      '<text x="' + (w / 2) + '" y="' + (h / 2 + 1) + '" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,-apple-system,Arial,sans-serif" font-size="' + fs + '" font-weight="700" fill="' + fg + '">' + safe + '</text></svg>';
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(w, h), anchor: new google.maps.Point(w / 2, h / 2)
    };
  }
  // choose a price pill if the pin has a label, else a coloured dot
  function pick(a, on) {
    if (a.flat) return logoIcon(on);
    var lbl = a.label || a.pill;
    return lbl ? priceIcon(lbl, on) : dot(on, a.color || '#ff5e1a', a.ring || '#ffffff', a.outline);
  }

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

  // custom round zoom controls (replaces Google's blocky default) — used on every map
  function addZoom(map) {
    var plus = '<svg viewBox="0 0 16 16" fill="none"><path d="M8 3.2v9.6M3.2 8h9.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    var minus = '<svg viewBox="0 0 16 16" fill="none"><path d="M3.2 8h9.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
    function btn(svg, label, dz) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'rega-zoom'; b.setAttribute('aria-label', label); b.innerHTML = svg;
      b.addEventListener('click', function () { map.setZoom((map.getZoom() || 13) + dz); });
      return b;
    }
    var wrap = document.createElement('div'); wrap.className = 'rega-zoom-wrap';
    wrap.appendChild(btn(plus, 'zoom in', 1));
    wrap.appendChild(btn(minus, 'zoom out', -1));
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(wrap);
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
      zoomControl: false, fullscreenControl: opts.fullscreen !== false,
      // 'cooperative' for maps embedded mid-page (page scroll must not zoom the map);
      // 'greedy' stays the default for dedicated map views like /stays
      gestureHandling: opts.gesture || 'greedy', clickableIcons: false, styles: STYLE
    });
    addZoom(map);
    var useCluster = !!(opts.cluster && window.markerClusterer && window.markerClusterer.MarkerClusterer);
    var info = new google.maps.InfoWindow({ maxWidth: 280 });
    var openSlug = null, openOff = null;
    map.addListener('click', function () { if (openSlug) { info.close(); if (openOff) openOff(); openSlug = null; openOff = null; } });
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
      var m = new google.maps.Marker({ position: pos, map: useCluster ? null : map, icon: pick(a, false), title: a.title, zIndex: 1 });
      byslug[a.slug] = { m: m, a: a };
      markers.push({ m: m, item: a, fill: fill, stroke: stroke, pos: pos, on: true });
      var html = '<a class="map-mini" href="' + a.href + '"><div class="mm-ph"><img src="' + optImg(a.photo, 640) + '" alt=""></div><div class="mm-info"><h5>' + a.title + '</h5><div class="mm-sub">' + a.sub + '</div><div class="mm-cta">' + a.cta + ' →</div></div></a>';
      function on() { m.setIcon(pick(a, true)); m.setZIndex(20); var c = card(a.slug); if (c) c.classList.add('active'); }
      function off() { m.setIcon(pick(a, false)); m.setZIndex(1); var c = card(a.slug); if (c) c.classList.remove('active'); }
      if (canHover) {
        m.addListener('mouseover', function () { clearTimeout(closeT); on(); info.setContent(html); info.open(map, m); });
        m.addListener('mouseout', function () { off(); shut(); });
        m.addListener('click', function () { window.location.href = a.href; });
      } else {
        m.addListener('click', function () {
          if (openOff) openOff();
          on(); info.setContent(html); info.open(map, m);
          openSlug = a.slug; openOff = off;
        });
      }
    });

    // marker clustering — pins group into branded count-bubbles when zoomed out,
    // and break apart as you zoom in (Airbnb behaviour). Falls back to plain pins
    // if the clusterer library is not present.
    var clusterer = null;
    // flats (the orange logo dots) are the anchor of the map story — they NEVER
    // collapse into count-bubbles; only guide places cluster.
    var noClust = function (m) { return m.item && m.item.flat; };
    function buildCluster() {
      if (clusterer) { try { clusterer.clearMarkers(); clusterer.setMap(null); } catch (e) {} clusterer = null; }
      var copts = {
        map: map, markers: markers.filter(function (m) { return m.on && !noClust(m); }).map(function (x) { return x.m; }),
        renderer: {
          render: function (c) {
            var count = c.count, position = c.position;
            var size = count < 10 ? 40 : count < 30 ? 48 : 56;
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '"><circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + (size / 2 - 2) + '" fill="#0a0908" stroke="#fff" stroke-width="2.5"/></svg>';
            return new google.maps.Marker({
              position: position,
              icon: { url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg), scaledSize: new google.maps.Size(size, size), anchor: new google.maps.Point(size / 2, size / 2) },
              label: { text: String(count), color: '#ffffff', fontSize: '13px', fontFamily: 'JetBrains Mono, monospace', fontWeight: '700' },
              zIndex: 1000 + count
            });
          }
        }
      };
      // clusterMaxZoom: only group into count-bubbles when zoomed OUT to that level or further;
      // at closer zooms every place stays an individual dot (the brand is a dot-map, not bubbles)
      if (opts.clusterMaxZoom != null && markerClusterer.SuperClusterAlgorithm) {
        copts.algorithm = new markerClusterer.SuperClusterAlgorithm({ maxZoom: opts.clusterMaxZoom });
      }
      clusterer = new markerClusterer.MarkerClusterer(copts);
    }
    function applyVisibility() {
      if (clusterer) {
        clusterer.clearMarkers();
        clusterer.addMarkers(markers.filter(function (m) { return m.on && !noClust(m); }).map(function (m) { return m.m; }));
        markers.forEach(function (mk) { if (noClust(mk)) mk.m.setMap(mk.on ? map : null); });
      }
      else { markers.forEach(function (mk) { mk.m.setMap(mk.on ? map : null); }); }
    }
    if (useCluster) { buildCluster(); applyVisibility(); }

    function refit(extra) {
      var b = new google.maps.LatLngBounds(), n = 0;
      markers.forEach(function (mk) { if (mk.on) { b.extend(mk.pos); n++; } });
      if (extra) { b.extend(extra); n++; }
      if (n === 1 && !extra) { map.setCenter(markers.filter(function (m) { return m.on; })[0].pos); map.setZoom(15); }
      else if (n > 0) map.fitBounds(b, 64);
    }
    // opts.frameFlats: open framed on the certified flats ("near your stay" story) instead of
    // fitting every pin — far-flung places would zoom the city out into an unreadable blob.
    // Filter buttons still refit to everything visible.
    if (opts.frameFlats) {
      var fl = markers.filter(function (mk) { return mk.item && mk.item.flat; });
      if (fl.length > 1) {
        // fitBounds (not centroid + fixed zoom): every flat stays inside the frame
        // whatever the container shape — on narrow phones the old way clipped pins.
        // Frame the dense CORE only: a lone far-out flat (e.g. Gonio) must not zoom
        // the whole city out into a blob; it stays reachable by zooming out.
        var lats = fl.map(function (mk) { return mk.pos.lat; }).sort(function (a, b) { return a - b; });
        var lngs = fl.map(function (mk) { return mk.pos.lng; }).sort(function (a, b) { return a - b; });
        var cLat = lats[Math.floor(lats.length / 2)], cLng = lngs[Math.floor(lngs.length / 2)];
        var ds = fl.map(function (mk) { var dy = mk.pos.lat - cLat, dx = mk.pos.lng - cLng; return Math.sqrt(dy * dy + dx * dx); });
        var med = ds.slice().sort(function (a, b) { return a - b; })[Math.floor(ds.length / 2)];
        var lim = Math.max(med * 2.5, 0.03); // ≥ ~3 km always counts as core
        var fb = new google.maps.LatLngBounds(), kept = 0;
        fl.forEach(function (mk, i) { if (ds[i] <= lim) { fb.extend(mk.pos); kept++; } });
        if (kept < 2) fl.forEach(function (mk) { fb.extend(mk.pos); });
        map.fitBounds(fb, 56);
        google.maps.event.addListenerOnce(map, 'idle', function () {
          var fz = opts.frameZoom || 15;
          if ((map.getZoom() || fz) > fz) map.setZoom(fz); // tight group → don't over-zoom
          // the OPENING view stays an individual-dot scatter (brand decision):
          // count-bubbles only appear once the user zooms OUT beyond it
          var z = Math.min(map.getZoom() || fz, fz);
          if (useCluster && opts.clusterMaxZoom != null && opts.clusterMaxZoom >= z) {
            opts.clusterMaxZoom = z - 1;
            buildCluster();
            applyVisibility();
          }
        });
      } else if (fl.length === 1) {
        map.setCenter(fl[0].pos);
        map.setZoom(opts.frameZoom || 15);
      } else refit();
    } else refit();

    document.querySelectorAll(cardSel + '[data-slug]').forEach(function (c) {
      var ref = byslug[c.dataset.slug]; if (!ref) return;
      c.addEventListener('mouseenter', function () { ref.m.setIcon(pick(ref.a, true)); ref.m.setZIndex(20); });
      c.addEventListener('mouseleave', function () { ref.m.setIcon(pick(ref.a, false)); ref.m.setZIndex(1); });
    });
    window.__staysMap = map;
    var mb = document.getElementById(opts.resizeBtn || 'viewMap');
    if (mb) mb.addEventListener('click', function () { setTimeout(function () { google.maps.event.trigger(map, 'resize'); refit(); }, 120); });

    var userMarker = null;
    function setFilter(fn) {
      markers.forEach(function (mk) { mk.on = !!fn(mk.item); });
      applyVisibility();
      refit(userMarker ? userMarker.getPosition() : null);
    }
    function clearFilter() { markers.forEach(function (mk) { mk.on = true; }); applyVisibility(); refit(userMarker ? userMarker.getPosition() : null); }
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
      center: pos, zoom: opts.zoom || 15, disableDefaultUI: true, zoomControl: false,
      gestureHandling: 'cooperative', clickableIcons: false, styles: STYLE
    });
    addZoom(map);
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
