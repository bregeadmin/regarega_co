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

export function nextPath(search, fallback) {
  let v = null;
  try { v = new URLSearchParams(search || '').get('next'); } catch (e) { v = null; }
  if (!v || v[0] !== '/' || v[1] === '/' || v[1] === '\\' || /[\r\n]/.test(v)) return fallback;
  return v;
}
