// Static paths + props for the native app place screen (app/place/[slug] in EN and RU).
// One query for all places and apartments, then per place: the 3 closest apartments
// (straight-line distance) and up to 6 other places of the same category.
import { supabase } from './supabase';

export interface NearbyApt { slug: string; title: string; title_ru?: string | null; bedrooms: number | null; max_guests: number | null; price_from: number | null; price_currency: string | null; photos: string[] | null; d: number }

const hav = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, r = (x: number) => (x * Math.PI) / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
};

export async function placePaths() {
  const { data: gp } = await supabase.from('guide_places').select('*').eq('status', 'published');
  const { data: apts } = await supabase
    .from('apartments_public')
    .select('slug,title,title_ru,bedrooms,max_guests,price_from,price_currency,photos,lat,lng');
  const places = (gp || []) as any[];
  const located = ((apts || []) as any[]).filter((a) => a.lat != null && a.lng != null);
  const photoOf = (p: any) => (p.photos && p.photos[0]) || p.image || '';
  return places.map((p) => {
    const nearby: NearbyApt[] = p.lat != null && p.lng != null
      ? located.map((a) => ({ ...a, d: hav(p, a) })).sort((x, y) => x.d - y.d).slice(0, 3)
      : [];
    const related = places
      .filter((x) => x.category === p.category && x.slug !== p.slug && photoOf(x))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6);
    return { params: { slug: p.slug }, props: { p, nearby, related } };
  });
}
