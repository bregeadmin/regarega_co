/* rega-map.js — shared Google Maps renderer for rega rega + bre.
   Framework-agnostic vanilla JS, no build step. Exposes window.RegaMap.
   The caller is responsible for loading the Google Maps JS API and pointing
   its &callback= at a function that calls RegaMap.stays()/RegaMap.single().

   Coordinates come from the shared Supabase record, so the same flat renders
   identically on every surface; edit lat/lng once -> all sites update.        */
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

  // free walking-directions deep-link to a coordinate
  function directionsUrl(lat, lng) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' +
      lat + ',' + lng + '&travelmode=walking';
  }

  /* multi-pin list map. data = [{slug,title,lat,lng,photo,href,sub,cta}].
     opts: { cardSel:'.apts .apt', resizeBtn:'viewMap' } */
  function stays(elId, data, opts) {
    opts = opts || {};
    var cardSel = opts.cardSel || '.apts .apt';
    var elc = document.getElementById(elId);
    if (!elc || elc.dataset.init) return; elc.dataset.init = '1';
    var map = new google.maps.Map(elc, {
      center: { lat: 41.64, lng: 41.62 }, zoom: 13, disableDefaultUI: true,
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
    var bounds = new google.maps.LatLngBounds();
    var byslug = {};
    function card(s) { return document.querySelector(cardSel + '[data-slug="' + s + '"]'); }
    data.forEach(function (a) {
      if (a.lat == null || a.lng == null) return;
      var fill = a.color || '#ff5e1a', stroke = a.ring || '#ffffff';
      var m = new google.maps.Marker({ position: { lat: a.lat, lng: a.lng }, map: map, icon: dot(false, fill, stroke), title: a.title, zIndex: 1 });
      byslug[a.slug] = { m: m, fill: fill, stroke: stroke };
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
      bounds.extend({ lat: a.lat, lng: a.lng });
    });
    if (!bounds.isEmpty()) map.fitBounds(bounds, 64);
    document.querySelectorAll(cardSel + '[data-slug]').forEach(function (c) {
      var ref = byslug[c.dataset.slug]; if (!ref) return;
      c.addEventListener('mouseenter', function () { ref.m.setIcon(dot(true, ref.fill, ref.stroke)); ref.m.setZIndex(20); });
      c.addEventListener('mouseleave', function () { ref.m.setIcon(dot(false, ref.fill, ref.stroke)); ref.m.setZIndex(1); });
    });
    window.__staysMap = map;
    var mb = document.getElementById(opts.resizeBtn || 'viewMap');
    if (mb) mb.addEventListener('click', function () { setTimeout(function () { google.maps.event.trigger(map, 'resize'); if (!bounds.isEmpty()) map.fitBounds(bounds, 64); }, 120); });
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

  window.RegaMap = { STYLE: STYLE, stays: stays, single: single, directionsUrl: directionsUrl };
})();
