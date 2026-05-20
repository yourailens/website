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
