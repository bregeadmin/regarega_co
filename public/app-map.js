/* rega rega app — the map screen «карта со шторкой-списком» (components/app/MapScreen.astro).
   App-only: the site keeps public/rega-map.js. Plain script, data in window.RR_MAP, open-now
   from window.rrHours (public/app-hours.js — the same helper as the home screen).

   - Google Maps (paper style) with our own HTML pins in one OverlayView; the list and the sheet
     never wait for it — no key for this host / offline → an honest note, the list still works.
   - Sheet: low / half / full. Drag the handle (or pull the list down from its top), tap the
     handle to step, the header list button toggles full. Scrolling the list lights up the top
     visible place on the map and gently pans to it. Tap a pin or a card → that place in the
     sheet; «подробнее» → its big card (the photo grows: public/app-gallery.js names it on click).
   - Leave: X, swipe down on the header (the circle shrinks with the finger), Esc. With app
     history → reverse circle (sessionStorage rr_map_back, read by AppHeader on the page we
     return to) + history.back(); direct visit → home.
   - Gestures never start in the left 20px (native edge «back»). Motion: transform / opacity /
     clip-path only; prefers-reduced-motion → no movement.
   Bump ?v= on change (sw.js serves it stale-while-revalidate). */
(function () {
  'use strict';
  var D = window.RR_MAP;
  if (!D) return;
  var RU = D.lang === 'ru';
  var html = document.documentElement;
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var EDGE = 20;
  var IOS = 'cubic-bezier(.32,.72,0,1)';
  var OUT = 'cubic-bezier(.23,1,.32,1)';
  var $ = function (id) { return document.getElementById(id); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var anim = function (el, kf, o) { if (!el || !el.animate || RM.matches) return null; return el.animate(kf, o); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var plural = function (n, a, b, c) { var m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 10 || h >= 20) ? b : c; };
  var put = function (k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  var mp = $('mp'), top = $('mpTop'), bar = $('mpBar'), sh = $('mpSh'), shH = $('mpShH');
  var list = $('mpList'), det = $('mpDet'), chips = $('mpChips');
  var HOME = D.base + '/app/now';

  // Tabler outline icons
  var ICO = {
    chevL: '<path d="M15 6l-6 6l6 6" />',
    arrow: '<path d="M17 7l-10 10" /><path d="M8 7l9 0l0 9" />',
    arrowR: '<path d="M5 12l14 0" /><path d="M13 18l6 -6" /><path d="M13 6l6 6" />',
    walk: '<path d="M13 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" /><path d="M7 21l3 -4" /><path d="M16 21l-2 -4l-3 -3l1 -6" /><path d="M6 12l2 -3l4 -1l3 3l3 1" />',
  };
  var svg = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var MARK = '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill-rule="evenodd" fill="currentColor" d="M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0 z M 64,64 m -12,0 a 12,12 0 1,1 24,0 a 12,12 0 1,1 -24,0 z"/></svg>';
  var L = RU
    ? { all: 'все места', allFlats: 'все квартиры', more: 'подробнее', moreStay: 'подробнее и даты', route: 'маршрут пешком', closed: 'сейчас закрыто',
        stay: 'жильё', flatsSub: 'проверенные квартиры', openNow: 'открыто сейчас', city: 'батуми', none: 'здесь пока пусто',
        locOff: 'геолокация выключена — включи её в настройках', far: 'ты не в батуми — карта остаётся на городе', locWait: 'ищу тебя…' }
    : { all: 'all places', allFlats: 'all flats', more: 'more', moreStay: 'more & dates', route: 'walking route', closed: 'closed now',
        stay: 'stay', flatsSub: 'flats we checked', openNow: 'open now', city: 'batumi', none: 'nothing here yet',
        locOff: 'location is off — turn it on in settings', far: "you're not in batumi — the map stays on the city", locWait: 'finding you…' };

  /* ------------------------------------------------------------ data */
  var T0 = window.rrHours.now();
  var items = [];
  D.places.forEach(function (p) {
    items.push({ kind: 'place', s: p.s, n: p.n, k: p.k, c: p.c, la: p.la, lo: p.lo, w: p.w, q: p.q, P: p.P, o: window.rrHours.openNow(p.h, T0),
      href: D.base + '/app/place/' + encodeURIComponent(p.s) });
  });
  D.stays.forEach(function (a) {
    items.push({ kind: 'stay', s: a.s, n: a.n, k: 'stay', la: a.la, lo: a.lo, w: a.sub, q: a.q, P: a.P, pr: a.pr, pf: a.pf,
      href: D.base + '/app/stays/' + encodeURIComponent(a.s) });
  });
  items.forEach(function (it, i) { it.i = i; });

  // walking origin: the trip's apartment door, or where the guest is (only if ALREADY allowed)
  var trip = window.rrTrip && window.rrTrip.active();
  var origin = trip && trip.apt && trip.apt.lat != null && trip.apt.lng != null ? { lat: trip.apt.lat, lng: trip.apt.lng } : null;
  var me = null;            // the guest's own position (blue dot)
  var minsTo = function (it) { return origin && window.rrTrip ? window.rrTrip.walkFrom(origin, it.la, it.lo) : null; };
  var walkTxt = function (it) {
    var mn = minsTo(it);
    if (mn == null) return '';
    if (mn <= 25) return RU ? mn + ' мин пешком' : mn + ' min walk';
    var km = (mn / 60) * 4.8 / 1.25, k = km < 10 ? km.toFixed(1) : String(Math.round(km));
    return RU ? k.replace('.', ',') + ' км' : k + ' km';
  };
  var farFromBatumi = function (p) { return window.rrTrip.walkFrom(p, 41.6508, 41.6357) > 300; };

  /* ------------------------------------------------------------ state */
  var st = history.state || {};
  var F = 'all', vis = [], cur = -1, detIt = null, state = 'half';
  var q = new URLSearchParams(location.search).get('cat');
  var chipOf = function (f) { return chips.querySelector('[data-f="' + f + '"]'); };
  if (st.rrMap && chipOf(st.rrMap.f)) F = st.rrMap.f;
  else if (q && chipOf(q)) F = q;
  var save = function () {
    try { history.replaceState(Object.assign({}, history.state || {}, { rrMap: { f: F, sheet: state, det: detIt ? detIt.i : null } }), ''); } catch (e) {}
  };

  /* ------------------------------------------------------------ list (the home cards) */
  var rank = function (it) { return it.kind === 'stay' ? 0 : it.o ? 0 : it.o === null ? 1 : 2; };
  function rowHTML(it, k) {
    var tag = it.kind === 'stay'
      ? '<span class="now-tag rr-tag--home"><i></i>' + esc(L.stay) + '</span>'
      : '<span class="now-tag" style="' + esc(D.cats[it.k].st) + '"><i></i>' + esc(it.c) + '</span>';
    return '<button type="button" class="now-pc mp-row" data-i="' + it.i + '" data-k="' + k + '">' +
      '<span class="now-pc__th">' + (it.q ? '<img src="' + esc(it.q) + '" alt="" loading="lazy" decoding="async" onload="this.classList.add(\'is-loaded\')">' : '') + punchHTML(it, true) + '</span>' +
      '<span class="now-pc__tx">' + tag + '<b class="now-pc__name">' + esc(it.n) + '</b>' +
      '<span class="now-pc__hrs">' + hrsHTML(it) + '</span>' +
      (it.w ? '<span class="now-pc__say">' + esc(it.w) + '</span>' : '') + '</span></button>';
  }
  // «мой батуми» mark (public/app-saves.js fills it in). Rows are <button>s → a span with role=button there.
  function punchHTML(it, inRow) {
    var d = ' data-k="' + (it.kind === 'stay' ? 'stay' : 'place') + '" data-s="' + esc(it.s) + '" data-n="' + esc(it.n) + '" data-c="batumi"';
    return inRow ? '<span class="rr-punch" role="button" tabindex="0"' + d + '></span>' : '<button class="rr-punch" type="button"' + d + '></button>';
  }
  function hrsHTML(it) {
    var w = walkTxt(it), out = '';
    if (it.kind === 'stay') out = '<span class="mp-row__price">' + esc(it.pf) + '</span>';
    else if (it.o) out = '<span class="rr-open"><i></i>' + esc(window.rrHours.short(it.o, RU)) + '</span>';
    else if (it.o === false) out = '<span class="rr-open is-closed"><i></i>' + esc(L.closed) + '</span>';
    return out + (w ? '<span class="now-walk">' + esc(w) + '</span>' : '');
  }
  function heading() {
    var n = vis.length, near = origin ? (RU ? ' рядом' : ' nearby') : '';
    if (F === 'stay') {
      $('mpShN').textContent = RU ? n + ' ' + plural(n, 'квартира', 'квартиры', 'квартир') + near : n + (n === 1 ? ' flat' : ' flats') + near;
      $('mpShSub').textContent = L.flatsSub;
      return;
    }
    var open = vis.filter(function (it) { return it.o; }).length;
    $('mpShN').textContent = RU ? n + ' ' + plural(n, 'место', 'места', 'мест') + near : n + (n === 1 ? ' place' : ' places') + near;
    $('mpShSub').textContent = open ? L.openNow + ' · ' + open : L.city + ' · ' + window.rrHours.hhmm(T0.mins);
  }
  function setF(f, keepScroll) {
    F = f;
    [].forEach.call(chips.querySelectorAll('.mp-chip'), function (c) {
      var on = c.getAttribute('data-f') === f;
      c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var on = function (it) { return f === 'all' ? it.kind === 'place' : f === 'stay' ? it.kind === 'stay' : it.k === f; };
    vis = items.filter(on);
    // open first, unknown hours next, closed last; within that nearest first when we know where from
    vis = vis.map(function (it, j) { return { it: it, j: j, r: rank(it), m: minsTo(it) }; })
      .sort(function (a, b) { return (a.r - b.r) || ((a.m == null ? 1e9 : a.m) - (b.m == null ? 1e9 : b.m)) || (a.j - b.j); })
      .map(function (x) { return x.it; });
    list.innerHTML = vis.length ? vis.map(rowHTML).join('') : '<p class="mp-empty">' + esc(L.none) + '</p>';
    // «all»: every pin in colour (flats too); the list under it holds the places
    pins.forEach(function (p) { p.el.classList.toggle('is-dim', f !== 'all' && !on(p.it)); });
    heading();
    if (!keepScroll) list.scrollTop = 0;
    cur = -1;
    unselect();
    save();
  }

  /* ------------------------------------------------------------ sheet: low / half / full */
  var H = function () { return mp.clientHeight; };
  var S = function () { return sh.offsetHeight; };
  var VIS = {
    full: function () { return S(); },
    half: function () { return Math.round(Math.min(S() - 40, Math.max(250, H() * 0.46))); },
    low: function () { return 104 + insetB; },
  };
  var insetB = 0;
  (function () { // env(safe-area-inset-bottom) in px
    var p = document.createElement('div');
    p.style.cssText = 'position:fixed;bottom:0;height:env(safe-area-inset-bottom);visibility:hidden;pointer-events:none';
    document.body.appendChild(p); insetB = p.offsetHeight || 0; p.remove();
  })();
  var visH = function () { return VIS[state](); };
  function setState(s, instant) {
    state = s;
    var v = VIS[s]();
    sh.style.setProperty('--ty', (S() - v) + 'px');
    sh.style.setProperty('--hid', (S() - v) + 'px');
    sh.setAttribute('data-state', s);
    $('mpListBtn').setAttribute('aria-pressed', s === 'full' ? 'true' : 'false');
    $('mpShUp').tabIndex = s === 'low' ? 0 : -1;
    if (instant) { sh.classList.add('is-drag'); void sh.offsetHeight; sh.classList.remove('is-drag'); }
    save();
  }
  function measure() {
    mp.style.setProperty('--top-h', Math.round(top.offsetHeight - 6) + 'px');
  }

  // drag: the handle, or the list pulled down from its very top
  var drag = null;
  function dragStart(y, from) { drag = { y: y, v0: visH(), t: performance.now(), dy: 0, vel: 0, from: from }; sh.classList.add('is-drag'); }
  function dragMove(y) {
    var now = performance.now(), dy = y - drag.y;
    drag.vel = (dy - drag.dy) / Math.max(1, now - drag.t); drag.t = now; drag.dy = dy;
    var v = drag.v0 - dy;
    // rubber band beyond the ends
    if (v > S()) v = S() + (v - S()) * 0.2;
    if (v < 80) v = 80 - (80 - v) * 0.2;
    sh.style.setProperty('--ty', (S() - v) + 'px');
  }
  function dragEnd() {
    var g = drag; drag = null; sh.classList.remove('is-drag');
    if (!g) return;
    if (Math.abs(g.dy) < 5 && g.from === 'handle') { setState(state === 'low' ? 'half' : state === 'half' ? 'full' : 'half'); return; }
    var v = g.v0 - g.dy - g.vel * 140;
    var best = ['low', 'half', 'full'].map(function (s) { return [s, Math.abs(VIS[s]() - v)]; }).sort(function (a, b) { return a[1] - b[1]; })[0][0];
    setState(best);
  }
  shH.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.clientX < EDGE || e.target.closest('button')) return;
    dragStart(e.clientY, 'handle');
    try { shH.setPointerCapture(e.pointerId); } catch (x) {}
  });
  shH.addEventListener('pointermove', function (e) { if (drag && drag.from === 'handle') dragMove(e.clientY); });
  shH.addEventListener('pointerup', function () { if (drag && drag.from === 'handle') dragEnd(); });
  shH.addEventListener('pointercancel', function () { if (drag && drag.from === 'handle') { drag = null; sh.classList.remove('is-drag'); setState(state); } });
  // list / place card at its top + finger down → the sheet follows (touch: non-passive to own the gesture)
  function pullable(el) {
    var tt = null;
    el.addEventListener('touchstart', function (e) {
      var t = e.touches[0];
      tt = e.touches.length === 1 && t.clientX >= EDGE && el.scrollTop <= 0 ? { y: t.clientY, x: t.clientX, on: false } : null;
    }, { passive: true });
    el.addEventListener('touchmove', function (e) {
      if (!tt) return;
      var t = e.touches[0], dy = t.clientY - tt.y;
      if (!tt.on) {
        if (Math.abs(dy) < 6 && Math.abs(t.clientX - tt.x) < 6) return;
        if (dy <= 0 || Math.abs(t.clientX - tt.x) > Math.abs(dy) || el.scrollTop > 0) { tt = null; return; }
        tt.on = true; dragStart(tt.y, 'list');
      }
      if (e.cancelable) e.preventDefault();
      dragMove(t.clientY);
    }, { passive: false });
    var end = function () { if (tt && tt.on) dragEnd(); tt = null; };
    el.addEventListener('touchend', end);
    el.addEventListener('touchcancel', end);
  }
  pullable(list); pullable(det);
  $('mpShUp').addEventListener('click', function () { setState('half'); });
  $('mpListBtn').addEventListener('click', function () { setState(state === 'full' ? 'half' : 'full'); });

  /* ------------------------------------------------------------ list ↔ map */
  var lt = 0;
  function topK() {
    var stp = list.scrollTop, ch = list.children;
    for (var j = 0; j < ch.length; j++) { var c = ch[j]; if (c.offsetTop + c.offsetHeight * 0.45 > stp) return j; }
    return 0;
  }
  function focusK(k, pan) {
    if (k === cur || !vis[k]) return;
    cur = k;
    var on = list.querySelector('.mp-row.is-on'); if (on) on.classList.remove('is-on');
    if (list.children[k]) list.children[k].classList.add('is-on');
    highlight(vis[k], pan);
  }
  list.addEventListener('scroll', function () {
    if (drag) return;
    cancelAnimationFrame(lt);
    lt = requestAnimationFrame(function () { focusK(topK(), true); });
  }, { passive: true });
  list.addEventListener('click', function (e) {
    var r = e.target.closest('.mp-row');
    if (r) showDetail(items[+r.getAttribute('data-i')]);
  });
  chips.addEventListener('click', function (e) {
    var c = e.target.closest('.mp-chip');
    if (!c || c.getAttribute('data-f') === F && !detIt) return;
    detIt && hideDetail(true);
    setF(c.getAttribute('data-f'));
    fitTo(vis);
    // the chip scrolls into view (horizontal only)
    var r = c.getBoundingClientRect(), cr = chips.getBoundingClientRect();
    if (r.left < cr.left + 16 || r.right > cr.right - 16) chips.scrollBy({ left: r.left - cr.left - 16, behavior: RM.matches ? 'auto' : 'smooth' });
  });

  /* ------------------------------------------------------------ the place inside the sheet */
  function showDetail(it, instant) {
    if (!it) return;
    if (state === 'low') setState('half');
    detIt = it;
    var stay = it.kind === 'stay';
    var w = walkTxt(it);
    det.innerHTML = '<div class="mp-det">' +
      '<button class="mp-back" type="button" id="mpBack">' + svg(ICO.chevL) + esc(stay ? L.allFlats : L.all) + '</button>' +
      '<a class="mp-det__ph" href="' + esc(it.href) + '" aria-label="' + esc(it.n) + '" tabindex="-1">' +
        (it.P ? '<img src="' + esc(it.P) + '" alt="" decoding="async" onload="this.classList.add(\'is-loaded\')">' : '') + punchHTML(it, false) + '</a>' +
      (stay ? '<span class="now-tag rr-tag--home"><i></i>' + esc(L.stay) + '</span>'
            : '<span class="now-tag" style="' + esc(D.cats[it.k].st) + '"><i></i>' + esc(it.c) + '</span>') +
      '<h2 class="now-display mp-det__name">' + esc(it.n) + '</h2>' +
      '<div class="mp-det__hrs">' + hrsHTML(it) + '</div>' +
      (it.w ? '<p class="mp-det__say">' + (stay ? esc(it.w) : (RU ? '«' : '“') + esc(it.w) + (RU ? '»' : '”')) + '</p>' : '') +
      '<div class="mp-det__acts">' +
        '<a class="mp-det__more' + (stay ? ' is-home' : '') + '" href="' + esc(it.href) + '">' + esc(stay ? L.moreStay : L.more) + svg(stay ? ICO.arrowR : ICO.arrow) + '</a>' +
        (stay ? '' : '<a class="mp-det__route" href="https://www.google.com/maps/dir/?api=1&destination=' + it.la + ',' + it.lo + '&travelmode=walking" target="_blank" rel="noopener" aria-label="' + esc(L.route) + '">' + svg(ICO.walk) + '</a>') +
      '</div></div>';
    list.hidden = true; det.hidden = false; det.scrollTop = 0;
    $('mpShN').textContent = it.n;
    $('mpShSub').textContent = stay ? it.w : [it.c, w].filter(Boolean).join(' · ');
    if (!instant) anim(det.firstElementChild, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 340, easing: OUT });
    $('mpBack').addEventListener('click', function () { hideDetail(); });
    cur = -1;
    highlight(it, !instant);
    save();
  }
  // «подробнее» = the photo link: app-gallery.js names the photo on click → it grows into the big card
  det.addEventListener('click', function (e) {
    var more = e.target.closest('.mp-det__more');
    if (!more || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var ph = det.querySelector('.mp-det__ph');
    if (!ph || !ph.querySelector('img')) return;
    e.preventDefault();
    ph.click();
  });
  function hideDetail(silent) {
    if (!detIt) return;
    detIt = null;
    det.hidden = true; det.innerHTML = ''; list.hidden = false;
    heading();
    cur = -1;
    if (!silent) {
      anim(list, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: OUT });
      focusK(topK(), true);
    }
    save();
  }

  /* ------------------------------------------------------------ Google map + HTML pins */
  var map = null, overlay = null, pinsBox = null, meEl = null, mapFailed = false;
  var pins = items.map(function (it) {
    var el = document.createElement('div');
    el.className = 'mp-pin' + (it.kind === 'stay' ? ' is-stay' : '');
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-i', it.i);
    if (it.kind === 'stay') {
      b.className = 'pn is-stay' + (it.pr ? '' : ' is-bare');
      b.innerHTML = '<span class="pn__mark">' + MARK + '</span>' + esc(it.pr) + '<span class="pn__nm">' + esc(it.n) + '</span>';
      b.setAttribute('aria-label', it.n + (it.pr ? ', ' + it.pf : ''));
    } else {
      var c = D.cats[it.k];
      b.className = 'pn' + (c.ln ? ' is-ln' : '');
      b.style.setProperty('--c', c.c);
      b.innerHTML = c.ic + '<span class="pn__nm">' + esc(it.n) + '</span>';
      b.setAttribute('aria-label', it.n);
    }
    el.appendChild(b);
    return { it: it, el: el, b: b };
  });
  function unselect() {
    var s = mp.querySelector('.mp-pin.is-sel'); if (s) s.classList.remove('is-sel');
    mp.classList.remove('is-focus');
    regroup();
  }
  // Pins that overlap on screen become one count bubble (tap = zoom in there). Places and flats
  // group separately; the selected pin is never swallowed; grey grains (filtered out) are left as
  // they are. Greedy, in div pixels (pans don't change it) — recomputed on zoom and on selection.
  var groups = [], gPool = [];
  function regroup() {
    if (!overlay || !overlay.getProjection() || !pinsBox) return;
    var pr = overlay.getProjection(), z = map.getZoom();
    groups = [];
    var live = pins.filter(function (p) { p.el.classList.remove('is-grouped'); return !p.el.classList.contains('is-dim'); });
    live.forEach(function (p) { p.pt = pr.fromLatLngToDivPixel(new google.maps.LatLng(p.it.la, p.it.lo)); });
    if (z < 18) {
      var sel = live.filter(function (p) { return p.el.classList.contains('is-sel'); })[0];
      var free = live.filter(function (p) { return p !== sel; });
      var near = function (a, b) {
        var dx = Math.abs(a.pt.x - b.pt.x), dy = Math.abs(a.pt.y - b.pt.y);
        return a.it.kind === 'stay' ? dx < 74 && dy < 32 : dx * dx + dy * dy < 32 * 32;
      };
      var used = {};
      free.forEach(function (p) {
        if (used[p.it.i]) return;
        var g = [p];
        free.forEach(function (q) { if (q !== p && !used[q.it.i] && q.it.kind === p.it.kind && g.some(function (m) { return near(m, q); })) g.push(q); });
        if (g.length < 2) return;
        g.forEach(function (m) { used[m.it.i] = 1; m.el.classList.add('is-grouped'); });
        groups.push(g);
      });
      // a bubble sits at its members' centre: a lone pin of the same kind under it joins, and two
      // bubbles that land on each other merge (a few passes settle it at this size)
      var ctr = function (g) { var c = { it: g[0].it, pt: { x: 0, y: 0 } }; g.forEach(function (m) { c.pt.x += m.pt.x / g.length; c.pt.y += m.pt.y / g.length; }); return c; };
      for (var pass = 0, moved = true; moved && pass < 4; pass++) {
        moved = false;
        groups.forEach(function (g) {
          var c = ctr(g);
          free.forEach(function (q) { if (!used[q.it.i] && q.it.kind === c.it.kind && near(c, q)) { used[q.it.i] = 1; q.el.classList.add('is-grouped'); g.push(q); moved = true; } });
        });
        for (var a = 0; a < groups.length; a++) for (var b = groups.length - 1; b > a; b--) {
          var ca = ctr(groups[a]), cb = ctr(groups[b]);
          if (ca.it.kind === cb.it.kind && near(ca, cb)) { groups[a] = groups[a].concat(groups[b]); groups.splice(b, 1); moved = true; }
        }
      }
    }
    // bubbles: reuse a small pool of elements
    while (gPool.length < groups.length) {
      var el = document.createElement('div'); el.className = 'mp-pin mp-grp-pin';
      el.innerHTML = '<button type="button" class="mp-grp"></button>';
      pinsBox.appendChild(el); gPool.push(el);
    }
    gPool.forEach(function (el, k) {
      var g = groups[k];
      el.hidden = !g;
      if (!g) return;
      var x = 0, y = 0, la = 0, lo = 0;
      g.forEach(function (m) { x += m.pt.x; y += m.pt.y; la += m.it.la; lo += m.it.lo; });
      el.style.left = x / g.length + 'px'; el.style.top = y / g.length + 'px';
      el.dataset.g = k;
      var stay = g[0].it.kind === 'stay';
      var worlds = {}; g.forEach(function (m) { if (!stay) worlds[D.cats[m.it.k].c] = 1; });
      var wl = Object.keys(worlds);
      var b = el.firstChild;
      b.className = 'mp-grp' + (stay ? ' is-stay' : '');
      // one world (a category filter) → its colour; mixed → neutral ink; flats → orange
      b.style.setProperty('--c', stay ? 'var(--home)' : F !== 'all' && wl.length === 1 ? wl[0] : 'var(--ink)');
      b.innerHTML = (stay ? '<span class="pn__mark">' + MARK + '</span>' : '') + g.length;
      b.setAttribute('aria-label', (RU ? (stay ? 'квартир: ' : 'мест: ') + g.length + ' — приблизить' : g.length + (stay ? ' flats' : ' places') + ' — zoom in'));
      el._c = { la: la / g.length, lo: lo / g.length, g: g };
    });
  }
  function zoomInto(el) {
    var c = el._c; if (!c || !map) return;
    var z = Math.min(18, map.getZoom() + 2);
    map.setZoom(z);
    var cc = centerFor(c.la, c.lo); if (cc) map.panTo(cc);
  }
  function highlight(it, pan) {
    unselect();
    var p = pins[it.i];
    p.el.classList.add('is-sel');
    mp.classList.add('is-focus');
    regroup();
    if (pan) panToItem(it);
    sideOf(p);
  }
  function sideOf(p) {
    if (!overlay || !overlay.getProjection()) return;
    var pt = overlay.getProjection().fromLatLngToContainerPixel(new google.maps.LatLng(p.it.la, p.it.lo));
    p.el.classList.toggle('is-left', !!pt && pt.x > mp.clientWidth * 0.6);
  }
  // the visible map is between the header and the sheet: put the pin in the middle of that
  function centerFor(la, lo) {
    var proj = map.getProjection();
    if (!proj) return null;
    var zoneTop = top.offsetHeight - 6, zoneBot = H() - visH();
    var dy = H() / 2 - (zoneTop + zoneBot) / 2;
    var scale = Math.pow(2, map.getZoom());
    var w = proj.fromLatLngToPoint(new google.maps.LatLng(la, lo));
    return proj.fromPointToLatLng(new google.maps.Point(w.x, w.y + dy / scale));
  }
  function panToItem(it) {
    if (!map) return;
    // already comfortably in view → leave the map alone (less motion)
    var pr = overlay && overlay.getProjection();
    var pt = pr && pr.fromLatLngToContainerPixel(new google.maps.LatLng(it.la, it.lo));
    var zt = top.offsetHeight + 24, zb = H() - visH() - 40;
    if (pt && pt.x > 50 && pt.x < mp.clientWidth - 50 && pt.y > zt && pt.y < zb && zb - zt > 120) return;
    var c = centerFor(it.la, it.lo);
    if (c) map.panTo(c);
  }
  // Frame the CORE of a set: points further than 4 km from the median point (Kvariati, the
  // botanical garden…) are left out so one far place doesn't zoom out to the whole region; they
  // stay reachable by panning or from the list (selecting pans there). Zoom 14…16 for Batumi.
  var kmBetween = function (a, b) { return window.rrTrip.walkFrom({ lat: a.la, lng: a.lo }, b.la, b.lo) * 4.8 / 60 / 1.25; };
  function coreOf(arr) {
    if (arr.length < 3) return arr;
    var med = function (k) { var v = arr.map(function (it) { return it[k]; }).sort(function (a, b) { return a - b; }); return v[v.length >> 1]; };
    var m = { la: med('la'), lo: med('lo') };
    var core = arr.filter(function (it) { return kmBetween(m, it) <= 4; });
    return core.length ? core : arr;
  }
  function fitTo(arr, instant) {
    if (!map || !arr.length || !map.getProjection()) return;
    var core = coreOf(arr), proj = map.getProjection();
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    core.forEach(function (it) {
      var w = proj.fromLatLngToPoint(new google.maps.LatLng(it.la, it.lo));
      x0 = Math.min(x0, w.x); x1 = Math.max(x1, w.x); y0 = Math.min(y0, w.y); y1 = Math.max(y1, w.y);
    });
    // the window between the header and the sheet, minus room for the pins themselves
    var bw = Math.max(80, mp.clientWidth - 72), bh = Math.max(80, H() - (top.offsetHeight - 6) - visH() - 64);
    var z = Math.floor(Math.min(Math.log2(bw / Math.max(1e-9, x1 - x0)), Math.log2(bh / Math.max(1e-9, y1 - y0))));
    z = isFinite(z) ? z : 16;
    // doesn't fit at 14: centre on where the places are densest (the median), not the box middle
    var mid = z < 14
      ? (function () { var m = function (k) { var v = core.map(function (it) { return it[k]; }).sort(function (a, b) { return a - b; }); return v[v.length >> 1]; }; return new google.maps.LatLng(m('la'), m('lo')); })()
      : proj.fromPointToLatLng(new google.maps.Point((x0 + x1) / 2, (y0 + y1) / 2));
    z = clamp(z, 14, 16);
    var same = map.getZoom() === z;
    if (!same) map.setZoom(z);
    var c = centerFor(mid.lat(), mid.lng());
    if (!c) return;
    if (same && !instant) map.panTo(c); else map.setCenter(c);
  }
  // paper style (#FAF7F0): quiet streets, soft sea, no POIs / transit — our pins carry the colour
  var STYLE = [
    { elementType: 'geometry', stylers: [{ color: '#f3eee4' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8c877e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#faf7f0' }, { weight: 3 }] },
    { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#efe9dd' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d3e0e1' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9fb4b3' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#fffdf9' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fbf1e4' }] },
    { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', stylers: [{ visibility: 'on' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e3eadb' }] },
    { featureType: 'poi.park', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  ];
  var hardFail = false;
  function fail(hard) {
    if (hard === true) hardFail = true;
    if (map || mapFailed) return;
    mapFailed = true;
    $('mpMap').innerHTML = '';
    $('mpFail').hidden = false;
    $('mpMe').hidden = true;
  }
  // Google calls this when the key is not allowed for this host
  window.gm_authFailure = function () { try { if (overlay) overlay.setMap(null); } catch (e) {} overlay = null; map = null; mapFailed = false; fail(true); };
  window.__rrMapInit = function () {
    if (hardFail) return;
    // arrived after the 12s note (slow network): take the note away and build the map after all
    if (mapFailed) { mapFailed = false; $('mpFail').hidden = true; $('mpMe').hidden = false; }
    try { initMap(); } catch (e) { fail(true); }
  };
  function initMap() {
    var el = $('mpMap');
    map = new google.maps.Map(el, {
      center: { lat: 41.6457, lng: 41.6295 }, zoom: 14,
      styles: STYLE, disableDefaultUI: true, clickableIcons: false, keyboardShortcuts: false,
      gestureHandling: 'greedy', backgroundColor: '#f3eee4', isFractionalZoomEnabled: false,
    });
    function Pins() {}
    Pins.prototype = new google.maps.OverlayView();
    Pins.prototype.onAdd = function () {
      pinsBox = document.createElement('div');
      pinsBox.className = 'mp-pins';
      pins.forEach(function (p) { pinsBox.appendChild(p.el); });
      meEl = document.createElement('div'); meEl.className = 'mp-pin mp-me-pin'; meEl.hidden = true;
      meEl.innerHTML = '<span class="mp-meDot"></span>';
      pinsBox.appendChild(meEl);
      this.getPanes().overlayMouseTarget.appendChild(pinsBox);
      google.maps.OverlayView.preventMapHitsAndGesturesFrom(pinsBox);
      pinsBox.addEventListener('click', function (e) {
        var g = e.target.closest('.mp-grp');
        if (g) { zoomInto(g.parentNode); return; }
        var b = e.target.closest('.pn');
        if (b) showDetail(items[+b.getAttribute('data-i')]);
      });
    };
    Pins.prototype.draw = function () {
      var pr = this.getProjection();
      if (!pr || !map) return;   // torn down (the key was refused)
      pins.forEach(function (p) {
        var pt = pr.fromLatLngToDivPixel(new google.maps.LatLng(p.it.la, p.it.lo));
        p.el.style.left = pt.x + 'px'; p.el.style.top = pt.y + 'px';
      });
      if (me) { var m = pr.fromLatLngToDivPixel(new google.maps.LatLng(me.lat, me.lng)); meEl.style.left = m.x + 'px'; meEl.style.top = m.y + 'px'; meEl.hidden = false; }
      var s = mp.querySelector('.mp-pin.is-sel');
      if (s) sideOf(pins[+s.firstChild.getAttribute('data-i')]);
      regroup();
    };
    Pins.prototype.onRemove = function () { if (pinsBox) pinsBox.remove(); };
    overlay = new Pins();
    overlay.setMap(map);

    // first frame: the core of the filtered places in the visible window; restore the picked place
    var framed = false;
    var frame = function () { if (framed || !map || !map.getProjection()) return; framed = true; fitTo(vis.length ? vis : items, true); };
    google.maps.event.addListenerOnce(map, 'projection_changed', frame);
    frame();
    google.maps.event.addListenerOnce(map, 'idle', function () {
      if (!map) return;   // the key was refused meanwhile (gm_authFailure)
      frame();
      if (html.classList.contains('rr-map-enter') || entering) pinsIn();
      if (detIt) highlight(detIt, true);
      else if (vis.length) focusK(topK(), false);
    });
  }
  // pins rise in from the reveal point outward
  var entering = false;
  function pinsIn() {
    if (RM.matches) return;
    var cx = parseFloat(html.style.getPropertyValue('--rr-mx')) || mp.clientWidth / 2;
    var cy = parseFloat(html.style.getPropertyValue('--rr-my')) || H() / 2;
    var pr = overlay && overlay.getProjection();
    if (!pr) return;
    pins.forEach(function (p) {
      var pt = pr.fromLatLngToContainerPixel(new google.maps.LatLng(p.it.la, p.it.lo));
      p.b.style.setProperty('--d', pt ? Math.min(420, Math.round(Math.hypot(pt.x - cx, pt.y - cy) * 0.9)) : 0);
    });
    mp.classList.add('is-enter');
    setTimeout(function () { mp.classList.remove('is-enter'); }, 1000);
  }
  function loadGoogle() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(D.key) + '&callback=__rrMapInit&loading=async&language=' + D.lang + '&region=GE';
    s.onerror = function () { fail(true); };
    document.head.appendChild(s);
    // nothing after 12s (offline, very slow) → the note; a late script still replaces it
    setTimeout(function () { if (!map) fail(false); }, 12000);
  }

  /* ------------------------------------------------------------ «я» */
  var toastT = 0;
  function toast(t) {
    var el = $('mpToast'); el.textContent = t; el.classList.add('is-on');
    clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('is-on'); }, 2200);
  }
  function placeMe(pos, pan) {
    me = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    if (overlay) overlay.draw();
    if (farFromBatumi(me)) { if (pan) toast(L.far); return; }
    if (!origin) { origin = me; if (detIt) showDetail(detIt, true); else setF(F, true); }
    if (pan && map) { var c = centerFor(me.lat, me.lng); if (c) map.panTo(c); }
  }
  // only when location is ALREADY allowed — never prompt on load
  function showMeIfAllowed() {
    if (!navigator.permissions || !navigator.permissions.query || !navigator.geolocation) return;
    try {
      navigator.permissions.query({ name: 'geolocation' }).then(function (ps) {
        if (ps.state !== 'granted') return;
        navigator.geolocation.getCurrentPosition(function (pos) { placeMe(pos, false); }, function () {}, { maximumAge: 600000, timeout: 8000 });
      }).catch(function () {});
    } catch (e) {}
  }
  // the button may ask (the guest tapped it)
  $('mpMe').addEventListener('click', function () {
    if (!navigator.geolocation) { toast(L.locOff); return; }
    if (me && map && !farFromBatumi(me)) { var c = centerFor(me.lat, me.lng); if (c) map.panTo(c); }
    navigator.geolocation.getCurrentPosition(function (pos) { placeMe(pos, true); }, function () { toast(L.locOff); }, { maximumAge: 60000, timeout: 10000, enableHighAccuracy: true });
  });

  /* ------------------------------------------------------------ leave: X / swipe down on the header / Esc */
  var leaving = false, giveUp = 0;
  var from = function () { return (history.state && history.state.rrMapFrom) || null; };
  function originCircle() {
    var f = from();
    if (f) return { x: f.x, y: f.y, r: f.r };
    var r = $('mpX').getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width / 2 };
  }
  var bigR = function (b) { return Math.hypot(Math.max(b.x, mp.clientWidth - b.x), Math.max(b.y, H() - b.y)); };
  function close(Rnow) {
    if (leaving) return;
    leaving = true;
    var f = from(), same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
    var canBack = history.length > 1 && same && !(window.navigation && navigation.canGoBack === false);
    if (canBack) {
      // the page we return to shrinks the map into the button / tile it came from (AppHeader + app-vt.css)
      if (f) put('rr_map_back', { x: f.x, y: f.y, r: f.r, R: Rnow || bigR(f), to: f.from, t: Date.now() });
      history.back();
      // back() did nothing (no Navigation API to know beforehand) → home
      giveUp = setTimeout(function () { if (document.visibilityState === 'visible') location.replace(HOME); }, 4000);
    } else {
      location.replace(HOME);
    }
  }
  addEventListener('pagehide', function () { clearTimeout(giveUp); });
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    leaving = false; mp.style.clipPath = ''; put('rr_map_back', null);
  });
  $('mpX').addEventListener('click', function () { close(); });
  addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (detIt) hideDetail(); else close();
  });
  // swipe down on the header: the map shrinks into its circle with the finger; past 90px → leave
  var hd = null;
  bar.addEventListener('pointerdown', function (e) {
    if (e.button !== 0 || e.clientX < EDGE || e.target.closest('button') || leaving) return;
    hd = { y: e.clientY, d: 0, b: originCircle(), R: 0 };
    try { bar.setPointerCapture(e.pointerId); } catch (x) {}
  });
  bar.addEventListener('pointermove', function (e) {
    if (!hd) return;
    hd.d = Math.max(0, e.clientY - hd.y);
    if (hd.d < 4 || RM.matches) return;
    var R0 = bigR(hd.b);
    hd.R = R0 - (R0 - Math.min(R0, 260)) * Math.min(1, hd.d / 420);
    mp.style.clipPath = 'circle(' + hd.R + 'px at ' + hd.b.x + 'px ' + hd.b.y + 'px)';
  });
  var hdEnd = function (cancel) {
    if (!hd) return;
    var g = hd; hd = null;
    if (!cancel && g.d > 90) { close(g.R || 0); return; }
    if (!g.R) { mp.style.clipPath = ''; return; }
    anim(mp, [{ clipPath: 'circle(' + g.R + 'px at ' + g.b.x + 'px ' + g.b.y + 'px)' }, { clipPath: 'circle(' + bigR(g.b) + 'px at ' + g.b.x + 'px ' + g.b.y + 'px)' }], { duration: 320, easing: 'cubic-bezier(.2,.9,.25,1)' });
    mp.style.clipPath = '';
  };
  bar.addEventListener('pointerup', function () { hdEnd(false); });
  bar.addEventListener('pointercancel', function () { hdEnd(true); });

  /* ------------------------------------------------------------ start */
  measure();
  var saved = st.rrMap;
  setF(F, false);
  // a preselected chip (?cat=) sits in view
  var ac = chipOf(F);
  if (ac && F !== 'all') chips.scrollLeft = Math.max(0, ac.offsetLeft - 16);
  setState(saved && VIS[saved.sheet] ? saved.sheet : 'half', true);
  if (saved && saved.det != null && items[saved.det]) showDetail(items[saved.det], true);
  addEventListener('resize', function () { measure(); setState(state, true); });
  // walking minutes / «я» even when the map itself doesn't load
  showMeIfAllowed();
  // entering with the circle reveal: the sheet rises in behind it, the header settles.
  // MapScreen's early inline script marks it (rr-map-enter) in pagereveal — which may already
  // have fired while this file was downloading: then start right away.
  function enter() {
    if (!html.classList.contains('rr-map-enter')) return;
    html.classList.remove('rr-map-enter');
    entering = true;
    setTimeout(function () { entering = false; }, 1500);
    if (map) pinsIn();
    var v = visH();
    anim(sh, [{ transform: 'translateY(' + S() + 'px)' }, { transform: 'translateY(' + (S() - v) + 'px)' }], { duration: 560, delay: 200, easing: IOS, fill: 'backwards' });
    anim(top, [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 360, delay: 220, easing: OUT, fill: 'backwards' });
  }
  if (html.classList.contains('rr-map-enter')) enter(); else addEventListener('pagereveal', enter);
  loadGoogle();
})();
