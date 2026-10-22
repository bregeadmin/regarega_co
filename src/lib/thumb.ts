// Resized photo URL through Vercel's image optimizer (sizes + allowed hosts live in
// vercel.json → images). Source photos in Supabase are ~1400px PNGs — far too heavy for
// app cards. Unknown hosts and local paths pass through untouched.
const OPTIMIZABLE = /^https:\/\/(qkzinjawtumhjbezlyog\.supabase\.co|images\.unsplash\.com|static\.tildacdn\.(?:com|one)|picsum\.photos)\//;

export const thumb = (u: string | null | undefined, w: 320 | 480 | 640 | 828 = 480): string =>
  u && OPTIMIZABLE.test(u) ? `/_vercel/image?url=${encodeURIComponent(u)}&w=${w}&q=72` : (u || '');
