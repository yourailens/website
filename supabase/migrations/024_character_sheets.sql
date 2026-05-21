-- ── Enums ─────────────────────────────────────────────────────

create type public.character_ethnicity as enum (
  'east_asian',
  'south_asian',
  'southeast_asian',
  'african',
  'middle_eastern',
  'latin_hispanic',
  'european',
  'indigenous',
  'mixed',
  'other'
);

create type public.character_age_group as enum (
  'child',
  'teen',
  'young_adult',
  'adult',
  'middle_aged',
  'senior'
);

create type public.character_gender as enum (
  'female',
  'male',
  'non_binary'
);

create type public.character_skin_tone as enum (
  'fair',
  'light',
  'medium',
  'olive',
  'tan',
  'brown',
  'dark',
  'deep'
);

create type public.character_archetype as enum (
  'hero',
  'villain',
  'mentor',
  'rebel',
  'scholar',
  'artist',
  'warrior',
  'caretaker',
  'explorer',
  'everyman',
  'other'
);

-- ── Table ──────────────────────────────────────────────────────

create table public.character_sheets (
  id               uuid          primary key default gen_random_uuid(),
  slug             text          not null unique,
  title            text          not null,
  description      text,
  image_url        text          not null,

  -- Core identity attributes
  ethnicity        public.character_ethnicity   not null,
  age_group        public.character_age_group   not null default 'adult',
  gender           public.character_gender      not null default 'female',
  skin_tone        public.character_skin_tone   not null default 'medium',
  archetype        public.character_archetype   not null default 'everyman',

  -- Free-form descriptors
  nationality      text,
  hair_color       text,
  eye_color        text,

  -- Searchable tags
  style_tags       text[]        not null default '{}',

  -- Layout
  aspect_ratio     text          not null default 'portrait'
                                 check (aspect_ratio in ('portrait', 'square', 'landscape')),

  -- Counters
  download_count   integer       not null default 0,
  view_count       integer       not null default 0,

  -- Admin controls
  featured         boolean       not null default false,
  published        boolean       not null default false,
  sort_order       integer       not null default 0,

  -- Search
  search_vector    tsvector,

  -- Timestamps
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now(),

  constraint character_sheet_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Full-text search trigger ───────────────────────────────────

create or replace function public.character_sheets_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.nationality, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.hair_color, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.eye_color, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B');
  return new;
end;
$$;

create trigger character_sheets_search_vector_trigger
  before insert or update on public.character_sheets
  for each row execute procedure public.character_sheets_search_vector_update();

-- ── updated_at auto-bump ───────────────────────────────────────

create or replace function public.character_sheets_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger character_sheets_updated_at_trigger
  before update on public.character_sheets
  for each row execute procedure public.character_sheets_set_updated_at();

-- ── Indexes ────────────────────────────────────────────────────

create index character_sheets_search_idx    on public.character_sheets using gin(search_vector);
create index character_sheets_ethnicity_idx on public.character_sheets (ethnicity);
create index character_sheets_age_group_idx on public.character_sheets (age_group);
create index character_sheets_gender_idx    on public.character_sheets (gender);
create index character_sheets_archetype_idx on public.character_sheets (archetype);
create index character_sheets_published_idx on public.character_sheets (published, sort_order, created_at desc);
create index character_sheets_featured_idx  on public.character_sheets (featured) where featured = true;

-- ── RLS ───────────────────────────────────────────────────────

alter table public.character_sheets enable row level security;

-- Anyone can read published character sheets
create policy "character_sheets_public_read"
  on public.character_sheets for select
  using (published = true);

-- Service role can do everything
create policy "character_sheets_service_all"
  on public.character_sheets for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ── Download / view counters ───────────────────────────────────

create or replace function public.increment_character_sheet_download(sheet_id uuid)
returns void language sql security definer as $$
  update public.character_sheets set download_count = download_count + 1 where id = sheet_id;
$$;

create or replace function public.increment_character_sheet_view(sheet_id uuid)
returns void language sql security definer as $$
  update public.character_sheets set view_count = view_count + 1 where id = sheet_id;
$$;
