-- ============================================================
-- 085 · YAILIANS
-- Showcase for the first 45-min AI film:
--   site settings (trailer) · voices · screenings · world gallery
-- Run this in the Supabase SQL editor.
-- ============================================================

-- Film / trailer settings (single row id = 1)
create table if not exists public.yailians_site (
  id              int         primary key default 1 check (id = 1),
  title           text        not null default 'YAILIANS',
  tagline         text,
  synopsis        text,
  trailer_url     text,
  trailer_poster  text,
  runtime_label   text        default '45 min',
  updated_at      timestamptz not null default now()
);

insert into public.yailians_site (id, title, tagline, runtime_label)
values (1, 'YAILIANS', 'Our first 45 min AI film.', '45 min')
on conflict (id) do nothing;

create or replace function public.yailians_site_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists yailians_site_updated_at_trigger on public.yailians_site;
create trigger yailians_site_updated_at_trigger
  before update on public.yailians_site
  for each row execute procedure public.yailians_site_set_updated_at();

-- What people think
create table if not exists public.yailians_voices (
  id               uuid        primary key default gen_random_uuid(),
  name             text        not null,
  role             text,
  quote            text        not null,
  portrait_url     text,
  video_url        text,
  featured_on_hub  boolean     not null default false,
  published        boolean     not null default true,
  sort_order       integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create or replace function public.yailians_voices_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists yailians_voices_updated_at_trigger on public.yailians_voices;
create trigger yailians_voices_updated_at_trigger
  before update on public.yailians_voices
  for each row execute procedure public.yailians_voices_set_updated_at();

create index if not exists yailians_voices_rail_idx
  on public.yailians_voices (published, sort_order desc, created_at desc);

-- Screenings (past + upcoming)
create table if not exists public.yailians_screenings (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null,
  venue            text,
  city             text,
  starts_at        timestamptz,
  ends_at          timestamptz,
  status           text        not null default 'upcoming'
                               check (status in ('upcoming', 'past')),
  notes            text,
  cover_url        text,
  ticket_url       text,
  featured_on_hub  boolean     not null default false,
  published        boolean     not null default true,
  sort_order       integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create or replace function public.yailians_screenings_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists yailians_screenings_updated_at_trigger on public.yailians_screenings;
create trigger yailians_screenings_updated_at_trigger
  before update on public.yailians_screenings
  for each row execute procedure public.yailians_screenings_set_updated_at();

create index if not exists yailians_screenings_rail_idx
  on public.yailians_screenings (status, published, sort_order desc, starts_at desc nulls last);

-- World gallery (worlds / creatures / characters / craft)
create table if not exists public.yailians_world (
  id               uuid        primary key default gen_random_uuid(),
  kind             text        not null
                               check (kind in ('world', 'creature', 'character', 'craft')),
  title            text        not null,
  caption          text,
  media_type       text        not null
                               check (media_type in ('image', 'video')),
  media_url        text        not null,
  poster_url       text,
  featured_on_hub  boolean     not null default false,
  published        boolean     not null default true,
  sort_order       integer     not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create or replace function public.yailians_world_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists yailians_world_updated_at_trigger on public.yailians_world;
create trigger yailians_world_updated_at_trigger
  before update on public.yailians_world
  for each row execute procedure public.yailians_world_set_updated_at();

create index if not exists yailians_world_rail_idx
  on public.yailians_world (kind, published, sort_order desc, created_at desc);

-- RLS
alter table public.yailians_site enable row level security;
alter table public.yailians_voices enable row level security;
alter table public.yailians_screenings enable row level security;
alter table public.yailians_world enable row level security;

drop policy if exists "yailians_site_public_read" on public.yailians_site;
create policy "yailians_site_public_read"
  on public.yailians_site for select using (true);

drop policy if exists "yailians_site_service_all" on public.yailians_site;
create policy "yailians_site_service_all"
  on public.yailians_site for all using (true) with check (true);

drop policy if exists "yailians_voices_public_read" on public.yailians_voices;
create policy "yailians_voices_public_read"
  on public.yailians_voices for select using (published = true);

drop policy if exists "yailians_voices_service_all" on public.yailians_voices;
create policy "yailians_voices_service_all"
  on public.yailians_voices for all using (true) with check (true);

drop policy if exists "yailians_screenings_public_read" on public.yailians_screenings;
create policy "yailians_screenings_public_read"
  on public.yailians_screenings for select using (published = true);

drop policy if exists "yailians_screenings_service_all" on public.yailians_screenings;
create policy "yailians_screenings_service_all"
  on public.yailians_screenings for all using (true) with check (true);

drop policy if exists "yailians_world_public_read" on public.yailians_world;
create policy "yailians_world_public_read"
  on public.yailians_world for select using (published = true);

drop policy if exists "yailians_world_service_all" on public.yailians_world;
create policy "yailians_world_service_all"
  on public.yailians_world for all using (true) with check (true);
