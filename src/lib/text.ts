// teaser(): short card blurb from a full description.
// Keep ~3 lines, end on a whole sentence (cut at the last period within budget);
// fall back to a clean word-break + ellipsis if there's no sentence break.
export function teaser(s: string | null | undefined, limit = 220): string {
  if (!s) return '';
  const flat = s.replace(/\s+/g, ' ').trim();
  if (flat.length <= limit) return flat;
  const cut = flat.slice(0, limit);
  const lastDot = cut.lastIndexOf('.');
  if (lastDot >= 80) return cut.slice(0, lastDot + 1);
  const lastSpace = cut.lastIndexOf(' ');
  return cut.slice(0, lastSpace > 0 ? lastSpace : limit).trim() + '…';
}
