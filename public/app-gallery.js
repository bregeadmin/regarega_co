/* rega rega app — big cards (place / news / apartment), r4/jakub kit.js «большая карточка».
   Loaded on every app page (layouts/App.astro + AppFull.astro), plain script, no deps.

   1) Card photo → big card: every app screen is its own page, so the «photo grows into the
      screen» is a cross-document view transition. On tap of a link to /app/place|news|stays/<slug>
      the card's photo gets `view-transition-name: ph-<slug>`; the gallery on the big card has the
      same name (components/app/Gallery.astro). Only the tapped card is named → names stay unique.
      The tapped photo's URL is remembered (sessionStorage rr_ph) so the gallery can paint it
      under its first slide before its own photo arrives. Timing: styles/app-vt.css.
   2) Gallery: swipe (own transform track, never from the left 20px — that's native «back»),
      «1 / N» + segments, X and swipe-down (page at top, gesture started on the gallery) close
      the screen: history.back() when we came from inside the app, else the home screen.
   3) Tap a photo → fullscreen viewer (role=dialog aria-modal → native pull-to-refresh stays off):
      swipe through, swipe down/up or X closes, the photo flies back into its slot.
   Motion: transform / opacity / clip-path only; prefers-reduced-motion → no movement. */
(function () {
  'use strict';
  var html = document.documentElement;
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var IOS = 'cubic-bezier(.32,.72,0,1)';
  var OUT = 'cubic-bezier(.23,1,.32,1)';
  var SOFT = 'cubic-bezier(.3,.66,.12,1)';
  var EDGE = 20;                 // native edge-swipe «back» zone
  var D = function (ms) { return RM.matches ? 0 : ms; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  // SAME rule as src/lib/phName.ts
  var phName = function (s) { return 'ph-' + String(s || '').replace(/[^a-zA-Z0-9_-]/g, '_'); };
  var get = function (k) { try { return JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  var put = function (k, v) { try { if (v == null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  var anim = function (el, kf, o) { if (!el.animate || RM.matches) return null; return el.animate(kf, o); };

  /* ------------------------------------------------------------ 1. card → big card */
  var DETAIL = /\/app\/(place|news|stays)\/([^\/?#]+)\/?$/;
  var named = [];
  function clearNames() { named.forEach(function (el) { el.style.viewTransitionName = ''; }); named = []; }
  function photoOf(a) {
    var p = a.querySelector('[data-ph]');
    if (p) return p;
    var img = a.querySelector('img');
    if (!img) return null;
    // the img's own frame (rounded wrapper) — but never one that also carries text (price stamp…)
    var par = img.parentElement;
    return par && par !== a && par.querySelectorAll('img').length === 1 && !par.textContent.trim() ? par : img;
  }
  function nameCard(a, slug) {
    // the big card of this very slug is on screen (news → its place with the same slug): skip
    if (document.querySelector('[data-gal][data-slug="' + slug.replace(/["\\]/g, '') + '"]')) return null;
    var ph = photoOf(a);
    if (!ph) return null;
    var img = ph.tagName === 'IMG' ? ph : ph.querySelector('img');
    if (img && (img.hidden || !img.getAttribute('src'))) return null;   // no photo → plain crossfade
    clearNames();
    ph.style.viewTransitionName = phName(slug);
    ph.style.setProperty('view-transition-class', 'rr-ph');
    named.push(ph);
    return img;
  }
  function slugOf(a) {
    if (!a || !a.href || (a.target && a.target !== '_self')) return null;
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (u.origin !== location.origin) return null;
    var m = u.pathname.match(DETAIL);
    return m ? decodeURIComponent(m[2]) : null;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    var slug = slugOf(a);
    if (!slug) return;
    var img = nameCard(a, slug);
    put('rr_ph', { slug: slug, src: img && img.complete && img.naturalWidth ? (img.currentSrc || img.src) : '', from: location.pathname });
  });

  // the page we come back to: closing a big card is quieter (html.rr-vt-back, app-vt.css);
  // if the list page was reloaded rather than restored, name the card we left from again
  addEventListener('pagereveal', function (e) {
    var back = get('rr_vt_back');
    put('rr_vt_back', null);
    var vt = e.viewTransition;
    // a navigation that starts before the transition has run (or our skip) aborts it — stay quiet
    var hush = function () {};
    if (vt && vt.ready) vt.ready.catch(hush);
    if (vt && vt.updateCallbackDone) vt.updateCallbackDone.catch(hush);
    if (leaving()) { html.style.opacity = '0'; if (vt) vt.skipTransition(); return; }
    if (!vt) { clearNames(); return; }
    if (back) {
      html.classList.add('rr-vt-back');
      vt.finished.then(off, off);
    }
    function off() { html.classList.remove('rr-vt-back'); }
    var s = get('rr_ph');
    if (s && s.from === location.pathname && !named.length) {
      var links = document.querySelectorAll('a[href]');
      for (var i = 0; i < links.length; i++) if (slugOf(links[i]) === s.slug) { nameCard(links[i], s.slug); break; }
    }
    // the tapped card keeps its name only for this reveal — a later tab switch must not morph it
    vt.finished.then(clearNames, clearNames);
  });

  /* ------------------------------------------------------------ 2. gallery */
  var closing = 0;               // history.back() steps taken while closing the screen
  var pvPop = false;             // the viewer called history.back() and its popstate hasn't come yet
  var home = '';
  // Leaving a big card goes back past every entry of the SAME screen: same-document ones (booking
  // steps, popstate below) and cross-document ones — e.g. the signed-out booking went
  // flat → login → location.replace(flat), so one step back is the same flat again. rr_leave
  // remembers the path we leave; a page that opens on that path keeps stepping back (hidden,
  // no transition). History runs out → the screen's natural parent (`home`: stays list for a
  // flat, home for place / news).
  var LEAVE = 'rr_leave';
  var canBack = function () { return !(window.navigation && navigation.canGoBack === false); };
  var giveUp = 0;
  function stepBack() {
    clearTimeout(giveUp);
    if (!canBack()) { stop(); location.replace(home); return; }
    // no Navigation API: if back() did nothing at all, nothing hides this page — then go to the parent
    giveUp = setTimeout(function () { if (closing && document.visibilityState === 'visible') { stop(); location.replace(home); } }, 4000);
    history.back();
  }
  function stop() { closing = 0; clearTimeout(giveUp); put(LEAVE, null); html.style.opacity = ''; }
  addEventListener('pagehide', function () { clearTimeout(giveUp); });
  function leaving() { var L = get(LEAVE); return !!(L && L.p === location.pathname && Date.now() - L.t < 15000); }
  function leave() {
    var same = false;
    try { same = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) {}
    if (history.length > 1 && same && canBack()) {
      closing = 1;
      put('rr_vt_back', 1);
      put(LEAVE, { p: location.pathname, n: 0, t: Date.now(), home: home });
      // the viewer's own history entry is still being popped: its popstate steps on (below)
      if (!(pvPop && history.state && history.state.rrpv)) stepBack();
    } else {
      put(LEAVE, null);
      location.replace(home);
    }
  }
  // a page that opens while we are leaving this path: keep going (or forget it — another screen)
  function keepLeaving() {
    var L = get(LEAVE);
    if (!L) { html.style.opacity = ''; return; }
    if (L.p !== location.pathname || Date.now() - L.t > 15000) { put(LEAVE, null); html.style.opacity = ''; return; }
    home = L.home || home;
    L.n++; L.t = Date.now();
    if (L.n > 8) { stop(); location.replace(home); return; }
    put(LEAVE, L);
    html.style.opacity = '0';
    closing = 1;
    stepBack();
  }
  // same-document entries (e.g. the booking steps on an apartment) are stepped over while closing
  addEventListener('popstate', function (e) {
    pvPop = false;
    if (!closing) return;
    e.stopImmediatePropagation();
    if (++closing > 8) { stop(); location.replace(home); return; }
    stepBack();
  });
  addEventListener('pageshow', function (e) {
    if (!e.persisted) return;
    closing = 0; resetPull(); keepLeaving();
  });

  var pullCard = null, pullFades = [], under = null;
  function resetPull(animate) {
    if (!pullCard) return;
    var from = pullCard.style.transform;
    pullCard.style.transform = ''; pullCard.style.clipPath = '';
    pullCard.classList.remove('is-pull');
    html.removeAttribute('data-no-ptr');
    if (animate && from) anim(pullCard, [{ transform: from }, { transform: 'none' }], { duration: D(380), easing: IOS });
    pullFades.forEach(function (f) { f.style.opacity = ''; });
    if (under) under.style.opacity = '0';
  }

  function initGallery(g) {
    var n = +g.getAttribute('data-n') || 0;
    home = g.getAttribute('data-home') || '/';
    var x = g.querySelector('[data-gal-close]');
    if (x) x.addEventListener('click', function (e) { e.preventDefault(); leave(); });
    if (!n) return;

    var track = g.querySelector('.gal__track');
    var slides = [].slice.call(track.children);
    var cnt = g.querySelector('[data-gal-i]');
    var segs = [].slice.call(g.querySelectorAll('.gal__segs i'));
    var card = g.closest('main') || g.parentElement;
    card.classList.add('gal-card');
    pullCard = card;
    pullFades = [].slice.call(document.querySelectorAll('[data-gal-fade]'));
    under = document.createElement('div');
    under.setAttribute('aria-hidden', 'true');
    under.style.cssText = 'position:fixed;inset:0;z-index:-1;background:#0A0908;opacity:0;pointer-events:none';
    document.body.appendChild(under);

    var i = 0;
    var W = function () { return g.clientWidth || 1; };
    function place(dx, animate) {
      track.classList.toggle('is-drag', !animate || RM.matches);
      track.style.transform = 'translate3d(' + (-i * W() + dx) + 'px,0,0)';
    }
    function go(k, animate) {
      i = clamp(k, 0, n - 1);
      place(0, animate);
      if (cnt) cnt.textContent = String(i + 1);
      segs.forEach(function (s, j) { s.classList.toggle('on', j === i); });
      // let the next photo start loading before it is swiped in
      var nx = slides[i + 1] && slides[i + 1].querySelector('.gal__img');
      if (nx && nx.loading === 'lazy') nx.loading = 'eager';
    }
    addEventListener('resize', function () { place(0, false); });

    // ---- one gesture model for touch (touch events: we must be able to cancel the page
    //      scroll for swipe-down) and mouse (pointer events, desktop / simulator)
    var s = null, moved = false, offMouse = function () {};
    function start(px, py) {
      moved = false;
      if (px < EDGE) { s = null; return; }      // native back owns the left edge
      s = { x: px, y: py, ax: null, dx: 0, dy: 0, t: performance.now(), hx: px, hy: py, ht: performance.now(), vx: 0, vy: 0 };
    }
    function move(px, py, ev) {
      if (!s) return;
      var dx = px - s.x, dy = py - s.y;
      if (!s.ax) {
        // iOS / Android only let the FIRST touchmoves be cancelled (later ones belong to the native
        // bounce / pull-to-refresh) — a downward drag at the top is ours from the first pixel
        if (ev && ev.cancelable && dy > 0 && dy >= Math.abs(dx) && (window.scrollY || html.scrollTop) <= 0) ev.preventDefault();
        if (Math.abs(dx) + Math.abs(dy) < 5) return;
        if (Math.abs(dx) > Math.abs(dy)) s.ax = n > 1 ? 'x' : 'n';
        else s.ax = dy > 0 && (window.scrollY || html.scrollTop) <= 0 ? 'y' : 'n';
        if (s.ax === 'n') { s = null; return; }
        moved = true;
        if (s.ax === 'y') { card.classList.add('is-pull'); html.setAttribute('data-no-ptr', ''); }
      }
      if (ev && ev.cancelable) ev.preventDefault();
      var now = performance.now(), dt = now - s.ht;
      if (dt > 0) { s.vx = (px - s.hx) / dt; s.vy = (py - s.hy) / dt; }
      s.hx = px; s.hy = py; s.ht = now; s.dx = dx; s.dy = dy;
      if (s.ax === 'x') {
        var max = 0, min = -(n - 1) * W(), v = -i * W() + dx;
        if (v > max) dx = Math.pow(v - max, 0.7) + max + i * W();          // rubber band at the ends
        else if (v < min) dx = -Math.pow(min - v, 0.7) + min + i * W();
        place(dx, false);
      } else pull(Math.max(0, dy));
    }
    function end() {
      if (!s) return;
      var st = s; s = null;
      if (st.ax === 'x') {
        var k = i;
        if (st.dx < -W() * 0.18 || st.vx < -0.4) k = i + 1;
        else if (st.dx > W() * 0.18 || st.vx > 0.4) k = i - 1;
        go(k, true);
      } else if (st.ax === 'y') {
        if (st.dy > 100 || (st.dy > 40 && st.vy > 0.45)) leave();
        else resetPull(true);
      }
    }
    function pull(dy) {
      var k = Math.min(dy, 420);
      card.style.transform = 'translate3d(0,' + (k * 0.55) + 'px,0) scale(' + (1 - k / 1300) + ')';
      card.style.clipPath = 'inset(0px round ' + Math.min(38, 12 + k / 4) + 'px)';
      pullFades.forEach(function (f) { f.style.opacity = String(Math.max(0, 1 - k / 160)); });
      under.style.opacity = String(Math.min(0.16, k / 900));
    }

    g.addEventListener('touchstart', function (e) {
      if (pv || e.touches.length > 1) { s = null; return; }
      if (e.target.closest('a,button')) { s = null; return; }
      start(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
    g.addEventListener('touchmove', function (e) {
      if (e.touches.length > 1) { s = null; return; }
      move(e.touches[0].clientX, e.touches[0].clientY, e);
    }, { passive: false });
    g.addEventListener('touchend', end);
    g.addEventListener('touchcancel', function () { if (s && s.ax === 'y') resetPull(true); else if (s && s.ax === 'x') go(i, true); s = null; });

    g.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a,button')) return;
      offMouse();
      start(e.clientX, e.clientY);
      var mv = function (ev) { move(ev.clientX, ev.clientY, null); };
      var up = function () { offMouse(); end(); };
      var cancel = function () { offMouse(); if (s && s.ax === 'y') resetPull(true); else if (s && s.ax === 'x') go(i, true); s = null; };
      offMouse = function () {
        removeEventListener('pointermove', mv); removeEventListener('pointerup', up); removeEventListener('pointercancel', cancel);
        offMouse = function () {};
      };
      addEventListener('pointermove', mv);
      addEventListener('pointerup', up);
      addEventListener('pointercancel', cancel);
    });
    g.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // tap a photo → fullscreen
    track.addEventListener('click', function (e) {
      if (moved) { moved = false; return; }
      var sl = e.target.closest('.gal__slide');
      if (sl) openViewer(slides, +sl.getAttribute('data-i'), go, g);
    });
    // keyboard: slides are reachable with arrows when the gallery has focus
    g.tabIndex = -1;
    g.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(i + 1, true);
      else if (e.key === 'ArrowLeft') go(i - 1, true);
    });
    go(0, false);
  }

  /* ------------------------------------------------------------ 3. fullscreen viewer */
  var pv = null;
  // where the photo flies from / back to: its slot in the gallery, cropped like there
  function fit(img, slot) {
    var s = slot.getBoundingClientRect(), r = img.getBoundingClientRect();
    if (!r.width || !r.height) return null;
    var k = Math.max(s.width / r.width, s.height / r.height);
    var vw = s.width / k, vh = s.height / k, ix = Math.max(0, (r.width - vw) / 2), iy = Math.max(0, (r.height - vh) / 2);
    var tx = (s.left + s.width / 2) - (r.left + r.width / 2), ty = (s.top + s.height / 2) - (r.top + r.height / 2);
    return { t: 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')', clip: 'inset(' + iy + 'px ' + ix + 'px ' + iy + 'px ' + ix + 'px)' };
  }
  function openViewer(slides, idx, sync, g) {
    if (pv) return;
    var n = slides.length;
    var L = { close: g.getAttribute('data-l-close') || 'close', photo: g.getAttribute('data-l-photo') || 'photo', hint: g.getAttribute('data-l-hint') || '' };
    var el = document.createElement('div');
    el.className = 'pv';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', L.photo);
    el.innerHTML = '<div class="pv__bg"></div><div class="pv__track">' +
      slides.map(function (sl) { return '<div class="pv__slide"><img alt="" draggable="false" src="' + String(sl.getAttribute('data-full')).replace(/"/g, '&quot;') + '"></div>'; }).join('') +
      '</div><div class="pv__ui"><span class="pv__c" aria-live="polite">' + (n > 1 ? (idx + 1) + ' / ' + n : '') + '</span>' +
      '<button class="pv__x" type="button" aria-label="' + L.close + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6l-12 12"/><path d="M6 6l12 12"/></svg></button></div>' +
      (L.hint ? '<div class="pv__hint">' + L.hint + '</div>' : '');
    document.body.appendChild(el);
    var track = el.querySelector('.pv__track'), bg = el.querySelector('.pv__bg');
    var ui = [].slice.call(el.querySelectorAll('.pv__ui,.pv__hint'));
    var c = el.querySelector('.pv__c'), xb = el.querySelector('.pv__x');
    var main = g.closest('main'), wasInert = main ? main.inert : false;
    var opener = document.activeElement;
    var W = function () { return el.clientWidth || 1; };
    var v = pv = { el: el, i: idx, slides: slides, sync: sync, closing: false };
    function place(dx, animate) {
      track.classList.toggle('is-drag', !animate || RM.matches);
      track.style.transform = 'translate3d(' + (-v.i * W() + dx) + 'px,0,0)';
    }
    function goTo(k) {
      slides[v.i].classList.remove('is-out');
      v.i = clamp(k, 0, n - 1);
      slides[v.i].classList.add('is-out');
      sync(v.i, false);                      // the gallery underneath follows, so the photo lands in its slot
      if (n > 1) c.textContent = (v.i + 1) + ' / ' + n;
      place(0, true);
    }
    v.place = place; v.track = track; v.bg = bg; v.ui = ui; v.main = main; v.wasInert = wasInert; v.opener = opener;
    place(0, false);
    slides[idx].classList.add('is-out');
    var img = track.children[idx].querySelector('img');
    var fly = function () {
      var f = fit(img, slides[idx]);
      if (f) anim(img, [{ transform: f.t, clipPath: f.clip }, { transform: 'none', clipPath: 'inset(0px)' }], { duration: D(460), easing: IOS, fill: 'backwards' });
      anim(bg, [{ opacity: 0 }, { opacity: 1 }], { duration: D(300), easing: OUT, fill: 'backwards' });
      ui.forEach(function (u) { anim(u, [{ opacity: 0 }, { opacity: 1 }], { duration: D(220), delay: D(200), easing: OUT, fill: 'backwards' }); });
    };
    if (img.complete && img.naturalWidth) fly();
    else { el.style.opacity = '0'; var show = function () { el.style.opacity = ''; fly(); }; img.onload = show; img.onerror = show; }
    if (main) main.inert = true;
    history.pushState(Object.assign({}, history.state || {}, { rrpv: 1 }), '');
    try { xb.focus({ preventScroll: true }); } catch (e) {}

    xb.addEventListener('click', function () { closeViewer(true); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeViewer(true);
      else if (e.key === 'ArrowRight') goTo(v.i + 1);
      else if (e.key === 'ArrowLeft') goTo(v.i - 1);
      else if (e.key === 'Tab') { e.preventDefault(); xb.focus(); }
    });

    var s = null;
    el.addEventListener('pointerdown', function (e) {
      if (e.button || e.target.closest('button') || v.closing) return;
      if (e.pointerType !== 'mouse' && e.clientX < EDGE) return;
      s = { x: e.clientX, y: e.clientY, ax: null, ht: performance.now(), hx: e.clientX, hy: e.clientY, vx: 0, vy: 0, dx: 0, dy: 0, id: e.pointerId };
      try { el.setPointerCapture(e.pointerId); } catch (x) {}
    });
    el.addEventListener('pointermove', function (e) {
      if (!s || e.pointerId !== s.id) return;
      var dx = e.clientX - s.x, dy = e.clientY - s.y;
      if (!s.ax) {
        if (Math.abs(dx) + Math.abs(dy) < 6) return;
        s.ax = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      }
      var now = performance.now(), dt = now - s.ht;
      if (dt > 0) { s.vx = (e.clientX - s.hx) / dt; s.vy = (e.clientY - s.hy) / dt; }
      s.hx = e.clientX; s.hy = e.clientY; s.ht = now; s.dx = dx; s.dy = dy;
      if (s.ax === 'x') {
        var edge = (v.i === 0 && dx > 0) || (v.i === n - 1 && dx < 0);
        place(edge ? (dx > 0 ? 1 : -1) * Math.pow(Math.abs(dx), 0.7) : dx, false);
      } else drag(dx, dy);
    });
    var up = function (e) {
      if (!s || e.pointerId !== s.id) return;
      var st = s; s = null;
      if (st.ax === 'x') {
        var k = v.i;
        if (st.dx < -W() * 0.18 || st.vx < -0.4) k++;
        else if (st.dx > W() * 0.18 || st.vx > 0.4) k--;
        goTo(k);
      } else if (st.ax === 'y') {
        if (Math.abs(st.dy) > 90 || Math.abs(st.vy) > 0.6) closeViewer(true);
        else dragBack();
      }
    };
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', function (e) { if (s && s.ax === 'y') dragBack(); else if (s) place(0, true); s = null; });
    el.addEventListener('wheel', function (e) { e.preventDefault(); }, { passive: false });

    function cur() { return track.children[v.i].querySelector('img'); }
    function drag(dx, dy) {
      var k = Math.min(Math.abs(dy), 500);
      cur().style.transform = 'translate(' + (dx * 0.6) + 'px,' + dy + 'px) scale(' + (1 - k / 1400) + ')';
      bg.style.opacity = String(1 - k / 380);
      ui.forEach(function (u) { u.style.opacity = String(Math.max(0, 1 - k / 120)); });
    }
    function dragBack() {
      var im = cur(), from = im.style.transform;
      im.style.transform = ''; bg.style.opacity = ''; ui.forEach(function (u) { u.style.opacity = ''; });
      if (from) anim(im, [{ transform: from }, { transform: 'none' }], { duration: D(340), easing: IOS });
    }
    v.cur = cur;
  }
  function closeViewer(byUs) {
    var v = pv;
    if (!v || v.closing) return;
    v.closing = true;
    pv = null;
    v.sync(v.i, false);
    var im = v.cur(), from = im.style.transform || 'none';
    im.style.transform = '';
    im.getAnimations && im.getAnimations().forEach(function (a) { a.cancel(); });
    var slot = v.slides[v.i];
    var f = fit(im, slot);
    var T = D(380);
    if (f) anim(im, [{ transform: from, clipPath: 'inset(0px)' }, { transform: f.t, clipPath: f.clip }], { duration: T, easing: IOS, fill: 'forwards' });
    anim(v.bg, [{ opacity: getComputedStyle(v.bg).opacity }, { opacity: 0 }], { duration: D(300), easing: OUT, fill: 'forwards' });
    v.ui.forEach(function (u) { anim(u, [{ opacity: getComputedStyle(u).opacity }, { opacity: 0 }], { duration: D(120), fill: 'forwards' }); });
    var done = function () {
      slot.classList.remove('is-out');
      v.slides.forEach(function (s) { s.classList.remove('is-out'); });
      v.el.remove();
      if (v.main) v.main.inert = v.wasInert;
      try { if (v.opener && v.opener.focus) v.opener.focus({ preventScroll: true }); } catch (e) {}
    };
    if (T) setTimeout(done, T); else done();
    if (byUs && history.state && history.state.rrpv) { pvPop = true; history.back(); }
  }
  addEventListener('popstate', function () { if (pv) closeViewer(false); });

  function boot() { [].forEach.call(document.querySelectorAll('[data-gal]'), initGallery); keepLeaving(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
