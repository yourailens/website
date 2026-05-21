-- ════════════════════════════════════════════════════════════
-- 025 · Resources Pack
-- Props Library · Lighting Presets · Color Grades · Mood Boards
-- ════════════════════════════════════════════════════════════

-- ── Helper: generic updated_at function ───────────────────────
-- (Re-usable across all four tables)

-- ════════════════════════════════════════════════════════════
-- 1. PROPS LIBRARY
-- ════════════════════════════════════════════════════════════

create type public.prop_category as enum (
  'accessories',
  'jewelry',
  'bags',
  'footwear',
  'headwear',
  'tech',
  'weapons',
  'tools',
  'food_drink',
  'furniture',
  'nature',
  'vehicles',
  'other'
);

create type public.prop_style as enum (
  'realistic',
  'fantasy',
  'sci_fi',
  'vintage',
  'modern',
  'anime',
  'editorial',
  'other'
);

create table public.props (
  id             uuid        primary key default gen_random_uuid(),
  slug           text        not null unique,
  title          text        not null,
  description    text,
  image_url      text        not null,
  category       public.prop_category  not null,
  style          public.prop_style     not null default 'realistic',
  color_tags     text[]      not null default '{}',
  style_tags     text[]      not null default '{}',
  aspect_ratio   text        not null default 'square'
                             check (aspect_ratio in ('portrait', 'square', 'landscape')),
  download_count integer     not null default 0,
  view_count     integer     not null default 0,
  featured       boolean     not null default false,
  published      boolean     not null default false,
  sort_order     integer     not null default 0,
  search_vector  tsvector,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint props_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

create or replace function public.props_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.color_tags, '{}'), ' ')), 'C');
  return new;
end; $$;

create trigger props_search_vector_trigger
  before insert or update on public.props
  for each row execute procedure public.props_search_vector_update();

create or replace function public.props_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger props_updated_at_trigger
  before update on public.props
  for each row execute procedure public.props_set_updated_at();

create index props_search_idx   on public.props using gin(search_vector);
create index props_category_idx on public.props (category);
create index props_style_idx    on public.props (style);
create index props_pub_idx      on public.props (published, sort_order, created_at desc);

alter table public.props enable row level security;
create policy "props_public_read" on public.props for select using (published = true);
create policy "props_service_all" on public.props for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create or replace function public.increment_prop_download(prop_id uuid)
returns void language sql security definer as $$
  update public.props set download_count = download_count + 1 where id = prop_id; $$;

create or replace function public.increment_prop_view(prop_id uuid)
returns void language sql security definer as $$
  update public.props set view_count = view_count + 1 where id = prop_id; $$;


-- ════════════════════════════════════════════════════════════
-- 2. LIGHTING PRESETS
-- ════════════════════════════════════════════════════════════

create type public.lighting_type as enum (
  'golden_hour',
  'blue_hour',
  'midday_sun',
  'studio_soft',
  'studio_hard',
  'cinematic',
  'neon',
  'candlelight',
  'backlit',
  'silhouette',
  'overcast',
  'other'
);

create type public.lighting_mood as enum (
  'warm',
  'cool',
  'neutral',
  'dramatic',
  'ethereal',
  'dark',
  'bright',
  'mysterious'
);

create table public.lighting_presets (
  id             uuid        primary key default gen_random_uuid(),
  slug           text        not null unique,
  title          text        not null,
  description    text,
  image_url      text        not null,
  lighting_type  public.lighting_type  not null,
  mood           public.lighting_mood  not null default 'neutral',
  color_temp     text,
  style_tags     text[]      not null default '{}',
  aspect_ratio   text        not null default 'landscape'
                             check (aspect_ratio in ('portrait', 'square', 'landscape')),
  download_count integer     not null default 0,
  view_count     integer     not null default 0,
  featured       boolean     not null default false,
  published      boolean     not null default false,
  sort_order     integer     not null default 0,
  search_vector  tsvector,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint lighting_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

create or replace function public.lighting_presets_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.color_temp, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B');
  return new;
end; $$;

create trigger lighting_presets_search_vector_trigger
  before insert or update on public.lighting_presets
  for each row execute procedure public.lighting_presets_search_vector_update();

create or replace function public.lighting_presets_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger lighting_presets_updated_at_trigger
  before update on public.lighting_presets
  for each row execute procedure public.lighting_presets_set_updated_at();

create index lighting_search_idx on public.lighting_presets using gin(search_vector);
create index lighting_type_idx   on public.lighting_presets (lighting_type);
create index lighting_mood_idx   on public.lighting_presets (mood);
create index lighting_pub_idx    on public.lighting_presets (published, sort_order, created_at desc);

alter table public.lighting_presets enable row level security;
create policy "lighting_public_read" on public.lighting_presets for select using (published = true);
create policy "lighting_service_all" on public.lighting_presets for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create or replace function public.increment_lighting_preset_download(preset_id uuid)
returns void language sql security definer as $$
  update public.lighting_presets set download_count = download_count + 1 where id = preset_id; $$;

create or replace function public.increment_lighting_preset_view(preset_id uuid)
returns void language sql security definer as $$
  update public.lighting_presets set view_count = view_count + 1 where id = preset_id; $$;


-- ════════════════════════════════════════════════════════════
-- 3. COLOR GRADING PRESETS
-- ════════════════════════════════════════════════════════════

create type public.color_grade_style as enum (
  'cinematic',
  'vintage',
  'moody',
  'vibrant',
  'pastel',
  'noir',
  'natural',
  'fantasy',
  'horror',
  'sci_fi',
  'editorial',
  'other'
);

create type public.color_grade_mood as enum (
  'warm',
  'cool',
  'neutral',
  'dramatic',
  'dreamy',
  'gritty',
  'ethereal',
  'raw'
);

create table public.color_grades (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        not null unique,
  title           text        not null,
  description     text,
  image_url       text        not null,
  grade_style     public.color_grade_style  not null,
  mood            public.color_grade_mood   not null default 'neutral',
  dominant_colors text[]      not null default '{}',
  style_tags      text[]      not null default '{}',
  aspect_ratio    text        not null default 'landscape'
                              check (aspect_ratio in ('portrait', 'square', 'landscape')),
  download_count  integer     not null default 0,
  view_count      integer     not null default 0,
  featured        boolean     not null default false,
  published       boolean     not null default false,
  sort_order      integer     not null default 0,
  search_vector   tsvector,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint color_grades_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

create or replace function public.color_grades_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.dominant_colors, '{}'), ' ')), 'C');
  return new;
end; $$;

create trigger color_grades_search_vector_trigger
  before insert or update on public.color_grades
  for each row execute procedure public.color_grades_search_vector_update();

create or replace function public.color_grades_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger color_grades_updated_at_trigger
  before update on public.color_grades
  for each row execute procedure public.color_grades_set_updated_at();

create index color_grades_search_idx on public.color_grades using gin(search_vector);
create index color_grades_style_idx  on public.color_grades (grade_style);
create index color_grades_mood_idx   on public.color_grades (mood);
create index color_grades_pub_idx    on public.color_grades (published, sort_order, created_at desc);

alter table public.color_grades enable row level security;
create policy "color_grades_public_read" on public.color_grades for select using (published = true);
create policy "color_grades_service_all" on public.color_grades for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create or replace function public.increment_color_grade_download(grade_id uuid)
returns void language sql security definer as $$
  update public.color_grades set download_count = download_count + 1 where id = grade_id; $$;

create or replace function public.increment_color_grade_view(grade_id uuid)
returns void language sql security definer as $$
  update public.color_grades set view_count = view_count + 1 where id = grade_id; $$;


-- ════════════════════════════════════════════════════════════
-- 4. MOOD / AESTHETIC BOARDS
-- ════════════════════════════════════════════════════════════

create type public.aesthetic_style as enum (
  'dark_academia',
  'y2k',
  'cottagecore',
  'cyberpunk',
  'wabi_sabi',
  'minimalist',
  'maximalist',
  'streetwear',
  'old_money',
  'clean_girl',
  'coastal_grandmother',
  'retro_futurism',
  'bohemian',
  'preppy',
  'grunge',
  'art_deco',
  'mob_wife',
  'vanilla_girl',
  'brat',
  'other'
);

create type public.aesthetic_era as enum (
  'seventies',
  'eighties',
  'nineties',
  'two_thousands',
  'twenty_tens',
  'modern',
  'timeless'
);

create table public.mood_boards (
  id             uuid        primary key default gen_random_uuid(),
  slug           text        not null unique,
  title          text        not null,
  description    text,
  image_url      text        not null,
  aesthetic      public.aesthetic_style  not null,
  era            public.aesthetic_era    not null default 'modern',
  color_palette  text[]      not null default '{}',
  style_tags     text[]      not null default '{}',
  aspect_ratio   text        not null default 'landscape'
                             check (aspect_ratio in ('portrait', 'square', 'landscape')),
  download_count integer     not null default 0,
  view_count     integer     not null default 0,
  featured       boolean     not null default false,
  published      boolean     not null default false,
  sort_order     integer     not null default 0,
  search_vector  tsvector,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint mood_boards_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

create or replace function public.mood_boards_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.color_palette, '{}'), ' ')), 'C');
  return new;
end; $$;

create trigger mood_boards_search_vector_trigger
  before insert or update on public.mood_boards
  for each row execute procedure public.mood_boards_search_vector_update();

create or replace function public.mood_boards_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger mood_boards_updated_at_trigger
  before update on public.mood_boards
  for each row execute procedure public.mood_boards_set_updated_at();

create index mood_boards_search_idx    on public.mood_boards using gin(search_vector);
create index mood_boards_aesthetic_idx on public.mood_boards (aesthetic);
create index mood_boards_era_idx       on public.mood_boards (era);
create index mood_boards_pub_idx       on public.mood_boards (published, sort_order, created_at desc);

alter table public.mood_boards enable row level security;
create policy "mood_boards_public_read" on public.mood_boards for select using (published = true);
create policy "mood_boards_service_all" on public.mood_boards for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create or replace function public.increment_mood_board_download(board_id uuid)
returns void language sql security definer as $$
  update public.mood_boards set download_count = download_count + 1 where id = board_id; $$;

create or replace function public.increment_mood_board_view(board_id uuid)
returns void language sql security definer as $$
  update public.mood_boards set view_count = view_count + 1 where id = board_id; $$;
