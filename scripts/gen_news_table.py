#!/usr/bin/env python3
"""Generate SQL: create `news` table (+RLS) and upsert news.json into it.
Output: scripts/news_table.sql — run once in Supabase SQL Editor. Re-runnable."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
items = json.load(open(os.path.join(HERE, '..', 'src', 'data', 'news.json'), encoding='utf-8'))

def q(s):
    """SQL text literal: single quotes, double inner apostrophes. None -> NULL."""
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def jb(arr):
    """jsonb literal from a list."""
    return "'" + json.dumps(arr or [], ensure_ascii=False).replace("'", "''") + "'::jsonb"

COLS = ['slug', 'title', 'title_ru', 'headline', 'headline_ru', 'place',
        'descr', 'descr_ru', 'body', 'body_ru', 'image', '"date"', 'url', 'status']

ddl = """-- News content moved into the DB (single source of truth for the content editor). Re-runnable.
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
"""

lines = [ddl, '-- ── data ──']
for it in items:
    vals = [
        q(it.get('slug')), q(it.get('title')), q(it.get('title_ru')),
        q(it.get('headline')), q(it.get('headline_ru')), q(it.get('place')),
        q(it.get('descr')), q(it.get('descr_ru')), q(it.get('body')), q(it.get('body_ru')),
        q(it.get('image')), q(it.get('date')), q(it.get('url')), q(it.get('status') or 'published'),
    ]
    set_clause = ', '.join(f'{c} = excluded.{c}' for c in COLS if c != 'slug')
    lines.append(
        f"insert into public.news (photos, {', '.join(COLS)}) values "
        f"({jb(it.get('photos'))}, {', '.join(vals)})\n"
        f"on conflict (slug) do update set photos = excluded.photos, {set_clause};"
    )

out = os.path.join(HERE, 'news_table.sql')
open(out, 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
print(f'wrote {out} — {len(items)} news rows')
