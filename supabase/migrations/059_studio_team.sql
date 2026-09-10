-- ============================================================
-- 059 · Studio team members, work gallery, and profile links
-- ============================================================

create type public.studio_team_media_type as enum ('image', 'video');

create table public.studio_team_members (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null unique,
  name          text        not null,
  role          text        not null default '',
  short_bio     text,
  bio           text,
  portrait_url  text,
  published     boolean     not null default false,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint studio_team_slug_format check (slug ~ '^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$')
);

create table public.studio_team_work (
  id           uuid        primary key default gen_random_uuid(),
  member_id    uuid        not null references public.studio_team_members(id) on delete cascade,
  media_type   public.studio_team_media_type not null default 'image',
  image_url    text,
  video_url    text,
  poster_url   text,
  aspect_ratio text        not null default 'natural'
                           check (aspect_ratio in ('natural', 'portrait', 'square', 'landscape', 'wide', 'story')),
  title        text,
  caption      text,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now()
);

create table public.studio_team_links (
  id         uuid    primary key default gen_random_uuid(),
  member_id  uuid    not null references public.studio_team_members(id) on delete cascade,
  label      text    not null,
  url        text    not null,
  sort_order integer not null default 0
);

create or replace function public.studio_team_members_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger studio_team_members_updated_at_trigger
  before update on public.studio_team_members
  for each row execute procedure public.studio_team_members_set_updated_at();

create index studio_team_members_published_idx
  on public.studio_team_members (published, sort_order, created_at desc);

create index studio_team_work_member_idx
  on public.studio_team_work (member_id, sort_order);

create index studio_team_links_member_idx
  on public.studio_team_links (member_id, sort_order);

alter table public.studio_team_members enable row level security;
alter table public.studio_team_work enable row level security;
alter table public.studio_team_links enable row level security;

create policy "studio_team_members_public_read"
  on public.studio_team_members for select
  using (published = true);

create policy "studio_team_work_public_read"
  on public.studio_team_work for select
  using (
    exists (
      select 1 from public.studio_team_members m
      where m.id = member_id and m.published = true
    )
  );

create policy "studio_team_links_public_read"
  on public.studio_team_links for select
  using (
    exists (
      select 1 from public.studio_team_members m
      where m.id = member_id and m.published = true
    )
  );

create policy "studio_team_members_service_all"
  on public.studio_team_members for all
  using (true) with check (true);

create policy "studio_team_work_service_all"
  on public.studio_team_work for all
  using (true) with check (true);

create policy "studio_team_links_service_all"
  on public.studio_team_links for all
  using (true) with check (true);
