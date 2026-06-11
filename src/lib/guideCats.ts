// Single source of truth for guide category colour + label (EN/RU).
// City-agnostic taxonomy — shared by GuideCategory, place pages and news pages
// so a colour/label is defined ONCE (not copy-pasted across files).
export type Lang = 'en' | 'ru';

// Place categories carry the WORLD colours (brandbook): never orange — orange is
// reserved for the certified flat (logo dot). Pins/dots/plates use colour + fill
// ('solid' or 'outline') so a category reads the same everywhere.
// tint/dark per world (brandbook): stamps are tint background + dark text + solid colour dot
export const GUIDE_CATS: Record<string, { color: string; tint: string; dark: string; outline?: boolean; label: { en: string; ru: string } }> = {
  'eat-drink':   { color: '#3A4868', tint: '#E8EBF1', dark: '#2C3850',                label: { en: 'eat & drink',           ru: 'еда и напитки' } },
  'wellness':    { color: '#1F8A5B', tint: '#E3F2EB', dark: '#176E48',                label: { en: 'wellness & slow living', ru: 'велнес' } },
  'work':        { color: '#1F8A5B', tint: '#E3F2EB', dark: '#176E48', outline: true, label: { en: 'work & remote life',     ru: 'работа' } },
  'move-around': { color: '#3A4868', tint: '#E8EBF1', dark: '#2C3850', outline: true, label: { en: 'move around',            ru: 'транспорт' } },
};

export const catColor = (c: string): string => GUIDE_CATS[c]?.color || '#3A4868';
export const catTint = (c: string): string => GUIDE_CATS[c]?.tint || '#E8EBF1';
export const catDark = (c: string): string => GUIDE_CATS[c]?.dark || '#2C3850';
export const catOutline = (c: string): boolean => GUIDE_CATS[c]?.outline || false;
// fill value for the "background:var(--cat-fill);border:... var(--cat-color)" pattern
export const catFill = (c: string): string => (GUIDE_CATS[c]?.outline ? 'transparent' : (GUIDE_CATS[c]?.color || '#3A4868'));
export const catLabel = (c: string, lang: Lang): string => GUIDE_CATS[c]?.label[lang] || c;
