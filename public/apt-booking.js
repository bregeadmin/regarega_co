/* Booking-request panel for a flat page (regarega.co / bre.ge).
   Reads window.APT_BOOK = { id, title, maxGuests, url, key, lang, t }.
   - Pulls live availability + prices from the public RPCs (035/036).
   - Calendar: booked nights struck-through & locked; free nights show price/night (+10%).
   - On a valid range: shows price breakdown + request form; submits to /api/booking.
   Shared by EN and RU pages; all visible copy comes from APT_BOOK.t (English fallback). */
(function () {
  var CFG = window.APT_BOOK || {};
  var T = CFG.t || {};
  if (!CFG.id) return;

  var MARKUP = 1.10;     // platform +10% — nightly only (cleaning stays netto)
  var MIN_NIGHTS = 2;
  var SCAN_DAYS = 180;   // window for the "from $X" minimum

  var panel = document.getElementById('aptBook');
  var trigger = document.getElementById('dateTrigger');
  var pop = document.getElementById('calPop');
  var calMonths = document.getElementById('calMonths');
  var calPrev = document.getElementById('calPrev');
  var calNext = document.getElementById('calNext');
  var calNight = document.getElementById('calNight');
  var calApply = document.getElementById('calApply');
  var dateVal = document.getElementById('dateVal');
  var abFrom = document.getElementById('abFrom');
  var abSave = document.getElementById('abSave');
  var abPick = document.getElementById('abPick');
  var abSummary = document.getElementById('abSummary');
  var abForm = document.getElementById('abForm');
  var abName = document.getElementById('abName');
  var abContact = document.getElementById('abContact');
  var abSeg = document.getElementById('abSeg');
  var abSend = document.getElementById('abSend');
  var abErr = document.getElementById('abErr');
  var abCompany = document.getElementById('abCompany');
  var mobBtn = document.getElementById('bookBtnMobile');
  if (!trigger || !pop || !panel) return;

  var t = function (k, d) { return (T[k] != null) ? T[k] : d; };
  var monthNames = T.months || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var weekDays = T.week || ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  // plural picker — Russian needs 3 forms (ночь / ночи / ночей), others 2
  function pl(n, f) {
    if (CFG.lang === 'ru') {
      var a = n % 10, b = n % 100;
      if (a === 1 && b !== 11) return f[0];
      if (a >= 2 && a <= 4 && (b < 10 || b >= 20)) return f[1];
      return f[2];
    }
    return n === 1 ? f[0] : f[1];
  }
  function nightsLabel(n) { return pl(n, T.nightsForms || ['night', 'nights', 'nights']); }
  // the shared guests widget writes its label in English; re-localize it for RU
  function localizeGuests() {
    if (CFG.lang !== 'ru') return;
    var gt = document.getElementById('gtVal'); if (!gt) return;
    var g = (window.__getBookingGuests && window.__getBookingGuests()) || { adults: 2, children: 0, infants: 0 };
    var total = (g.adults || 0) + (g.children || 0);
    var parts = [total + ' ' + pl(total, ['гость', 'гостя', 'гостей'])];
    if (g.infants) parts.push(g.infants + ' ' + pl(g.infants, ['младенец', 'младенца', 'младенцев']));
    gt.textContent = parts.join(' · ');
  }

  var today = new Date(); today.setHours(0, 0, 0, 0);
  var BOOKED = new Set();
  var PRICE = {};            // 'YYYY-MM-DD' -> netto nightly override
  var BASE = null;           // netto base nightly
  var CUR = 'usd';
  var CLEAN = 0;             // netto cleaning fee
  var viewYear = today.getFullYear();
  var viewMonth = today.getMonth();
  var startDate = null, endDate = null, mode = 'start';
  var channel = 'telegram';
  var sending = false;

  function sym(c) { return (c || CUR) === 'gel' ? '₾' : '$'; }
  function money(n, c) { return sym(c) + Math.round(n); }
  function fmtKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function parseKey(k) { var p = k.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
  function fmtPretty(d) { if (!d) return null; return String(d.getDate()).padStart(2, '0') + ' ' + monthNames[d.getMonth()].slice(0, 3).toLowerCase(); }
  function nettoFor(k) { return (k in PRICE) ? PRICE[k] : BASE; }
  function nightlyGuest(k) { var n = nettoFor(k); return (n == null) ? null : n * MARKUP; }

  // ---------- live data ----------
  function rpc(fn, payload) {
    return fetch(CFG.url + '/rest/v1/rpc/' + fn, {
      method: 'POST',
      headers: { apikey: CFG.key, Authorization: 'Bearer ' + CFG.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function loadData() {
    rpc('public_apartment_availability', { p_apartment: CFG.id }).then(function (rows) {
      BOOKED = new Set();
      (rows || []).forEach(function (b) {
        var d = parseKey(b.ci), end = parseKey(b.co);
        while (d < end) { BOOKED.add(fmtKey(d)); d.setDate(d.getDate() + 1); }
      });
      if (!pop.hidden) render();
    });
    rpc('public_apartment_pricing', { p_apartment: CFG.id }).then(function (p) {
      if (!p) return;
      BASE = (p.base_rate != null) ? Number(p.base_rate) : null;
      CUR = p.currency || 'usd';
      if (p.markup_pct != null) MARKUP = 1 + Number(p.markup_pct) / 100;   // наценка = комиссия оператора (фолбэк 1.10)
      CLEAN = (p.cleaning != null) ? Number(p.cleaning) : 0;
      if (p.min_nights != null) MIN_NIGHTS = Math.max(1, Number(p.min_nights) || 2);
      PRICE = {};
      (p.rates || []).forEach(function (r) { PRICE[r.date] = Number(r.price); });
      updateFrom();
      if (!pop.hidden) render();
      if (startDate && endDate) buildSummary();
    });
  }
  function updateFrom() {
    if (!abFrom) return;
    var min = null, d = new Date(today), lim = new Date(today); lim.setDate(lim.getDate() + SCAN_DAYS);
    while (d < lim) {
      var k = fmtKey(d);
      if (!BOOKED.has(k)) { var g = nightlyGuest(k); if (g != null && (min == null || g < min)) min = g; }
      d.setDate(d.getDate() + 1);
    }
    if (min != null) {
      abFrom.textContent = t('from', 'from') + ' ' + money(min);
      var per = document.getElementById('abPer');
      if (per) per.hidden = false;
      if (abSave) abSave.hidden = false;
    }
  }

  // ---------- calendar ----------
  function bookedInRange(a, b) { // any booked night within [a, b)
    var d = new Date(a);
    while (d < b) { if (BOOKED.has(fmtKey(d))) return true; d.setDate(d.getDate() + 1); }
    return false;
  }
  function renderMonth(year, month) {
    var first = new Date(year, month, 1);
    var startWeekday = (first.getDay() + 6) % 7;
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var html = '<div class="cal-month"><div class="cal-title">' + monthNames[month] + ' ' + year + '</div>';
    html += '<div class="cal-week">';
    weekDays.forEach(function (w) { html += '<div class="cal-week-day">' + w + '</div>'; });
    html += '</div><div class="cal-grid">';
    for (var i = 0; i < startWeekday; i++) html += '<button class="cal-day empty" disabled></button>';
    for (var dd = 1; dd <= daysInMonth; dd++) {
      var date = new Date(year, month, dd);
      var key = fmtKey(date);
      var isToday = date.getTime() === today.getTime();
      var cls = 'cal-day', lock = false, price = null;
      if (date < today) { cls += ' past'; lock = true; }
      else if (BOOKED.has(key)) { cls += ' booked'; lock = true; }
      else { cls += ' av'; price = nightlyGuest(key); }
      if (startDate && fmtKey(startDate) === key) { cls += ' start'; if (endDate && fmtKey(endDate) === key) cls += ' range-single'; }
      if (endDate && fmtKey(endDate) === key) cls += ' end';
      if (startDate && endDate && date > startDate && date < endDate) cls += ' inside';
      if (isToday) cls += ' is-today';
      var pTxt = (price != null) ? '<span class="cd-p">' + money(price) + '</span>' : '<span class="cd-p"></span>';
      html += '<button class="' + cls + '"' + (lock ? ' disabled' : '') + ' data-date="' + key + '"><span class="cd-n">' + dd + '</span>' + pTxt + '</button>';
    }
    html += '</div></div>';
    return html;
  }
  function render() {
    var nm = viewMonth + 1, ny = nm > 11 ? viewYear + 1 : viewYear; nm = nm > 11 ? 0 : nm;
    calMonths.innerHTML = renderMonth(viewYear, viewMonth) + renderMonth(ny, nm);
    calMonths.querySelectorAll('.cal-day.av').forEach(function (btn) {
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        var p = btn.dataset.date.split('-').map(Number);
        var d = new Date(p[0], p[1] - 1, p[2]);
        if (mode === 'start' || (startDate && d <= startDate)) {
          startDate = d; endDate = null; mode = 'end';
        } else {
          if (bookedInRange(startDate, d)) {          // can't span a booked night
            startDate = d; endDate = null; mode = 'end';
          } else {
            endDate = d; mode = 'start';
          }
        }
        updateLabels(); render();
      });
    });
  }
  function nightsCount() { return (startDate && endDate) ? Math.round((endDate - startDate) / 86400000) : 0; }
  function updateLabels() {
    if (startDate && endDate) {
      dateVal.textContent = fmtPretty(startDate) + ' → ' + fmtPretty(endDate);
      dateVal.classList.remove('empty');
    } else if (startDate) {
      dateVal.textContent = fmtPretty(startDate) + ' → …';
      dateVal.classList.remove('empty');
    } else {
      dateVal.textContent = t('addDates', 'add dates'); dateVal.classList.add('empty');
    }
    var n = nightsCount();
    if (startDate && endDate) {
      if (n < MIN_NIGHTS) { calNight.textContent = t('minNights', 'min 2 nights').replace(/\d+/, MIN_NIGHTS); }
      else { calNight.textContent = '✓ ' + n + ' ' + nightsLabel(n); }
    } else if (startDate) { calNight.textContent = t('pickOut', '→ now pick checkout'); }
    else { calNight.textContent = t('pickIn', '→ pick arrival'); }

    if (startDate && endDate && n >= MIN_NIGHTS) { setState('dates'); buildSummary(); }
    else if (panel.dataset.state !== 'sent') { setState('empty'); }
  }

  // ---------- panel state + summary ----------
  function setState(s) { panel.dataset.state = s; }
  function buildSummary() {
    if (!abSummary || !(startDate && endDate)) return;
    var n = nightsCount();
    var sub = 0, missing = false, d = new Date(startDate);
    for (var i = 0; i < n; i++) { var g = nightlyGuest(fmtKey(d)); if (g == null) missing = true; else sub += g; d.setDate(d.getDate() + 1); }
    var rows = '';
    if (missing) {
      rows = '<div class="ab-line"><span>' + n + ' ' + nightsLabel(n) + '</span><span>' + t('onRequest', 'on request') + '</span></div>';
    } else {
      var avg = sub / n;
      rows += '<div class="ab-line"><span>' + money(avg) + ' × ' + n + ' ' + nightsLabel(n) + '</span><span>' + money(sub) + '</span></div>';
      if (CLEAN > 0) rows += '<div class="ab-line"><span>' + t('cleaning', 'cleaning') + '</span><span>' + money(CLEAN) + '</span></div>';
      rows += '<div class="ab-line total"><span>' + t('total', 'total') + '</span><span>' + money(sub + CLEAN) + '</span></div>';
    }
    abSummary.innerHTML = rows;
    abSummary.dataset.amount = missing ? '' : String(Math.round(sub + CLEAN));
  }

  // ---------- calendar open/close ----------
  function reposition() {
    if (pop.hidden) return;
    var rect = trigger.getBoundingClientRect();
    var top = Math.max(14, rect.bottom + 8);
    pop.style.top = top + 'px';
    pop.style.left = Math.max(14, Math.min(window.innerWidth - pop.offsetWidth - 14, rect.left)) + 'px';
  }
  function openPop() { pop.hidden = false; trigger.classList.add('active'); render(); reposition(); }
  function closePop() { pop.hidden = true; trigger.classList.remove('active'); }
  trigger.addEventListener('click', function (e) { e.stopPropagation(); if (pop.hidden) openPop(); else closePop(); });
  if (abPick) abPick.addEventListener('click', function () { openPop(); });
  calPrev.addEventListener('click', function (ev) { ev.stopPropagation(); viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } render(); });
  calNext.addEventListener('click', function (ev) { ev.stopPropagation(); viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } render(); });
  if (calApply) calApply.addEventListener('click', function (ev) { ev.stopPropagation(); closePop(); });
  document.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target) && !trigger.contains(e.target)) closePop(); });
  window.addEventListener('scroll', reposition, { passive: true });
  window.addEventListener('resize', reposition);
  if (mobBtn) mobBtn.addEventListener('click', function () {
    if (panel.scrollIntoView) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(openPop, 320);
  });

  // ---------- channel segment ----------
  var placeholders = T.placeholders || { telegram: '@username', whatsapp: '+995 …', email: 'name@email.com' };
  if (abSeg) abSeg.querySelectorAll('.ab-seg-b').forEach(function (b) {
    b.addEventListener('click', function () {
      abSeg.querySelectorAll('.ab-seg-b').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      channel = b.dataset.ch;
      if (abContact) { abContact.placeholder = placeholders[channel] || ''; abContact.type = channel === 'email' ? 'email' : 'text'; }
    });
  });

  // ---------- submit ----------
  function showErr(m) { if (abErr) { abErr.textContent = m; abErr.style.display = m ? 'block' : 'none'; } }
  if (abForm) abForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending) return;
    showErr('');
    if (!(startDate && endDate && nightsCount() >= MIN_NIGHTS)) { showErr(t('errDates', 'pick your dates first')); return; }
    var name = (abName.value || '').trim();
    var contact = (abContact.value || '').trim();
    if (!name) { showErr(t('errName', 'add your name')); abName.focus(); return; }
    if (!contact) { showErr(t('errContact', 'add a contact')); abContact.focus(); return; }
    var g = (window.__getBookingGuests && window.__getBookingGuests()) || { adults: 2, children: 0 };
    var adults = (g.adults || 2) + (g.children || 0);
    var amount = abSummary && abSummary.dataset.amount ? Number(abSummary.dataset.amount) : null;

    sending = true; abSend.disabled = true; abSend.textContent = t('sending', 'sending…');
    fetch('/api/booking', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apartment_id: CFG.id, apt_title: CFG.title || '',
        ci: fmtKey(startDate), co: fmtKey(endDate), adults: adults,
        name: name, channel: channel, contact: contact,
        amount: amount, currency: CUR, company: abCompany ? abCompany.value : ''
      })
    }).then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
      .then(function (res) {
        if (res && res.ok) { setState('sent'); if (panel.scrollIntoView) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        else { showErr(t('errSend', 'could not send — try telegram')); }
      })
      .catch(function () { showErr(t('errSend', 'could not send — try telegram')); })
      .finally(function () { sending = false; abSend.disabled = false; abSend.textContent = t('send', '↗ send request'); });
  });

  // init
  if (abContact) abContact.placeholder = placeholders.telegram;
  localizeGuests();
  var gpApply = document.getElementById('gpApply');
  if (gpApply) gpApply.addEventListener('click', function () { setTimeout(localizeGuests, 0); });
  loadData();

  // auto-open the date calendar when arrived via a "book" deep link (#aptBook — e.g. from bre.ge)
  try {
    if (location.hash === '#aptBook') {
      setTimeout(function () { if (pop && pop.hidden) openPop(); }, 450);
    }
  } catch (e) {}
})();
