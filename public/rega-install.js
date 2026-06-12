/* rega-install.js — плашка «гид на телефон» (PWA-онбординг + QR с компа).
   Самостоятельный файл: подключается на главной и на хабе гида (EN+RU).
   Телефон: Android — кнопка установки (beforeinstallprompt), iOS — шаги «На экран Домой».
   Компьютер: QR текущей страницы (рисуем локально /rega-qr.js, ссылка наружу не уходит). */
(function () {
  var LANG = window.RR_LANG || (location.pathname.indexOf('/ru/') === 0 ? 'ru' : 'en');
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
    // знак = точная копия .brand-sign из шапки (Site.astro), не фавиконный вырез
    var mark = '<svg class="rri-mark" viewBox="0 0 100 100" aria-hidden="true"><path fill-rule="evenodd" fill="#FF5E1A" d="M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0 z M 64,64 m -12,0 a 12,12 0 1,1 24,0 a 12,12 0 1,1 -24,0 z"/></svg>';
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
