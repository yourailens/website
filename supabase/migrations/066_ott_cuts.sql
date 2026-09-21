-- ============================================================
-- 066 · OTT cuts for AI ads / AI films / AI community
-- Photos or videos, any ratio, caption + optional description.
-- Run this in the Supabase SQL editor (or via CLI migrate).
-- ============================================================

create table if not exists public.ott_cuts (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null unique,
  caption       text        not null,
  description   text,
  category      text        not null
                            check (category in ('ads', 'films', 'community')),
  media_type    text        not null
                            check (media_type in ('image', 'video')),
  media_url     text        not null,
  poster_url    text,
  aspect_ratio  text        not null default 'natural'
                            check (aspect_ratio in ('natural', 'portrait', 'square', 'landscape', 'wide', 'story')),
  published     boolean     not null default true,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint ott_cuts_slug_format check (slug ~ '^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$')
);

create or replace function public.ott_cuts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists ott_cuts_updated_at_trigger on public.ott_cuts;
create trigger ott_cuts_updated_at_trigger
  before update on public.ott_cuts
  for each row execute procedure public.ott_cuts_set_updated_at();

create index if not exists ott_cuts_rail_idx
  on public.ott_cuts (category, published, sort_order, created_at desc);

alter table public.ott_cuts enable row level security;

drop policy if exists "ott_cuts_public_read" on public.ott_cuts;
create policy "ott_cuts_public_read"
  on public.ott_cuts for select
  using (published = true);

drop policy if exists "ott_cuts_service_all" on public.ott_cuts;
create policy "ott_cuts_service_all"
  on public.ott_cuts for all
  using (true) with check (true);
