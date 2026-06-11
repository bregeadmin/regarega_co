// Static map teaser for the homepage hero (no Google Maps SDK).
// Inline stylized SVG of Batumi + category-coloured pins, absolutely positioned.
// Pins are the targets the intro animation flies into; coordinates live here only.

type Pin = { x: number; y: number; kind: 'solid' | 'outline' | 'logo'; c?: string };

// Brandbook pin system (locked, June 2026 — see src/lib/guideCats.ts + rega-map.js):
// orange is RESERVED for certified flats (the logo dot). Guide places use the WORLD
// colours — slate #3A4868 + green #1F8A5B — as solid OR outline. No category rainbow.
const SLATE = '#3A4868', GREEN = '#1F8A5B';
const PINS: Pin[] = [
  { x: 54, y: 33, kind: 'solid',   c: SLATE }, // eat & drink
  { x: 71, y: 49, kind: 'solid',   c: SLATE }, // eat & drink
  { x: 61, y: 70, kind: 'solid',   c: GREEN }, // wellness
  { x: 81, y: 37, kind: 'outline', c: GREEN }, // work (green outline)
  { x: 47, y: 55, kind: 'outline', c: SLATE }, // move around (slate outline)
  { x: 74, y: 63, kind: 'logo' },              // certified flat = the logo
  { x: 58, y: 45, kind: 'logo' },              // certified flat = the logo
];

// certified flat = the Rega mark itself (master dieline: hole r = 33% radius, offset +24%)
const LOGO_SVG =
  '<svg viewBox="0 0 32 32" aria-hidden="true">' +
  '<circle cx="16" cy="16" r="14" fill="#FF5E1A" stroke="#fff" stroke-width="2.5"/>' +
  '<circle cx="19.36" cy="19.36" r="4.62" fill="#FAF7F0"/></svg>';

// Abstract Batumi: Black Sea to the west (left), city blocks east, a boulevard + a park.
// Monochrome land (only pins carry colour); fixed viewBox → CLS-safe, crisp on retina.
const MAP_SVG = `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <rect width="320" height="240" fill="var(--paper)"/>
  <path d="M0 0 L96 0 C90 56 70 120 118 240 L0 240 Z" fill="#DCE6EA"/>
  <path d="M96 0 C90 56 70 120 118 240" fill="none" stroke="var(--line-strong)" stroke-width="1.4"/>
  <g stroke="var(--line)" stroke-width="1" fill="none" opacity="0.9">
    <path d="M118 26 L320 26"/>
    <path d="M126 78 L320 78"/>
    <path d="M132 132 L320 132"/>
    <path d="M120 186 L320 186"/>
    <path d="M170 8 L196 232"/>
    <path d="M236 8 L250 232"/>
    <path d="M112 150 C170 120 210 150 300 110" stroke="var(--line-strong)"/>
  </g>
  <rect x="196" y="150" width="56" height="40" rx="7" fill="var(--bg-2)" stroke="var(--line)" stroke-width="1"/>
</svg>`;

export function mapTeaserHTML(o: { href: string; label: string; cta: string; aria: string }): string {
  const pins = PINS.map((p) =>
    p.kind === 'logo'
      ? `<div class="mt-pin rega-pin logo" style="left:${p.x}%;top:${p.y}%">${LOGO_SVG}</div>`
      : `<div class="mt-pin rega-pin ${p.kind}" style="left:${p.x}%;top:${p.y}%;--c:${p.c}"><span></span></div>`,
  ).join('');
  return (
    `<a class="hero-card map-teaser" href="${o.href}" aria-label="${o.aria}">` +
    `<div class="mt-canvas">${MAP_SVG}</div>` +
    pins +
    `<span class="mt-label">${o.label}</span>` +
    `<span class="mt-cta">${o.cta} <span class="mt-arr">&rarr;</span></span>` +
    `</a>`
  );
}
