# Переписка гость ↔ хозяин — план постройки

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Гость пишет хозяину из приложения rega rega, команда оператора отвечает из Rega OS, переписка переводится ИИ и защищена от утечки контактов до брони. Push приходит обеим сторонам.

**Architecture:**
- **База.** Миграция 089 добавляет таблицы разговоров и сообщений. Прямого доступа к ним нет, только RPC по `auth.uid()`.
- **Запись.** Пишет только Edge Function `chat`: защита (правила + ИИ), перевод, вставка, push в OneSignal, фото в закрытый бакет.
- **Чтение.** Обе стороны читают через RPC и опрашивают раз в ~4 с, без Realtime.

**Tech Stack:** Postgres/Supabase (plpgsql RPC, RLS), Deno Edge Function (fetch к Anthropic и OneSignal), Astro + inline JS (гость), ванильный JS (Rega OS), Swift (Capacitor AppDelegate).

**Spec:** `docs/superpowers/specs/2026-10-30-guest-host-messaging-design.md`

## Global Constraints
- **Ветки и места:**
  - `guest-messaging` в `~/rega-os-v2-chat` (от `guest-accounts-prod`) и в `~/rega-batumi-chat` (от `origin/app-phase1`);
  - нативка — `~/rega-rega-ios` (main).
- **Без разрешения ничего не выкладывать:** без push, деплоя и заливки в TestFlight до «да» Артёма.
- **Номер миграции 089.** Перед записью перепроверить `ls migrations` во всех worktree и на `origin`.
- **Репо `rega-batumi` публичный:** только публичный anon-ключ (`src/lib/supabase.ts`), никаких секретов.
- **UI:**
  - без эмодзи, иконки Tabler;
  - цвет означает только состояние;
  - акцент Rega OS синий, у гостя оранжевый только у жилья;
  - модалки на `.modal-back` + `mClose`.
- **Rega OS:** каждый изменённый js/css получает новый `?v=` в `index.html`. Тексты интерфейса идут через `t()` плюс запись в `i18n-en.js`.
- **Ссылки:** в адресах только id разговора (uuid). Никаких имён, почт и токенов.
- **ИИ:** модель `claude-haiku-5-5`, ключ `ANTHROPIC_API_KEY`. Если ИИ упал, сообщение всё равно уходит, контакты прячут правила.
- **Фото:** до 4 на сообщение, JPEG ≤1600px, только при подтверждённой брони. Бакет `chat-photos` закрытый, ссылки подписываются на 3600 с.
- **Лимиты:** текст ≤4000 символов, ≤20 сообщений за 60 с на человека.

## Review Focus
1. **Даты, суммы и номера брони не должны прятаться как телефон** («12.11.2026», «$1 250 000», «бронь 4471»). Тест в Task 1.
2. **Обходы словами и пробелами** («плюс девять девять пять…», «w h a t s a p p», «t . me/…») прячет ИИ, а повторный проход правил прячет то, что ИИ «вернул» в переводе. Тест в Task 1 (правила по переводу) и ручная проверка в Task 7.
3. **Бронь удалили при открытом чате:** удаление не падает, разговор остаётся, защита снова включена. Тест в Task 2.
4. **Посторонний (другой гость, уборщица, собственник, platform_admin без роли) зовёт RPC чужого разговора:** получает ошибку или пустой ответ. Тест в Task 2.
5. **Повторная отправка при плохой сети** не дублирует сообщение (`client_id` уникален в разговоре). Тест в Task 2 и проверка в Task 3.

---

### Task 1: Правила защиты контактов (`mask.ts`)

**Files:**
- Create: `~/rega-os-v2-chat/supabase/functions/chat/mask.ts` (чистый TS без Deno API)
- Test: `~/rega-os-v2-chat/supabase/functions/chat/mask.test.ts` (`node --test`, Node 24 сам срезает типы)

**Interfaces:**
- Produces: `maskContacts(text: string): { text: string; hit: boolean }`. Скрытое заменяется на `[контакт скрыт]`/`[contact hidden]`. Язык метки — второй параметр `label: string`, по умолчанию `'[контакт скрыт]'`.

- [ ] **Step 1: Тест.** Прячутся:
  - `+995 555 12 34 56`, `8 (999) 123-45-67`, `555123456`;
  - `ivan@mail.ru`;
  - `https://wa.me/995555`, `t.me/ivan`, `www.site.ge`, `instagram.com/x`;
  - `@ivan_b`.

  Не трогаются: `12.11.2026`, `2026-11-12`, `14:00`, `$1 250`, `1 250 000 лари`, `бронь 4471`, `квартира 12, этаж 7`, `wifi пароль rega2026`. В результате `hit` совпадает с ожиданием.
- [ ] **Step 2:** `node --test supabase/functions/chat/` — падает (нет модуля).
- [ ] **Step 3: Реализация.** Телефон — это ≥7 цифр подряд с разделителями `space - . ( ) +`, если фрагмент не похож на дату или время. Почта, URL (протокол, `www.` или домен с известной зоной + путь), `@` + ≥3 символа слова.
- [ ] **Step 4:** тесты проходят.
- [ ] **Step 5:** commit `chat: правила защиты контактов`.

### Task 2: Миграция 089 (база переписки)

**Files:**
- Create: `~/rega-os-v2-chat/migrations/089_guest_chat.sql`
- Test: `~/rega-os-v2-chat/migrations/089_guest_chat.test.sql` (стиль 088: `begin … rollback`, фейковые uuid `0e089000-…`, в конце `'ALL 089 CHECKS PASSED'`)

**Interfaces (Produces):**
- **Таблицы** (у anon/authenticated нет прав):
  - `conversations(id uuid pk, operator_id uuid not null → operators cascade, apartment_id uuid → apartments set null, booking_id bigint unique → bookings set null, guest_id uuid → guest_accounts set null, guest_name text, created_at, last_message_at)`;
  - `conversation_members(conversation_id → cascade, account_id → guest_accounts cascade, pk)`;
  - `messages(id bigserial pk, conversation_id → cascade, client_id uuid, sender_kind text check in ('guest','operator'), sender_id uuid, sender_name text, body text not null, lang text, tr jsonb not null default '{}', photos text[] not null default '{}', created_at)`, `unique(conversation_id, client_id)`;
  - `conversation_reads(conversation_id, user_id uuid, last_read_id bigint, pk(conversation_id,user_id))`;
  - `guest_accounts.lang text`.
- **`chat_responders(p_operator uuid) returns uuid[]`** — `operator_people.profile_id` с ролью founder/manager, `active`, `profile_id` не пустой. Только для service_role и внутренних вызовов.
- **`chat_my_operators() returns uuid[]`** — операторы, где `auth.uid()` founder/manager.
- **Для гостя (authenticated), все возвращают jsonb:**
  - `chat_can_message(p_apartment uuid) → boolean` (доступно и anon);
  - `chat_for_booking(p_booking bigint) → {ok, id}`: только участник `trip_members`. Создаёт разговор, если его нет, и копирует участников. Ошибки `not_member` / `no_responders`;
  - `chat_inquiry(p_apartment uuid) → {ok, id}`: нужен профиль. Берёт самый свежий вопрос без брони этого гостя по этой квартире, иначе создаёт;
  - `chat_list() → [{id, apt_title, apt_slug, operator_name, ci, co, pending, last_body, last_tr, last_at, unread}]`.
- **Для обеих сторон:**
  - `chat_messages(p_conv uuid, p_after bigint default 0)` → `{ok, side, conv:{id, apt_title, operator_name, guest_name, booking_id, ci, co, pending, protected, photos_ok}, messages:[{id, mine, sender_kind, sender_name, body, lang, tr, photos, created_at}]}`. Последние 200 при `p_after=0`. Ошибка `forbidden`;
  - `chat_mark_read(p_conv uuid)`;
  - `chat_unread() → int` (для гостя по его разговорам, для оператора по `chat_my_operators()`).
- **Для оператора:**
  - `chat_op_list()` → то же, что `chat_list`, плюс `guest_name`, `operator_id`, `operator_name`;
  - `chat_op_for_booking(p_booking bigint) → {ok, id|null}`: существующий разговор или создание, если у брони есть `trip_members`.
- **Служебная (только service_role):** `chat_send_ctx(p_conv uuid, p_uid uuid) → {side, sender_name, protected, photos_ok, operator_id, operator_name, guest_name, apt_title, guest_ids uuid[], guest_langs text[], operator_uids uuid[]}`, либо `null`, если нет доступа.
- **Служебная (только service_role):** `chat_insert(p_conv, p_uid, p_side, p_name, p_client uuid, p_body, p_lang, p_tr jsonb, p_photos text[]) → {ok, id, dup}`. Лимит 20/60 с → `{ok:false,error:'rate'}`. Обновляет `last_message_at` и отметку прочтения отправителя.
- **Триггер `after insert on trip_members`:**
  - owner → вопрос этого гостя по квартире брони без брони привязывается к брони, если у брони ещё нет разговора;
  - любой → добавляется в участники разговора брони, если он есть.
- **Защита:** `protected = booking_id is null or bookings.source = 'request'`; `photos_ok = not protected`.
- **Бакет** `chat-photos` (private, insert в `storage.buckets` при отсутствии).

- [ ] **Step 1: Тест-файл.** Проверки:
  - аноним без таблиц и RPC (кроме `chat_can_message`);
  - гость A пишет вопрос; гость B не видит его (`forbidden`);
  - заявка из приложения A на ту же квартиру склеивает вопрос с бронью;
  - спутник по приглашению видит разговор;
  - подтверждение брони → `protected=false`, `photos_ok=true`;
  - удаление брони не падает, разговор остаётся, `protected=true`;
  - менеджер видит в `chat_op_list`, уборщица (`role=cleaner`) не видит;
  - `chat_insert` с тем же `client_id` возвращает `dup=true`, второй строки нет;
  - 21-е сообщение за минуту → `rate`;
  - `chat_unread` считает и обнуляется после `chat_mark_read`.
- [ ] **Step 2: Миграция.** Идемпотентно (`if not exists`, `create or replace`, `drop policy if exists`), шапка-комментарий как у 084/088 (что делает и как прогнать).
- [ ] **Step 3: Проверка без базы.** Нет локального Postgres. Перечитать SQL против схемы 084/085/088 (имена колонок `bookings.source/ci/co/apartment_id/guest_token`, `apartments.title/slug/operator_id`, `operators.name`). Тест прогоняет Артём: до 089 должен упасть, после пройти.
- [ ] **Step 4:** commit `089: база переписки гость ↔ хозяин`.

### Task 3: Edge Function `chat`

**Files:**
- Create: `~/rega-os-v2-chat/supabase/functions/chat/index.ts`, `.../chat/ai.ts` (промт и разбор JSON)
- Test: `.../chat/ai.test.ts` (разбор ответа ИИ, запасной путь)

**Interfaces:**
- **Consumes:** `maskContacts` (Task 1), `chat_send_ctx`, `chat_insert` (Task 2).
- **Produces:** POST `/functions/v1/chat`, JWT пользователя (verify_jwt ВКЛ).
  - `{action:'send', conv, client_id, text, lang, photos?: string[] /*base64 jpeg*/}` → `{ok, id, dup?}`. Ошибки: `forbidden`, `rate`, `photos_locked`, `too_long`, `empty`.
  - `{action:'photos', conv, paths: string[]}` → `{ok, urls:{[path]:url}}` (проверка доступа через `chat_send_ctx`).
- `ai.ts`: `buildPrompt(text, protectedOn, langs: string[])`, `parseAi(raw: string): {lang: string, text: string, tr: Record<string,string>} | null`, `prepare(text, protectedOn, langs, callAi) → {lang, body, tr}`:
  1. если защита включена — `maskContacts`;
  2. ИИ;
  3. если защита включена — `maskContacts` по body и каждому переводу.

  При сбое ИИ: `{lang:null, body:masked, tr:{}}`.
- **Языки перевода:** `['ru','en', ...guest_langs]` без дублей.
- **Push:**
  - гостям (`guest_ids` минус отправитель): заголовок = `operator_name`, текст = `tr[lang гостя] || body`, обрезка 120, `data:{view:'chat', conv, path:'/georgia/batumi/app/chat?c='+conv}`. Ключи `GUEST_ONESIGNAL_APP_ID/REST_KEY`;
  - команде (`operator_uids` минус отправитель): заголовок = `guest_name · apt_title`, текст = `tr.ru || body`, `data:{view:'chat', id: conv}`. Ключи `ONESIGNAL_APP_ID/REST_KEY`.
  - Ошибка push не ломает ответ.
- **Фото:** путь `<conv>/<uuid>.jpg`, загрузка в `chat-photos` от service role, ≤4 штук, ≤1.5 МБ каждая после декодирования.
- **Язык гостя:** при отправке гостем `update guest_accounts set lang`.

- [ ] **Step 1: Тест `ai.test.ts`.**
  - `parseAi` достаёт JSON из ответа с ```json-оградой и без неё; на мусор → `null`.
  - `prepare` с `callAi`, который бросает исключение: текст замаскирован, `tr={}`.
  - `prepare` с ИИ, вернувшим перевод с телефоном при защите: телефон замаскирован.
- [ ] **Step 2:** тест падает.
- [ ] **Step 3: `ai.ts` и `index.ts`.** Вызов Anthropic через fetch, как в `translate/index.ts`. Шапка с командой деплоя: `npx -y supabase@latest functions deploy chat --project-ref qkzinjawtumhjbezlyog`.
- [ ] **Step 4:** `node --test supabase/functions/chat/` — всё зелёное.
- [ ] **Step 5:** commit `chat: функция отправки (защита, перевод, push, фото)`.

### Task 4: Гостевое приложение — переписка

**Files:**
- Modify: `~/rega-batumi-chat/src/lib/guestAuth.ts`: `rrAuth.chat.{canMessage(apt), forBooking(id), inquiry(apt), list(), messages(conv, after), read(conv), unread(), send(p), photos(conv, paths)}` в стиле `saves.call` (missing → `{ok:false, missing:true}`).
- Create: `src/components/app/ChatScreen.astro`, `src/components/app/ChatListScreen.astro`, `src/styles/app-chat.css` (на основе `app-concierge.css`), страницы `src/pages/georgia/batumi/app/chat/index.astro`, `.../app/messages/index.astro` и их `ru/` копии.
- Modify:
  - `TripScreen.astro` — кнопка «написать хозяину · {оператор}» под `.tr-flow`; без входа ведёт на `app/login?next=`;
  - `StayScreen.astro` — «спросить хозяина» рядом с CTA, только если `chat_can_message`;
  - `ProfileScreen.astro` — строка «сообщения» со счётчиком; при выходе стереть `rr_chat*`;
  - `TabBar.astro` + `tabbar.css` — точка непрочитанного на вкладке поездки/профиля по `rrAuth.chat.unread()` (раз в 60 с и при `visibilitychange`).

**Interfaces:**
- **Consumes:** RPC из Task 2, функция из Task 3.
- **Produces:**
  - страница `app/chat?c=<uuid>`, или `app/chat?b=<booking_id>` (зовёт `forBooking` и заменяет адрес на `?c=`), или `app/chat?a=<apartment_id>` (зовёт `inquiry`);
  - `&q=<текст>` заранее вписывает текст в поле (для консьержа).

- [ ] **Step 1: Экран переписки.**
  - Шапка: квартира, даты, статус.
  - Пузыри: свои справа, чужие слева.
  - Текст показывается как `tr[мой язык] || body`; ссылка «показать оригинал / show original» видна, если перевод отличается.
  - Фото: сетка до 4, тап открывает на весь экран.
  - Строка защиты, если `protected`.
  - Кнопка фото только при `photos_ok`; сжатие canvas до 1600px, JPEG 0.8.
  - Отправка с `client_id = crypto.randomUUID()`: пузырь сразу «отправляется», при ошибке — «повторить» с тем же `client_id`.
  - Опрос `messages(conv, lastId)` каждые 4 с, пока вкладка видима; `read()` при открытии и после новых.
- [ ] **Step 2: Список переписок** (`app/messages`): строка = квартира, оператор, последняя фраза, время, непрочитанное. Пустое состояние «пока нет переписок».
- [ ] **Step 3: Входы** в Trip, Stay, Profile, TabBar.
- [ ] **Step 4: Проверка.**
  - `npm run build` без ошибок.
  - Локальный сервер из `~/rega-batumi-chat` (вне Downloads) + Playwright-скрипт в scratchpad, который подменяет `rpc/chat_*` и `functions/v1/chat` фикстурами. Скриншоты на 393×852:
    - чат с защитой;
    - чат после брони с фото;
    - перевод с «показать оригинал»;
    - список;
    - поездка с кнопкой.
  - Консоль без ошибок, без горизонтальной прокрутки.
- [ ] **Step 5:** commit `app: переписка с хозяином`.

### Task 5: Rega OS — раздел «сообщения»

**Files:**
- Create: `~/rega-os-v2-chat/messages.js`, `~/rega-os-v2-chat/os-messages.css`
- Modify:
  - `index.html` — `<section id="view-messages">`, пункт бокового меню `data-view="messages"` с бейджем `#niMsgBadge`, подключение файлов, `?v=`;
  - `platform.js` (`showView` → показать и `initMessages()`; `renderMenu` → строка «сообщения» со счётчиком);
  - `native-bridge.js` — `view==='chat'` → `openChat(id)`;
  - `bookings.js` — кнопка «переписка» в окне брони → `openChatForBooking(bookingId)`;
  - `i18n-en.js`.
- Modify (стенд): `_qa/fixtures/rpc.mjs` (+ `chat_op_list`, `chat_messages`, `chat_unread`, `chat_op_for_booking`), `_qa/stand.mjs` — сцены `messages`, `messages-open`, `modal-bk-detail` с кнопкой.

**Interfaces:**
- **Consumes:** RPC `chat_op_list`, `chat_messages`, `chat_mark_read`, `chat_unread`, `chat_op_for_booking`; функция `chat` (`send`, `photos`) через `fetch(SUPA_URL+'/functions/v1/chat')` с токеном сессии.
- **Produces:** глобальные `initMessages()`, `openChat(convId)`, `openChatForBooking(bookingId)`, `msgUnreadTick()`.

- [ ] **Step 1: Список и разговор.**
  - Десктоп: список слева, разговор справа.
  - Телефон: разговор — шторка `.modal-back`, закрывается `mClose`.
  - Строка списка: имя гостя, квартира, «вопрос до брони» или даты, подпись оператора (если операторов больше одного), последняя фраза в языке интерфейса (`LANG`), время, синяя точка непрочитанного.
  - Пузыри, «показать оригинал», фото по подписанным ссылкам, строка защиты, поле ответа, кнопка фото при `photos_ok`, «открыть бронь».
  - Опрос 4 с при открытом разговоре; бейдж — `chat_unread` раз в 60 с и при фокусе.
- [ ] **Step 2: Входы.** Пункт меню, строка в мобильном меню, бейдж на кнопке «меню» нижней панели, кнопка в окне брони, маршрут push.
- [ ] **Step 3: Стенд.** `node _qa/stand.mjs --only=messages,messages-open,modal-bk-detail`. Без `✗` и `↔` на телефоне и десктопе, в светлой и тёмной теме. Посмотреть скриншоты.
- [ ] **Step 4:** commit `Rega OS: раздел «сообщения»`.

### Task 6: Консьерж передаёт вопрос + нативный переход по push

**Files:**
- Modify: `~/rega-os-v2-chat/supabase/functions/concierge/index.ts` — строка 77 подсказки: при брони ставить `[[host]]` отдельной строкой вместо совета «напиши в тот же чат». Без брони — как было.
- Modify: `~/rega-batumi-chat/src/components/app/ConciergeScreen.astro` (+ css) — маркер `[[host]]` превращается в карточку «спросить {оператор}».
  - Если вошёл: ведёт на `app/chat?b=<booking_id>&q=<последний вопрос гостя>`.
  - Если не вошёл: на `app/login?next=` туда же.
  - Без брони маркер просто вырезается.
- Modify: `~/rega-rega-ios/ios/App/App/AppDelegate.swift` — при тапе по push, если в `additionalData` есть `path`, начинающийся с `/georgia/batumi/app/`, открыть этот путь (с `/ru` при `rr_lang=ru`) на том же хосте; иначе — как сейчас (поездка).

- [ ] **Step 1:** правка подсказки + разбор маркера в приложении; скриншот карточки через Playwright-подмену ответа консьержа.
- [ ] **Step 2:** правка AppDelegate; `xcodebuild` сборка для симулятора проходит. Архив и TestFlight — только после «да».
- [ ] **Step 3:** commit в каждом репо.

### Task 7: Живая проверка (после «да» Артёма на прогон базы и функции)

- [ ] Артём прогоняет `089_guest_chat.test.sql` (должен упасть), затем `089_guest_chat.sql`, затем тест снова (`ALL 089 CHECKS PASSED`).
- [ ] Деплой `chat` и `concierge` (команды из шапок).
- [ ] Превью гостевого приложения (после «да» на push ветки) и Rega OS (после «да» на деплой). Артём сам входит гостем на телефоне и менеджером на Mac:
  - вопрос до брони с телефоном и словами-обходами → у менеджера «[контакт скрыт]», перевод EN↔RU;
  - ответ → push гостю;
  - подтверждённая бронь → фото в обе стороны;
  - push оператору открывает разговор.
