// Pure helpers for guest accounts. No imports — unit-tested with node --test.
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export function isEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
}

export function cleanCode(s) {
  return String(s || '').replace(/\D/g, '').slice(0, 6);
}

export function tokenFrom(s) {
  const m = String(s || '').match(UUID);
  return m ? m[0].toLowerCase() : null;
}

export function inviteFrom(s) {
  const m = String(s || '').match(/[?&]i=([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
  return m ? m[1].toLowerCase() : null;
}

// Keep in sync with the inline copy in src/components/app/LoginScreen.astro.
// Resolves against a fixed origin and accepts only a same-origin path+search+hash, so tricks
// like "/\t/evil.com" (the URL parser strips tab/newline -> //evil.com) fall back.
export function nextPath(search, fallback) {
  let v = null;
  try { v = new URLSearchParams(search || '').get('next'); } catch (e) { v = null; }
  if (!v || v[0] !== '/' || /[\u0000-\u001f\u007f\\]/.test(v)) return fallback;
  try {
    const u = new URL(v, 'https://x.invalid');
    if (u.origin !== 'https://x.invalid') return fallback;
    const out = u.pathname + u.search + u.hash;
    return out[0] === '/' && out[1] !== '/' ? out : fallback;
  } catch (e) { return fallback; }
}

// Site header: the letter in the account disc (name first, then email).
export function initialOf(name, email) {
  const s = String(name || '').trim() || String(email || '').trim();
  return s ? s.charAt(0).toUpperCase() : '?';
}

// Unread counter text: nothing for 0, capped at 99+.
export function unreadText(n) {
  const v = Math.floor(Number(n) || 0);
  return v <= 0 ? '' : v > 99 ? '99+' : String(v);
}

// Old site hearts (localStorage rr_favs, flat slugs) → «my batumi» saves not already there.
export function favsToSaves(favs, have) {
  const seen = new Set((have || []).filter((x) => x && x.k === 'stay').map((x) => x.s));
  const out = [];
  for (const s of favs || []) {
    if (typeof s !== 'string' || !/^[a-z0-9-]{1,120}$/.test(s) || seen.has(s)) continue;
    seen.add(s);
    out.push({ k: 'stay', s, c: 'batumi' });
  }
  return out;
}
