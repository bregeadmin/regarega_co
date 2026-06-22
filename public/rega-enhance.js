/* shared UI enhancements (native date sheet shell, banner/hero handling,
   homepage->stays handoff, live count + scroll, view-toggle a11y).
   Loaded by BOTH Site.astro and SiteRu.astro so EN and RU never drift. */
(function(){
  var mq = window.matchMedia('(max-width:720px)');
  var scrim = null;
  function getScrim(){
    if(scrim) return scrim;
    scrim = document.createElement('div');
    scrim.className = 'cal-scrim';
    scrim.addEventListener('click', closeAll);
    document.body.appendChild(scrim);
    return scrim;
  }
  function anyOpen(){ return document.querySelector('.cal-pop:not([hidden])'); }
  function closeAll(){
    document.querySelectorAll('.cal-pop:not([hidden])').forEach(function(p){ p.setAttribute('hidden',''); });
    document.querySelectorAll('.date-trigger.active, .field.active, .date-field.active').forEach(function(t){ t.classList.remove('active'); });
  }
  var openPop = null;
  function clampDesktop(p){
    openPop = p;
    p.classList.add('cal-clamp');
    var top = p.getBoundingClientRect().top;
    p.style.maxHeight = Math.max(360, window.innerHeight - top - 14) + 'px';
  }
  function reclamp(){ if(openPop && !openPop.hasAttribute('hidden') && !mq.matches) clampDesktop(openPop); }
  function onOpen(p){
    getScrim().classList.add('on');
    document.body.classList.add('cal-open');
    if(mq.matches){
      p.style.transition='none';
      p.style.transform='translateY(100%)';
      void p.offsetHeight;
      requestAnimationFrame(function(){ p.style.transition=''; p.style.transform=''; });
    } else {
      clampDesktop(p);
      window.addEventListener('scroll', reclamp, {passive:true});
      window.addEventListener('resize', reclamp);
    }
  }
  function onClose(){
    if(scrim) scrim.classList.remove('on');
    document.body.classList.remove('cal-open');
    window.removeEventListener('scroll', reclamp);
    window.removeEventListener('resize', reclamp);
    if(openPop){ openPop.classList.remove('cal-clamp'); openPop.style.maxHeight=''; openPop = null; }
  }
  function react(p){
    if(p.hasAttribute('hidden')){ if(!anyOpen()) onClose(); }
    else { onOpen(p); }
  }
  function init(){
    document.querySelectorAll('.cal-pop').forEach(function(p){
      new MutationObserver(function(){ react(p); }).observe(p, {attributes:true, attributeFilter:['hidden']});
    });
    if(anyOpen()) onOpen(anyOpen());
  }
  if(document.readyState!=='loading') init(); else document.addEventListener('DOMContentLoaded', init);
})();
(function(){
  // homepage hero hands the search off to /stays — open the real picker on arrival
  var pick = new URLSearchParams(location.search).get('pick');
  if(!pick) return;
  function go(){
    var el = document.getElementById(pick === 'guests' ? 'searchGuests' : 'searchDates');
    if(el) el.click();
  }
  if(document.readyState!=='loading') setTimeout(go, 350);
  else document.addEventListener('DOMContentLoaded', function(){ setTimeout(go, 350); });
})();
(function(){
  // /stays: the magnifier runs the search; keep the "N places" count live, and jump to
  // the results — but only AFTER the filter settles (it hides cards async, which would
  // otherwise make a smooth-scroll overshoot and tuck the first card under the header).
  var bar = document.querySelector('.searchbar');
  var apts = document.querySelector('.apts');
  if(!bar && !apts) return;
  document.body.classList.add('on-stays');
  var submit = bar && bar.querySelector('.submit');
  var results = document.querySelector('.left-head') || apts;
  var countEl = document.querySelector('.count b');
  var cards = apts ? apts.querySelectorAll('.apt[data-slug]') : [];

  var armed = false, timer;
  function stickyBottom(){
    var s = 0;
    ['.topbar', '.subhead'].forEach(function(sel){
      var el = document.querySelector(sel); if(!el) return;
      var cs = getComputedStyle(el);
      if((cs.position === 'fixed' || cs.position === 'sticky') && cs.display !== 'none'){
        var r = el.getBoundingClientRect();
        if(r.top < 160 && r.bottom > s) s = r.bottom;
      }
    });
    return s;
  }
  function fire(){
    if(!armed) return; armed = false; clearTimeout(timer);
    var card = (apts && apts.querySelector('.apt[data-slug]:not([hidden])')) || results;
    if(!card) return;
    var y = card.getBoundingClientRect().top + window.scrollY - stickyBottom() - 24;
    window.scrollTo({ top: Math.max(0, y), behavior:'smooth' });
  }
  function arm(){ armed = true; clearTimeout(timer); timer = setTimeout(fire, 1000); }

  function update(){
    if(countEl){
      var vis = 0; cards.forEach(function(c){ if(c.offsetParent !== null) vis++; });
      countEl.textContent = countEl.textContent.replace(/^\s*\d+/, String(vis));
    }
    if(armed){ clearTimeout(timer); timer = setTimeout(fire, 180); }
  }

  if(submit && results){
    submit.setAttribute('aria-label', 'show results');
    submit.addEventListener('click', function(e){
      e.preventDefault();
      try { if(window.__staysApi && window.__staysApi.refit) window.__staysApi.refit(); } catch(_){}
      arm();
    });
  }
  cards.forEach(function(c){ new MutationObserver(update).observe(c, {attributes:true, attributeFilter:['style','class','hidden']}); });
  update();
})();
(function(){
  // while at the top of a hero page (home / guide), keep the install banner and the
  // floating "near me / map" buttons from covering the hero — reveal once scrolled in
  var hasHero = document.getElementById('heroSearch') || document.querySelector('.masthead');
  if(!hasHero) return;
  function upd(){ document.body.classList.toggle('at-hero-top', (window.scrollY||0) < window.innerHeight * 0.7); }
  window.addEventListener('scroll', upd, {passive:true});
  window.addEventListener('resize', upd);
  upd();
})();
(function(){
  // keep aria-pressed in sync on the list/map view toggle (by id, so it works on EN + RU)
  var btns = [document.getElementById('viewList'), document.getElementById('viewMap')].filter(Boolean);
  if(!btns.length) return;
  function sync(){ btns.forEach(function(b){ b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'); }); }
  btns.forEach(function(b){ new MutationObserver(sync).observe(b, {attributes:true, attributeFilter:['class']}); });
  sync();
})();
