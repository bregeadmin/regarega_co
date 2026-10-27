// Cities for the guest app's city picker (components/app/CityPicker.astro + public/app-cities.js).
// Faces ported from rega-design-panel r4/final/cities.js (Emil's «cities as pages»): a sky
// gradient, a hand-drawn city line, local time (Intl timeZone), live weather by coordinates.
// Only Batumi is open; every other city is «soon» and NOT selectable (no «notify me» button —
// it would do nothing). No demo content for closed cities.

export interface CityFace {
  sky: [string, string];
  dark: boolean;
  line: string; // SVG path data for viewBox 0 0 353 64 (stroke only)
}
export interface City {
  id: string;
  en: string;
  ru: string;
  countryEn: string;
  countryRu: string;
  tz: string;
  lat: number;
  lng: number;
  open: boolean;
  face?: CityFace; // cities with a full page (swipe pages + the stack)
}

const LINES: Record<string, string> = {
  batumi: `<path d="M0 56 C40 52 70 58 110 55 S190 52 230 56 S300 55 353 54"/><path d="M96 55 L96 14 M92 55 L100 55 M96 14 C99 18 93 22 96 26 C99 30 93 34 96 38 C99 42 93 46 96 50"/><circle cx="96" cy="10" r="2.6"/><circle cx="170" cy="32" r="17"/><path d="M170 15 L170 49 M153 32 L187 32 M158 20 L182 44 M182 20 L158 44 M162 55 L170 49 L178 55"/><path d="M236 55 C236 44 234 36 230 30 M230 30 C224 28 219 30 216 34 M230 30 C234 25 240 25 244 27 M230 30 C230 24 227 21 223 20"/><path d="M276 55 C276 46 278 40 282 35 M282 35 C288 33 293 35 295 39 M282 35 C279 30 273 30 269 32 M282 35 C283 29 287 27 290 27"/><path d="M28 46 C32 44 36 48 40 46 M36 40 C40 38 44 42 48 40"/>`,
  tbilisi: `<path d="M0 56 C40 54 60 30 96 24 C121 19 136 30 150 44 C162 54 186 56 206 55 S300 56 353 55"/><path d="M86 27 L86 15 L94 15 L94 22 L102 22 L102 13 L110 13 L110 21"/><path d="M114 14 L114 6 M111 9 L117 9"/><path d="M114 20 L236 8"/><rect x="180" y="12" width="7" height="6" rx="1.5"/><path d="M162 52 C182 38 206 38 228 50 M168 48 L168 54 M222 47 L222 54"/><path d="M262 55 C262 47 266 43 272 43 C278 43 282 47 282 55 M290 55 C290 49 293 46 298 46 C303 46 306 49 306 55"/>`,
  istanbul: `<path d="M0 56 C60 54 120 57 180 55 S300 54 353 56"/><path d="M110 55 L110 40 C110 28 124 22 136 22 C148 22 162 28 162 40 L162 55"/><path d="M118 40 C118 34 124 31 128 31 M154 40 C154 34 148 31 144 31"/><path d="M98 55 L98 14 M96 14 L98 6 L100 14 M174 55 L174 14 M172 14 L174 6 L176 14"/><path d="M136 22 L136 15"/><path d="M220 55 L220 38 C220 31 228 27 234 27 C240 27 248 31 248 38 L248 55 M260 55 L260 22 M258 22 L260 14 L262 22"/><path d="M24 48 C28 46 32 50 36 48 M300 50 C304 48 308 52 312 50"/>`,
  yerevan: `<path d="M0 56 C60 55 140 57 200 55 S300 56 353 55"/><path d="M150 50 L196 14 L214 26 L236 18 L292 50" /><path d="M188 20 L196 14 L204 20 M230 22 L236 18 L242 22"/><path d="M40 55 L40 36 L58 36 L58 55 M46 36 L46 28 L52 28 L52 36"/><path d="M70 55 L70 44 L80 44 L80 55 M84 55 L84 40 L94 40 L94 55"/><path d="M310 55 L310 42 L324 42 L324 55"/>`,
  lisbon: `<path d="M0 54 C40 30 80 26 120 40 C160 54 200 30 240 34 C280 38 320 50 353 52"/><rect x="146" y="30" width="34" height="18" rx="4"/><path d="M150 38 L176 38 M154 48 L154 52 M172 48 L172 52 M163 30 L163 18 L170 12"/><path d="M60 40 L60 30 L70 30 L70 38 M250 36 L250 26 L262 26 L262 38"/>`,
  kutaisi: `<path d="M0 56 C60 55 100 40 150 32 C190 26 220 36 250 50 C280 56 320 56 353 55"/><path d="M140 32 L140 20 L176 20 L176 30 M150 20 L150 12 L166 12 L166 20 M158 12 L158 4 C158 2 158 2 158 4"/><path d="M152 12 C152 6 164 6 164 12"/><path d="M40 54 C60 42 90 42 110 54 M60 48 L60 54 M90 48 L90 54"/><path d="M290 54 L290 44 L304 44 L304 54"/>`,
  baku: `<path d="M0 56 C60 55 140 56 200 55 S300 56 353 55"/><path d="M150 55 C148 40 152 22 164 10 C170 22 172 40 170 55"/><path d="M178 55 C176 36 182 18 196 4 C202 18 204 36 200 55"/><path d="M206 55 C206 42 210 28 220 18 C226 28 228 42 226 55"/><path d="M60 55 L60 30 L76 30 L76 55 M64 30 L64 24 L72 24 L72 30"/><path d="M270 50 C276 48 282 52 288 50 M296 46 C302 44 308 48 314 46"/>`,
};

const face = (id: string, sky: [string, string], dark = true): CityFace => ({ sky, dark, line: LINES[id] || '' });

// order = the swipe pages order (cities with a face first), then the rest of the list
export const CITIES: City[] = [
  { id: 'batumi', en: 'batumi', ru: 'батуми', countryEn: 'georgia', countryRu: 'грузия', tz: 'Asia/Tbilisi', lat: 41.6508, lng: 41.6357, open: true, face: face('batumi', ['#121A30', '#2C3A5E']) },
  { id: 'tbilisi', en: 'tbilisi', ru: 'тбилиси', countryEn: 'georgia', countryRu: 'грузия', tz: 'Asia/Tbilisi', lat: 41.7151, lng: 44.8271, open: false, face: face('tbilisi', ['#202329', '#505661']) },
  { id: 'istanbul', en: 'istanbul', ru: 'стамбул', countryEn: 'türkiye', countryRu: 'турция', tz: 'Europe/Istanbul', lat: 41.0082, lng: 28.9784, open: false, face: face('istanbul', ['#2A2342', '#8E5B70']) },
  { id: 'yerevan', en: 'yerevan', ru: 'ереван', countryEn: 'armenia', countryRu: 'армения', tz: 'Asia/Yerevan', lat: 40.1792, lng: 44.4991, open: false, face: face('yerevan', ['#0E1428', '#24315A']) },
  { id: 'lisbon', en: 'lisbon', ru: 'лиссабон', countryEn: 'portugal', countryRu: 'португалия', tz: 'Europe/Lisbon', lat: 38.7223, lng: -9.1393, open: false, face: face('lisbon', ['#F3C58C', '#E8875A'], false) },
  { id: 'kutaisi', en: 'kutaisi', ru: 'кутаиси', countryEn: 'georgia', countryRu: 'грузия', tz: 'Asia/Tbilisi', lat: 42.2679, lng: 42.6946, open: false },
  { id: 'sighnaghi', en: 'sighnaghi', ru: 'сигнахи', countryEn: 'georgia', countryRu: 'грузия', tz: 'Asia/Tbilisi', lat: 41.6197, lng: 45.9219, open: false },
  { id: 'mestia', en: 'mestia', ru: 'местиа', countryEn: 'georgia', countryRu: 'грузия', tz: 'Asia/Tbilisi', lat: 43.0453, lng: 42.7297, open: false },
  { id: 'kazbegi', en: 'kazbegi', ru: 'казбеги', countryEn: 'georgia', countryRu: 'грузия', tz: 'Asia/Tbilisi', lat: 42.6575, lng: 44.6433, open: false },
  { id: 'gudauri', en: 'gudauri', ru: 'гудаури', countryEn: 'georgia', countryRu: 'грузия', tz: 'Asia/Tbilisi', lat: 42.4775, lng: 44.4789, open: false },
  { id: 'gyumri', en: 'gyumri', ru: 'гюмри', countryEn: 'armenia', countryRu: 'армения', tz: 'Asia/Yerevan', lat: 40.7942, lng: 43.8453, open: false },
  { id: 'dilijan', en: 'dilijan', ru: 'дилижан', countryEn: 'armenia', countryRu: 'армения', tz: 'Asia/Yerevan', lat: 40.7406, lng: 44.8631, open: false },
  { id: 'antalya', en: 'antalya', ru: 'анталья', countryEn: 'türkiye', countryRu: 'турция', tz: 'Europe/Istanbul', lat: 36.8969, lng: 30.7133, open: false },
  { id: 'izmir', en: 'izmir', ru: 'измир', countryEn: 'türkiye', countryRu: 'турция', tz: 'Europe/Istanbul', lat: 38.4237, lng: 27.1428, open: false },
  { id: 'trabzon', en: 'trabzon', ru: 'трабзон', countryEn: 'türkiye', countryRu: 'турция', tz: 'Europe/Istanbul', lat: 41.0027, lng: 39.7168, open: false },
  { id: 'kas', en: 'kaş', ru: 'каш', countryEn: 'türkiye', countryRu: 'турция', tz: 'Europe/Istanbul', lat: 36.2018, lng: 29.6377, open: false },
  { id: 'baku', en: 'baku', ru: 'баку', countryEn: 'azerbaijan', countryRu: 'азербайджан', tz: 'Asia/Baku', lat: 40.4093, lng: 49.8671, open: false },
  { id: 'sheki', en: 'sheki', ru: 'шеки', countryEn: 'azerbaijan', countryRu: 'азербайджан', tz: 'Asia/Baku', lat: 41.1919, lng: 47.1706, open: false },
  { id: 'belgrade', en: 'belgrade', ru: 'белград', countryEn: 'serbia', countryRu: 'сербия', tz: 'Europe/Belgrade', lat: 44.7866, lng: 20.4489, open: false },
  { id: 'novi-sad', en: 'novi sad', ru: 'нови-сад', countryEn: 'serbia', countryRu: 'сербия', tz: 'Europe/Belgrade', lat: 45.2671, lng: 19.8335, open: false },
  { id: 'budva', en: 'budva', ru: 'будва', countryEn: 'montenegro', countryRu: 'черногория', tz: 'Europe/Podgorica', lat: 42.2864, lng: 18.84, open: false },
  { id: 'kotor', en: 'kotor', ru: 'котор', countryEn: 'montenegro', countryRu: 'черногория', tz: 'Europe/Podgorica', lat: 42.4247, lng: 18.7712, open: false },
  { id: 'herceg-novi', en: 'herceg novi', ru: 'херцег-нови', countryEn: 'montenegro', countryRu: 'черногория', tz: 'Europe/Podgorica', lat: 42.4531, lng: 18.5375, open: false },
  { id: 'limassol', en: 'limassol', ru: 'лимасол', countryEn: 'cyprus', countryRu: 'кипр', tz: 'Asia/Nicosia', lat: 34.7071, lng: 33.0226, open: false },
  { id: 'paphos', en: 'paphos', ru: 'пафос', countryEn: 'cyprus', countryRu: 'кипр', tz: 'Asia/Nicosia', lat: 34.7754, lng: 32.4245, open: false },
  { id: 'larnaca', en: 'larnaca', ru: 'ларнака', countryEn: 'cyprus', countryRu: 'кипр', tz: 'Asia/Nicosia', lat: 34.9003, lng: 33.6232, open: false },
  { id: 'porto', en: 'porto', ru: 'порту', countryEn: 'portugal', countryRu: 'португалия', tz: 'Europe/Lisbon', lat: 41.1579, lng: -8.6291, open: false },
  { id: 'barcelona', en: 'barcelona', ru: 'барселона', countryEn: 'spain', countryRu: 'испания', tz: 'Europe/Madrid', lat: 41.3874, lng: 2.1686, open: false },
  { id: 'valencia', en: 'valencia', ru: 'валенсия', countryEn: 'spain', countryRu: 'испания', tz: 'Europe/Madrid', lat: 39.4699, lng: -0.3763, open: false },
  { id: 'malaga', en: 'málaga', ru: 'малага', countryEn: 'spain', countryRu: 'испания', tz: 'Europe/Madrid', lat: 36.7213, lng: -4.4214, open: false },
];

export const PAGE_CITIES = CITIES.filter((c) => c.face);
export const cityName = (c: City, lang: 'en' | 'ru') => (lang === 'ru' ? c.ru : c.en);
export const cityCountry = (c: City, lang: 'en' | 'ru') => (lang === 'ru' ? c.countryRu : c.countryEn);
export const skylineSvg = (c: City, stroke: string) =>
  `<svg class="cp-line" viewBox="0 0 353 64" fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${c.face?.line || ''}</svg>`;
