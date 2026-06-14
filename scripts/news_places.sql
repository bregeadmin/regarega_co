-- Новости: несколько мест на новость (массив slug-ов гида). Re-runnable.
alter table public.news add column if not exists places jsonb not null default '[]'::jsonb;

-- бэкфилл: старое одиночное place → массив [place]
update public.news set places = jsonb_build_array(place)
  where place is not null and place <> '' and (places is null or places = '[]'::jsonb);
