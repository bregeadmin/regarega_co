import { defineConfig } from 'astro/config';

// Rega Rega — static site, deploys to Vercel with zero config.
export default defineConfig({
  site: 'https://regarega.co',
  // i18n scaffold (EN default, RU mirror) — wired later
  // i18n: { defaultLocale: 'en', locales: ['en', 'ru'] },
});
