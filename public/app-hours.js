/* rega rega app — «open now» from Google hours (guide_places.hours), Batumi time.
   ONE helper for the home screen (components/app/NowScreen.astro) and the map (public/app-map.js),
   so «до 23:00» means the same thing everywhere. Plain script → window.rrHours.
   hours = ["Monday: 10:00 AM - 10:00 PM", "Tuesday: 12:00 - 10:45 PM", "Wednesday: Open 24 hours", "Thursday: Closed", …]
   (bump ?v= on change: sw.js serves it stale-while-revalidate) */
(function () {
  var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // Batumi wall clock
  function now() {
    var d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Tbilisi' }));
    return { date: d, hour: d.getHours(), dow: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
  }
  // "10:00 AM" / "12:00" (the suffix may sit only on the close time → fallback)
  function pt(s, fallback) {
    var m = String(s).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i); if (!m) return null;
    var suf = m[3] || fallback; var h = +m[1];
    if (suf) { h = h % 12; if (/pm/i.test(suf)) h += 12; }
    return h * 60 + (+m[2]);
  }
  function ranges(str) {
    if (!str || /closed/i.test(str)) return [];
    if (/24/.test(str) && /hour/i.test(str)) return [{ o: 0, c: 1440, all: true }];
    return str.split(',').map(function (r) {
      var p = r.split(/[–—-]/); if (p.length < 2) return null;
      var suf = (p[1].match(/(AM|PM)/i) || [])[1];
      var o = pt(p[0], suf), c = pt(p[1]); if (o == null || c == null) return null;
      if (c <= o) c += 1440; return { o: o, c: c };
    }).filter(Boolean);
  }
  function dayStr(hours, d) {
    for (var i = 0; i < hours.length; i++) { var l = hours[i], k = l.indexOf(':'); if (k > 0 && l.slice(0, k).trim() === DAYS[d]) return l.slice(k + 1).trim(); }
    return '';
  }
  // → null (no hours known), false (closed), or { all } / { close: minutes-of-day }
  function openNow(hours, t) {
    if (!hours || !hours.length) return null;
    t = t || now();
    var today = ranges(dayStr(hours, t.dow)), yest = ranges(dayStr(hours, (t.dow + 6) % 7));
    for (var i = 0; i < today.length; i++) if (t.mins >= today[i].o && t.mins < today[i].c) return today[i].all ? { all: true } : { close: today[i].c % 1440 };
    for (var j = 0; j < yest.length; j++) if (t.mins + 1440 >= yest[j].o && t.mins + 1440 < yest[j].c) return { close: yest[j].c % 1440 };
    return false;
  }
  function hhmm(m) { return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2); }
  // «открыто до 23:00» (hero)
  function status(o, ru) {
    if (!o) return '';
    if (o.all) return ru ? 'открыто круглосуточно' : 'open 24 hours';
    return (ru ? 'открыто до ' : 'open till ') + hhmm(o.close);
  }
  // «до 23:00» (list rows)
  function short(o, ru) {
    if (!o) return '';
    if (o.all) return ru ? 'круглосуточно' : '24 hours';
    return (ru ? 'до ' : 'until ') + hhmm(o.close);
  }
  window.rrHours = { now: now, openNow: openNow, status: status, short: short, hhmm: hhmm };
})();
