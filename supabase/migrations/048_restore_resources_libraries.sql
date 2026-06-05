-- 048 · Restore Resources libraries (re-apply 019–025 after 041 drop)
-- Skip this migration if resource tables already exist (never ran 041).

-- ============================================================
-- 019 · Prompt Library
-- A blog-style AI prompt / workflow library.
-- Each row is one "entry" that can be an image prompt or a
-- video prompt, with a rich markdown body, cover image, tags,
-- AI model references, and full-text search via tsvector.
-- ============================================================

-- ── Enum types ───────────────────────────────────────────────

create type public.prompt_media_type as enum ('image', 'video');

create type public.prompt_image_category as enum (
  'photorealistic',
  'ultrarealistic',
  'natural',
  'product',
  '2d_illustration',
  '3d_render',
  'animation',
  'editorial',
  'portrait',
  'cinematic',
  'abstract',
  'other'
);

create type public.prompt_video_category as enum (
  'animation',
  'cinematic',
  'product',
  'lip_sync',
  'motion_fx',
  'character',
  'documentary',
  'transition',
  'vfx',
  'other'
);

create type public.prompt_difficulty as enum (
  'beginner',
  'intermediate',
  'advanced'
);

-- ── Main table ───────────────────────────────────────────────

create table public.prompts (
  id                uuid              primary key default gen_random_uuid(),
  slug              text              not null unique,
  title             text              not null,
  excerpt           text,                         -- one-line summary shown in cards
  cover_image_url   text,                         -- S3 / public URL for the card thumbnail
  media_type        public.prompt_media_type not null,
  -- One of the two category columns will be non-null depending on media_type
  image_category    public.prompt_image_category,
  video_category    public.prompt_video_category,
  difficulty        public.prompt_difficulty not null default 'intermediate',
  -- Comma / array of AI models referenced: ['Kling AI', 'Higgsfield', 'Midjourney', …]
  models            text[]            not null default '{}',
  -- Free-form tags for search ("anime", "portrait lighting", "neon", …)
  tags              text[]            not null default '{}',
  -- Rich markdown body (the actual workflow / prompt content)
  body              text              not null default '',
  -- SEO / OG meta
  og_image_url      text,
  -- Stats
  view_count        integer           not null default 0,
  featured          boolean           not null default false,
  published         boolean           not null default false,
  sort_order        integer           not null default 0,
  created_at        timestamptz       not null default now(),
  updated_at        timestamptz       not null default now(),

  -- Full-text search vector (maintained by trigger below)
  search_vector     tsvector,

  constraint slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$'),
  constraint category_matches_type check (
    (media_type = 'image' and image_category is not null and video_category is null) or
    (media_type = 'video' and video_category is not null and image_category is null)
  )
);

-- ── Indexes ──────────────────────────────────────────────────

create index prompts_search_idx        on public.prompts using gin(search_vector);
create index prompts_published_idx     on public.prompts (published, sort_order desc, created_at desc);
create index prompts_media_type_idx    on public.prompts (media_type, published);
create index prompts_image_cat_idx     on public.prompts (image_category) where media_type = 'image';
create index prompts_video_cat_idx     on public.prompts (video_category) where media_type = 'video';
create index prompts_featured_idx      on public.prompts (featured, published);
create index prompts_difficulty_idx    on public.prompts (difficulty, published);

-- ── Search vector trigger ────────────────────────────────────

create or replace function public.prompts_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.body, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.tags, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.models, '{}'), ' ')), 'B');
  return new;
end;
$$;

create trigger prompts_search_vector_trigger
  before insert or update on public.prompts
  for each row execute procedure public.prompts_search_vector_update();

-- ── updated_at trigger ───────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger prompts_updated_at
  before update on public.prompts
  for each row execute procedure public.set_updated_at();

-- ── RLS: public can read published; only service-role can write ──

alter table public.prompts enable row level security;

-- Anyone can read published prompts
create policy "prompts_public_read"
  on public.prompts for select
  using (published = true);

-- Service-role bypass (admin writes via server-side with service key)
create policy "prompts_service_all"
  on public.prompts for all
  to service_role
  using (true)
  with check (true);

-- ── Helper: increment view count safely ─────────────────────

create or replace function public.increment_prompt_view(p_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.prompts set view_count = view_count + 1 where id = p_id;
end;
$$;

-- Grant execute to anon so the public page can call it
grant execute on function public.increment_prompt_view(uuid) to anon;
grant execute on function public.increment_prompt_view(uuid) to authenticated;

-- ============================================================
-- 020 · Prompts – media fields
-- Adds cover aspect ratio and an optional demo video URL.
-- ============================================================

-- cover_aspect: how the thumbnail/cover image is cropped/displayed
alter table public.prompts
  add column if not exists cover_aspect text
    check (cover_aspect in ('square', 'portrait', 'landscape'))
    default 'landscape';

-- demo_video_url: an S3-hosted or external video showing the prompt in action
-- (visible on the public prompt page, below the cover)
alter table public.prompts
  add column if not exists demo_video_url text;

-- ── Enums ─────────────────────────────────────────────────────

create type public.outfit_category as enum (
  'casual',
  'formal',
  'fantasy',
  'sci_fi',
  'traditional',
  'editorial',
  'anime',
  'gothic',
  'vintage',
  'activewear',
  'swimwear',
  'bridal'
);

create type public.outfit_character_type as enum (
  'female',
  'male',
  'unisex'
);

-- ── Table ──────────────────────────────────────────────────────

create table public.outfits (
  id               uuid          primary key default gen_random_uuid(),
  slug             text          not null unique,
  title            text          not null,
  description      text,
  image_url        text          not null,
  category         public.outfit_category         not null,
  character_type   public.outfit_character_type   not null default 'female',
  style_tags       text[]        not null default '{}',
  color_palette    text[]        not null default '{}',
  aspect_ratio     text          not null default 'portrait'
                                 check (aspect_ratio in ('portrait', 'square', 'landscape')),
  download_count   integer       not null default 0,
  view_count       integer       not null default 0,
  featured         boolean       not null default false,
  published        boolean       not null default false,
  sort_order       integer       not null default 0,
  search_vector    tsvector,
  created_at       timestamptz   not null default now(),
  updated_at       timestamptz   not null default now(),

  constraint outfit_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Full-text search trigger ───────────────────────────────────

create or replace function public.outfits_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B');
  return new;
end;
$$;

create trigger outfits_search_vector_trigger
  before insert or update on public.outfits
  for each row execute procedure public.outfits_search_vector_update();

-- ── updated_at auto-bump ───────────────────────────────────────

create or replace function public.outfits_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger outfits_updated_at_trigger
  before update on public.outfits
  for each row execute procedure public.outfits_set_updated_at();

-- ── Indexes ────────────────────────────────────────────────────

create index outfits_search_idx    on public.outfits using gin(search_vector);
create index outfits_category_idx  on public.outfits (category);
create index outfits_char_type_idx on public.outfits (character_type);
create index outfits_published_idx on public.outfits (published, sort_order, created_at desc);
create index outfits_featured_idx  on public.outfits (featured) where featured = true;

-- ── RLS ───────────────────────────────────────────────────────

alter table public.outfits enable row level security;

-- Anyone can read published outfits
create policy "outfits_public_read"
  on public.outfits for select
  using (published = true);

-- Service role can do everything
create policy "outfits_service_all"
  on public.outfits for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- ── Download / view counters ───────────────────────────────────

create or replace function public.increment_outfit_download(outfit_id uuid)
returns void language sql security definer as $$
  update public.outfits set download_count = download_count + 1 where id = outfit_id;
$$;

create or replace function public.increment_outfit_view(outfit_id uuid)
returns void language sql security definer as $$
  update public.outfits set view_count = view_count + 1 where id = outfit_id;
$$;

-- ── Enums ─────────────────────────────────────────────────────

create type public.scenario_type as enum (
  'portrait',
  'duo',
  'group_scene',
  'action',
  'romance',
  'everyday',
  'cinematic',
  'magical',
  'battle',
  'fashion_shoot'
);

create type public.scenario_setting as enum (
  'indoor',
  'outdoor',
  'fantasy',
  'sci_fi',
  'historical',
  'urban',
  'nature',
  'studio'
);

create type public.scenario_mood as enum (
  'happy',
  'dramatic',
  'mysterious',
  'peaceful',
  'intense',
  'playful',
  'romantic',
  'melancholic'
);

-- ── Table ──────────────────────────────────────────────────────

create table public.scenarios (
  id              uuid          primary key default gen_random_uuid(),
  slug            text          not null unique,
  title           text          not null,
  description     text,
  image_url       text          not null,
  scenario_type   public.scenario_type   not null default 'portrait',
  setting         public.scenario_setting not null default 'outdoor',
  mood            public.scenario_mood   not null default 'peaceful',
  character_count text          not null default 'solo'
                                check (character_count in ('solo', 'duo', 'group')),
  style_tags      text[]        not null default '{}',
  aspect_ratio    text          not null default 'portrait'
                                check (aspect_ratio in ('portrait', 'square', 'landscape')),
  download_count  integer       not null default 0,
  view_count      integer       not null default 0,
  featured        boolean       not null default false,
  published       boolean       not null default false,
  sort_order      integer       not null default 0,
  search_vector   tsvector,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now(),

  constraint scenario_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Full-text search trigger ───────────────────────────────────

create or replace function public.scenarios_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.style_tags, '{}'), ' ')), 'B');
  return new;
end;
$$;

create trigger scenarios_search_vector_trigger
  before insert or update on public.scenarios
  for each row execute procedure public.scenarios_search_vector_update();

create or replace function public.scenarios_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger scenarios_updated_at_trigger
  before update on public.scenarios
  for each row execute procedure public.scenarios_set_updated_at();

-- ── Indexes + RLS ─────────────────────────────────────────────

create index scenarios_search_idx     on public.scenarios using gin(search_vector);
create index scenarios_type_idx       on public.scenarios (scenario_type);
create index scenarios_published_idx  on public.scenarios (published, sort_order, created_at desc);

alter table public.scenarios enable row level security;

create policy "scenarios_public_read" on public.scenarios for select using (published = true);
create policy "scenarios_service_all" on public.scenarios for all
  using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ── Counters ──────────────────────────────────────────────────

create or replace function public.increment_scenario_download(scenario_id uuid)
returns void language sql security definer as $$
  update public.scenarios set download_count = download_count + 1 where id = scenario_id;
$$;

create or replace function public.increment_scenario_view(scenario_id uuid)
returns void language sql security definer as $$
  update public.scenarios set view_count = view_count + 1 where id = scenario_id;
$$;

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

notify pgrst, 'reload schema';
