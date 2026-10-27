// Single source of truth for guide category colour + label (EN/RU).
// City-agnostic taxonomy — shared by GuideCategory, place pages and news pages
// so a colour/label is defined ONCE (not copy-pasted across files).
export type Lang = 'en' | 'ru';

// Place categories carry the WORLD colours (brandbook): never orange — orange is
// reserved for the certified flat (logo dot). Pins/dots/plates use colour + fill
// ('solid' or 'outline') so a category reads the same everywhere.
// tint/dark per world (brandbook): stamps are tint background + dark text + solid colour dot
export type WorldId = 'city' | 'self';
// Worlds: colour = world, icon = category. Orange is NOT a world (stays / trip / booking only).
export const WORLDS: { id: WorldId; color: string; tint: string; dark: string; label: { en: string; ru: string }; order: number }[] = [
  { id: 'city', color: '#3A4868', tint: '#E8EBF1', dark: '#2C3850', label: { en: 'everyday city', ru: 'город каждый день' }, order: 1 },
  { id: 'self', color: '#1F8A5B', tint: '#E3F2EB', dark: '#176E48', label: { en: 'for yourself',  ru: 'для себя' },          order: 2 },
];
const W = Object.fromEntries(WORLDS.map((w) => [w.id, w])) as Record<WorldId, (typeof WORLDS)[number]>;

// Tabler "outline" path data (viewBox 0 0 24 24, stroke 2). One icon per category, same everywhere.
const IC = {
  eat: '<path d="M19 3v12h-5c-.023 -3.681 .184 -7.406 5 -12zm0 12v6h-1v-3m-10 -14v17m-3 -17v3a3 3 0 1 0 6 0v-3" />',
  car: '<path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" /><path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6m-6 -6h15m-6 0v-5" />',
  leaf: '<path d="M5 21c.5 -4.5 2.5 -8 7 -10" /><path d="M9 18c6.218 0 10.5 -3.288 11 -12v-2h-4.014c-9 0 -11.986 4 -12 9c0 1 0 3 2 5h3z" />',
  laptop: '<path d="M3 19l18 0" /><path d="M5 6m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z" />',
};

export const GUIDE_CATS: Record<string, { world: WorldId; icon: string; outline?: boolean; color: string; tint: string; dark: string; label: { en: string; ru: string } }> = {
  'eat-drink':   { world: 'city', icon: IC.eat,    color: W.city.color, tint: W.city.tint, dark: W.city.dark, label: { en: 'eat & drink',            ru: 'еда и напитки' } },
  'move-around': { world: 'city', icon: IC.car,    outline: true, color: W.city.color, tint: W.city.tint, dark: W.city.dark, label: { en: 'move around',            ru: 'транспорт' } },
  'wellness':    { world: 'self', icon: IC.leaf,   color: W.self.color, tint: W.self.tint, dark: W.self.dark, label: { en: 'wellness & slow living', ru: 'велнес' } },
  'work':        { world: 'self', icon: IC.laptop, outline: true, color: W.self.color, tint: W.self.tint, dark: W.self.dark, label: { en: 'work & remote life',     ru: 'работа' } },
};

const svgOf = (inner: string, stroke = 'currentColor') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
export const catWorld = (c: string): WorldId => GUIDE_CATS[c]?.world || 'city';
/** Inline SVG string (currentColor stroke) for a category icon. */
export const catIcon = (c: string): string => svgOf(GUIDE_CATS[c]?.icon || IC.eat);
/** CSS url(...) of the icon (black stroke) — used as a mask so the icon takes the world colour. */
export const catIconUrl = (c: string): string => `url(data:image/svg+xml,${encodeURIComponent(svgOf(GUIDE_CATS[c]?.icon || IC.eat, '#000'))})`;

export const catColor = (c: string): string => GUIDE_CATS[c]?.color || '#3A4868';
export const catTint = (c: string): string => GUIDE_CATS[c]?.tint || '#E8EBF1';
export const catDark = (c: string): string => GUIDE_CATS[c]?.dark || '#2C3850';
// legacy (site pages + map pins only): solid/outline split. The APP uses icons instead (catStyle/catIcon).
export const catOutline = (c: string): boolean => GUIDE_CATS[c]?.outline || false;
// fill value for the "background:var(--cat-fill);border:... var(--cat-color)" pattern
export const catFill = (c: string): string => (GUIDE_CATS[c]?.outline ? 'transparent' : (GUIDE_CATS[c]?.color || '#3A4868'));
export const catLabel = (c: string, lang: Lang): string => GUIDE_CATS[c]?.label[lang] || c;
// inline vars for a category stamp / chip / pin: style={catStyle(k)} + --tag-i icon mask
export const catStyle = (c: string): string => `--tag-c:${catColor(c)};--tag-t:${catTint(c)};--tag-d:${catDark(c)};--tag-i:${catIconUrl(c)};--tag-w:14px`;
