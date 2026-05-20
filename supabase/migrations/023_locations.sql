-- ── Enums ─────────────────────────────────────────────────────

create type public.location_category as enum (
  'urban',
  'nature',
  'fantasy',
  'sci_fi',
  'historical',
  'interior',
  'underwater',
  'aerial',
  'desert',
  'forest',
  'beach',
  'mountains',
  'mystical'
);

create type public.location_time_of_day as enum (
  'day',
  'golden_hour',
  'night',
  'dawn',
  'dusk',
  'any'
);

create type public.location_weather as enum (
  'clear',
  'cloudy',
  'rainy',
  'snowy',
  'foggy',
  'stormy',
  'any'
);

-- ── Table ──────────────────────────────────────────────────────

create table public.locations (
  id              uuid          primary key default gen_random_uuid(),
  slug            text          not null unique,
  title           text          not null,
  description     text,
  image_url       text          not null,
  category        public.location_category     not null,
  time_of_day     public.location_time_of_day  not null default 'any',
  weather         public.location_weather      not null default 'any',
  style_tags      text[]        not null default '{}',
  aspect_ratio    text          not null default 'landscape'
                                check (aspect_ratio in ('portrait', 'square', 'landscape')),
  download_count  integer       not null default 0,
  view_count      integer       not null default 0,
  featured        boolean       not null default false,
  published       boolean       not null default false,
  sort_order      integer       not null default 0,
  search_vector   tsvector,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now(),

  constraint location_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Full-text search trigger ───────────────────────────────────

create or replace function public.locations_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B');
  return new;
end;
$$;

create trigger locations_search_vector_trigger
  before insert or update on public.locations
  for each row execute procedure public.locations_search_vector_update();

create or replace function public.locations_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger locations_updated_at_trigger
  before update on public.locations
  for each row execute procedure public.locations_set_updated_at();

-- ── Indexes + RLS ─────────────────────────────────────────────

create index locations_search_idx    on public.locations using gin(search_vector);
create index locations_cat_idx       on public.locations (category);
create index locations_published_idx on public.locations (published, sort_order, created_at desc);

alter table public.locations enable row level security;

create policy "locations_public_read" on public.locations for select using (published = true);
create policy "locations_service_all" on public.locations for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ── Counters ──────────────────────────────────────────────────

create or replace function public.increment_location_download(location_id uuid)
returns void language sql security definer as $$
  update public.locations set download_count = download_count + 1 where id = location_id;
$$;

create or replace function public.increment_location_view(location_id uuid)
returns void language sql security definer as $$
  update public.locations set view_count = view_count + 1 where id = location_id;
$$;
