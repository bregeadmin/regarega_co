# Site login, guest menu and messages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** regarega.co gets the same guest account as the app — header menu, sign-in window, «ask the host», booking only after sign-in, messages/trips/saved/account pages — in EN and RU, desktop and phone.

**Architecture:** Everything is built on branch `guest-messaging` (worktree `~/rega-batumi-chat`, based on `app-phase1`), where the site and the app already share `Site.astro`/`SiteRu.astro`. The site loads the same bundled `src/lib/guestAuth.ts` (`window.rrAuth`) and `public/app-saves.js` (`window.rrSaves`). One new site component carries the header button, the menu and the sign-in window (`window.rrLogin`). The chat and «my batumi» screens are split into a core component (markup + script) and a thin app wrapper, so the site pages reuse the same code.

**Tech Stack:** Astro (static), inline vanilla JS, `@supabase/supabase-js` via guestAuth, `node --test`, Playwright with mocked RPCs for screenshots.

**Spec:** `docs/superpowers/specs/2026-10-30-site-login-and-messages-design.md` (parent: `2026-10-30-guest-host-messaging-design.md`). Mockup: `~/rega-design-panel/site-messaging-vs-airbnb.html`.

## Global Constraints

- Public repo: no secrets. The publishable Supabase key already in the code is fine.
- No emoji, Tabler-style inline SVG icons. Guest accent orange `#FF5E1A`; orange dot = unread. Fonts Geologica + JetBrains Mono. Site tokens from `src/styles/shell.css`.
- Links to a conversation carry only `?c=<conversation id>`; never a token of someone else.
- Every visible string exists in EN and RU (`lang` prop + `T` dictionary pattern).
- Inside the app (`html.in-app`) the header account button and its menu are hidden.
- Anti-goals: sign-in never leaves the apartment page; no Telegram/WhatsApp/email/phone path to the host on the apartment page; one favourites list per guest across site and app.
- Nothing is pushed or deployed. Commits on `guest-messaging` only.

## Review Focus

1. Guest signs in from the apartment page, then presses back/refresh — page state, header and the pending question must survive (question text kept until sent).
2. Signed-in guest with no profile name presses «send request» — must be asked for the name in the window, then the request goes; never a raw `no_profile`.
3. Guest who already has a conversation about this flat presses «ask» — must land in that conversation, not create a second one (`chat_inquiry` is idempotent; verify the UI uses its id).
4. Old site hearts (`rr_favs`) after the first load — all still hearted, also on the saved page; un-hearting removes from both stores.
5. Header in the app wrapper (Capacitor) and on narrow phones — no double menu, no horizontal scroll at 375px.

---

### Task 1: Site account layer — header button, menu, sign-in window

**Files:**
- Create: `src/components/site/SiteAccount.astro` (markup for button, menu sheet, sign-in window; inline script `window.rrLogin`)
- Create: `src/styles/site-account.css`
- Modify: `src/layouts/Site.astro`, `src/layouts/SiteRu.astro` (place `<SiteAccount lang>` in `.topbar .right` before `.city`; import guestAuth via `<script>import '../lib/guestAuth';</script>`; load `/app-saves.js?v=2` defer)
- Modify: `src/lib/guestCore.js` + `tests/guestCore.test.mjs`

**Interfaces:**
- Produces `window.rrLogin`:
  - `open(opts?: { title?: string; sub?: string; ask?: { apt: string; op: string; title: string; photo?: string } }) → Promise<{ ok: true } | { ok: false }>` — resolves `ok:true` once signed in **and** a profile exists (name step shown only when `profile()` is null). With `ask`, after sign-in the window shows the question step: textarea → `rrAuth.chat.inquiry(apt)` → `rrAuth.chat.send({conv, client_id, text, lang})` → `location.href = <BASE>/messages?c=<conv>`.
  - `ask(a)` = `open({ ask: a })`; when already signed in, skips straight to the question step. If `chat.inquiry` returns an existing conversation that already has messages, go straight there instead of the question step.
- Produces in `guestCore.js`: `initialOf(name: string|null, email: string|null): string` (first letter upper-cased, `'?'` fallback); `unreadText(n: number): string` (`''` for 0, `'99+'` above 99).
- Header: signed out → `<button class="sa-login">` («войти» / «sign in»); signed in → `<button class="sa-me">` (menu icon + initial disc + `.sa-dot` when unread). Menu items: messages (count), trips, saved, account, sign out → `<BASE>/messages`, `/trips`, `/saved`, `/account`. Desktop: dropdown under the button; ≤760px: bottom sheet over a scrim. Esc / scrim / item click closes.
- Unread: `rrAuth.chat.unread()` on load, every 60 s while visible, on `visibilitychange`; cache in `localStorage.rr_chat_unread` (same key the app uses).
- Sign out: `rrAuth.signOut()`, clear the same keys ProfileScreen clears (`rr_trip`, `rr_trip_token`, `rr_claimed`, `rr_cc`, `rr_uid`, `rr_chat_lang`, `rr_chat_unread`), `rrSaves.forget()`, reload.
- Sign-in window reuses the LoginScreen flow and error mapping (copy `mapErr`, resend timer, 6-digit auto-submit) — keep the comment «keep in sync with LoginScreen.astro».

- [ ] **Step 1: Failing tests** in `tests/guestCore.test.mjs`:
```js
test('initialOf', () => {
  assert.equal(initialOf('anna müller', null), 'A');
  assert.equal(initialOf('', 'zoe@x.co'), 'Z');
  assert.equal(initialOf(null, null), '?');
});
test('unreadText', () => {
  assert.equal(unreadText(0), '');
  assert.equal(unreadText(7), '7');
  assert.equal(unreadText(140), '99+');
});
```
- [ ] **Step 2:** `npm test` → FAIL (`initialOf` not exported).
- [ ] **Step 3:** Implement both in `guestCore.js`; build `SiteAccount.astro` + CSS; wire into both layouts.
- [ ] **Step 4:** `npm test` → PASS; `npx astro build` → no errors.
- [ ] **Step 5:** Playwright (mocked `rrAuth` RPCs, see Task 5 harness): header signed-out, signed-in with dot, menu open on 1440 and 375, in-app class hides it. Screens read, 0 console errors.
- [ ] **Step 6:** Commit `feat(site): guest header menu and sign-in window`.

### Task 2: Apartment page — «ask the host», booking only after sign-in, no off-platform contacts

**Files:**
- Modify: `src/lib/aptDetail.ts`, `src/lib/aptDetailRu.ts` (template strings)
- Modify: `src/pages/georgia/batumi/stays/[slug].astro`, `src/pages/ru/georgia/batumi/stays/[slug].astro`
- Modify: `public/apt-booking.js` (+ `?v=` on its `<script>` tags)
- Modify: `src/styles/apt.css`

**Interfaces:**
- Consumes `window.rrLogin` (Task 1), `rrAuth.session()`, `rrAuth.chat.canMessage(apt)` (anon allowed), `operatorName()` from `src/lib/stayUi.ts`.
- Template changes (both languages):
  - `.alt-channels` block → `<div class="ask-host" id="askHost" hidden>` with the operator initial disc, operator name, «хотите сперва спросить?» / «want to ask first?» and a button `#askHostBtn` «спросить» / «ask»; placeholder `%%OP%%` filled in `[slug].astro` from `operatorName(apt.operator_id)` (fallback «хозяин» / «the host»).
  - Remove the `cta-help` section entirely.
  - FAQ «How do I check in?» / RU equivalent: replace the Telegram sentence with «after booking you'll have a chat with the host right here — arrival time, directions, anything» (RU: «после брони у вас будет переписка с хозяином прямо здесь — время заезда, как добраться, любые вопросы»).
  - Form `.ab-to` (name, seg, contact) removed; `book-steps` step 2 text → «sign in by email — no password» / «войдите по почте — без пароля».
- `apt-booking.js` submit: dates check → `rrLogin.open({ title: <copy "sign in to send the request"> })` → on ok: `rrAuth.session()` → `POST /api/booking` with `Authorization: Bearer <access_token>` and body `{apartment_id, apt_title, ci, co, adults, amount, currency}` → `ok && guest_token` → `localStorage.rr_trip_token = guest_token`, state `sent` with a link «open messages» to `<BASE>/messages`; `error === 'no_profile' | 'auth'` → `rrLogin.open()` again then retry once; other errors → «could not send — try again» (no Telegram mention).
- Ask block script (inline in `[slug].astro`): when `rrAuth` ready → `canMessage(APT_BOOK.id)` → `ok && data === true` shows `#askHost`; click → `rrLogin.ask({ apt, op, title, photo })`.

- [ ] **Step 1:** Write a node test `tests/aptTemplate.test.mjs` that imports both templates and asserts: no `t.me/`, no `mailto:`, no `abContact`, no `abSeg`; contains `id="askHost"` and `%%OP%%`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Edit templates, `[slug].astro` pages, `apt-booking.js`, CSS.
- [ ] **Step 4:** `npm test` → PASS; `npx astro build` OK; `grep -c "t.me/bre_ge" dist/georgia/batumi/stays/*/index.html` → 0 on apartment pages.
- [ ] **Step 5:** Playwright: apartment page signed out (ask block visible when canMessage true, hidden when false), click ask → window; dates + send while signed out → window opens; mocked `/api/booking` ok → sent state. EN + RU, 1440 + 375.
- [ ] **Step 6:** Commit `feat(site): ask the host and sign-in booking on the flat page`.

### Task 3: Messages, trips, saved, account pages

**Files:**
- Create: `src/components/app/ChatCore.astro`, `src/components/app/ChatListCore.astro` (moved bodies of `ChatScreen`/`ChatListScreen`; prop `lang`, `mode: 'app' | 'site'`)
- Modify: `src/components/app/ChatScreen.astro`, `ChatListScreen.astro` (wrap the cores; app behaviour unchanged)
- Create: `src/components/app/MyCore.astro` (body of `MyScreen.astro`, same split) ; modify `MyScreen.astro`
- Create: `src/components/site/SiteMessages.astro`, `SiteTrips.astro`, `SiteAccountPage.astro`
- Create pages: `src/pages/georgia/batumi/{messages,trips,saved,account}.astro` and the same under `src/pages/ru/georgia/batumi/`
- Create: `src/styles/site-pages.css`

**Interfaces:**
- Cores keep their current element ids and scripts; `mode:'site'` changes only: links (`<BASE>/messages?c=` instead of `<BASE>/app/chat?c=`; back link to `<BASE>/messages`), no app header/back chrome, login redirect → `rrLogin.open()` instead of `app/login?next=`.
- `/messages`: desktop ≥900px two columns (list | open conversation or empty «choose a conversation»); `?c=` selects. Below 900px: list when no `?c=`, conversation with a back arrow when `?c=`. Signed out → page shows a sign-in prompt button (`rrLogin.open()` then reload).
- `/trips`: `rrAuth.trips()` → rows (flat, dates, «request» tag when `pending`), each row → `<BASE>/trip?t=<own guest_token>`, plus a «message the host» link via `rrAuth.chat.forBooking(booking_id)` → `/messages?c=`. `null` → retry line; `[]` → empty state with link to stays.
- `/saved`: `MyCore` in site mode (flats, places, news from `rrSaves`).
- `/account`: name + phone form (`rrAuth.saveProfile`), email read-only, sign out, delete account with two-tap confirm (`rrAuth.deleteAccount()`), same copy as ProfileScreen.
- All four pages: `noindex` meta.

- [ ] **Step 1:** Before the split, take Playwright shots of app `chat`, `messages`, `my` (baseline).
- [ ] **Step 2:** Split into cores; build; re-shoot app screens → pixel-identical layout (eyeball compare) and 0 console errors.
- [ ] **Step 3:** Build the four site pages + CSS.
- [ ] **Step 4:** `npx astro build` OK; Playwright on all four pages EN+RU, 1440+375, signed in/out; 0 console errors, 0 horizontal scroll.
- [ ] **Step 5:** Commit `feat(site): messages, trips, saved and account pages`.

### Task 4: Favourites — site hearts into the account

**Files:**
- Modify: `src/layouts/Site.astro`, `src/layouts/SiteRu.astro` (hearts script)
- Modify: `src/lib/guestCore.js` + tests

**Interfaces:**
- Produces in `guestCore.js`: `favsToSaves(favs: string[], have: {k,s}[]): {k:'stay', s, c:'batumi'}[]` — valid slugs (`/^[a-z0-9-]{1,120}$/`) from `rr_favs` that are not already saved, de-duplicated.
- Hearts: state read from `rrSaves.has('stay', slug)` once `rrSaves` exists (fallback `rr_favs` until then); click → `rrSaves.set('stay', slug, 'batumi', on)` **and** mirror into `rr_favs` + fire `rr:favschange` (keeps the token sync in `rega-personal.js` working).
- One-time merge: if `localStorage.rr_favs_mig` is unset → `favsToSaves(rr_favs, rrSaves.list())` each `rrSaves.set(...)`, then set `rr_favs_mig = 1`.
- Listen to window `rr-saves` and repaint hearts (change in another tab / after account sync).

- [ ] **Step 1:** Failing test:
```js
test('favsToSaves', () => {
  assert.deepEqual(favsToSaves(['coral-apartment', 'red-camelia', 'BAD SLUG', 'coral-apartment'], [{ k: 'stay', s: 'red-camelia' }]),
    [{ k: 'stay', s: 'coral-apartment', c: 'batumi' }]);
  assert.deepEqual(favsToSaves([], []), []);
});
```
- [ ] **Step 2:** `npm test` → FAIL. **Step 3:** implement + wire. **Step 4:** `npm test` PASS, build OK.
- [ ] **Step 5:** Playwright: preset `rr_favs=['coral-apartment']` → stays page heart on, `/saved` lists it; un-heart → gone from both keys.
- [ ] **Step 6:** Commit `feat(site): hearts saved to the guest account`.

### Task 5: Whole-site check

- [ ] Playwright harness in the scratchpad (extend `guest-shots.mjs`): serve `dist/` statically, mock Supabase REST/RPC + `/functions/v1/chat` + `/api/booking`. Shoot: home, stays, flat page (EN/RU), guide, place, trip page, the four new pages, app `chat`/`messages`/`my`/`stays`. 1440 and 375, light. Record console errors and horizontal scroll.
- [ ] `npm test` all green; `npx astro build` clean.
- [ ] Final whole-branch review by a fresh reviewer; fix Critical/Important with a failing test first.
