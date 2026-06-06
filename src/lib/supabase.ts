import { createClient } from '@supabase/supabase-js';

// Public (publishable) key — safe to ship in client/build output.
// Reads the shared Rega Rega Supabase (single source of truth).
const url = import.meta.env.PUBLIC_SUPABASE_URL || 'https://qkzinjawtumhjbezlyog.supabase.co';
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_R0NeSmTwX9qt0bxlHYj1AA_JIVRqsqU';

export const supabase = createClient(url, key);

export type Apartment = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  neighborhood: string | null;
  bedrooms: number | null;
  max_guests: number | null;
  price_from: number | null;
  photos: string[];
};
