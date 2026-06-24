# Rega Rega App — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Превратить regarega.co (Astro-сайт, уже устанавливаемый PWA) в ощущаемое приложение: нижнее меню из 4 вкладок (app-shell), работа офлайн, подсказка «установить на экран», и экран «Поездка» по токену брони — без магазинов, на изолированной ветке, прод не трогаем до явного «деплой».

**Architecture:** Один код. Astro статика → Vercel. Добавляем: (1) компонент нижнего меню в Site.astro/SiteRu.astro; (2) настоящий кэширующий service worker вместо нынешнего passthrough `public/sw.js`; (3) install-prompt (A2HS) для Android + инструкция для iOS; (4) страницу `/georgia/batumi/trip` читающую бронь по токену из общей Supabase через безопасный анон-RPC. Проверка — `astro build`, `astro preview`, preview-инструменты, Lighthouse PWA. Никакой работы со сторами в этой фазе.

**Tech Stack:** Astro, @supabase/supabase-js, Vercel serverless (`api/`), Service Worker, Web App Manifest, Tabler/inline SVG иконки.

---

## Scope — что входит и что НЕТ

**IN (Sprint 1):**
- Task 1 — нижнее меню (Гид · Карта · Жильё · Поездка), app-shell.
- Task 2 — офлайн service worker (кэш гида/карты/ассетов + офлайн-фоллбэк).
- Task 3 — подсказка «установить на экран» (Android beforeinstallprompt + iOS-инструкция).
- Task 4 — экран «Поездка» по токену (read-only: бронь, коды, инструкции).

**OUT (отдельными заходами, НЕ в эту неделю):**
- Перекраска в светлый редакционный стиль (сейчас остаётся текущий кремовый бренд) — Phase 1.5.
- Аккаунт/регистрация, пуши, чат — Phase 2+.
- Обёртка в App Store / Google Play — Phase 3 (аккаунт Apple уже заапрувлен → TestFlight доступен потом).

**Изоляция:** вся работа на ветке `app-phase1` от `main`. Никакого `vercel --prod` (он льёт всю рабочую копию) до явного согласия Артёма. Память-предупреждение: перед любым деплоем `git status`.

---

## File Structure

| Файл | Создать/Изменить | Ответственность |
|---|---|---|
| `src/components/TabBar.astro` | Создать | Нижнее меню: 4 вкладки, активная по URL |
| `src/styles/tabbar.css` | Создать | Стили меню (fixed bottom, safe-area, скрыт на ≥720px) |
| `src/layouts/Site.astro` | Изменить | Подключить TabBar + нижний отступ body (EN) |
| `src/layouts/SiteRu.astro` | Изменить | То же (RU) |
| `public/sw.js` | Изменить | Passthrough → кэширующий SW (precache + runtime) |
| `public/offline.html` | Создать | Офлайн-фоллбэк страница |
| `src/scripts/pwa-install.js` | Создать | Перехват beforeinstallprompt + iOS-инструкция |
| `public/manifest.webmanifest` | Изменить | `start_url` под app-shell, проверка scope |
| `src/pages/georgia/batumi/trip.astro` | Создать | Экран «Поездка» по токену (EN) |
| `src/pages/ru/georgia/batumi/trip.astro` | Создать | Экран «Поездка» по токену (RU) |
| `supabase/get-booking-by-token.sql` | Создать | Безопасный анон-RPC чтения брони по токену |

---

## Task 0: Изолированная ветка + зелёный базлайн

**Files:** нет правок кода; подготовка.

- [ ] **Step 1: Ветка от main**

```bash
cd ~/Downloads/rega-batumi
git status            # должно быть чисто; если нет — разобраться ПЕРЕД веткой
git checkout -b app-phase1
```

- [ ] **Step 2: Установить зависимости и поднять dev**

```bash
npm install
npm run dev          # astro dev, обычно http://localhost:4321
```
Expected: сайт открывается, главная редиректит на `/georgia/batumi`.

- [ ] **Step 3: Базлайн PWA (зафиксировать «до»)**

Открыть preview, снять Lighthouse PWA / ручную проверку: манифест есть, SW регистрируется (passthrough), «установить» в Chrome доступно. Записать как стартовую точку.

- [ ] **Step 4: Commit точки старта (пустой маркер)**

```bash
git commit --allow-empty -m "chore: start app-phase1 branch"
```

---

## Task 1: Нижнее меню (app-shell)

**Files:**
- Create: `src/components/TabBar.astro`, `src/styles/tabbar.css`
- Modify: `src/layouts/Site.astro` (подключить компонент перед `</body>`, добавить класс на body), `src/layouts/SiteRu.astro`

- [ ] **Step 1: Подтвердить реальные маршруты вкладок**

```bash
ls src/pages/georgia/batumi          # guide, stays, index...
grep -rl "HomeIntro\|fitBounds\|leaflet\|maplibre\|mapbox" src/pages   # где живёт карта
```
Зафиксировать: Гид=`/georgia/batumi/guide`, Жильё=`/georgia/batumi/stays`, Карта=маршрут карты (если отдельной страницы нет — Карта временно ведёт на `/georgia/batumi/stays` к карте объектов; отдельную `/map` вынесем в Phase 1.5), Поездка=`/georgia/batumi/trip` (создаём в Task 4). RU-зеркала с префиксом `/ru`.

- [ ] **Step 2: Создать компонент `src/components/TabBar.astro`**

```astro
---
// Нижнее меню приложения. Активная вкладка — по началу пути.
// lang: 'en' | 'ru' — для подписей и префикса ссылок.
const { lang = 'en' } = Astro.props;
const p = Astro.url.pathname;
const base = lang === 'ru' ? '/ru/georgia/batumi' : '/georgia/batumi';
const tabs = [
  { key: 'guide', href: `${base}/guide`, en: 'guide', ru: 'гид', match: '/guide' },
  { key: 'map',   href: `${base}/stays`, en: 'map',   ru: 'карта', match: '/map' },
  { key: 'stays', href: `${base}/stays`, en: 'stays', ru: 'жильё', match: '/stays' },
  { key: 'trip',  href: `${base}/trip`,  en: 'trip',  ru: 'поездка', match: '/trip' },
];
const active = (m: string) => p.includes(m);
const icon: Record<string,string> = {
  guide: 'M12 2 4 7v10l8 5 8-5V7z',          // placeholder paths — заменить на реальные в Step 3
  map:   'M9 3 3 6v15l6-3 6 3 6-3V3l-6 3z',
  stays: 'M3 11h18v9H3zM6 11V7h12v4',
  trip:  'M5 12h14M13 6l6 6-6 6',
};
---
<nav class="tabbar" aria-label="Главное меню">
  {tabs.map(t => (
    <a class:list={["tabbar__item", { 'is-active': active(t.match) }]} href={t.href} aria-current={active(t.match) ? 'page' : undefined}>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d={icon[t.key]}/></svg>
      <span>{lang === 'ru' ? t.ru : t.en}</span>
    </a>
  ))}
</nav>
```

- [ ] **Step 3: Стили `src/styles/tabbar.css`** (использует токены из tokens.css: --bg, --ink, --accent)

```css
.tabbar{position:fixed;left:0;right:0;bottom:0;z-index:60;display:flex;
  background:var(--bg,#FAF7F0);border-top:.5px solid var(--line,#ECE8DF);
  padding:6px 2px calc(6px + env(safe-area-inset-bottom));}
.tabbar__item{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:4px 0;color:var(--faint,#9b9a94);text-decoration:none;font-size:11px;}
.tabbar__item.is-active{color:var(--accent,#FF5E1A);font-weight:500;}
@media(min-width:720px){.tabbar{display:none;}}      /* десктоп — обычная навигация сверху */
body.has-tabbar{padding-bottom:64px;}
@media(min-width:720px){body.has-tabbar{padding-bottom:0;}}
```
Заменить placeholder-пути иконок на реальные (Tabler outline: compass, map-2, bed, route) — взять `d=` из tabler-icons.

- [ ] **Step 4: Подключить в Site.astro (EN)** — перед `</body>`, добавить класс на body:

```astro
import TabBar from '../components/TabBar.astro';
import '../styles/tabbar.css';
/* в <body class="... has-tabbar"> и перед </body>: */
<TabBar lang="en" />
```
И то же в `SiteRu.astro` с `lang="ru"`.

- [ ] **Step 5: Проверка**

Run: `npm run dev`, открыть preview на узком вьюпорте (375px).
Expected: меню снизу, активная вкладка оранжевая, переход между Гид/Жильё работает, контент не перекрыт меню. На ≥720px меню скрыто.

- [ ] **Step 6: Commit**

```bash
git add src/components/TabBar.astro src/styles/tabbar.css src/layouts/Site.astro src/layouts/SiteRu.astro
git commit -m "feat(app): bottom tab bar app-shell"
```

---

## Task 2: Офлайн service worker

**Files:** Modify `public/sw.js`; Create `public/offline.html`.

- [ ] **Step 1: Офлайн-фоллбэк `public/offline.html`** — лёгкая страница бренда «нет сети, гид скоро вернётся».

- [ ] **Step 2: Переписать `public/sw.js`** (versioned cache, precache shell, стратегии):

```js
const VERSION = 'rega-v1';
const PRECACHE = [
  '/georgia/batumi/guide', '/georgia/batumi/stays',
  '/offline.html', '/manifest.webmanifest',
  '/icons/icon-192.png?v=7', '/icons/icon-512.png?v=7',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // HTML-страницы: network-first, офлайн → кэш → offline.html
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((r) => { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then((m) => m || caches.match('/offline.html'))));
    return;
  }
  // ассеты/картинки/данные: stale-while-revalidate
  e.respondWith(caches.match(req).then((cached) => {
    const net = fetch(req).then((r) => { if (r.ok) { const cp = r.clone(); caches.open(VERSION).then((c) => c.put(req, cp)); } return r; }).catch(() => cached);
    return cached || net;
  }));
});
```

- [ ] **Step 3: Bump кэша при изменениях** — менять `VERSION` при правках precache.

- [ ] **Step 4: Проверка офлайн**

Run: `npm run build && npm run preview`. В preview-инструментах: загрузить гид, затем эмулировать offline, перезагрузить.
Expected: гид и stays открываются из кэша; неизвестный URL офлайн → `/offline.html`. Console без ошибок SW.

- [ ] **Step 5: Commit**

```bash
git add public/sw.js public/offline.html
git commit -m "feat(pwa): offline caching service worker"
```

---

## Task 3: Подсказка «установить на экран»

**Files:** Create `src/scripts/pwa-install.js`; Modify `Site.astro`/`SiteRu.astro` (подключить скрипт + контейнер баннера).

- [ ] **Step 1: Скрипт `src/scripts/pwa-install.js`**

```js
// Android/Chrome: ловим beforeinstallprompt, показываем свою кнопку.
// iOS: своего события нет → показываем инструкцию «Поделиться → На экран Домой».
let deferred = null;
const banner = () => document.getElementById('pwa-install');
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; show('android'); });
function show(kind){ const b = banner(); if(!b) return;
  if (window.matchMedia('(display-mode: standalone)').matches) return;       // уже установлено
  if (localStorage.getItem('rr_install_dismissed')) return;
  b.dataset.kind = kind; b.hidden = false; }
function isiOS(){ return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream; }
document.addEventListener('DOMContentLoaded', () => {
  if (isiOS() && !navigator.standalone) show('ios');
  const b = banner(); if(!b) return;
  b.querySelector('[data-act="install"]').addEventListener('click', async () => {
    if (deferred){ deferred.prompt(); await deferred.userChoice; deferred = null; b.hidden = true; }
    else { b.querySelector('[data-ios]').hidden = false; }   // iOS: раскрыть инструкцию
  });
  b.querySelector('[data-act="close"]').addEventListener('click', () => { b.hidden = true; localStorage.setItem('rr_install_dismissed','1'); });
});
```

- [ ] **Step 2: Контейнер баннера** в layout (EN+RU), бренд-стилизованный, скрыт по умолчанию (`hidden`), с кнопками `data-act="install"` / `data-act="close"` и блоком `data-ios` с шагами для iOS.

- [ ] **Step 3: Проверка** — Android Chrome: появляется баннер, тап → системный prompt. iOS Safari: появляется инструкция. «Закрыть» → больше не показывается (localStorage).

- [ ] **Step 4: Commit**

```bash
git add src/scripts/pwa-install.js src/layouts/Site.astro src/layouts/SiteRu.astro
git commit -m "feat(pwa): add-to-home-screen prompt (Android + iOS)"
```

---

## Task 4: Экран «Поездка» по токену (бэкенд-зависимость)

**Files:** Create `supabase/get-booking-by-token.sql`, `src/pages/georgia/batumi/trip.astro`, `src/pages/ru/georgia/batumi/trip.astro`.

> Это единственная часть с зависимостью от общей Supabase. Делаем read-only и максимально безопасно (по образцу `api/booking.js`: анон-grant, SECURITY DEFINER, отдаём только нужные поля одной брони по токену).

- [ ] **Step 1: Discovery — как сейчас гость видит бронь/коды**

```bash
# существующая система инструкций — отдельный репозиторий/Tilda; здесь подтверждаем,
# есть ли уже токен на брони и где коды/инструкции в схеме Rega OS.
```
Свериться со схемой Rega OS v2 (миграции в репозитории админки): есть ли колонка `guest_token` / поле кодов / инструкций на брони. Зафиксировать имена полей. Если токена нет — Артём решает: (а) добавить `guest_token` на брони в админ-миграции, или (б) Sprint-1 «Поездка» линкует на существующую систему инструкций, а нативный экран ждёт Phase 2. **Это развилка для согласования, не пишем вслепую.**

- [ ] **Step 2: Безопасный RPC `get_booking_by_token`** (если идём путём (а)) — SECURITY DEFINER, принимает токен, возвращает ОДНУ бронь: квартира, даты, гости, статус, коды, инструкция. Анон-grant только на этот RPC, RLS прочих таблиц не ослабляем.

```sql
create or replace function public.get_booking_by_token(p_token text)
returns table(apt_title text, ci date, co date, adults int, status text,
              door_code text, wifi text, instructions text)
language sql security definer set search_path = public as $$
  select a.title, b.ci, b.co, b.adults, b.status,
         b.door_code, b.wifi, b.instructions
  from bookings b join apartments a on a.id = b.apartment_id
  where b.guest_token = p_token limit 1;
$$;
revoke all on function public.get_booking_by_token(text) from public;
grant execute on function public.get_booking_by_token(text) to anon;
```
(точные имена таблиц/колонок — из Step 1; привести в соответствие.)

- [ ] **Step 3: Страница `trip.astro`** — читает `?t=<token>` на клиенте, зовёт RPC через `supabase`, рендерит: карточка брони (статус-пилюля «заезд через N дней»), коды (дверь, wifi), «инструкция заселения», кнопка «написать хозяину» (deep-link на оператора). Без токена → пустое состояние-приглашение (как в дизайне: «здесь появится твоя поездка» + «посмотреть жильё»). Используем `src/lib/supabase.ts`.

- [ ] **Step 4: RU-зеркало** `ru/.../trip.astro`.

- [ ] **Step 5: Кэшировать «Поездку»** — добавить страницу в SWR (Task 2 уже покрывает navigate-режим; убедиться, что бронь читается из кэша офлайн — данные RPC кэшировать в localStorage на клиенте для офлайна).

- [ ] **Step 6: Проверка** — открыть `/georgia/batumi/trip?t=<тестовый токен>`: видна бронь, коды, инструкция. Без токена — приглашение. Офлайн после первого захода — данные из кэша.

- [ ] **Step 7: Commit**

```bash
git add supabase/get-booking-by-token.sql src/pages/georgia/batumi/trip.astro src/pages/ru/georgia/batumi/trip.astro
git commit -m "feat(app): trip screen by booking token (read-only)"
```

---

## Verification (вместо юнит-тестов — это статика+PWA)

- `npm run build` зелёный после каждой задачи.
- `npm run preview` + preview-инструменты: snapshot, console-logs, network, offline-эмуляция.
- Lighthouse PWA-аудит: installable, has SW, offline-ready, manifest валиден.
- Реальное устройство: установить на Android и iPhone (через TestFlight НЕ в этой фазе — просто A2HS), проверить офлайн и «Поездку».

## Milestones (чтобы каждый шаг был законченным)

- **M1 (Tasks 1-3):** установимое офлайн-приложение с нижним меню — уже можно дать гостю. Полноценный результат даже без Task 4.
- **M2 (Task 4):** + «Поездка» по токену. Требует согласования развилки в Step 1.

## Self-review notes

- Все пути — реальные из репозитория (проверено грепом 2026-06-22).
- Единственный placeholder, помеченный явно: иконки tab-bar (Step 1.3 — заменить на реальные Tabler-пути) и маршрут «Карта» (Step 1.1 — подтвердить/временно на stays).
- Развилка Task 4 Step 1 — осознанная точка согласования с Артёмом (схема брони в другом репозитории), не слепой код.
- Перекраска в светлый стиль и сторы — вне фазы, зафиксировано в Scope.
