-- ============================================================
-- 042 · Director Modules
-- Workflow playbooks: camera, lighting, lens, prompts, assets
-- ============================================================

create type public.module_discipline as enum (
  'photography',
  'video',
  'design',
  'motion',
  'social',
  'other'
);

create type public.module_asset_kind as enum (
  'reference',
  'example_output',
  'lighting_diagram',
  'mood',
  'prop',
  'download',
  'video'
);

create table public.modules (
  id                  uuid                    primary key default gen_random_uuid(),
  slug                text                    not null unique,
  title               text                    not null,
  tagline             text,
  description         text,
  discipline          public.module_discipline not null default 'other',
  cover_image_url     text,
  cover_aspect        text                    not null default 'landscape'
                      check (cover_aspect in ('portrait', 'square', 'landscape')),
  -- Director POV (plain language, not AI jargon)
  director_brief      text,
  camera_setup        text,
  lighting_setup      text,
  lens_and_focal      text,
  composition_notes   text,
  color_and_mood      text,
  -- Production workflow
  workflow_steps      jsonb                   not null default '[]'::jsonb,
  recommended_models  text[]                  not null default '{}',
  prompt_structure    text,
  prompt_tips         text,
  common_mistakes     text,
  -- Meta
  view_count          integer                 not null default 0,
  featured            boolean                 not null default false,
  published           boolean                 not null default false,
  sort_order          integer                 not null default 0,
  search_vector       tsvector,
  created_at          timestamptz             not null default now(),
  updated_at          timestamptz             not null default now(),
  constraint modules_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

create table public.module_assets (
  id              uuid                        primary key default gen_random_uuid(),
  module_id       uuid                        not null references public.modules(id) on delete cascade,
  title           text                        not null,
  caption         text,
  kind            public.module_asset_kind    not null default 'reference',
  image_url       text,
  video_url       text,
  aspect_ratio    text                        not null default 'landscape'
                  check (aspect_ratio in ('portrait', 'square', 'landscape')),
  sort_order      integer                     not null default 0,
  created_at      timestamptz                 not null default now()
);

create index modules_search_idx on public.modules using gin(search_vector);
create index modules_published_idx on public.modules (published, sort_order desc, created_at desc);
create index modules_discipline_idx on public.modules (discipline, published);
create index modules_featured_idx on public.modules (featured, published);
create index module_assets_module_idx on public.module_assets (module_id, sort_order);

-- Search vector
create or replace function public.modules_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.tagline, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.director_brief, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.camera_setup, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.lighting_setup, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.prompt_structure, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.recommended_models, '{}'), ' ')), 'B');
  return new;
end; $$;

create trigger modules_search_vector_trigger
  before insert or update on public.modules
  for each row execute procedure public.modules_search_vector_update();

create or replace function public.modules_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger modules_updated_at_trigger
  before update on public.modules
  for each row execute procedure public.modules_set_updated_at();

create or replace function public.increment_module_view(m_id uuid)
returns void language sql security definer as $$
  update public.modules set view_count = view_count + 1 where id = m_id;
$$;

-- RLS
alter table public.modules enable row level security;
alter table public.module_assets enable row level security;

create policy "modules_public_read"
  on public.modules for select
  using (published = true);

create policy "modules_service_all"
  on public.modules for all
  to service_role
  using (true) with check (true);

create policy "module_assets_public_read"
  on public.module_assets for select
  using (
    exists (
      select 1 from public.modules m
      where m.id = module_id and m.published = true
    )
  );

create policy "module_assets_service_all"
  on public.module_assets for all
  to service_role
  using (true) with check (true);

grant execute on function public.increment_module_view(uuid) to anon;
grant execute on function public.increment_module_view(uuid) to authenticated;
