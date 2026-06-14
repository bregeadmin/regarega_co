-- Новости: флажки «крутить на главной / в гиде» + (на всякий) колонка places. Re-runnable, идемпотентно.
alter table public.news add column if not exists places   jsonb   not null default '[]'::jsonb;
alter table public.news add column if not exists on_home   boolean not null default true;
alter table public.news add column if not exists on_guide  boolean not null default true;

-- бэкфилл одиночного place → массив (если ещё не делали)
update public.news set places = jsonb_build_array(place)
  where place is not null and place <> '' and (places is null or places = '[]'::jsonb);
