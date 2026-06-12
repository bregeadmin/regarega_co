/* rega-personal.js — персональный слой гида Rega Rega (online).
   Работает только при наличии токена брони (?t= или localStorage). Без токена — обычный гид.
   Зависит от: window.RR_PLACES (места с координатами), window.RR_LANG ('en'|'ru'),
   глобального supabase (CDN). Хук избранного: localStorage 'rr_favs' + событие 'rr:favschange'
   (скрипт сердечек живёт в Site.astro/SiteRu.astro). Токен в ссылки НЕ пишем; чистим ?t= из URL. */
(function () {
  var SB_URL = 'https://qkzinjawtumhjbezlyog.supabase.co';
  var SB_KEY = 'sb_publishable_R0NeSmTwX9qt0bxlHYj1AA_JIVRqsqU';
  var LANG = window.RR_LANG || 'en';
  var PLACES = window.RR_PLACES || [];
  var STAYS = LANG === 'ru' ? '/ru/georgia/batumi/stays' : '/georgia/batumi/stays';
  var GUIDE_BASE = LANG === 'ru' ? '/ru/georgia/batumi/guide/' : '/georgia/batumi/guide/';

  var T = {
    en: { hi: 'hi', youAt: "you're staying at", near: 'near you', min: 'min walk',
          back: 'welcome back', soon: 'your trip is coming up', bookAgain: 'book another stay',
          offers: 'for you nearby', refresh: 'refresh', openGuide: 'see place',
          nearMe: 'near me', locating: 'finding…', locErr: 'no location' },
    ru: { hi: 'привет', youAt: 'вы остановились в', near: 'рядом с вами', min: 'мин пешком',
          back: 'с возвращением', soon: 'скоро ваша поездка', bookAgain: 'забронировать снова',
          offers: 'для вас рядом', refresh: 'обновить', openGuide: 'смотреть место',
          nearMe: 'рядом', locating: 'ищем…', locErr: 'нет геолокации' }
  }[LANG];

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function firstName(full) { return (full || '').trim().split(/\s+/)[0] || ''; }
  function uniq(a) { var seen = {}, out = []; (a || []).forEach(function (x) { if (x && !seen[x]) { seen[x] = 1; out.push(x); } }); return out; }

  function getToken() {
    var t = null;
    try {
      var u = new URL(location.href);
      t = u.searchParams.get('t');
      if (t) {
        localStorage.setItem('rr_token', t);
        // вычищаем токен из адресной строки сразу после захвата (он живёт в localStorage)
        u.searchParams.delete('t');
        history.replaceState(null, '', u.pathname + (u.search || '') + (u.hash || ''));
        return t;
      }
      return localStorage.getItem('rr_token');
    } catch (e) { return t; }
  }

  function havKm(a, b) {
    var R = 6371, r = function (x) { return x * Math.PI / 180; };
    var dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
    var s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.sqrt(s));
  }
  function walkMin(km) { return Math.max(1, Math.round(km * 12)); }

  if (!window.supabase) return;             // supabase-js не загрузился — тихо выходим
  var sb = window.supabase.createClient(SB_URL, SB_KEY);
  var TOKEN = getToken();

  // экспорт для отладки/расширений
  window.RR = { token: TOKEN, sb: sb, lang: LANG, t: T };
  if (!TOKEN) { setupNearMe(); return; }     // аноним → кнопка «места рядом со мной» по GPS; избранное локально

  // ── localStorage избранного (тот же ключ/событие, что в Site.astro) ──
  function lsFavs() { try { return JSON.parse(localStorage.getItem('rr_favs') || '[]'); } catch (e) { return []; } }
  function setFavs(arr) {
    try { localStorage.setItem('rr_favs', JSON.stringify(arr)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('rr:favschange', { detail: arr }));
  }

  // ── главный запрос: кто гость, где живёт, какие офферы ──
  sb.rpc('guest_guide', { p_token: TOKEN }).then(function (res) {
    var d = res && res.data;
    if (!d || d.state === 'none') return;
    window.RR.data = d;
    render(d);
  });

  // избранное: гидрация из записи гостя + мерж с локальным, запись обратно (kind='apartment')
  sb.rpc('guest_favorites_list', { p_token: TOKEN }).then(function (res) {
    var rows = (res && res.data) || [];
    var server = rows.filter(function (x) { return x.kind === 'apartment'; }).map(function (x) { return x.slug; });
    var merged = uniq(server.concat(lsFavs()));
    setFavs(merged);                         // обновит ♥ на карточках + фильтр /stays
    sb.rpc('guest_favorites_sync', { p_token: TOKEN, p_slugs: merged, p_kind: 'apartment' });
  });

  // подписка: любое изменение ♥ → запись в Supabase (debounced)
  var syncTimer = null;
  document.addEventListener('rr:favschange', function (e) {
    var slugs = Array.isArray(e.detail) ? e.detail : lsFavs();
    clearTimeout(syncTimer);
    syncTimer = setTimeout(function () {
      sb.rpc('guest_favorites_sync', { p_token: TOKEN, p_slugs: slugs, p_kind: 'apartment' });
    }, 600);
  });

  // ── рендер персональной шапки ──
  function opt(u, w) { return u ? ('/_vercel/image?url=' + encodeURIComponent(u) + '&w=' + (w || 320) + '&q=72') : ''; }
  function placeCard(p, origin) {
    var d = havKm(origin, p);
    var img = opt(p.photo, 320);
    return '<a class="rrp-place" href="' + esc(p.href) + '">' +
      (img ? '<span class="rrp-ph" style="background-image:url(' + esc(img) + ')"></span>' : '<span class="rrp-ph"></span>') +
      '<span class="rrp-meta"><b>' + esc(p.title) + '</b>' +
      '<span class="rrp-dist">' + walkMin(d) + ' ' + T.min + '</span></span></a>';
  }
  function nearestStrip(origin) {
    var near = PLACES.slice().sort(function (a, b) { return havKm(origin, a) - havKm(origin, b); }).slice(0, 6);
    return '<div class="rrp-near"><div class="rrp-h">' + T.near + '</div>' +
      '<div class="rrp-row">' + near.map(function (p) { return placeCard(p, origin); }).join('') + '</div></div>';
  }
  function nearestHtml(d) {
    if (d.apt.lat == null || d.apt.lng == null || !PLACES.length) return '';
    return nearestStrip(d.apt);
  }
  function controlsHtml() {
    // только «обновить» — кнопку «Поделиться» делает Site.astro (site-wide). Не дублируем.
    return '<button type="button" class="rrp-refresh" data-rr="refresh" aria-label="' + esc(T.refresh) + '">' +
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.7 3L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.7-3L3 16"/><path d="M3 21v-5h5"/></svg></button>';
  }
  function offerTicket(o) {
    var done = (o.claimed || 0) >= (o.total || 1);
    var place = o.guide_place_slug ? GUIDE_BASE + o.guide_place_slug : null;
    return '<div class="rrp-offer" data-offer="' + esc(o.offer_id) + '">' +
      '<div class="rrp-offer-top"><b>' + esc(o.partner || o.title) + '</b>' +
      '<span class="rrp-cnt">' + (o.claimed || 0) + '/' + (o.total || 1) + '</span></div>' +
      '<div class="rrp-offer-terms">' + esc(o.terms || o.title) + '</div>' +
      (place ? '<a class="rrp-offer-place" href="' + esc(place) + '">' + T.openGuide + ' →</a>' : '') +
      '<button type="button" class="rrp-claim' + (done ? ' done' : '') + '" ' + (done ? 'disabled' : '') +
        ' data-offer="' + esc(o.offer_id) + '" aria-label="claim">' +
        '<svg viewBox="0 0 100 100" width="22" height="22" fill="currentColor"><path fill-rule="evenodd" d="M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0 z M 64,64 m -12,0 a 12,12 0 1,1 24,0 a 12,12 0 1,1 -24,0 z"/></svg>' +
      '</button></div>';
  }
  function renderOffers(offers) {
    if (!offers || !offers.length) return '';
    return '<div class="rrp-offers"><div class="rrp-h">' + T.offers + '</div>' +
      offers.map(offerTicket).join('') + '</div>';
  }
  function render(d) {
    var el = document.getElementById('rr-personal');
    if (!el) return;
    var name = firstName(d.guest), html = '';
    if (d.state === 'active') {
      html = '<div class="rrp-hero"><div class="rrp-greet">' + esc(T.hi) + (name ? ', ' + esc(name) : '') + '</div>' +
        '<div class="rrp-sub">' + esc(T.youAt) + ' <b>' + esc(d.apt.title) + '</b></div>' +
        controlsHtml() + '</div>' + nearestHtml(d) + renderOffers(d.offers || []);
    } else if (d.state === 'past') {
      html = '<div class="rrp-hero rrp-back"><div class="rrp-greet">' + esc(T.back) + (name ? ', ' + esc(name) : '') + '</div>' +
        '<a class="rrp-book" href="' + STAYS + '">' + esc(T.bookAgain) + ' →</a>' + controlsHtml() + '</div>';
    } else if (d.state === 'pre') {
      html = '<div class="rrp-hero"><div class="rrp-greet">' + esc(T.soon) + (name ? ', ' + esc(name) : '') + '</div>' +
        controlsHtml() + '</div>';
    } else { return; }
    el.innerHTML = html;
    el.hidden = false;
    wire(el);
  }

  function wire(scope) {
    var r = scope.querySelector('[data-rr="refresh"]');
    if (r) r.onclick = refresh;
    scope.querySelectorAll('.rrp-claim').forEach(function (btn) {
      if (!btn.disabled) btn.onclick = function () { claim(btn.getAttribute('data-offer'), btn); };
    });
  }
  function refresh() {
    sb.rpc('guest_guide', { p_token: TOKEN }).then(function (res) {
      var d = res && res.data;
      if (d && d.state !== 'none') { window.RR.data = d; render(d); }
    });
  }
  function claim(offerId, btn) {
    btn.disabled = true;
    sb.rpc('claim_offer', { p_token: TOKEN, p_offer_id: offerId, p_placement: 'guide' }).then(function (res) {
      var d = res && res.data;
      if (d && d.ok) {
        var card = btn.closest('.rrp-offer');
        var cnt = card && card.querySelector('.rrp-cnt');
        if (cnt) cnt.textContent = d.claimed + '/' + d.total;
        if (d.claimed >= d.total) { btn.classList.add('done'); btn.onclick = null; }
        else { btn.disabled = false; }
      } else { btn.disabled = false; }
    });
  }

  // ── аноним (без токена): плавающая кнопка «места рядом со мной» (клон .map-fab — поверх, не полосой) ──
  function nearUsed() { try { return sessionStorage.getItem('rr_nearme_used') === '1'; } catch (e) { return false; } }
  function setupNearMe() {
    if (nearUsed() || !PLACES.length || !navigator.geolocation || document.getElementById('rr-fab')) return;
    var logo = '<svg class="rrf-ico" viewBox="0 0 100 100" aria-hidden="true"><path fill-rule="evenodd" fill="#FF5E1A" d="M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0 z M 62,62 m -16.5,0 a 16.5,16.5 0 1,1 33,0 a 16.5,16.5 0 1,1 -33,0 z"/></svg>';
    var fab = document.createElement('button');
    fab.type = 'button'; fab.id = 'rr-fab'; fab.className = 'rr-fab';
    fab.innerHTML = logo + '<span class="rrf-txt">' + T.nearMe + '</span>';
    document.body.appendChild(fab);
    fab.onclick = function () {
      fab.classList.add('loading'); fab.querySelector('.rrf-txt').textContent = T.locating;
      navigator.geolocation.getCurrentPosition(function (pos) {
        renderNearMe({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, function () {
        fab.classList.remove('loading'); fab.classList.add('err');
        fab.querySelector('.rrf-txt').textContent = T.locErr;
        setTimeout(function () { fab.classList.remove('err'); fab.querySelector('.rrf-txt').textContent = T.nearMe; }, 2600);
      }, { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 });
    };
  }
  function renderNearMe(origin) {
    var fab = document.getElementById('rr-fab'); if (fab) fab.remove();
    try { sessionStorage.setItem('rr_nearme_used', '1'); } catch (e) {}   // показали места → больше не зовём кнопку в этой сессии
    if (document.getElementById('rr-sheet')) return;
    var near = PLACES.slice().sort(function (a, b) { return havKm(origin, a) - havKm(origin, b); }).slice(0, 8);
    var sheet = document.createElement('div');
    sheet.id = 'rr-sheet'; sheet.className = 'rr-sheet';
    sheet.innerHTML = '<div class="rrs-head"><span class="rrp-h">' + T.near + '</span>' +
      '<button type="button" class="rrs-x" aria-label="close">×</button></div>' +
      '<div class="rrp-row">' + near.map(function (p) { return placeCard(p, origin); }).join('') + '</div>';
    document.body.appendChild(sheet);
    requestAnimationFrame(function () { sheet.classList.add('on'); });
    sheet.querySelector('.rrs-x').onclick = function () {
      sheet.classList.remove('on');
      setTimeout(function () { sheet.remove(); setupNearMe(); }, 320);
    };
  }

  window.RR.render = render;
  window.RR.refresh = refresh;
})();

/* ── установка на телефон (онбординг PWA) — для всех, не зависит от токена ── */
(function () {
  var LANG = window.RR_LANG || 'en';
  var T = {
    en: { txt: 'add the guide to your phone', btn: 'install',
          iosTitle: 'add the guide to your home screen',
          s1: 'tap Share at the bottom', s2: 'scroll down the list', s3: 'choose “Add to Home Screen”',
          qrTitle: 'take the guide with you',
          qrTxt: 'point your phone camera — this page opens on your phone' },
    ru: { txt: 'добавьте гид на телефон', btn: 'установить',
          iosTitle: 'поставьте гид на экран «домой»',
          s1: 'нажмите «Поделиться» внизу', s2: 'пролистайте список вниз', s3: 'выберите «На экран Домой»',
          qrTitle: 'возьмите гид с собой',
          qrTxt: 'наведите камеру телефона — эта страница откроется на нём' }
  }[LANG];

  function standalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }
  function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (/macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);  // iPadOS прикидывается маком
  }
  function isAndroid() { return /android/i.test(navigator.userAgent); }
  function dismissed() { try { return localStorage.getItem('rr_install_dismissed') === '1'; } catch (e) { return false; } }
  function dismiss() { try { localStorage.setItem('rr_install_dismissed', '1'); } catch (e) {} var b = document.getElementById('rr-install'); if (b) b.remove(); }

  if (standalone() || dismissed()) return;

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    if (!isAndroid()) return;  // на компьютере вместо установки — QR на телефон
    deferred = e; show('android');
  });
  if (isIOS()) setTimeout(function () { show('ios'); }, 2500);  // iOS не шлёт beforeinstallprompt
  if (!isIOS() && !isAndroid() && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    setTimeout(function () { loadQR(function () { show('desktop'); }); }, 2500);
  }

  function loadQR(cb) {
    if (window.qrcode) return cb();
    var s = document.createElement('script');
    s.src = '/rega-qr.js'; s.onload = cb;
    document.head.appendChild(s);
  }

  function show(mode) {
    if (standalone() || dismissed() || document.getElementById('rr-install')) return;
    var mark = '<svg class="rri-mark" viewBox="0 0 100 100" aria-hidden="true"><path fill-rule="evenodd" fill="#FF5E1A" d="M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0 z M 62,62 m -16.5,0 a 16.5,16.5 0 1,1 33,0 a 16.5,16.5 0 1,1 -33,0 z"/></svg>';
    var x = '<button type="button" class="rri-x" id="rri-x" aria-label="close">×</button>';
    var bar = document.createElement('div');
    bar.id = 'rr-install';
    if (mode === 'android') {
      bar.className = 'android';
      var dl = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 11l5 5 5-5"/></svg>';
      bar.innerHTML = mark + '<span class="rri-txt">' + T.txt + '</span>' +
        '<button type="button" class="rri-btn" id="rri-go">' + T.btn + dl + '</button>' + x;
    } else if (mode === 'desktop') {
      bar.className = 'desktop';
      var svg = '';
      try {
        var qr = window.qrcode(0, 'M');
        qr.addData(location.href);
        qr.make();
        svg = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
      } catch (err) { return; }  // ссылка не влезла в QR — молча не показываем
      bar.innerHTML =
        '<div class="rri-qr">' + svg + '</div>' +
        '<div class="rri-qrcol">' +
          '<div class="rri-head">' + mark + '<span class="rri-title">' + T.qrTitle + '</span>' + x + '</div>' +
          '<p class="rri-qrtxt">' + T.qrTxt + '</p>' +
        '</div>';
    } else {
      bar.className = 'ios';
      var share = '<svg class="rri-share" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v11"/><path d="M8 7l4-4 4 4"/><path d="M6 12v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6"/></svg>';
      bar.innerHTML =
        '<div class="rri-head">' + mark + '<span class="rri-title">' + T.iosTitle + '</span>' + x + '</div>' +
        '<ol class="rri-steps">' +
          '<li><span class="rri-n">1</span><span>' + T.s1 + ' ' + share + '</span></li>' +
          '<li><span class="rri-n">2</span><span>' + T.s2 + '</span></li>' +
          '<li><span class="rri-n">3</span><span>' + T.s3 + '</span></li>' +
        '</ol>';
    }
    document.body.appendChild(bar);
    requestAnimationFrame(function () { bar.classList.add('on'); });
    var go = bar.querySelector('#rri-go');
    if (go) go.onclick = function () { if (deferred) { deferred.prompt(); deferred = null; } bar.remove(); };
    var xb = bar.querySelector('#rri-x'); if (xb) xb.onclick = dismiss;
  }
})();
