/* rega rega app — city picker (components/app/CityPicker.astro, styles/app-cities.css).
   Port of rega-design-panel r4/final/map.html «города как страницы» (Emil) + the stack.
   - #cityPill on the home screen opens a full-screen dialog (role=dialog aria-modal → native
     pull-to-refresh stays off while it is open, see window.rrNoPullRefresh in the layouts).
   - Pages swipe sideways (native scroll-snap; a 20px strip on the left edge belongs to the
     native «back» swipe, our paging never starts there). Mouse can drag pages too.
   - Close: X, swipe down on a page, Esc, browser «back» (#city in history), «open the guide».
   - Local time per city via Intl timeZone; live weather for the page cities (Open-Meteo, one
     request, shown only when it arrives). Batumi «right now» = guide places open now (rrHours).
   - Trip mark: window.rrTrip.active() (same source as html.has-trip) → orange «your trip <dates>».
   Motion: transform / opacity / filter only, interruptible; prefers-reduced-motion → none.
   (bump ?v= on change: sw.js serves it stale-while-revalidate) */
(function () {
  'use strict';
  var cp = document.getElementById('cp');
  if (!cp) return;
  var $ = function (id) { return document.getElementById(id); };
  var pager = $('cpPager'), stack = $('cpStack'), dock = $('cpDock');
  var pages = [].slice.call(pager.querySelectorAll('.cp-pg'));
  var dots = [].slice.call($('cpDots').children);
  var RU = cp.dataset.lang === 'ru';
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var OUT = 'cubic-bezier(.23,1,.32,1)';
  var EDGE = 20;
  var html = document.documentElement;
  var anim = function (el, kf, o) { if (!el.animate || RM.matches) return null; return el.animate(kf, o); };
  var W = function () { return pager.clientWidth || window.innerWidth; };

  // ---------- local time ----------
  var fmts = {};
  var timeIn = function (tz) {
    try {
      if (!fmts[tz]) fmts[tz] = new Intl.DateTimeFormat(RU ? 'ru-RU' : 'en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz });
      return fmts[tz].format(new Date());
    } catch (e) { return ''; }
  };
  var tick = function () {
    pages.forEach(function (p) { var t = p.querySelector('[data-time]'); if (t) t.textContent = timeIn(p.dataset.tz); });
    [].slice.call(stack.querySelectorAll('.tm[data-tz]')).forEach(function (m) { m.querySelector('[data-time]').textContent = timeIn(m.dataset.tz); });
  };

  // ---------- weather (page cities, one request) ----------
  var SKY = RU
    ? [[0, 'ясно'], [3, 'облачно'], [48, 'туман'], [67, 'дождь'], [77, 'снег'], [82, 'ливень'], [99, 'гроза']]
    : [[0, 'clear'], [3, 'cloudy'], [48, 'fog'], [67, 'rain'], [77, 'snow'], [82, 'showers'], [99, 'storm']];
  var sky = function (code) { for (var i = 0; i < SKY.length; i++) if (code <= SKY[i][0]) return SKY[i][1]; return ''; };
  var deg = function (t) { var r = Math.round(t); return (r > 0 ? '+' : r < 0 ? '−' : '') + Math.abs(r) + '°'; };
  var wxAsked = false;
  var weather = function () {
    if (wxAsked || !window.fetch) return; wxAsked = true;
    var la = pages.map(function (p) { return p.dataset.lat; }).join(','), lo = pages.map(function (p) { return p.dataset.lng; }).join(',');
    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + la + '&longitude=' + lo + '&current=temperature_2m,weather_code')
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (res) {
        if (!res) return;
        var list = Array.isArray(res) ? res : [res];
        pages.forEach(function (p, i) {
          var c = list[i] && list[i].current;
          if (!c || typeof c.temperature_2m !== 'number') return;
          p.querySelector('[data-temp]').textContent = deg(c.temperature_2m);
          p.querySelector('[data-sky]').textContent = sky(c.weather_code);
          var m = stack.querySelector('.tm[data-id="' + p.dataset.id + '"] [data-temp]');
          if (m) m.textContent = deg(c.temperature_2m);
        });
      }).catch(function () {});
  };

  // ---------- Batumi «right now»: guide places open now ----------
  var nowFilled = false;
  var fillNow = function () {
    if (nowFilled) return; nowFilled = true;
    var box = cp.querySelector('[data-now]');
    if (!box) return;
    var H = window.rrHours, places = [];
    try { places = JSON.parse($('cpPlaces').textContent || '[]'); } catch (e) {}
    if (!H || !places.length) { box.parentNode.hidden = true; return; }
    var T0 = H.now(), open = [];
    places.forEach(function (p) { var o = H.openNow(p.h, T0); if (o && o.close != null) open.push({ n: p.n, c: o.close }); });
    cp.querySelector('[data-openof]').textContent = cp.dataset.lOpen + ' ' + open.length + ' ' + cp.dataset.lOf + ' ' + places.length;
    box.textContent = open.length
      ? open.slice(0, 2).map(function (o) { return o.n + (RU ? ' до ' : ' until ') + H.hhmm(o.c); }).join(', ')
      : (RU ? 'сейчас всё закрыто' : 'everything is closed right now');
  };

  // ---------- trip mark (same source as html.has-trip) ----------
  var MON3 = RU ? ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
                : ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  var day = function (s) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; };
  var tripDates = function (t) {
    var ci = day(t && t.ci), co = day(t && t.co);
    if (!ci || !co) return '';
    if (ci.getMonth() === co.getMonth()) return ci.getDate() + '–' + co.getDate() + ' ' + MON3[co.getMonth()];
    return ci.getDate() + ' ' + MON3[ci.getMonth()] + ' – ' + co.getDate() + ' ' + MON3[co.getMonth()];
  };
  var PLANE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 10h4a2 2 0 0 1 0 4h-4l-4 7h-3l2 -7h-4l-2 2h-3l2 -4l-2 -4h3l2 2h4l-2 -7h3z" /></svg>';
  var markTrip = function () {
    var t = null;
    try { t = window.rrTrip && window.rrTrip.active(); } catch (e) {}
    var txt = t ? tripDates(t) : '';
    var chip = cp.querySelector('[data-trip-chip]'), sb = stack.querySelector('[data-sb="open"]'), dot = cp.querySelector('.cp-tripdot');
    if (!txt) return;
    var label = cp.dataset.lTrip + ' ' + txt;
    if (chip) { chip.classList.add('is-trip'); chip.innerHTML = PLANE + '<span></span>'; chip.lastChild.textContent = label; }
    if (sb) { sb.classList.add('is-trip'); sb.innerHTML = PLANE + '<span></span>'; sb.lastChild.textContent = label; }
    if (dot) dot.hidden = false;
  };

  // ---------- paging ----------
  var idx = 0;
  var sync = function () {
    idx = Math.max(0, Math.min(pages.length - 1, Math.round(pager.scrollLeft / W())));
    dots.forEach(function (d, j) { d.classList.toggle('on', j === idx); });
    var light = pages[idx] && pages[idx].dataset.dark === '0';
    dock.classList.toggle('is-light', !!light);
  };
  pager.addEventListener('scroll', function () { requestAnimationFrame(sync); }, { passive: true });
  var toPage = function (i, smooth) {
    stackOff();
    pager.scrollTo({ left: W() * i, behavior: smooth && !RM.matches ? 'smooth' : 'auto' });
    sync();
  };

  // ---------- stack ----------
  var stackOn = function () {
    stack.classList.add('on'); cp.classList.add('is-stack');
    stack.scrollTop = 0;
    anim(stack, [{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: OUT });
  };
  var stackOff = function () { stack.classList.remove('on'); cp.classList.remove('is-stack'); };
  $('cpStackBtn').addEventListener('click', stackOn);
  $('cpBack').addEventListener('click', function () { stackOff(); sync(); });
  $('cpPile').addEventListener('click', function (e) { var c = e.target.closest('.cp-cd'); if (c) toPage(+c.dataset.i, true); });
  $('cpChips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) toPage(+b.dataset.i, true); });
  $('cpQ').addEventListener('input', function (e) {
    var v = e.target.value.trim().toLowerCase(), n = 0, first = true;
    [].slice.call(stack.querySelectorAll('#cpPile .cp-cd, #cpChips > *')).forEach(function (el) {
      var ok = !v || (' ' + el.dataset.n).indexOf(' ' + v) > -1; // word prefix: «лис» → lisbon, not tbilisi
      el.style.display = ok ? '' : 'none';
      if (el.classList.contains('cp-cd')) { el.classList.toggle('is-first', ok && first); if (ok) first = false; }
      else if (ok) n++;
    });
    $('cpEmpty').hidden = !!n;
  });

  // ---------- open / close ----------
  var opener = null, timer = 0, closing = false, current = null;
  var open = function (from) {
    if (!cp.hidden && !closing) return;
    if (current) { current.cancel(); current = null; }
    closing = false;
    opener = from || null;
    cp.hidden = false; cp.style.transform = ''; cp.style.opacity = '';
    html.classList.add('cp-open');
    stackOff();
    $('cpQ').value = ''; $('cpQ').dispatchEvent(new Event('input'));
    pager.style.scrollSnapType = 'none'; pager.scrollLeft = 0; pager.style.scrollSnapType = ''; sync();
    tick(); clearInterval(timer); timer = setInterval(tick, 20000);
    fillNow(); markTrip(); weather();
    try { if (location.hash !== '#city') history.pushState({ city: 1 }, '', '#city'); } catch (e) {}
    current = anim(cp, [{ opacity: 0, transform: 'scale(1.03)', filter: 'blur(6px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }], { duration: 420, easing: OUT });
    $('cpX').focus({ preventScroll: true });
  };
  var close = function (fromHistory) {
    if (cp.hidden || closing) return; closing = true;
    if (!fromHistory) { try { if (location.hash === '#city') history.back(); } catch (e) {} }
    var done = function () {
      cp.hidden = true; closing = false; current = null;
      cp.style.transform = ''; cp.style.opacity = '';
      html.classList.remove('cp-open'); clearInterval(timer);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    };
    var from = getComputedStyle(cp).transform;
    if (current) current.cancel();
    current = anim(cp, [{ opacity: cp.style.opacity || 1, transform: from === 'none' ? 'none' : from, filter: 'blur(0)' }, { opacity: 0, transform: from === 'none' ? 'scale(1.02)' : from + ' translateY(40px)', filter: 'blur(4px)' }], { duration: 260, easing: 'ease-out', fill: 'forwards' });
    if (!current) { done(); return; }
    current.onfinish = function () { var a = current; done(); if (a) a.cancel(); };
  };
  document.addEventListener('click', function (e) {
    var pill = e.target.closest && e.target.closest('#cityPill');
    if (pill) { e.preventDefault(); open(pill); }
  });
  $('cpX').addEventListener('click', function () { close(); });
  pager.addEventListener('click', function (e) { if (e.target.closest('[data-go]')) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cp.hidden) { e.preventDefault(); close(); } });
  window.addEventListener('popstate', function () { if (!cp.hidden && location.hash !== '#city') close(true); });
  // landed on …#city (reload / restored tab): there's nothing to go back to inside the picker
  try { if (location.hash === '#city') history.replaceState(history.state, '', location.pathname + location.search); } catch (e) {}

  // ---------- gestures on the pages: swipe down closes; mouse drags pages ----------
  var g = null;
  pager.addEventListener('pointerdown', function (e) {
    if (e.clientX < EDGE || e.button > 0 || cp.classList.contains('is-stack')) return;
    if (e.target.closest('button') && e.pointerType === 'mouse') return;
    g = { id: e.pointerId, x: e.clientX, y: e.clientY, t: Date.now(), s: pager.scrollLeft, mode: null, mouse: e.pointerType === 'mouse' };
    if (current) { current.cancel(); current = null; }
  });
  window.addEventListener('pointermove', function (e) {
    if (!g || e.pointerId !== g.id) return;
    var dx = e.clientX - g.x, dy = e.clientY - g.y;
    if (!g.mode) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      g.mode = Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 'down' : 'none') : (g.mouse ? 'page' : 'none');
      if (g.mode === 'page') pager.style.scrollSnapType = 'none';
      if (g.mode === 'down') { try { pager.setPointerCapture(e.pointerId); } catch (er) {} }
    }
    if (g.mode === 'down') {
      var y = Math.max(0, dy);
      cp.style.transform = 'translateY(' + y + 'px) scale(' + (1 - Math.min(y, 400) / 4000) + ')';
      cp.style.opacity = String(1 - Math.min(y, 400) / 800);
    } else if (g.mode === 'page') {
      pager.scrollLeft = g.s - dx;
    }
  });
  var up = function (e) {
    if (!g || e.pointerId !== g.id) return;
    var st = g; g = null;
    var dx = e.clientX - st.x, dy = e.clientY - st.y, v = dy / Math.max(1, Date.now() - st.t);
    if (st.mode === 'down') {
      if (dy > 110 || (v > 0.6 && dy > 30)) { close(); return; }
      var from = cp.style.transform;
      cp.style.transform = ''; cp.style.opacity = '';
      anim(cp, [{ transform: from, opacity: 1 - Math.min(Math.max(dy, 0), 400) / 800 }, { transform: 'none', opacity: 1 }], { duration: 320, easing: OUT });
    } else if (st.mode === 'page') {
      var i0 = Math.round(st.s / W()), i = Math.abs(dx) > 40 ? i0 + (dx < 0 ? 1 : -1) : i0;
      i = Math.max(0, Math.min(pages.length - 1, i));
      pager.scrollTo({ left: i * W(), behavior: RM.matches ? 'auto' : 'smooth' });
      setTimeout(function () { pager.style.scrollSnapType = ''; }, 450);
    }
  };
  window.addEventListener('pointerup', up);
  window.addEventListener('pointercancel', up);
  window.addEventListener('resize', function () { if (!cp.hidden) { pager.scrollLeft = idx * W(); } });
})();
