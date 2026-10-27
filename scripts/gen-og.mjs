// Build-time generator: branded EDITORIAL link-preview cards (1200x630) per place & apartment.
// Written to dist/og/*.png; pages reference them as og:image. Runs after `astro build`.
import { createCanvas, GlobalFonts, loadImage, Path2D } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { WORDMARK_PATHS } from '../src/lib/wordmark.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const F = (n) => join(__dir, 'og-fonts', n);
GlobalFonts.registerFromPath(F('mono-700.woff'), 'MonoBold');
GlobalFonts.registerFromPath(F('mono-600.woff'), 'MonoSemi');
// Card type = Geologica (the site/app font; latin + cyrillic in one face). The wordmark is drawn paths (src/lib/wordmark.js).
GlobalFonts.registerFromPath(F('geologica-800.ttf'), 'GeoBold');
GlobalFonts.registerFromPath(F('geologica-400.ttf'), 'GeoReg');
GlobalFonts.registerFromPath(F('jbm-bold.woff2'), 'JBM');

const OUT = join(__dir, '..', 'dist', 'og');
mkdirSync(OUT, { recursive: true });

const supabase = createClient(
  'https://qkzinjawtumhjbezlyog.supabase.co',
  'sb_publishable_R0NeSmTwX9qt0bxlHYj1AA_JIVRqsqU'
);

const CAT_COLOR = { 'eat-drink': '#3A4868', 'wellness': '#1F8A5B', 'work': '#1F8A5B', 'move-around': '#3A4868' };
const CAT_LABEL = { 'eat-drink': 'eat & drink', 'wellness': 'wellness', 'work': 'work & remote', 'move-around': 'move around' };
const CAT_LABEL_RU = { 'eat-drink': 'еда и напитки', 'wellness': 'велнес', 'work': 'работа', 'move-around': 'транспорт' };

const W = 1200, H = 630;

function noEmoji(s) { return String(s == null ? '' : s).replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}]/gu, '').replace(/\*+/g, '').replace(/\s+/g, ' ').trim(); }
function clip(s, n) { const t = noEmoji(s); return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t; }

async function fetchImg(url) {
  try { const r = await fetch(url); if (!r.ok) return null; return await loadImage(Buffer.from(await r.arrayBuffer())); }
  catch (e) { return null; }
}

function roundRect(x, rx, ry, rw, rh, rad) {
  rad = Math.min(rad, rw / 2, rh / 2);
  x.beginPath();
  x.moveTo(rx + rad, ry);
  x.arcTo(rx + rw, ry, rx + rw, ry + rh, rad);
  x.arcTo(rx + rw, ry + rh, rx, ry + rh, rad);
  x.arcTo(rx, ry + rh, rx, ry, rad);
  x.arcTo(rx, ry, rx + rw, ry, rad);
  x.closePath();
}
function cover(x, img, dx, dy, dw, dh) {
  const ir = img.width / img.height, br = dw / dh; let sw, sh, sx, sy;
  if (ir > br) { sh = img.height; sw = sh * br; sx = (img.width - sw) / 2; sy = 0; }
  else { sw = img.width; sh = sw / br; sx = 0; sy = (img.height - sh) / 2; }
  x.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}
function mark(x, cx, cy, r) {
  x.fillStyle = '#FF5E1A'; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill();
  x.fillStyle = '#FAF7F0'; x.beginPath(); x.arc(cx + r * 0.28, cy + r * 0.28, r * 0.30, 0, 7); x.fill();
}
function wrap(x, text, maxW) {
  const words = String(text).split(/\s+/), lines = []; let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur); return lines;
}

async function card(d) {
  const cv = createCanvas(W, H); const x = cv.getContext('2d');
  const fName = 'GeoBold';
  const fLine = 'GeoReg';
  const fMono = d.ru ? 'JBM' : 'MonoBold';
  const fMonoS = d.ru ? 'JBM' : 'MonoSemi';
  x.fillStyle = '#FAF7F0'; x.fillRect(0, 0, W, H);

  // left photo, framed + rounded
  const fx = 48, fy = 48, fw = 540, fh = H - 96;
  x.save(); roundRect(x, fx, fy, fw, fh, 22); x.clip();
  x.fillStyle = '#E8EBF1'; x.fillRect(fx, fy, fw, fh);
  const img = d.img || await fetchImg(d.photo);
  if (img) cover(x, img, fx, fy, fw, fh);
  x.restore();

  const px = 636, pr = W - 56; // right panel bounds
  x.textBaseline = 'alphabetic';

  // header: mark + wordmark
  mark(x, px + 22, 92, 22);
  const wmX = px + 22 + 22 + 18, wmS = 34 * 0.528 / 100;
  x.save(); x.translate(wmX, 103 - 100 * wmS); x.scale(wmS, wmS); x.fillStyle = '#0A0908';
  WORDMARK_PATHS.forEach((d) => x.fill(new Path2D(d))); x.restore();
  // kicker right
  x.font = '17px ' + fMonoS; x.fillStyle = '#6B6862'; x.textAlign = 'right';
  x.fillText(String(d.kicker).toUpperCase(), pr, 99); x.textAlign = 'left';

  // tag pill
  let y = 250;
  x.font = '18px ' + fMono; const tagT = String(d.tag).toUpperCase();
  const tw = x.measureText(tagT).width, tpx = 18, tph = 40;
  x.fillStyle = d.accent; roundRect(x, px, y - tph + 8, tw + tpx * 2, tph, 999); x.fill();
  x.fillStyle = '#FAF7F0'; x.fillText(tagT, px + tpx, y - 8);

  // name (Geologica 800 ~62, max 2 lines)
  y += 36;
  x.font = '62px ' + fName; x.fillStyle = '#0A0908';
  const nameLines = wrap(x, String(d.name) + '.', pr - px).slice(0, 2);
  for (const ln of nameLines) { y += 58; x.fillText(ln, px, y); }

  // line (Geologica 400 ~27, max 3 lines)
  y += 30;
  x.font = '27px ' + fLine; x.fillStyle = '#6B6862';
  // as many lines as fit above the footer rule (a two-line name leaves room for fewer)
  const room = Math.max(1, Math.min(3, Math.floor((H - 64 - 30 - 18 - y) / 38)));
  const all = wrap(x, d.line, pr - px), lineLines = all.slice(0, room);
  if (all.length > room) {
    let last = lineLines[room - 1];
    while (last && x.measureText(last + '…').width > pr - px) last = last.replace(/\s*\S+$/, '');
    lineLines[room - 1] = last.replace(/[\s,.;:—-]+$/, '') + '…';
  }
  for (const ln of lineLines) { y += 38; x.fillText(ln, px, y); }

  // footer (anchored to bottom)
  const fyy = H - 64;
  x.strokeStyle = '#E0DACE'; x.lineWidth = 1.5;
  x.beginPath(); x.moveTo(px, fyy - 30); x.lineTo(pr, fyy - 30); x.stroke();
  x.font = '19px ' + fMonoS; x.fillStyle = '#6B6862'; x.fillText('regarega.co', px, fyy);
  x.font = '19px ' + fMono; x.fillStyle = d.accent; x.textAlign = 'right';
  x.fillText(String(d.cta).toUpperCase(), pr, fyy); x.textAlign = 'left';

  return cv.toBuffer('image/png');
}

(async () => {
  let n = 0;
  const { data: gp } = await supabase.from('guide_places').select('slug,title,name,category,take_title,summary,summary_ru,body_ru,photos,image').eq('status', 'published');
  for (const p of (gp || [])) {
    const photo = (p.photos && p.photos[0]) || p.image; if (!photo) continue;
    const img = await fetchImg(photo);
    const accent = CAT_COLOR[p.category] || '#3A4868';
    const name = String(p.title || p.name || '').toLowerCase();
    // EN
    writeFileSync(join(OUT, 'place-' + p.slug + '.png'), await card({ img, name, accent, tag: CAT_LABEL[p.category] || p.category || 'guide', kicker: 'batumi · the guide', cta: 'open in the guide', line: clip(p.take_title || p.summary, 130) })); n++;
    // RU (line from body_ru — guide summary_ru is hours/address)
    writeFileSync(join(OUT, 'place-' + p.slug + '-ru.png'), await card({ img, name, accent, tag: CAT_LABEL_RU[p.category] || p.category || 'гид', kicker: 'батуми · гид', cta: 'открыть в гиде', ru: true, line: clip(p.body_ru || p.take_title, 130) })); n++;
  }
  const { data: apts } = await supabase.from('apartments_public').select('slug,title,title_ru,summary,summary_ru,photos');
  for (const a of (apts || [])) {
    const photo = a.photos && a.photos[0]; if (!photo) continue;
    const img = await fetchImg(photo);
    // EN
    writeFileSync(join(OUT, 'stay-' + a.slug + '.png'), await card({ img, name: String(a.title || '').toLowerCase(), tag: 'apartment', accent: '#FF5E1A', kicker: 'batumi · stays', cta: 'book direct', line: clip(a.summary, 130) })); n++;
    // RU
    writeFileSync(join(OUT, 'stay-' + a.slug + '-ru.png'), await card({ img, name: String(a.title || '').toLowerCase(), tag: 'квартира', accent: '#FF5E1A', kicker: 'батуми · квартиры', cta: 'забронировать', ru: true, line: clip(a.summary_ru || a.summary, 130) })); n++;
  }
  // --- news (editorial link-preview cards) ---
  const { data: news } = await supabase.from('news').select('*').eq('status', 'published');
  for (const nw of (news || [])) {
    const photo = nw.image || (nw.photos && nw.photos[0]); if (!photo) continue;
    const img = await fetchImg(photo);
    const name = String(nw.title || '').toLowerCase();
    const line = clip(nw.descr || nw.body, 130);
    writeFileSync(join(OUT, 'news-' + nw.slug + '.png'), await card({ img, name, tag: 'news', accent: '#FF5E1A', kicker: 'batumi · the guide', cta: 'read', line })); n++;
    const nameRu = String(nw.title_ru || nw.title || '').toLowerCase();
    const lineRu = clip(nw.descr_ru || nw.body_ru || nw.descr || nw.body, 130);
    writeFileSync(join(OUT, 'news-' + nw.slug + '-ru.png'), await card({ img, name: nameRu, tag: 'новости', accent: '#FF5E1A', kicker: 'батуми · гид', cta: 'читать', ru: true, line: lineRu })); n++;
  }

  // --- longreads (editorial stories — hardcoded pages, no DB row) ---
  const longreads = [
    {
      slug: 'day-in-old-batumi', photo: 'https://regarega.co/img/old-batumi.jpg',
      name: 'a day in old batumi', name_ru: 'день в старом батуми',
      line: 'our slow walking guide — two squares, peeling façades, and the long way down to the sea.',
      line_ru: 'неспешный пеший гид — две площади, облупленные фасады и дорога к морю.',
    },
  ];
  for (const lr of longreads) {
    const img = await fetchImg(lr.photo);
    writeFileSync(join(OUT, 'longread-' + lr.slug + '.png'), await card({ img, name: lr.name, tag: 'story', accent: '#FF5E1A', kicker: 'batumi · the guide', cta: 'read the story', line: lr.line })); n++;
    writeFileSync(join(OUT, 'longread-' + lr.slug + '-ru.png'), await card({ img, name: lr.name_ru, tag: 'история', accent: '#FF5E1A', kicker: 'батуми · гид', cta: 'читать', ru: true, line: lr.line_ru })); n++;
  }

  // default fallback cards (EN + RU)
  writeFileSync(join(OUT, 'default.png'), await card({ photo: 'https://regarega.co/img/hero-batumi.jpg', name: 'rega rega batumi', tag: 'city guide', accent: '#FF5E1A', kicker: 'batumi', cta: 'open', line: 'checked flats and a city guide — batumi edition.' }));
  writeFileSync(join(OUT, 'default-ru.png'), await card({ photo: 'https://regarega.co/img/hero-batumi.jpg', name: 'rega rega батуми', tag: 'гид по городу', accent: '#FF5E1A', kicker: 'батуми', cta: 'открыть', ru: true, line: 'проверенные квартиры и гид по батуми.' }));
  console.log('[gen-og] generated ' + n + ' cards (EN+RU) + defaults');
})();
