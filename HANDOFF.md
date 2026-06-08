# Rega Rega (сайт) — HANDOFF для нового чата

> Сайт-платформа Rega Rega (Astro SSG). Точка входа для нового чата: прочитай этот файл.
> Проект: `~/Downloads/rega-batumi/`. Деплой: `npx vercel --prod --yes` (Vercel проект `rega-batumi`, team `bregeadmins-projects`). Live: https://rega-batumi.vercel.app

## ⏭️ СЛЕДУЮЩАЯ ЗАДАЧА: RU-версия гида
Русский гид сейчас — **отдельные старые захардкоженные страницы** (`src/pages/ru/guide/*.astro`): фейковые счётчики («42 места»), unsplash-картинки, без реальных данных, без карты-сплита. EN-гид уже полностью data-driven. Нужно привести RU к EN.
**Первое решение в новом чате (спросить Артёма):**
- (A) RU-гид на тех же данных, что EN: UI/категории/«N мин» — по-русски, но **названия и тексты мест остаются английскими** (в `guide_places` нет русских полей). Быстро, без ключа.
- (B) Перевести контент: добавить колонки `title_ru/summary_ru/body_ru/take_title_ru` в `guide_places`, заполнить переводами. Полноценно, но это **контент-работа + запись в БД (нужен `sb_secret_` ключ)**.
**Объём:** ru-хаб (`ru/guide.astro`), ru-категории (сейчас 4 толстых стаба → переписать на общий компонент), ru-страницы мест (`ru/guide/[slug]` — сейчас их нет, есть только EN `/guide/[slug]`), ru-новости. По возможности переиспользовать `src/components/GuideCategory.astro` и `src/pages/guide/[slug].astro`, параметризовав языком, чтобы не плодить дубли.

## ✅ Сделано в этой сессии (всё на проде)
- **Новости:** обложка-плашка на хабе переделана под bre-стиль (дуотон, заголовок-курсив, «read the issue»); страница новости — лид + подпись «by the rega rega team», карточка «the place» (ссылка на место в гиде), мини-галерея.
- **Карта-discoverability на хабе гида:** карта поднята под «миры», панель `all / open now / near me`, плавающая кнопка-пилюля `map`.
- **Airbnb-сплит на страницах категорий гида и на /stays (EN+RU):** список слева + липкая карта справа, синхронизация карточка↔пин, **кластеризация** (markerclusterer), **разворот карты** (в ширину, та же высота, ✕/Esc), **near me** (геолокация), на /stays — **сжатие шапки при скролле** в одну полоску + фильтры в одну кнопку-модалку.
- **Пины-пилюли** (как Airbnb): на /stays цена `₾X` (плейсхолдер — у квартир нет `price_from`); в гиде — название/категория. Движок: `public/rega-map.js` (`priceIcon`/`pick`).
- **Круглые контролы карты** (зум +/− и кнопка-разворот) — в движке + shell.css, на всех картах и языках.
- **Фото мест гида → Supabase Storage** (218 шт, бакет `guide`); сайт независим от Тильды (кроме хвоста ниже).
- **«Что рядом» на квартирах (EN+RU):** реальные ближайшие места из гида (Haversine) вместо демо.
- **Главная (`/`) — data-driven:** блоки гида/новостей из базы, 0 битых ссылок, WhatsApp починён.
- **Галереи** (места + новости): крупные landscape + ведущее фото + **лайтбокс-карусель** (стрелки/клавиши/счётчик + свайп пальцем).
- **Убран кастомный курсор** — везде нативный.
- Цены на карточках/пинах — плейсхолдер `from ₾X` (заполнятся, как проставишь `price_from`).

## ⏳ ОТЛОЖЕНО до задачи, где будет `sb_secret_` ключ
- **Фото новостей → Storage** (`src/data/news.json`, 2 шт, ещё tildacdn). Скрипт готов: `scripts/migrate-news-photos.py`.
- **4 «image-only» места** (urban-coffee, jet-scooter-rent, maxim-taxi, bolt-taxi) — одиночное `image` ещё на tildacdn. Скрипт `scripts/migrate-guide-photos.py` уже умеет их добить — просто перезапустить.
- Способ: положить ключ в env `SUPA_KEY=...`, прогнать скрипт(ы), пересобрать (`npx vercel --prod --yes`), ключ удалить.

## 📋 Бэклог сайта (после RU-гида)
- **Переезд на regarega.co** — бриф `~/Downloads/REGA-migration-handoff.md`. Нужен доступ к DNS домена (главный блокер).
- **Цены квартир** — заполнить `price_from` в Supabase → плейсхолдеры `₾X` станут реальными ценами (карточки + пины), без правок кода.
- **Лонгриды** (шаблоны на хабе) + расширить новости — контент.
- **Rega Standard** в карточках — ждёт чек-лист от Артёма.

## Ключевые факты / доступы
- Supabase `qkzinjawtumhjbezlyog`; публичный ключ (чтение): `sb_publishable_R0NeSmTwX9qt0bxlHYj1AA_JIVRqsqU`. Запись — SQL Editor или временный `sb_secret_` ключ (создать → использовать → удалить).
- Google Maps ключ: `AIzaSyAHmVWis6qg53NgzADFrnjHtdBjsxb-Pa4` (referrer-locked: rega-batumi.vercel.app, *.vercel.app, regarega.co, bre.ge). **Карта не рендерится на localhost** — проверять на проде.
- Таблицы: `apartments_public` (вью), `guide_places` (places, RU-полей пока нет). Новости — файл `src/data/news.json`.
- ⚠️ Готча: paste большого SQL в Supabase корёжит не-ASCII → генерить чисто-ASCII (`E'...\uXXXX...'`).
- Превью локально (не из Downloads): сборка `npx astro build` → `cp -R dist/* ~/rega-guide-preview/` → preview-сервер `guide-preview` (port 8790). Карта там не грузится (referrer).
- EN↔RU: макеты `Site.astro` / `SiteRu.astro`; страницы дублируются в `src/pages/` и `src/pages/ru/`.

## Другие хэндоффы
- `~/Desktop/REGA-ROADMAP.md` — общая карта (bre/база/админка). Память: `project_rega_roadmap.md` (там же отложенные дела).
- `~/Downloads/REGA-migration-handoff.md` — переезд на regarega.co.
