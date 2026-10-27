/* rega rega app — «мой батуми»: save places / flats / news to the guest's own city collection.
   Loaded (defer) by layouts/App.astro + AppFull.astro → window.rrSaves before any module script.
   - Markup: any <button class="rr-punch" data-k="place|stay|news" data-s="<slug>" data-n="<name>"
     [data-c="batumi"]> — this script fills the mark, aria-pressed, aria-label (also for buttons
     added later, e.g. by app-map.js, via a MutationObserver). Clicks are caught in the capture
     phase: they never open the card link or grow the gallery.
   - Tap: the mark fills, a small disc leaves the hole along a gentle arc to the «profile» tab,
     toast «сохранили в мой батуми · открыть». Tap again = removed, quietly. Reduced motion → instant.
   - Storage: localStorage rr_saves = [{k,s,c,t}] (always local first). The onboarding's rr_punched
     (array of place slugs, lib/firstRun.ts) is merged in once (rr_saves_mig).
   - Account (window.rrAuth, migration 088): signed in → first time on this phone merge local into the
     account (union), then the account is the truth (rr_saves_uid = whose copy this is). Failed calls
     queue in rr_saves_q and replay next load. RPCs not in the DB yet (404/PGRST202) → local only.
   Event: window 'rr-saves' after every change (my-screen, profile counter).
   (bump ?v= in the layouts on change: sw.js serves it stale-while-revalidate) */
(function () {
  'use strict';
  var KEY = 'rr_saves', UIDK = 'rr_saves_uid', QK = 'rr_saves_q', MIGK = 'rr_saves_mig';
  var KINDS = { place: 1, stay: 1, news: 1 };
  var SLUG = /^[a-z0-9-]{1,120}$/;
  var RU = (document.documentElement.lang || '').slice(0, 2) === 'ru';
  var BASE = RU ? '/ru/georgia/batumi' : '/georgia/batumi';
  var CITY = { batumi: { ru: 'батуми', en: 'batumi', ru6: 'батуми' }, tbilisi: { ru: 'тбилиси', en: 'tbilisi', ru6: 'тбилиси' } };
  var D = 'M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0 z M 64,64 m -12,0 a 12,12 0 1,1 24,0 a 12,12 0 1,1 -24,0 z';
  var SVG = '<svg viewBox="-6 -6 112 112" aria-hidden="true"><path fill-rule="evenodd" d="' + D + '"/></svg>';
  var RM = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  function cityName(c) { var x = CITY[c || 'batumi']; return x ? (RU ? x.ru : x.en) : String(c || 'batumi'); }
  var L = RU
    ? { save: function (c) { return 'сохранить в мой ' + cityName(c); }, rm: function (c) { return 'убрать из моего ' + cityName(c); },
        saved: function (c) { return 'сохранили в мой ' + cityName(c); }, open: 'открыть' }
    : { save: function (c) { return 'save to my ' + cityName(c); }, rm: function (c) { return 'remove from my ' + cityName(c); },
        saved: function (c) { return 'saved to my ' + cityName(c); }, open: 'open' };

  function read(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function drop(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function valid(x) { return x && KINDS[x.k] && SLUG.test(x.s || '') && SLUG.test(x.c || 'batumi'); }
  function clean(list) {
    var seen = {}, out = [];
    (Array.isArray(list) ? list : []).forEach(function (x) {
      if (!valid(x) || seen[x.k + ':' + x.s]) return;
      seen[x.k + ':' + x.s] = 1;
      out.push({ k: x.k, s: x.s, c: x.c || 'batumi', t: x.t || new Date().toISOString() });
    });
    return out;
  }

  var items = clean(read(KEY));
  // onboarding (rr_punched = ["place-slug", …]) → once into rr_saves
  if (!read(MIGK)) {
    var p = read('rr_punched');
    if (Array.isArray(p)) p.forEach(function (s) { if (typeof s === 'string' && !find('place', s)) items.unshift({ k: 'place', s: s, c: 'batumi', t: new Date().toISOString() }); });
    items = clean(items);
    write(KEY, items); write(MIGK, 1);
  }

  function find(k, s) { for (var i = 0; i < items.length; i++) if (items[i].k === k && items[i].s === s) return items[i]; return null; }
  function persist() {
    write(KEY, items);
    paintAll();
    try { window.dispatchEvent(new CustomEvent('rr-saves', { detail: { count: items.length } })); } catch (e) {}
  }

  /* ---------------- account sync ---------------- */
  var acct = null; // uid once this phone's copy belongs to the signed-in account
  function api() { var a = window.rrAuth; return a && a.saves ? a : null; }
  function enqueue(op) {
    var q = read(QK); q = Array.isArray(q) ? q : [];
    q = q.filter(function (o) { return !(o.k === op.k && o.s === op.s); }); // last write wins
    q.push(op); write(QK, q.slice(-500));
  }
  function remote(x, on) {
    var a = api();
    if (!acct || !a) return;
    a.saves.set(x.k, x.s, x.c || 'batumi', on).then(function (r) { if (!r.ok && !r.missing) enqueue({ k: x.k, s: x.s, c: x.c, on: on }); });
  }
  function replay(a, q) {
    var i = 0;
    return new Promise(function (res, rej) {
      (function next() {
        if (i >= q.length) { write(QK, []); return res(); }
        var o = q[i];
        a.saves.set(o.k, o.s, o.c || 'batumi', !!o.on).then(function (r) {
          if (!r.ok) { write(QK, q.slice(i)); return rej(r); }
          i++; next();
        });
      })();
    });
  }
  function boot() {
    var a = api();
    if (!a) return;
    a.session().then(function (s) {
      var uid = s && s.user && s.user.id;
      if (!uid) return;
      var was = read(UIDK);
      if (was && was !== uid) { items = []; write(QK, []); persist(); was = null; } // another account's copy
      var step;
      if (was === uid) {
        acct = uid; // already this account's copy: live changes go straight up
        var q = read(QK);
        step = replay(a, Array.isArray(q) ? q : []);
      } else {
        step = a.saves.merge(items).then(function (r) { if (!r.ok) throw r; });
      }
      return step.then(function () { return a.saves.list(); }).then(function (r) {
        if (!r.ok || !Array.isArray(r.data)) throw r;
        items = clean(r.data);
        write(UIDK, uid); acct = uid;
        persist();
      });
    }).catch(function () { /* offline / RPCs not there yet → stay local, retry next load */ });
  }

  /* ---------------- public api ---------------- */
  function set(k, s, on, c) {
    if (!KINDS[k] || !SLUG.test(s || '')) return false;
    var x = find(k, s);
    if (on && !x) { x = { k: k, s: s, c: c || 'batumi', t: new Date().toISOString() }; items.unshift(x); persist(); remote(x, true); }
    else if (!on && x) { items = items.filter(function (y) { return y !== x; }); persist(); remote(x, false); }
    return !!on;
  }
  function forget() { // sign-out / delete account: drop the account's copy (a never-synced local list stays)
    if (!read(UIDK)) return;
    [KEY, UIDK, QK].forEach(drop);
    items = []; acct = null;
  }

  /* ---------------- the mark on cards ---------------- */
  function paint(b) {
    if (!b.firstElementChild) b.innerHTML = SVG;
    if (b.tagName === 'BUTTON' && b.type !== 'button') b.type = 'button';
    var on = !!find(b.dataset.k, b.dataset.s), c = b.dataset.c || 'batumi', n = b.dataset.n ? ': ' + b.dataset.n : '';
    b.classList.toggle('is-on', on);
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', (on ? L.rm(c) : L.save(c)) + n);
  }
  function paintAll(root) { [].forEach.call((root || document).querySelectorAll('.rr-punch'), paint); }

  var easeIO = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  function fly(b) {
    var tab = document.querySelector('.tabbar a[data-tab="profile"]');
    var r = b.getBoundingClientRect();
    var tr = tab && tab.getClientRects().length ? tab.getBoundingClientRect() : { left: innerWidth - 60, top: innerHeight - 70, width: 40, height: 40 };
    var x0 = r.left + r.width / 2 + r.width * 0.12, y0 = r.top + r.height / 2 + r.height * 0.12; // from the hole
    var x2 = tr.left + tr.width / 2, y2 = tr.top + tr.height / 2 - 6;
    var x1 = Math.min(x0, x2) - 110, y1 = (y0 + y2) / 2 - 40; // a gentle arc towards the middle of the screen
    var p = document.createElement('i');
    p.className = 'rr-piece';
    document.body.appendChild(p);
    var t0 = performance.now(), dur = 640;
    (function frame(now) {
      var k = Math.min(1, (now - t0) / dur), t = easeIO(k);
      var x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
      var y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      p.style.transform = 'translate(' + (x - 9) + 'px,' + (y - 9) + 'px) scale(' + (1 - 0.45 * t) + ')';
      p.style.opacity = k > 0.84 ? String(1 - (k - 0.84) / 0.16) : '1';
      if (k < 1) requestAnimationFrame(frame);
      else {
        p.remove();
        if (tab) { tab.classList.add('rr-got'); setTimeout(function () { tab.classList.remove('rr-got'); }, 320); }
      }
    })(t0);
  }

  var toastEl = null;
  function toast(c) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'rr-stoast';
      toastEl.setAttribute('role', 'status');
      toastEl.innerHTML = SVG + '<span></span><a></a>';
      document.body.appendChild(toastEl);
    }
    toastEl.querySelector('span').textContent = L.saved(c);
    var a = toastEl.querySelector('a');
    a.textContent = L.open; a.href = BASE + '/app/my';
    requestAnimationFrame(function () { toastEl.classList.add('on'); });
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('on'); }, 2800);
  }

  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest && e.target.closest('.rr-punch');
    if (!b) return;
    e.preventDefault(); e.stopPropagation();
    var k = b.dataset.k, s = b.dataset.s, c = b.dataset.c || 'batumi';
    var on = !find(k, s);
    set(k, s, on, c);
    if (!on) { if (toastEl) toastEl.classList.remove('on'); return; } // removing is quiet
    if (!RM.matches) { b.classList.add('is-punch'); setTimeout(function () { b.classList.remove('is-punch'); }, 420); fly(b); setTimeout(function () { toast(c); }, 360); }
    else toast(c);
  }, true);
  // the span version (inside row buttons, app-map.js): Enter / Space like a real button
  document.addEventListener('keydown', function (e) {
    var b = e.target;
    if (!b || !b.classList || !b.classList.contains('rr-punch') || b.tagName === 'BUTTON') return;
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault(); e.stopPropagation(); b.click();
  }, true);
  // a stray tap on the card's gallery must not start a drag from the button either
  ['pointerdown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (e.target && e.target.closest && e.target.closest('.rr-punch')) e.stopPropagation(); }, { capture: true, passive: true });
  });

  window.rrSaves = {
    list: function (city) { return items.filter(function (x) { return !city || (x.c || 'batumi') === city; }).slice(); },
    has: function (k, s) { return !!find(k, s); },
    set: set,
    count: function (city) { return window.rrSaves.list(city).length; },
    forget: forget,
    synced: function () { return !!acct; },
    cityName: cityName,
    paint: paintAll,
    base: BASE,
  };

  function start() {
    paintAll();
    if (window.MutationObserver) {
      var pend = false;
      new MutationObserver(function () {
        if (pend) return; pend = true;
        requestAnimationFrame(function () { pend = false; [].forEach.call(document.querySelectorAll('.rr-punch:not([aria-label])'), paint); });
      }).observe(document.body, { childList: true, subtree: true });
    }
    window.rrAuth ? boot() : addEventListener('rr-auth-ready', boot, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true }); else start();
  // back from another page (bfcache) — a save made there shows here
  addEventListener('pageshow', function (e) { if (e.persisted) { items = clean(read(KEY)); persist(); } });
})();
