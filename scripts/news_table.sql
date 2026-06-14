-- News content moved into the DB (single source of truth for the content editor). Re-runnable.
create table if not exists public.news (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text,
  title_ru    text,
  headline    text,
  headline_ru text,
  place       text,
  descr       text,
  descr_ru    text,
  body        text,
  body_ru     text,
  image       text,
  photos      jsonb not null default '[]'::jsonb,
  "date"      text,
  url         text,
  status      text  not null default 'published',
  created_at  timestamptz default now()
);

alter table public.news enable row level security;
grant select on public.news to anon, authenticated;
grant insert, update, delete on public.news to authenticated;

drop policy if exists news_read  on public.news;
drop policy if exists news_write on public.news;
-- anon/visitors see only published; platform admin sees all
create policy news_read  on public.news for select
  using (status = 'published' or public.is_platform_admin());
-- only the platform (in-house) edits news
create policy news_write on public.news for all to authenticated
  using (public.is_platform_admin()) with check (public.is_platform_admin());

-- ── data ──
insert into public.news (photos, slug, title, title_ru, headline, headline_ru, place, descr, descr_ru, body, body_ru, image, "date", url, status) values ('["/news/pure-aperol-poster.jpg", "/news/pure-storefront.jpg"]'::jsonb, '13-06-aperol-party-pure-bistro', 'aperol party at pure bistro', 'aperol party в pure bistro', 'an *aperol* spritz party, and a brighter way into the weekend.', 'вечеринка с *апероль*-шприцем — и яркий вход в выходные.', 'pure-bistro', 'Aperol spritz in every variation — one Saturday night at one of our favourite tables in Batumi.', 'Апероль-шприц во всех вариациях — одна субботняя ночь в одном из наших любимых мест Батуми.', '**aperol spritz, in every variation** — pure bistro turns one saturday into a bright little party.

*when life throws up a few problems, look at them through a glass of bright aperol.* the team riffs on the spritz everyone knows and most people love.

**sat 13 june · from 20:00** · pure bistro.', '**апероль-шприц во всех вариациях** — pure bistro превращает одну субботу в маленький яркий праздник.

*когда жизнь подкидывает пару проблем — посмотри на них через бокал яркого апероля.* команда обыгрывает шприц, который знают все и любят почти все.

**сб 13 июня · с 20:00** · pure bistro.', '/news/pure-aperol-poster.jpg', '2026-06-13 20:00', '', 'published')
on conflict (slug) do update set photos = excluded.photos, title = excluded.title, title_ru = excluded.title_ru, headline = excluded.headline, headline_ru = excluded.headline_ru, place = excluded.place, descr = excluded.descr, descr_ru = excluded.descr_ru, body = excluded.body, body_ru = excluded.body_ru, image = excluded.image, "date" = excluded."date", url = excluded.url, status = excluded.status;
insert into public.news (photos, slug, title, title_ru, headline, headline_ru, place, descr, descr_ru, body, body_ru, image, "date", url, status) values ('["https://static.tildacdn.com/tild3365-3266-4365-b833-666134346537/photo_2026-05-13_120.jpeg", "https://static.tildacdn.one/tild3731-3531-4939-a439-373931623932/___12.png", "https://static.tildacdn.com/tild3230-3734-4965-b966-383834343061/photo_2026-05-13_120.jpeg", "https://static.tildacdn.com/tild6364-3330-4335-b435-643062663439/photo_2026-05-13_120.jpeg"]'::jsonb, '15-05-cocktail-pop-up-at-kava-lova', 'cocktail pop-up at kava lova', NULL, 'a *cocktail* pop-up, and where to drink after work.', NULL, 'kava-lova', 'Simple plan: stop by after work, have a couple of cocktails, stay in your rhythm.', NULL, 'a one-night **guest-bartender pop-up** at kava lova — vanya from qube bar behind the counter.

simple plan: *stop by after work, have a couple of cocktails, stay in your rhythm.* no tickets, no fuss.

**from 19:00 till late** · reserve via @kavalova.', NULL, 'https://static.tildacdn.com/tild3365-3266-4365-b833-666134346537/photo_2026-05-13_120.jpeg', '2026-05-13 12:10', 'https://bre.ge/tpost/15-05-cocktail-pop-up-at-kava-lova', 'published')
on conflict (slug) do update set photos = excluded.photos, title = excluded.title, title_ru = excluded.title_ru, headline = excluded.headline, headline_ru = excluded.headline_ru, place = excluded.place, descr = excluded.descr, descr_ru = excluded.descr_ru, body = excluded.body, body_ru = excluded.body_ru, image = excluded.image, "date" = excluded."date", url = excluded.url, status = excluded.status;
insert into public.news (photos, slug, title, title_ru, headline, headline_ru, place, descr, descr_ru, body, body_ru, image, "date", url, status) values ('["https://static.tildacdn.com/tild3038-6362-4533-a236-653766666666/IMG_0825.jpg", "https://static.tildacdn.one/tild3731-3531-4939-a439-373931623932/___12.png", "https://static.tildacdn.com/tild6563-6561-4361-b336-326139663638/IMG_0825.jpg", "https://static.tildacdn.com/tild3965-3966-4366-b161-363030326232/_3ae4f3a2a5a95e7b11c.jpeg"]'::jsonb, 'oyster-night-pure-bistro-08-05-26', 'oyster weekend at pure bistro', NULL, 'oyster *weekend*, and the best brunch in town.', NULL, 'pure-bistro', 'Fresh oysters, cava and crémant in one of our favorite brunch & dinner spots in Batumi.', NULL, '**fresh oysters, cava and crémant** for one weekend at pure bistro — one of our favourite tables on the chavchavadze side.

*shuck, sip, repeat.* walk-ins are fine, but a table is safer on the saturday night.

**fri–sun · 08–10 may.**', NULL, 'https://static.tildacdn.com/tild6563-6561-4361-b336-326139663638/IMG_0825.jpg', '2026-05-07 21:05', 'https://bre.ge/tpost/oyster-night-pure-bistro-08-05-26', 'published')
on conflict (slug) do update set photos = excluded.photos, title = excluded.title, title_ru = excluded.title_ru, headline = excluded.headline, headline_ru = excluded.headline_ru, place = excluded.place, descr = excluded.descr, descr_ru = excluded.descr_ru, body = excluded.body, body_ru = excluded.body_ru, image = excluded.image, "date" = excluded."date", url = excluded.url, status = excluded.status;
