// stripEmoji(): remove decorative emoji from editorial copy (descriptions, blurbs).
// No admin/CMS yet, so we sanitize at render time — DB text may contain ✨ 🌊 etc.
// Keeps functional UI arrows (→ ↗ ← …, U+2190–21FF) untouched.
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{1F1E6}-\u{1F1FF}]/gu;
export function stripEmoji(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(EMOJI_RE, '').replace(/[ \t]{2,}/g, ' ').replace(/ +([.,!?;:])/g, '$1')
    // normalize time ranges to a tight en-dash: "16:00 - 22:00" -> "16:00–22:00"
    .replace(/(\d{1,2}:\d{2})\s*[–—-]\s*(\d{1,2}:\d{2})/g, '$1–$2')
    // normalize price ranges: "10-40 ₾" -> "10–40 ₾"
    .replace(/(\d+)\s*[–—-]\s*(\d+)(\s*(?:₾|gel|lari|\$|usd|eur|€))/gi, '$1–$2$3');
}

// teaser(): short card blurb from a full description.
// Keep ~3 lines, end on a whole sentence (cut at the last period within budget);
// fall back to a clean word-break + ellipsis if there's no sentence break.
export function teaser(s: string | null | undefined, limit = 220): string {
  if (!s) return '';
  const flat = stripEmoji(s).replace(/\s+/g, ' ').trim();
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const lastDot = cut.lastIndexOf('.');
  if (lastDot >= 80) return cut.slice(0, lastDot + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 0 ? lastSpace : limit).trim() + '…';
}
