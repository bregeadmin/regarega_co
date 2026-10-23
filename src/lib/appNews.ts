// News for the native app: the screen paths (app/news/[slug] in EN and RU) and the shared
// bits every app screen showing news needs — RU fields with EN fallback, photo cleanup,
// and the date label. "News" are mostly city events: `date` is the event's date + time.
import { supabase } from './supabase';

export type Lang = 'en' | 'ru';

export async function loadNews() {
  const { data } = await supabase
    .from('news').select('*').eq('status', 'published').order('date', { ascending: false });
  return ((data || []) as any[]).filter((n) => n.on_guide !== false);
}

// the imported tilda gallery carries the bre.ge logo placeholder and resized duplicates
// of the same shot (same filename) — drop both, like the site's news page does
export const newsPhotos = (n: any): string[] => {
  const raw: string[] = (n.photos && n.photos.length) ? n.photos : (n.image ? [n.image] : []);
  const seen = new Set<string>();
  return raw.filter((src) => {
    if (/___12\.png/.test(src)) return false;
    const base = String(src).split('/').pop() || src;
    if (seen.has(base)) return false;
    seen.add(base); return true;
  });
};

export const newsText = (n: any, lang: Lang) => {
  const ru = lang === 'ru';
  return {
    title: (ru && n.title_ru) || n.title || '',
    headline: (ru && n.headline_ru) || n.headline || '',
    descr: (ru && n.descr_ru) || n.descr || '',
    body: (ru && n.body_ru) || n.body || '',
  };
};

const MONTHS = {
  en: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
};
// "2026-11-21 19:00" → "21 nov · 19:00" (time only when it is set)
export const newsDate = (d: string, lang: Lang) => {
  const m = String(d || '').match(/(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
  if (!m) return '';
  const day = `${+m[3]} ${MONTHS[lang][+m[2] - 1]}`;
  return m[4] && !(m[4] === '00' && m[5] === '00') ? `${day} · ${m[4]}:${m[5]}` : day;
};
// sortable "YYYY-MM-DD" for client-side "upcoming first" ordering
export const newsDay = (d: string) => (String(d || '').match(/\d{4}-\d{2}-\d{2}/) || [''])[0];

export async function newsPaths() {
  const news = await loadNews();
  const { data: gp } = await supabase
    .from('guide_places')
    .select('slug,title,name,category,photos,image,address')
    .eq('status', 'published');
  const pmap: Record<string, any> = {};
  (gp || []).forEach((p: any) => { pmap[p.slug] = p; });
  return news.map((n) => ({
    params: { slug: n.slug },
    props: {
      n,
      places: ((n.places && n.places.length) ? n.places : (n.place ? [n.place] : []))
        .map((s: string) => pmap[s]).filter(Boolean),
    },
  }));
}
