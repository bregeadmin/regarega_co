// Single source of truth for guide category colour + label (EN/RU).
// City-agnostic taxonomy — shared by GuideCategory, place pages and news pages
// so a colour/label is defined ONCE (not copy-pasted across files).
export type Lang = 'en' | 'ru';

export const GUIDE_CATS: Record<string, { color: string; label: { en: string; ru: string } }> = {
  'eat-drink':   { color: '#ff5e1a', label: { en: 'eat & drink',           ru: 'еда и напитки' } },
  'wellness':    { color: '#00b5b0', label: { en: 'wellness & slow living', ru: 'велнес' } },
  'work':        { color: '#7f77dd', label: { en: 'work & remote life',     ru: 'работа' } },
  'move-around': { color: '#3D5AFE', label: { en: 'move around',            ru: 'транспорт' } },
};

export const catColor = (c: string): string => GUIDE_CATS[c]?.color || '#ff5e1a';
export const catLabel = (c: string, lang: Lang): string => GUIDE_CATS[c]?.label[lang] || c;
