// Place card helpers shared by the home «ещё рядом сейчас» list (components/app/NowScreen.astro)
// and the map sheet (pages/…/app/map.astro) — the same photo and the same one-line «why».
export const placePhoto = (p: any): string => (p.photos && p.photos[0]) || p.image || '';

// one line on why this place: the editorial take (EN) / first sentence of the RU body
// (RU has no take yet — summary_ru often starts with hours, so use the body's first sentence)
export const placeWhy = (p: any, lang: 'en' | 'ru'): string => {
  const isRu = lang === 'ru';
  let raw = isRu ? String(p.body_ru || '').split(/(?<=[.!?])\s|\n/)[0] : String(p.take_title || '');
  // "garage wines — это винный бар…" → "винный бар…" (the name is already the headline)
  const name = String(p.title || p.name || '').toLowerCase().split(/\s+/)[0];
  if (isRu && name && raw.toLowerCase().startsWith(name) && raw.includes(' — ')) raw = raw.slice(raw.indexOf(' — ') + 3).replace(/^это\s+/i, '');
  const clean = raw.replace(/\*+/g, '').replace(/\s+/g, ' ').replace(/[.]$/, '').trim();
  return clean.length > 120 ? clean.slice(0, 120).replace(/\s+\S*$/, '') + '…' : clean;
};
