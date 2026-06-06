# rega rega — batumi edition

Astro port of the city edition (was bre-public, rebranded). = `regarega.co/batumi`.

## Run
```bash
npm install && npm run dev      # http://localhost:4322
npm run build                   # → dist/
```

## Structure
```
src/layouts/Site.astro     SHARED shell — topbar, mobile menu, footer, cursor, head.
                           Edit the nav/logo/footer ONCE here → every page updates.
src/styles/shell.css       shared CSS (tokens, topbar, menu, footer, cursor, type)
src/pages/index.astro      home (hero + search + journal + guide preview + doors)
public/                    favicons, assets
```

## Status
- ✅ Home ported, on shared Site layout. Builds + runs.
- ⬜ Pages still standalone HTML in ../rega-batumi-site (not yet ported):
     about, contact, privacy, terms, 404 (static — port next),
     stays, guide, apartment detail (port WITH Supabase data),
     own/invest/agents (these move to bre.ge — do NOT port here).
- ⬜ RU mirror (i18n) — later.
- ⬜ Wire Supabase for stays/guide.

Brand canon: Rega Identity Guidelines v1 (in repo root of rega-rega + design package).
