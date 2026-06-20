import { createClient } from '@supabase/supabase-js';

// Public (publishable) key — safe to ship in client/build output.
// Reads the shared Rega Rega Supabase (single source of truth).
const url = import.meta.env.PUBLIC_SUPABASE_URL || 'https://qkzinjawtumhjbezlyog.supabase.co';
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_R0NeSmTwX9qt0bxlHYj1AA_JIVRqsqU';

export const supabase = createClient(url, key);

export type Apartment = {
  id: string;
  slug: string;
  operator_id: string | null;
  title: string;
  title_ru: string | null;
  summary: string | null;
  summary_ru: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  beds: number | null;
  baths: number | null;
  max_guests: number | null;
  price_from: number | null;
  price_currency: string | null;
  lat: number | null;
  lng: number | null;
  photos: string[];
  amenities: string[] | null;
  rooms: { room: string; photos: number; amenities: string[] }[] | null;
};

// Clean display names — override Airbnb's "… by brege" titles.
// Temporary shim until names are edited in the admin (DB).
export const NAMES: Record<string, string> = {
  'sunset-apartment': 'Sunset Apartment',
  'seaside-apartment': 'Seaside Apartment',
  'alliance-burgundy-8th-floor': 'Alliance Burgundy 8th floor',
  'white-camelia-apartment': 'White Camelia',
  'red-camelia-apartment': 'Red Camelia',
  'coral-apartment': 'Coral Apartment',
  'granat-apartment': 'Granat Apartment',
  'cozy-view-apartment-in-old-batumi': 'Cozy View (Old Batumi)',
  'modern-batumi-apartment': 'Modern Batumi Apartment',
  'batumi-view-and-vibes': 'Batumi View and Vibes',
  'next-seaview-studio': 'Next Seaview Studio',
  'sunway-apartment': 'SunWay Apartment',
  'greenside-emerald-apartment': 'Greenside Emerald',
};

export function applyNames(a: Apartment): Apartment {
  const n = NAMES[a.slug];
  if (n) { a.title = n; a.title_ru = n; }
  return a;
}
