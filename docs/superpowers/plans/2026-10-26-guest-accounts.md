# Guest Accounts (plan 1 of 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Guests of the rega rega app can sign in with an email code, keep a profile, own their trips (claimed by the host's link or booked in the app), share a trip with one or more companions, delete the account, and get push notifications when a booking request is confirmed or declined.

**Architecture:** Supabase Auth (email OTP) in the same project as Rega OS operators; guests live in their own tables (`guest_accounts`, `trip_members`, `trip_invites`) and never get an operator profile. All guest writes go through SECURITY DEFINER RPCs that key on `auth.uid()`. The guest app (Astro static screens in `~/Downloads/rega-batumi`, Capacitor shell `~/rega-rega-ios`) uses supabase-js auth in the browser; guest pushes reuse the operator pattern (OneSignal external_id = user id) with a separate OneSignal app and Edge Function. Plan 2 (host messaging) builds on these tables.

**Tech Stack:** Supabase (Postgres, Auth, Edge Functions/Deno, pg_net), Astro 4 static pages + inline/bundled JS, supabase-js 2, Vercel serverless (`api/booking.js`), Capacitor 8 iOS + OneSignal, `node --test` for pure JS helpers.

**Spec:** `docs/superpowers/specs/2026-10-25-guest-accounts-and-host-messaging-design.md`

## Global Constraints

- Sign-in method in v1: **email code only** (no SMS / Apple / Google).
- Profile after first sign-in: **name required**; phone optional (email always known from sign-in).
- A booking reaches an account only by (a) booking in the app while signed in or (b) adding the host's link (`guest_token`). **Never** by matching phone/email.
- One booking = one **owner** (first signed-in account to claim the token). Others get `taken`. The owner can add **companions** via an invite link; owner and companions see the same trip.
- The anonymous link keeps working without sign-in exactly as today (codes, instructions, concierge).
- Booking **in the app** requires sign-in. The website booking form outside the app stays as is.
- **No fallback channels** (no Telegram copies, no reminder pushes, no emails about replies). Pushes only.
- Guest signup must **not** create an operator, a `profiles` row, or any access to Rega OS.
- Rega (platform) does not read guest data beyond what operators already see; no new platform-admin read paths.
- Account deletion in the app (Apple requirement).
- UI: no emoji (Tabler icons only), one primary action per screen, lowercase brand copy, EN + RU via the existing `lang` component pattern, mobile width first; no "falling/impact" motion.
- Repo `bregeadmin/regarega_co` is **public**: no secrets/hook URLs in code. Work on branch `app-phase1`; never touch `main` / prod regarega.co.
- Artem runs every SQL migration (Supabase SQL Editor) and every Edge Function deploy (`npx -y supabase@latest functions deploy <name> --project-ref qkzinjawtumhjbezlyog`); the implementer prepares files + exact commands. Entering email codes / passwords is done by Artem, never by the agent.

## Review Focus

- **Second account claims an already-owned link** → sees the instructions (anonymous view) plus "this booking is already added to another account"; never the owner's trips list or invites. (Test in Task 1 `claim_taken`, Task 5 UI step.)
- **Pending in-app booking request** → trip shows "waiting for host confirmation", **no codes, no wifi**, even inside the ci-2…co+1 window. (Task 1 `pending_request_hides_codes`.)
- **Invite link used twice / after 7 days / by the owner** → clear error, no second membership. (Task 1 `invite_used`, `invite_expired`, `invite_own`.)
- **Operator email signs in on the guest app** → becomes a guest too without losing or changing operator access; a fresh guest email never creates an operator. (Task 1 `guest_signup_no_operator`, Task 2 manual check.)
- **Declined request** (Rega OS deletes the booking) → owner + companions still get the "declined" push (trigger must run BEFORE the delete cascades `trip_members`). (Task 7 `decline_push_before_delete`.)

---

### Task 1: Database — guest tables, RPCs, signup trigger, pending-request gating

**Files:**
- Create: `~/rega-os-v2/migrations/084_guest_accounts.sql`
- Create: `~/rega-os-v2/migrations/084_guest_accounts.test.sql` (runs inside `begin … rollback`)

**Interfaces:**
- Produces (tables): `guest_accounts(id uuid pk → auth.users on delete cascade, name text not null, email text, phone text, created_at)`, `trip_members(booking_id bigint → bookings on delete cascade, account_id uuid → guest_accounts on delete cascade, role text check in ('owner','companion'), created_at, pk(booking_id, account_id))` + unique partial index one `owner` per booking, `trip_invites(code uuid pk default gen_random_uuid(), booking_id bigint → bookings on delete cascade, created_by uuid, expires_at timestamptz default now()+interval '7 days', used_by uuid, used_at timestamptz)`.
- Produces (RPCs, `security definer`, `grant execute … to authenticated`, all raise/return using `auth.uid()`):
  - `save_guest_profile(p_name text, p_phone text default null) returns jsonb` → `{id,name,email,phone}`; email from `auth.jwt()->>'email'`; error `bad_name` if trimmed name empty.
  - `my_guest_profile() returns jsonb` → profile or `null`.
  - `claim_trip(p_token uuid) returns jsonb` → `{ok:true, booking_id, role}` | `{ok:false, error:'no_profile'|'not_found'|'taken'}`; idempotent for the existing owner/companion.
  - `my_trips() returns jsonb` → array `[{booking_id, role, guest_token, ci, co, pending:boolean, apt_title, apt_slug, operator_name}]`, newest `ci` first.
  - `create_trip_invite(p_booking bigint) returns jsonb` → `{ok:true, code}` | `{ok:false, error:'not_owner'}`.
  - `accept_trip_invite(p_code uuid) returns jsonb` → `{ok:true, booking_id}` | `{ok:false, error:'no_profile'|'not_found'|'used'|'expired'|'own'}`.
  - `create_my_booking_request(p_apartment uuid, p_ci date, p_co date, p_adults int, p_amount numeric default null, p_currency text default 'usd') returns jsonb` → `{ok:true, booking_id, guest_token}`; calls `create_booking_request` with guest name from profile, `p_channel => 'email'`, `p_contact => profile email`; then sets `bookings.guest_token = gen_random_uuid()` and inserts the owner row. Error `no_profile`.
- Changes: `handle_new_user()` (copy the full body from `069_signup_trigger_skip_invited.sql`) gains a first early return: `if coalesce(new.raw_user_meta_data->>'kind','') = 'guest' then return new; end if;`.
- Changes: `guest_instruction(p_token)` (copy the full body from `029_guest_instruction_operator.sql`): when `v_b.source = 'request'` → `v_state := 'pending'`, steps' code values nulled exactly as for `pre`, `v_wifi := null`. `guest_guide` unchanged.
- RLS: `guest_accounts` select/update own row only; `trip_members` select where `account_id = auth.uid()`; `trip_invites` no policies (RPC only). No insert/update/delete policies for authenticated on `trip_members`.

- [ ] **Step 1: Write the failing test script `084_guest_accounts.test.sql`.** Inside `begin; … rollback;`: insert two fake `auth.users` (A with `raw_user_meta_data = '{"kind":"guest"}'`, B same), switch identity with `set local role authenticated; set local request.jwt.claims = '{"sub":"<A>","email":"a@test.local","role":"authenticated"}'`, and assert with `do $$ … assert …; $$` blocks:
  - `guest_signup_no_operator`: after inserting A, `select count(*) from profiles where id=A` = 0 and no new `operators` row.
  - `profile_required`: `claim_trip(<real test booking token>)->>'error' = 'no_profile'` before `save_guest_profile`.
  - `claim_owner`: after `save_guest_profile('Anna')`, claim → `ok` and `role='owner'`; second call by A → same result (idempotent).
  - `claim_taken`: as B (with profile) → `error='taken'`; `my_trips()` for B is `[]`.
  - `invite_flow`: A `create_trip_invite` → code; B `accept_trip_invite(code)` → ok; B `my_trips()` has the booking with `role='companion'`.
  - `invite_used` (B again → `used`), `invite_own` (A accepts own fresh code → `own`), `invite_expired` (update `expires_at` to past → `expired`).
  - `pending_request_hides_codes`: insert a booking with `source='request'`, ci = today, a `guest_token`; `guest_instruction(token)->>'state' = 'pending'` and no step `code.value` non-null and `wifi` is null.
  - `my_booking_request`: as A, `create_my_booking_request(<apartment id>, current_date+10, current_date+12, 2)` → ok, booking has `source='request'`, `guest_token` not null, A is owner.
  The test uses a booking created inside the transaction (any existing apartment id: `(select id from apartments limit 1)`).

- [ ] **Step 2: Hand Artem the test to run before the migration** — paste into SQL Editor. Expected: fails on the first missing function/table (`function claim_trip does not exist` or similar).

- [ ] **Step 3: Write `084_guest_accounts.sql`** with the tables, RLS, RPCs, the two function rewrites above. Idempotent (`create … if not exists`, `create or replace`, `drop policy if exists`). Header comment in Russian like neighbouring migrations, "прогнать в SQL Editor (Артём), до деплоя функций".

- [ ] **Step 4: Artem runs 084, then the test script.** Expected: test ends with `ROLLBACK` and no assertion error. Also run the RLS audit query and confirm no rows reference guest-readable data:
  ```sql
  select schemaname, tablename, policyname, roles, qual from pg_policies
   where 'authenticated' = any(roles) and (qual is null or qual = 'true');
  ```
  Any listed table that holds operator/guest data must be reviewed (guests are now `authenticated`); fix in the same migration before merging.

- [ ] **Step 5: Commit** (in `~/rega-os-v2`): `git add migrations/084_guest_accounts.sql migrations/084_guest_accounts.test.sql && git commit -m "feat(guests): accounts, trip ownership + invites, in-app requests, pending gating (084)"`

### Task 2: Email code delivery + account deletion function

**Files:**
- Create: `~/rega-os-v2/supabase/functions/guest-account/index.ts`
- Create: `~/rega-os-v2/docs/guest-email-setup.md` (steps for Artem, Russian)

**Interfaces:**
- Produces: `POST /functions/v1/guest-account` with `Authorization: Bearer <guest access token>`, body `{action:'delete'}` → `{ok:true}`; deletes the auth user via service role (cascades `guest_accounts`, `trip_members`). Refuses (403 `operator`) if the user has a `profiles` row — operators are never deleted from the guest app. Deploy with JWT verification **on** (default).

- [ ] **Step 1: Write `guest-email-setup.md`:** (1) Resend: create account, add domain `regarega.co`, add the DNS records it shows (GoDaddy), create SMTP credentials; (2) Supabase → Auth → SMTP: host `smtp.resend.com`, port 465, user `resend`, password = API key, sender `rega rega <hello@regarega.co>`; (3) Auth → Email templates → "Magic link / OTP": subject `код для входа в rega rega · your rega rega code`, body showing `{{ .Token }}` large, RU + EN, no link required; (4) Auth → Providers → Email: enable, OTP length 6, OTP expiry 600 s; (5) Auth → Rate limits: emails per hour ≥ 60.
- [ ] **Step 2: Write the function** (`jsr:@supabase/supabase-js@2` like `send-push`): read user from the bearer token (`auth.getUser`), check `profiles`, `auth.admin.deleteUser(id)`.
- [ ] **Step 3: Type-check:** `npx -y deno@latest check supabase/functions/guest-account/index.ts` → no errors.
- [ ] **Step 4: Artem deploys** `npx -y supabase@latest functions deploy guest-account --project-ref qkzinjawtumhjbezlyog` and follows `guest-email-setup.md`. Check: `curl -X POST …/functions/v1/guest-account` without a token → 401.
- [ ] **Step 5: Commit** `feat(guests): guest-account delete function + email setup guide`.

### Task 3: Client auth library (guest app)

**Files:**
- Create: `src/lib/guestCore.js` (pure, no imports)
- Create: `src/lib/guestAuth.ts` (supabase-js wrapper; exposes `window.rrAuth`)
- Create: `tests/guestCore.test.mjs`
- Modify: `package.json` — add `"test": "node --test tests/"`

**Interfaces:**
- `guestCore.js` exports: `isEmail(s: string): boolean`, `cleanCode(s: string): string` (digits only, max 6), `tokenFrom(s: string): string|null` (first UUID in any pasted text — same rule as TripScreen), `inviteFrom(s: string): string|null` (UUID from `?i=`), `nextPath(search: string, fallback: string): string` (only same-origin paths starting with `/`, else fallback).
- `window.rrAuth` (set by `guestAuth.ts`, loaded on every app screen via the layouts): `session(): Promise<Session|null>`, `sendCode(email): Promise<{ok, error?}>` (calls `signInWithOtp({email, options:{shouldCreateUser:true, data:{kind:'guest'}}})`), `verify(email, code): Promise<{ok, error?}>` (`verifyOtp` type `email`), `profile(): Promise<Profile|null>` (`my_guest_profile`), `saveProfile(name, phone?)`, `trips()`, `claim(token)`, `invite(bookingId)`, `accept(code)`, `bookRequest(params)`, `signOut()`, `deleteAccount()` (Task 2 function, then `signOut`). Storage key `rr_auth`; client created with the publishable key from `src/lib/supabase.ts`. It also mirrors the user id into `localStorage.rr_uid` (string, '' when signed out) for the iOS shell (Task 7).

- [ ] **Step 1: Write failing tests** in `tests/guestCore.test.mjs`: `isEmail('a@b.co')===true`, `isEmail('a@b')===false`; `cleanCode(' 12 34-56 7')==='123456'`; `tokenFrom('https://bre-instruction-deploy.vercel.app/?t=5d53d53c-d6fc-4e4f-96bc-6395263f9536')==='5d53d53c-d6fc-4e4f-96bc-6395263f9536'`, `tokenFrom('hello')===null`; `inviteFrom('…/app/trip/join?i=<uuid>')===<uuid>`; `nextPath('?next=/ru/georgia/batumi/app/trip','/x')==='/ru/georgia/batumi/app/trip'`, `nextPath('?next=https://evil.com','/x')==='/x'`, `nextPath('?next=//evil.com','/x')==='/x'`.
- [ ] **Step 2:** `npm test` → FAIL (module not found).
- [ ] **Step 3: Implement `guestCore.js`, then `guestAuth.ts`;** include `<script>import '../lib/guestAuth';</script>` (bundled) in `App.astro` and `AppFull.astro` only (not the site layouts).
- [ ] **Step 4:** `npm test` → PASS; `npx astro build` → `Complete!`.
- [ ] **Step 5: Commit** `feat(app): guest auth client (email code) + pure helpers with tests`.

### Task 4: Sign-in screen + profile screen

**Files:**
- Create: `src/components/app/LoginScreen.astro`, `src/pages/georgia/batumi/app/login.astro`, `src/pages/ru/georgia/batumi/app/login.astro`, `src/styles/app-login.css`
- Modify: `src/components/app/ProfileScreen.astro`, `src/styles/app-profile.css`

**Interfaces:**
- Consumes: `window.rrAuth.*`, `nextPath` (Task 3).
- Produces: route `${BASE}/app/login?next=<path>`; after success it `location.replace(next)`. Other screens send people here with `next` = their own path (+ query).

- [ ] **Step 1: Build `LoginScreen`** — three states in one screen, one primary button each: (1) email field + "получить код / get code"; (2) "код отправлен на <email>" + 6-digit field (`inputmode="numeric" autocomplete="one-time-code"`), "отправить ещё раз" enabled after 60 s, "другая почта"; (3) only when `profile()` is null: name (required) + phone (optional) + "готово / done". Errors inline under the field (wrong code, too many requests, network). Already signed in with profile → redirect to `next` immediately.
- [ ] **Step 2: Update `ProfileScreen`** — signed out: the current screen + primary "войти / sign in" (→ login with `next` = profile). Signed in: name + email (phone if set), "изменить" opens the same name/phone form inline, list "мои поездки" from `trips()` (apartment, dates, "ждёт подтверждения" when `pending`; tap → trip screen with that trip), language row (unchanged), "выйти / sign out", "удалить аккаунт" with the same two-tap pattern as "убрать поездку" on the trip screen.
- [ ] **Step 3: Verify in the browser (preview build or local `rega-built` server for layout):** both languages, 375 px wide, each state screenshotted; Artem does the real sign-in once on the preview (enters his own code) and you confirm the profile row appears via `my_guest_profile` in the page.
- [ ] **Step 4: Commit** `feat(app): guest sign-in by email code + profile with trips, sign out, delete`.

### Task 5: Trips on the account — claim, multiple trips, companions

**Files:**
- Modify: `src/components/app/TripScreen.astro`, `src/styles/app-trip.css`
- Create: `src/pages/georgia/batumi/app/trip/join.astro`, `src/pages/ru/georgia/batumi/app/trip/join.astro` (thin wrappers rendering `TripScreen` with `mode="join"`)
- Move: `src/pages/georgia/batumi/app/trip.astro` → `src/pages/georgia/batumi/app/trip/index.astro` (same for RU) so `/app/trip` keeps working

**Interfaces:**
- Consumes: `rrAuth.session/claim/trips/invite/accept`, `inviteFrom` (Task 3); RPC results from Task 1.
- Behaviour (decisions the implementer cannot make alone):
  - Opening a link (`?t=`) while signed in → load it exactly as today, then `claim(token)`. `taken` → small note under the hero: "эта бронь уже добавлена в другой аккаунт / already added to another account" (instructions still shown). `no_profile` → send to login with `next`.
  - Opening `/app/trip` while signed in with no local `rr_trip` → `trips()`; pick the trip whose `co` is today or later with the nearest `ci`; else the latest past one; load it by its `guest_token` through the existing loader. `pending` trips render the hero + "ждём подтверждения хозяина / waiting for the host to confirm", no steps/wifi.
  - Owner sees a secondary action "добавить спутника / add a companion" → `invite(booking_id)` → `navigator.share({url: origin + BASE + '/app/trip/join?i=' + code})` (clipboard fallback + toast). Companions don't see it.
  - `join` mode: not signed in → login with `next`; signed in → `accept(code)`; ok → load that trip; errors → message per code (`used`, `expired`, `own`, `not_found`) with a link to the trip tab.
  - "Убрать поездку с этого телефона" only clears local storage; it never deletes membership.
- [ ] **Step 1: Implement** the behaviours above; keep the existing anonymous flow untouched when signed out.
- [ ] **Step 2: Verify on the preview** with the granat token (Artem's account): claim → appears in profile trips; a second account (Artem's second email) → `taken` note; invite → join from the second account → both see the trip; pending trip (Task 6) shows no codes.
- [ ] **Step 3: Commit** `feat(app): trips on the account — claim by link, trips list, companions by invite`.

### Task 6: Booking in the app requires sign-in

**Files:**
- Modify: `public/apt-booking.js` (only the in-app path: pages under `/app/`)
- Modify: `api/booking.js`

**Interfaces:**
- Consumes: `rrAuth.session()`, `rrAuth.profile()` (Task 3); RPC `create_my_booking_request` (Task 1).
- Produces: `POST /api/booking` with header `Authorization: Bearer <guest access token>` and body `{apartment_id, ci, co, adults, amount, currency, apt_title}` → `{ok:true, id, guest_token}`. Without the header the endpoint behaves exactly as today (website form).

- [ ] **Step 1:** In `apt-booking.js`, when `location.pathname` contains `/app/`: hide name/contact fields; on submit, no session → go to login with `next` = current URL (keep chosen dates in the query so they are restored); with session → send the bearer token. On success → `rr_trip_token = guest_token` and go to `${BASE}/app/trip` (pending state).
- [ ] **Step 2:** In `api/booking.js`, when a bearer token is present: call `rpc/create_my_booking_request` with `apikey` = publishable key and `Authorization` = the guest's token (so `auth.uid()` is the guest); keep the Telegram copy (it is the existing request alert, not a messaging fallback); return `guest_token`.
- [ ] **Step 3: Verify on the preview:** Artem books a far-future date on one apartment from the app → Rega OS shows the request; trip tab shows "ждём подтверждения"; the website form (outside `/app/`) still works without sign-in. Artem declines it afterwards.
- [ ] **Step 4: Commit** `feat(app): in-app booking requires sign-in, lands as the guest's pending trip`.

### Task 7: Guest pushes — booking confirmed / declined

**Files:**
- Create: `~/rega-os-v2/supabase/functions/send-guest-push/index.ts`
- Create: `~/rega-os-v2/migrations/085_guest_push_booking_status.sql`
- Modify: `~/rega-rega-ios/package.json`, `~/rega-rega-ios/ios/App/App/AppDelegate.swift`, project version → 6

**Interfaces:**
- Produces: `send-guest-push` — same input as `send-push` (`{user_ids, title, body, data}`), secrets `GUEST_ONESIGNAL_APP_ID`, `GUEST_ONESIGNAL_REST_KEY`; addresses OneSignal `external_id` = guest user id. Deployed `--no-verify-jwt` (called from the database, like `send-push`).
- Produces: triggers on `bookings` — `AFTER UPDATE` when `old.source='request' and new.source<>'request'` → "бронь подтверждена / booking confirmed" (data `{view:'trip', booking_id}`); `BEFORE DELETE` when `old.source='request'` → "заявку отклонили / request declined". Recipients = all `trip_members` of the booking. Exception-wrapped like 073 (a push never breaks a booking write). Text in the recipient's app language is out of scope: send RU + EN in one body line.
- iOS: copy the operator app's OneSignal pattern (`~/rega-os-ios/ios/App/App/AppDelegate.swift`): `OneSignal.initialize(<guest app id>)`, permission request, and a 2-second tick that reads `localStorage.rr_uid` from the webview and calls `OneSignal.login(uid)` / `logout()`. Tap → open `${BASE}/app/trip`.

- [ ] **Step 1: Artem creates the OneSignal app "rega rega guest"** (iOS, same APNs key as the operator app) and sets the two secrets; give him the exact steps.
- [ ] **Step 2: Write the test** `085_guest_push_booking_status.test.sql` (begin/rollback). Both triggers get their recipients from `public.trip_push_recipients(p_booking bigint) returns uuid[]`. Assert: it returns the owner and the companion of a test booking; `decline_push_before_delete`: the decline trigger exists as BEFORE DELETE (`select tgtype & 2 = 2 from pg_trigger where tgname = 'trg_guest_push_declined'`). Expected before step 3: fails (function/trigger missing).
- [ ] **Step 3: Implement** the function, migration, and iOS changes; type-check the function with `npx -y deno@latest check`.
- [ ] **Step 4: Artem runs 085 + test, deploys `send-guest-push`;** build and upload build 6 to TestFlight (same `xcodebuild archive` + `-exportArchive` flow as build 5).
- [ ] **Step 5: Verify on a real phone:** sign in in the TestFlight app, make a request, Artem confirms in Rega OS → push arrives, tap opens the trip; repeat with decline.
- [ ] **Step 6: Commit** in both repos.

### Task 8: Ship to preview + final check

- [ ] **Step 1:** `npm test` and `npx astro build` pass; push `app-phase1`; wait for the preview to serve the new `login` page.
- [ ] **Step 2:** Walk the whole flow once on the preview in RU and EN at 375 px (sign in → profile → claim granat → trips list → invite → join → in-app request → pending → confirm push). Screenshots for Artem.
- [ ] **Step 3:** Update memory `project_rega_guide_app.md` and `MEMORY.md` (what is live, which migrations/functions Artem ran).

**Deferred on purpose:** the printed QR for apartments (spec 6a) needs a public App Store link; until then hosts keep sending the booking link. Plan 2 (host messaging: conversations, trip "message the host", stay-page question, concierge hand-off, Rega OS "messages" for founder/managers, message pushes) is written after this plan ships, on top of `guest_accounts` / `trip_members`.
