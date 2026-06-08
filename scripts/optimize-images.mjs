// Post-build: rewrite remote <img src> URLs to Vercel's image optimizer
// (resize + WebP/AVIF + edge CDN cache). Runs on dist/ after `astro build`.
import { readdirSync, statSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const HOSTS = [
  'qkzinjawtumhjbezlyog.supabase.co',
  'images.unsplash.com',
  'static.tildacdn.com',
  'static.tildacdn.one',
  'picsum.photos',
];
const W = 1080;   // must be present in vercel.json images.sizes
const Q = 72;

const hostAlt = HOSTS.map((h) => h.replace(/[.]/g, '\\.')).join('|');
const RE = new RegExp('src="(https:\\/\\/(?:' + hostAlt + ')\\/[^"]+)"', 'g');
const opt = (u) => `src="/_vercel/image?url=${encodeURIComponent(u)}&w=${W}&q=${Q}"`;

let files = 0, repl = 0;
function walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (e.endsWith('.html')) {
      const c = readFileSync(p, 'utf8');
      const n = c.replace(RE, (_m, u) => { repl++; return opt(u); });
      if (n !== c) { writeFileSync(p, n); files++; }
    }
  }
}
walk('dist');
console.log(`[optimize-images] rewrote ${repl} <img> src(s) across ${files} html file(s)`);
