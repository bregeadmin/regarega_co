-- Site + app auto-rebuild: when guide places, news or apartments change, the database
-- itself triggers a rebuild of regarega.co (Vercel hook, branch main) and of the app
-- (hook, branch app-phase1). The site is static, so data shows up only after a rebuild.
--
-- Debounced: every change only marks the site "dirty"; a pg_cron job checks once a minute
-- and fires the hooks once the data has been quiet for 2 minutes (or has been dirty for
-- 10 minutes straight, so a long editing session still publishes). One build per batch of
-- edits, not one per row.
--
-- Hook URLs live in the table, not in code: the real ones replace HOOK_MAIN / HOOK_APP at
-- run time (they are only ever pasted into the SQL editor, never committed).
-- Safe to run again: everything is create-if-missing / replace.

create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create table if not exists public.site_rebuild (
  id          int primary key default 1 check (id = 1),
  dirty_since timestamptz,          -- first change not yet published
  last_change timestamptz,          -- most recent change
  last_fired  timestamptz,          -- last time the hooks were called
  hooks       text[] not null default '{}'
);
alter table public.site_rebuild enable row level security;   -- no policies: only the functions below touch it

insert into public.site_rebuild (id, hooks)
values (1, array['HOOK_MAIN', 'HOOK_APP'])
on conflict (id) do update set hooks = excluded.hooks;

-- statement-level trigger: one cheap update per INSERT/UPDATE/DELETE statement
create or replace function public.mark_site_dirty()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  begin
    update public.site_rebuild
       set dirty_since = coalesce(dirty_since, now()),
           last_change = now()
     where id = 1;
  exception when others then
    null; -- marking the site dirty must never break a write to the data itself
  end;
  return null;
end;
$$;

drop trigger if exists trg_site_dirty on public.guide_places;
create trigger trg_site_dirty after insert or update or delete on public.guide_places
  for each statement execute function public.mark_site_dirty();

drop trigger if exists trg_site_dirty on public.news;
create trigger trg_site_dirty after insert or update or delete on public.news
  for each statement execute function public.mark_site_dirty();

drop trigger if exists trg_site_dirty on public.apartments;
create trigger trg_site_dirty after insert or update or delete on public.apartments
  for each statement execute function public.mark_site_dirty();

-- called by cron every minute; `force` fires right away (for a manual "publish now")
create or replace function public.fire_site_rebuild(force boolean default false)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  r  public.site_rebuild;
  h  text;
begin
  select * into r from public.site_rebuild where id = 1;
  if r is null then return 'no row'; end if;
  if not force then
    if r.dirty_since is null then return 'clean'; end if;
    if r.last_change > now() - interval '2 minutes'
       and r.dirty_since > now() - interval '10 minutes' then
      return 'waiting';
    end if;
  end if;

  foreach h in array r.hooks loop
    perform net.http_post(url := h, body := '{}'::jsonb);
  end loop;

  -- clear only if nothing changed meanwhile; a newer edit keeps it dirty for the next run
  update public.site_rebuild
     set dirty_since = null, last_fired = now()
   where id = 1 and last_change is not distinct from r.last_change;
  update public.site_rebuild set last_fired = now() where id = 1;
  return 'fired ' || coalesce(array_length(r.hooks, 1), 0) || ' hooks';
end;
$$;

revoke all on function public.fire_site_rebuild(boolean) from public, anon, authenticated;

select cron.unschedule('rega-site-rebuild')
 where exists (select 1 from cron.job where jobname = 'rega-site-rebuild');
select cron.schedule('rega-site-rebuild', '* * * * *', $cron$ select public.fire_site_rebuild(); $cron$);

-- check: select * from public.site_rebuild;
-- fire now: select public.fire_site_rebuild(true);
