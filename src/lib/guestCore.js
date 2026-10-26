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
