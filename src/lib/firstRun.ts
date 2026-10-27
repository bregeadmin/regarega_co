// First run: splash («квартира на карте, в объёме», ≈5.25 s) → 3-step onboarding → the guide.
// Markup + gate: src/components/app/FirstRun.astro. Ported from rega-design-panel
// r3/splash3/jakub-2b.html and r3/onboarding/onboarding.html; the 393×852 coordinates of the
// prototype are kept and anchored to the real viewport (centre x, vertical anchors scaled).
// Only runs when the inline gate put `rr-first` on <html>.
// Local state: rr_onboarded (set on finish / skip), rr_punched (JSON array of place slugs —
// synced in stage 2), rr_picks (JSON array of chosen worlds, for later).

type RT = { pkN: string[]; punched: string; removed: string };

const NS = 'http://www.w3.org/2000/svg';
const MARK_SVG = '<svg viewBox="0 0 100 100" aria-hidden="true"><path fill-rule="evenodd" fill="var(--home)" d="M 50,50 m -50,0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0 z M 64,64 m -12,0 a 12,12 0 1,1 24,0 a 12,12 0 1,1 -24,0 z"/></svg>';

const readJSON = (k: string): any[] => {
  try { const v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v : []; } catch { return []; }
};
const writeJSON = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

export function initFirstRun() {
  const root = document.getElementById('fr');
  if (root) root.dataset.ready = '1'; // the inline gate's watchdog sees the script has started
  if (!root || !document.documentElement.classList.contains('rr-first')) return;
  try {
    run(root);
  } catch (err) {
    // never leave a blank overlay / an inert page behind: fall through to the guide
    console.warn('first run failed', err);
    document.documentElement.classList.remove('rr-first');
    document.querySelectorAll<HTMLElement>('[data-fr-inert]').forEach((n) => { n.inert = false; n.removeAttribute('aria-hidden'); delete n.dataset.frInert; });
    root.remove();
    try { localStorage.setItem('rr_onboarded', new Date().toISOString()); } catch {}
  }
}

function run(root: HTMLElement) {
  const $ = (id: string) => document.getElementById(id)!;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rt: RT = JSON.parse(root.dataset.rt || '{}');

  // photos load while the splash plays (data-src so returning guests never fetch them)
  root.querySelectorAll<HTMLImageElement>('img[data-src]').forEach((im) => { if (im.dataset.src) im.src = im.dataset.src; });

  // modal: everything else on the page is inert + hidden from assistive tech until finish
  const others = [...document.body.children].filter((n) => n !== root && n.tagName !== 'SCRIPT') as HTMLElement[];
  others.forEach((n) => { n.inert = true; n.setAttribute('aria-hidden', 'true'); n.dataset.frInert = '1'; });
  const focusStep = (i: number) => {
    const h = steps[i]?.querySelector<HTMLElement>('.fr-h');
    h?.focus({ preventScroll: true });
  };

  /* ======================= onboarding ======================= */
  const ob = $('frOb');
  const toastEl = $('frToast');
  const track = $('frTrack');
  const steps = [...root.querySelectorAll<HTMLElement>('.fr-step')];
  const bars = [...root.querySelectorAll<HTMLElement>('.fr-prog i')];
  let step = 0;
  const go = (i: number) => {
    step = i;
    toastEl.classList.remove('on');
    track.style.transform = `translateX(${(-100 / 3) * i}%)`;
    bars.forEach((b, k) => b.classList.toggle('on', k <= i));
    steps.forEach((s, k) => { s.setAttribute('aria-hidden', String(k !== i)); s.inert = k !== i; });
  };
  go(0);
  // focus moves to the new step's heading, so it never falls to <body> when the button hides
  root.querySelectorAll('[data-fr-next]').forEach((b) => b.addEventListener('click', () => { go(Math.min(2, step + 1)); focusStep(step); }));

  // 1 · what are you into (kept locally for later)
  $('frPicks').addEventListener('click', (e) => {
    const p = (e.target as HTMLElement).closest<HTMLElement>('.fr-pk');
    if (!p) return;
    const on = p.classList.toggle('on');
    p.setAttribute('aria-pressed', String(on));
    writeJSON('rr_picks', [...root.querySelectorAll<HTMLElement>('.fr-pk.on')].map((x) => x.dataset.k));
  });

  // 2 · punch: the hole stays in the corner, the piece flies along a gentle arc into «my batumi»
  const toast = (text: string) => {
    toastEl.innerHTML = MARK_SVG + '<span></span>';
    toastEl.querySelector('span')!.textContent = text;
    requestAnimationFrame(() => toastEl.classList.add('on'));
    clearTimeout((toastEl as any)._t);
    (toastEl as any)._t = setTimeout(() => toastEl.classList.remove('on'), 1900);
  };
  const pocket = $('frPocket'), pocketIc = $('frPocketIc'), pocketN = $('frPocketN'), pocketSub = $('frPocketSub');
  const next2 = $('frNext2') as HTMLButtonElement;
  const plural = (n: number) => {
    const a = n % 10, b = n % 100;
    return a === 1 && b !== 11 ? rt.pkN[0] : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? rt.pkN[1] : rt.pkN[2];
  };
  const hasCards = !!root.querySelector('.fr-punch');
  const sync = (delay: number) => {
    const done = [...root.querySelectorAll<HTMLElement>('.fr-punch.done')];
    const n = done.length;
    $('frHint').classList.toggle('off', n > 0);
    // rr_punched: the guest's own places on this device (slugs); merge with anything already there
    const all = new Set<string>(readJSON('rr_punched'));
    root.querySelectorAll<HTMLElement>('.fr-punch').forEach((b) => { if (b.classList.contains('done')) all.add(b.dataset.slug!); else all.delete(b.dataset.slug!); });
    writeJSON('rr_punched', [...all]);
    setTimeout(() => {
      pocketN.textContent = n ? String(n) : '';
      pocketSub.textContent = n ? `${n} ${plural(n)}` : pocketSub.dataset.empty || '';
      next2.disabled = !n && hasCards;
      next2.textContent = (n || !hasCards ? next2.dataset.next : next2.dataset.need) || '';
    }, delay);
  };
  const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const fly = (from: { x: number; y: number }, to: { x: number; y: number }, color: string, dur: number, done: () => void) => {
    const p = document.createElement('div');
    p.className = 'fr-piece';
    p.style.background = color;
    root.appendChild(p);
    const x0 = from.x, y0 = from.y, x2 = to.x, y2 = to.y;
    const x1 = Math.min(x0, x2) - 120, y1 = (y0 + y2) / 2 - 40; // gentle arc to the left, towards the centre
    const t0 = performance.now();
    const frame = (now: number) => {
      const k = Math.min(1, (now - t0) / dur), t = easeIO(k);
      const x = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
      const y = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      p.style.transform = `translate(${x - 20}px,${y - 20}px) scale(${1.08 - 0.62 * t})`;
      p.style.opacity = String(k > 0.86 ? 1 - (k - 0.86) / 0.14 : 1);
      if (k < 1) requestAnimationFrame(frame); else { p.remove(); done(); }
    };
    requestAnimationFrame(frame);
  };
  const bump = () => { pocket.classList.add('bump'); setTimeout(() => pocket.classList.remove('bump'), 260); };
  root.querySelectorAll<HTMLButtonElement>('.fr-punch').forEach((btn) => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const name = btn.dataset.name || '';
    if (btn.classList.contains('done')) {
      btn.classList.remove('done');
      btn.setAttribute('aria-pressed', 'false');
      toast(`${name} ${rt.removed}`);
      sync(0);
      return;
    }
    btn.classList.add('done');
    btn.setAttribute('aria-pressed', 'true');
    if (reduce) { bump(); toast(`${name} ${rt.punched}`); sync(0); return; }
    const r = btn.getBoundingClientRect(), tr = pocketIc.getBoundingClientRect();
    const color = getComputedStyle(btn).getPropertyValue('--c').trim() || getComputedStyle(root).getPropertyValue('--eat');
    setTimeout(() => fly({ x: r.left + r.width / 2, y: r.top + r.height / 2 }, { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 }, color, 620, bump), 90);
    setTimeout(() => toast(`${name} ${rt.punched}`), 380);
    sync(700);
  }));
  // already punched on this device (a second onboarding via ?welcome)
  const had = new Set(readJSON('rr_punched'));
  root.querySelectorAll<HTMLElement>('.fr-punch').forEach((b) => { if (had.has(b.dataset.slug)) { b.classList.add('done'); b.setAttribute('aria-pressed', 'true'); } });
  if (had.size || !hasCards) sync(0); // no cards fetched at build → «дальше» is never locked

  // 3 · notifications: inside the iOS wrapper, the native permission prompt if the web layer
  // can reach one; otherwise this button simply moves on (no fake permission)
  const notif = $('frNotif') as HTMLButtonElement;
  const setOn = () => {
    notif.classList.add('is-ok');
    notif.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5l10 -10"/></svg><span></span>';
    notif.querySelector('span')!.textContent = notif.dataset.on || '';
    $('frS3').classList.remove('is-off');
    $('frOpen').classList.remove('fr-btn--light');
  };
  // the permission call the web layer can reach, or null (today: always null — the iOS wrapper
  // asks natively at launch, so there is nothing to ask here)
  const nativeAsk = ((): (() => Promise<boolean>) | null => {
    const W = window as any;
    if (!W.Capacitor) return null;
    const os = W.plugins?.OneSignal || W.OneSignal;
    if (os?.Notifications && typeof os.Notifications.requestPermission === 'function') {
      return () => Promise.resolve(os.Notifications.requestPermission(true)).then((ok: any) => !!ok);
    }
    const pn = W.Capacitor.Plugins?.PushNotifications;
    if (pn && typeof pn.requestPermissions === 'function') {
      return () => Promise.resolve(pn.requestPermissions()).then((r: any) => r?.receive === 'granted');
    }
    return null;
  })();
  if (!nativeAsk) {
    // nothing to ask: one primary «открыть гид», the push examples stay as the explanation
    notif.remove();
    $('frOpen').classList.remove('fr-btn--light');
    $('frS3').classList.remove('is-off');
  }
  notif.addEventListener('click', () => {
    if (notif.classList.contains('is-ok')) return finish();
    let ask: Promise<boolean> | null = null;
    try { ask = nativeAsk ? nativeAsk() : null; } catch { ask = null; }
    if (!ask) return finish();
    notif.disabled = true;
    ask.then((ok) => { notif.disabled = false; if (ok) setOn(); else finish(); }, () => finish());
  });

  // finish / skip → the guide underneath
  let finished = false;
  function finish() {
    if (finished) return;
    finished = true;
    try { localStorage.setItem('rr_onboarded', new Date().toISOString()); } catch {}
    window.scrollTo(0, 0);
    const end = () => {
      document.documentElement.classList.remove('rr-first');
      others.forEach((n) => { n.inert = false; n.removeAttribute('aria-hidden'); delete n.dataset.frInert; });
      root!.remove();
      document.querySelector<HTMLElement>('.app-logo')?.focus({ preventScroll: true });
    };
    if (reduce) return end();
    root!.classList.add('is-gone');
    setTimeout(end, 420);
  }
  root.querySelectorAll('[data-fr-finish]').forEach((b) => b.addEventListener('click', finish));

  /* ======================= splash ======================= */
  runSplash(root, reduce, () => {
    ob.style.opacity = '1';
    $('frFilm').classList.add('is-done');
    focusStep(step);
  });
  $('frFilm').focus({ preventScroll: true });
}

function runSplash(root: HTMLElement, reduce: boolean, onDone: () => void) {
  const $ = (id: string) => document.getElementById(id)!;
  const W = window.innerWidth, H = window.innerHeight, ky = H / 852;
  const css = getComputedStyle(root);
  const V = (n: string) => css.getPropertyValue(n).trim();
  const C = { eat: V('--eat'), well: V('--well'), blue: V('--blue'), home: V('--home'), bg: V('--bg'), ink: V('--ink') };
  const film = $('frFilm'), ob = $('frOb');
  const sv = $('frSv');
  sv.setAttribute('width', String(W)); sv.setAttribute('height', String(H));
  const el = (tag: string, a: Record<string, any>, p?: Element) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, String(a[k])); p && p.appendChild(e); return e; };
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v)), lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
  const eout = (t: number) => 1 - Math.pow(1 - t, 3), eout5 = (t: number) => 1 - Math.pow(1 - t, 5);
  const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), esine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // vertical anchors of the 393×852 prototype, on this screen
  const CY0 = 380 * ky, CY1 = 410 * ky, LOCK_CY = 330 * ky;
  $('frSlogan').style.top = `${LOCK_CY + 140}px`;

  /* camera: map plane, tilt around X, perspective */
  const F = 900; const cam = { th: 0, S: 1, cx: W / 2, cy: CY0 };
  const P = (x: number, y: number, z = 0): [number, number, number] => {
    const c = Math.cos(cam.th), s = Math.sin(cam.th);
    const y2 = y * c + z * s, z2 = -y * s + z * c, k = (F / (F + z2)) * cam.S;
    return [cam.cx + x * k, cam.cy + y2 * k, k];
  };
  const ptsPath = (pts: number[][]) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('') + 'Z';

  /* map: blocks, a boulevard, a square (no recognisable city) — paper tones of the map art */
  const ROT = -0.2, rot = (x: number, y: number): [number, number] => [x * Math.cos(ROT) - y * Math.sin(ROT), x * Math.sin(ROT) + y * Math.cos(ROT)];
  const PARK_C = '#E3EFE5';
  const BLOCKS: { c: [number, number][]; el: Element }[] = [];
  for (let gx = -6; gx <= 6; gx++) for (let gy = -7; gy <= 7; gy++) {
    if (rnd() > 0.84) continue; if (Math.abs(gx) < 1 && Math.abs(gy) < 1) continue;
    const w = 50 + rnd() * 34, h = 44 + rnd() * 40, x = gx * 92 - w / 2, y = gy * 88 - h / 2, park = rnd() < 0.07;
    const corners = ([[x, y], [x + w, y], [x + w, y + h], [x, y + h]] as [number, number][]).map(([a, b]) => rot(a, b));
    BLOCKS.push({ c: corners, el: el('path', { fill: park ? PARK_C : rnd() < 0.5 ? '#F2ECE2' : '#EFE8DC' }, $('frGround')) });
  }
  const AVE: [number, number][] = []; for (let i = 0; i <= 40; i++) { const u = -600 + i * 30; AVE.push(rot(u, -150 + Math.sin(u / 160) * 60)); }
  const aveEl = el('path', { fill: 'none', stroke: '#FFFDF9', 'stroke-width': 22, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, $('frGround'));
  const PARK: [number, number][] = []; for (let i = 0; i < 48; i++) { const a = (i / 48) * Math.PI * 2; PARK.push([-190 + Math.cos(a) * 70, 170 + Math.sin(a) * 52]); }
  const parkEl = el('path', { fill: PARK_C }, $('frGround'));
  /* walking rings */
  const RINGS = [{ r: 170, lb: root.dataset.r1 || '' }, { r: 320, lb: root.dataset.r2 || '' }].map((o) => ({
    ...o,
    el: el('path', { fill: 'none', stroke: C.ink, 'stroke-opacity': 0.22, 'stroke-width': 1.3, 'stroke-dasharray': '3 6' }, $('frRings')),
    tx: el('text', { class: 'fr-ring-lb' }, $('frRings')),
  }));
  RINGS.forEach((o) => (o.tx.textContent = o.lb));

  /* places in world colours; 2 = our flat: orange pin with the hole-punch head */
  const KINDS: [string, number][] = [[C.eat, 1], [C.eat, 1], [C.home, 2], [C.eat, 1], [C.eat, 1], [C.eat, 0], [C.home, 2], [C.eat, 0], [C.well, 1], [C.well, 1], [C.home, 2], [C.well, 0], [C.well, 0], [C.blue, 1], [C.home, 2], [C.blue, 1], [C.eat, 1], [C.well, 1]];
  const FLATS = [[150, -250], [-55, 95], [175, 120], [-115, 240]]; let fi = 0;
  const PL = KINDS.map((k, i) => {
    const a = -Math.PI / 2 + i * ((Math.PI * 2) / KINDS.length) + (rnd() - 0.5) * 0.45; const r = 120 + rnd() * 210;
    const g = el('g', {}, $('frPins'));
    const sh = el('ellipse', { fill: C.ink, opacity: 0, filter: 'url(#frBlur4)' }, g);
    const stem = el('line', { stroke: C.ink, 'stroke-opacity': 0.35, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
    const ring = el('circle', { fill: C.bg }, g);
    const head = k[1] === 2 ? el('use', { href: '#frMarkP', fill: C.home }, g) : el('circle', { fill: k[1] ? k[0] : C.bg, stroke: k[0], 'stroke-width': k[1] ? 0 : 3.2 }, g);
    const glass = el('circle', { fill: 'url(#frSheen)' }, g);
    const edge = el('circle', { fill: 'none', stroke: '#fff', 'stroke-opacity': 0.7, 'stroke-width': 1 }, g);
    const fp = k[1] === 2 ? FLATS[fi++] : null;
    return { x: fp ? fp[0] : Math.cos(a) * r, y: fp ? fp[1] : Math.sin(a) * r * 1.1, solid: k[1], flat: k[1] === 2, d: i * 30, g, sh, stem, ring, head, glass, edge };
  });

  /* the flat on the map (the same mark path) + the punched piece */
  const homeUse = el('use', { href: '#frMarkP', fill: C.home, filter: 'url(#frHomeSh)' }, $('frHome'));
  const homeDisc = el('ellipse', { fill: C.home, filter: 'url(#frHomeSh)' }, $('frHome'));
  const R0 = 56, HOLE = { x: 0.28 * R0, y: 0.28 * R0, r: 0.24 * R0 };
  const pSh = el('ellipse', { fill: C.ink, filter: 'url(#frBlur4)' }, $('frPiece'));
  const pBody = el('ellipse', { fill: C.home }, $('frPiece'));
  const pSheen = el('ellipse', { fill: 'url(#frSheen)' }, $('frPiece'));

  /* script (ms) */
  const T = { disc: [0, 400], press: [430, 620], slide: [620, 1100], tilt: [900, 1700], burst: [1150, 1800], rise: [1350, 2050], rings: [1700, 2350],
    c1: [650, 1780], c2: [1880, 3050], c3: [3100, 4000], back: [3880, 4380], lock: [4350, 4700], dock: [4820, 5150], end: 5250 } as const;
  let LOCKW = 298;
  let dockX = 20, dockY = 68;
  const fadeEl = film.querySelector<HTMLElement>('.fr-fade')!;
  const lockEl = $('frLock'), wm = $('frWm'), slogan = $('frSlogan'), tapSkip = $('frTapSkip');
  const caps = [['frC1', T.c1], ['frC2', T.c2], ['frC3', T.c3]] as const;

  function render(t: number) {
    const tl = eio(seg(t, T.tilt[0], T.tilt[1])), bk = eio(seg(t, T.back[0], T.back[1]));
    cam.th = lerp(0, (56 * Math.PI) / 180, tl) * (1 - bk);
    cam.S = lerp(lerp(1, 0.86, tl), 64 / (2 * R0), bk);
    cam.cy = lerp(lerp(CY0, CY1, tl), LOCK_CY, bk);
    const mapA = eout(seg(t, 800, 1500)) * (1 - eout(seg(t, T.back[0], T.back[0] + 380)));
    $('frGround').setAttribute('opacity', String(mapA));
    if (mapA > 0) {
      BLOCKS.forEach((b) => b.el.setAttribute('d', ptsPath(b.c.map(([x, y]) => P(x, y)))));
      aveEl.setAttribute('d', AVE.map((p, i) => { const q = P(p[0], p[1]); return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(''));
      aveEl.setAttribute('stroke-width', String(22 * P(0, 0)[2]));
      parkEl.setAttribute('d', ptsPath(PARK.map(([x, y]) => P(...rot(x, y)))));
    }

    // 1) a whole disc from above; the hole opens on the press — from then on it is the mark 1:1
    const a = eout(seg(t, T.disc[0], T.disc[1]));
    const [hx, hy, hk] = P(0, 0);
    const c = Math.cos(cam.th);
    const open = t >= T.press[1];
    homeDisc.setAttribute('cx', String(hx)); homeDisc.setAttribute('cy', String(hy));
    homeDisc.setAttribute('rx', String(R0 * hk * lerp(0.94, 1, a))); homeDisc.setAttribute('ry', String(R0 * hk * c * lerp(0.94, 1, a)));
    homeDisc.setAttribute('opacity', String(open ? 0 : a));
    homeUse.setAttribute('transform', `translate(${hx} ${hy}) scale(${hk} ${hk * c}) translate(${-R0} ${-R0}) scale(${R0 / 50})`);
    homeUse.setAttribute('opacity', open ? '1' : '0');
    $('frHome').setAttribute('opacity', t > T.lock[0] + 60 ? '0' : '1');

    // 2) the piece: press → lift a little → slide right across the map (horizontal), then bursts into dots
    const pr = esine(seg(t, T.press[0], T.press[1])), sl = eio(seg(t, T.slide[0], T.slide[1])), up = eout(seg(t, T.press[1], T.press[1] + 260));
    const pxw = lerp(HOLE.x, HOLE.x + 120, sl), pyw = lerp(HOLE.y, HOLE.y + 6, sl), pz = -lerp(0, 14, up) * (1 - seg(t, T.burst[0], T.burst[0] + 200));
    const [gx, gy, gk] = P(pxw, pyw, 0), [px, py, pk] = P(pxw, pyw, pz);
    const shrink = 1 - eout(seg(t, T.burst[0], T.burst[0] + 280));
    const pr0 = HOLE.r * pk * (1 - 0.08 * pr) * lerp(1, 1.12, up) * shrink;
    [pBody, pSheen].forEach((n) => { n.setAttribute('cx', String(px)); n.setAttribute('cy', String(py)); n.setAttribute('rx', String(pr0)); n.setAttribute('ry', String(pr0 * lerp(1, c, 0.6))); });
    pSheen.setAttribute('opacity', String(up * 0.9));
    pSh.setAttribute('cx', String(gx + 3)); pSh.setAttribute('cy', String(gy + 6 * up)); pSh.setAttribute('rx', String(HOLE.r * gk * 1.1 * shrink)); pSh.setAttribute('ry', String(HOLE.r * gk * c * shrink)); pSh.setAttribute('opacity', String(0.25 * up));
    $('frPiece').setAttribute('opacity', t < T.press[0] ? '0' : shrink > 0.02 ? '1' : '0');

    // 3) dots slide across the map from the piece to the places; a glass pin grows on each
    const tilt = Math.sin(cam.th);
    PL.forEach((p) => {
      const k = seg(t, T.burst[0] + p.d, T.burst[0] + p.d + 600), e = eout5(k);
      const qx = (pxw + p.x) / 2 + (p.y - pyw) * 0.2, qy = (pyw + p.y) / 2 - (p.x - pxw) * 0.2;
      const x = (1 - e) * (1 - e) * pxw + 2 * (1 - e) * e * qx + e * e * p.x, y = (1 - e) * (1 - e) * pyw + 2 * (1 - e) * e * qy + e * e * p.y;
      const r = eout(seg(t, T.rise[0] + p.d, T.rise[0] + p.d + 420));
      const Hh = tilt > 0 ? 34 * r : 0;
      const [bx, by] = P(x, y, 0), [tx, ty] = P(x, y, -Hh);
      const fade = 1 - eout(seg(t, T.back[0], T.back[0] + 320));
      p.g.setAttribute('opacity', String((k > 0 ? clamp(k * 5) : 0) * fade));
      const sz = lerp(0.55, 1, eout(k));
      p.sh.setAttribute('cx', String(bx)); p.sh.setAttribute('cy', String(by)); p.sh.setAttribute('rx', String(9 * sz * (0.6 + 0.4 * r))); p.sh.setAttribute('ry', String(9 * sz * c * (0.6 + 0.4 * r))); p.sh.setAttribute('opacity', String(0.08 + 0.14 * r));
      p.stem.setAttribute('x1', String(bx)); p.stem.setAttribute('y1', String(by)); p.stem.setAttribute('x2', String(tx)); p.stem.setAttribute('y2', String(ty)); p.stem.setAttribute('opacity', String(r));
      const hr = (p.flat ? 10.5 : 9.5) * sz;
      [p.ring, p.head, p.glass, p.edge].forEach((n) => { n.setAttribute('cx', String(tx)); n.setAttribute('cy', String(ty)); });
      p.ring.setAttribute('r', String(hr + 3));
      if (p.flat) p.head.setAttribute('transform', `translate(${tx - hr} ${ty - hr}) scale(${hr / 50})`);
      else p.head.setAttribute('r', String(p.solid ? hr : hr - 1.6));
      p.glass.setAttribute('r', String(hr)); p.edge.setAttribute('r', String(hr + 2.5));
      p.glass.setAttribute('opacity', String(p.flat ? 0 : 0.85 * r)); p.edge.setAttribute('opacity', String(r));
    });

    // 4) «on foot» rings spread from the flat
    RINGS.forEach((o, i) => {
      const k = eout(seg(t, T.rings[0] + i * 180, T.rings[1] + i * 180)); const rr = o.r * k;
      const fade = 1 - eout(seg(t, T.back[0], T.back[0] + 300));
      o.el.setAttribute('opacity', String(k * fade));
      if (k > 0 && fade > 0) {
        const pts: number[][] = []; for (let j = 0; j < 72; j++) { const an = (j / 72) * Math.PI * 2; pts.push(P(Math.cos(an) * rr, Math.sin(an) * rr)); }
        o.el.setAttribute('d', ptsPath(pts));
      }
      const ang = i ? -1.62 : -0.95; const lp = P(Math.cos(ang) * rr, Math.sin(ang) * rr);
      o.tx.setAttribute('x', String(lp[0] + 6)); o.tx.setAttribute('y', String(lp[1] - 4));
      o.tx.setAttribute('opacity', String(eout(seg(t, T.rings[1] + i * 180 - 200, T.rings[1] + i * 180 + 150)) * fade));
    });

    // captions: appear in place with a short horizontal drift
    caps.forEach(([id, [a0, a1]]) => {
      const i = eout(seg(t, a0, a0 + 300)), o = eout(seg(t, a1 - 220, a1));
      const n = $(id); n.style.opacity = String(i * (1 - o)); n.style.transform = `translateX(${(1 - i) * 18 - o * 14}px)`;
    });

    // 5) the logo, the slogan, and docking into the onboarding header
    const L = eout(seg(t, T.lock[0], T.lock[1])), D = eio(seg(t, T.dock[0], T.dock[1])), ctr = eio(seg(t, T.lock[0] + 60, T.lock[1] + 100));
    const lx = W / 2 - 32, ly = LOCK_CY - 32;
    lockEl.style.opacity = t > T.lock[0] ? '1' : '0';
    lockEl.style.transform = `translate(${lerp(lerp(lx, (W - LOCKW) / 2, ctr), dockX, D)}px,${lerp(ly, dockY, D)}px) scale(${lerp(1, 26 / 64, D)})`;
    wm.style.opacity = String(L); wm.style.transform = `translateX(${(1 - L) * -14}px)`;
    const sg = eout(seg(t, T.lock[0] + 120, T.lock[1] + 180));
    slogan.style.opacity = String(sg * (1 - eout(seg(t, T.dock[0] + 60, T.dock[0] + 260)))); slogan.style.transform = `translateY(${(1 - sg) * 8}px)`;
    const f = eout(seg(t, T.dock[0] + 180, T.end));
    ob.style.opacity = String(f);
    fadeEl.style.opacity = String(1 - f);
    film.style.background = `color-mix(in srgb, var(--bg) ${Math.round((1 - f) * 100)}%, transparent)`;
    tapSkip.style.opacity = String((1 - seg(t, 3600, 3900)) * seg(t, 500, 800));
  }

  let raf = 0, done = false;
  const finish = () => { if (done) return; done = true; cancelAnimationFrame(raf); render(T.end); onDone(); };
  const measure = () => {
    lockEl.style.transform = 'none';
    LOCKW = lockEl.offsetWidth || LOCKW;
    const sign = document.querySelector('#frLogo svg');
    if (sign) { const r = sign.getBoundingClientRect(); dockX = r.left; dockY = r.top; }
  };
  const play = () => {
    if (done) return; // tapped before the deferred start (fonts) — never re-render the splash over the onboarding
    measure();
    film.dataset.t0 = String(performance.now()); // splash start (screenshots / debugging)
    if (reduce) { render(T.dock[0] - 40); setTimeout(() => { if (!done) finish(); }, 1800); return; } // static final frame, then the onboarding
    const t0 = performance.now();
    const loop = (now: number) => { if (done) return; const t = now - t0; render(t); if (t < T.end) raf = requestAnimationFrame(loop); else finish(); };
    raf = requestAnimationFrame(loop);
  };
  film.addEventListener('click', finish);
  film.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } });
  render(0);
  // wait for the fonts (the lock-up is measured), but never longer than a beat
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), new Promise((r) => setTimeout(r, 700))]).then(() => setTimeout(play, 80));
}
