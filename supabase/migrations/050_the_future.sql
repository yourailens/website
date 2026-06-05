-- ============================================================
-- 050 · The Future — fields, modules, sequence frames
-- Creations: broad fields → modules → timeline media + captions
-- ============================================================

create table public.future_fields (
  id                uuid        primary key default gen_random_uuid(),
  slug              text        not null unique,
  title             text        not null,
  tagline           text,
  description       text,
  cover_image_url   text,
  cover_video_url   text,
  cover_media_type  text        not null default 'image'
                    check (cover_media_type in ('image', 'video')),
  cover_aspect      text        not null default 'landscape'
                    check (cover_aspect in ('portrait', 'square', 'landscape', 'wide', 'story')),
  sort_order        integer     not null default 0,
  published         boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint future_fields_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

create table public.future_modules (
  id                uuid        primary key default gen_random_uuid(),
  field_id          uuid        not null references public.future_fields(id) on delete cascade,
  slug              text        not null,
  title             text        not null,
  tagline           text,
  intro             text,
  cover_image_url   text,
  cover_video_url   text,
  cover_media_type  text        not null default 'image'
                    check (cover_media_type in ('image', 'video')),
  cover_aspect      text        not null default 'landscape'
                    check (cover_aspect in ('portrait', 'square', 'landscape', 'wide', 'story')),
  view_count        integer     not null default 0,
  sort_order        integer     not null default 0,
  published         boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (field_id, slug),
  constraint future_modules_slug_format check (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

create table public.future_sequence_frames (
  id              uuid        primary key default gen_random_uuid(),
  module_id       uuid        not null references public.future_modules(id) on delete cascade,
  label           text        not null default '',
  caption         text,
  media_type      text        not null default 'image'
                  check (media_type in ('image', 'video')),
  image_url       text,
  video_url       text,
  poster_url      text,
  aspect_ratio    text        not null default 'landscape'
                  check (aspect_ratio in ('portrait', 'square', 'landscape', 'wide', 'story')),
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now()
);

create index future_fields_published_idx on public.future_fields (published, sort_order);
create index future_modules_field_idx on public.future_modules (field_id, published, sort_order);
create index future_sequence_frames_module_idx on public.future_sequence_frames (module_id, sort_order);

create or replace function public.future_fields_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger future_fields_updated_at_trigger
  before update on public.future_fields
  for each row execute procedure public.future_fields_set_updated_at();

create or replace function public.future_modules_set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end; $$;

create trigger future_modules_updated_at_trigger
  before update on public.future_modules
  for each row execute procedure public.future_modules_set_updated_at();

create or replace function public.increment_future_module_view(m_id uuid)
returns void language sql security definer as $$
  update public.future_modules set view_count = view_count + 1 where id = m_id;
$$;

-- RLS
alter table public.future_fields enable row level security;
alter table public.future_modules enable row level security;
alter table public.future_sequence_frames enable row level security;

create policy "future_fields_public_read"
  on public.future_fields for select using (published = true);

create policy "future_fields_service_all"
  on public.future_fields for all to service_role using (true) with check (true);

create policy "future_modules_public_read"
  on public.future_modules for select
  using (
    published = true
    and exists (select 1 from public.future_fields f where f.id = field_id and f.published = true)
  );

create policy "future_modules_service_all"
  on public.future_modules for all to service_role using (true) with check (true);

create policy "future_sequence_frames_public_read"
  on public.future_sequence_frames for select
  using (
    exists (
      select 1 from public.future_modules m
      join public.future_fields f on f.id = m.field_id
      where m.id = module_id and m.published = true and f.published = true
    )
  );

create policy "future_sequence_frames_service_all"
  on public.future_sequence_frames for all to service_role using (true) with check (true);

grant execute on function public.increment_future_module_view(uuid) to anon;
grant execute on function public.increment_future_module_view(uuid) to authenticated;

-- Seed broad fields (publish when content is ready)
insert into public.future_fields (slug, title, tagline, description, sort_order, published) values
  (
    'science-technology',
    'Science & Technology',
    'Research, systems, and what comes next.',
    'Explorations at the edge of science, engineering, and emerging technology.',
    0,
    false
  ),
  (
    'arts',
    'Arts',
    'Culture, craft, and creative futures.',
    'Visual culture, performance, and the evolving language of art.',
    1,
    false
  ),
  (
    'law',
    'Law',
    'Rights, governance, and civic imagination.',
    'How law shapes society — and how we might rethink it.',
    2,
    false
  );
