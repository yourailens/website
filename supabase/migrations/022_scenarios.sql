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
