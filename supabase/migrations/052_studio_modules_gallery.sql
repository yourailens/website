-- ============================================================
-- 052 · Replace director playbooks with gallery-based Modules
-- ============================================================

-- Drop legacy director modules (playbooks)
drop table if exists public.module_assets cascade;
drop table if exists public.modules cascade;
drop function if exists public.increment_module_view(uuid);
drop function if exists public.modules_search_vector_update() cascade;
drop function if exists public.modules_set_updated_at() cascade;
drop type if exists public.module_asset_kind cascade;
drop type if exists public.module_discipline cascade;

-- ── Enums ────────────────────────────────────────────────────

create type public.studio_module_type as enum (
  'prompt_playbooks',
  'client_showcases',
  'products_visuals'
);

create type public.studio_module_media_type as enum ('image', 'video');

-- ── Modules (collections) ─────────────────────────────────────

create table public.studio_modules (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        not null unique,
  module_type     public.studio_module_type not null,
  title           text        not null,
  description     text,
  cover_image_url text,
  cover_aspect    text        not null default 'portrait'
                              check (cover_aspect in ('portrait', 'square', 'landscape', 'wide', 'story')),
  published       boolean     not null default false,
  featured        boolean     not null default false,
  sort_order      integer     not null default 0,
  view_count      integer     not null default 0,
  search_vector   tsvector,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint studio_module_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Gallery items ─────────────────────────────────────────────

create table public.studio_module_items (
  id           uuid        primary key default gen_random_uuid(),
  module_id    uuid        not null references public.studio_modules(id) on delete cascade,
  media_type   public.studio_module_media_type not null default 'image',
  image_url    text,
  video_url    text,
  poster_url   text,
  aspect_ratio text        not null default 'natural'
                           check (aspect_ratio in ('natural', 'portrait', 'square', 'landscape', 'wide', 'story')),
  caption      text,
  prompt       text,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

-- ── Search ────────────────────────────────────────────────────

create or replace function public.studio_modules_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B');
  return new;
end; $$;

create trigger studio_modules_search_vector_trigger
  before insert or update on public.studio_modules
  for each row execute procedure public.studio_modules_search_vector_update();

-- ── Updated at ────────────────────────────────────────────────

create or replace function public.studio_modules_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger studio_modules_updated_at_trigger
  before update on public.studio_modules
  for each row execute procedure public.studio_modules_set_updated_at();

-- ── View counter ──────────────────────────────────────────────

create or replace function public.increment_studio_module_view(p_id uuid)
returns void language sql security definer as $$
  update public.studio_modules
  set view_count = view_count + 1
  where id = p_id;
$$;

-- ── Indexes ───────────────────────────────────────────────────

create index studio_modules_search_idx on public.studio_modules using gin(search_vector);
create index studio_modules_type_idx on public.studio_modules (module_type, published, sort_order, created_at desc);
create index studio_modules_featured_idx on public.studio_modules (featured) where featured = true;
create index studio_module_items_module_idx on public.studio_module_items (module_id, sort_order);

-- ── RLS ───────────────────────────────────────────────────────

alter table public.studio_modules enable row level security;
alter table public.studio_module_items enable row level security;

create policy "studio_modules_public_read"
  on public.studio_modules for select
  using (published = true);

create policy "studio_module_items_public_read"
  on public.studio_module_items for select
  using (
    exists (
      select 1 from public.studio_modules m
      where m.id = module_id and m.published = true
    )
  );

create policy "studio_modules_service_all"
  on public.studio_modules for all
  using (true) with check (true);

create policy "studio_module_items_service_all"
  on public.studio_module_items for all
  using (true) with check (true);
