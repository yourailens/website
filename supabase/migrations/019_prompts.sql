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
