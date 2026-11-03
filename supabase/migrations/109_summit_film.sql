-- ============================================================
-- 109 · Bengaluru Tech Summit film
-- One row: the pavilion film played on /bengaluru-tech-summit.
-- Run this in the Supabase SQL editor.
-- ============================================================

create table if not exists public.summit_film (
  id          int         primary key default 1 check (id = 1),
  video_url   text,
  poster_url  text,
  updated_at  timestamptz not null default now()
);

insert into public.summit_film (id)
values (1)
on conflict (id) do nothing;

create or replace function public.summit_film_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists summit_film_updated_at_trigger on public.summit_film;
create trigger summit_film_updated_at_trigger
  before update on public.summit_film
  for each row execute procedure public.summit_film_set_updated_at();

alter table public.summit_film enable row level security;

drop policy if exists "summit_film_public_read" on public.summit_film;
create policy "summit_film_public_read"
  on public.summit_film for select using (true);

drop policy if exists "summit_film_service_all" on public.summit_film;
create policy "summit_film_service_all"
  on public.summit_film for all using (true) with check (true);
