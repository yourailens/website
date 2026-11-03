-- ============================================================
-- 107 · AI Creators Community
-- Promo page settings + media used as hero, jumbotron, or gallery.
-- Run this in the Supabase SQL editor.
-- ============================================================

create table if not exists public.community_site (
  id            int         primary key default 1 check (id = 1),
  eyebrow       text        not null default 'YAIL',
  title         text        not null default 'AI Creators Community',
  lede          text,
  member_count  integer     not null default 180,
  member_label  text        not null default 'members',
  cta_label     text        not null default 'Show your interest',
  updated_at    timestamptz not null default now()
);

insert into public.community_site (id, eyebrow, title, lede, member_count, member_label, cta_label)
values (
  1,
  'YAIL',
  'AI Creators Community',
  'A home for people making films, ads, and worlds with generative media.',
  180,
  'members',
  'Show your interest'
)
on conflict (id) do nothing;

create or replace function public.community_site_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists community_site_updated_at_trigger on public.community_site;
create trigger community_site_updated_at_trigger
  before update on public.community_site
  for each row execute procedure public.community_site_set_updated_at();

-- placement: hero (opening billboard) · jumbo (full-bleed section) · gallery
create table if not exists public.community_pieces (
  id            uuid        primary key default gen_random_uuid(),
  placement     text        not null default 'gallery'
                            check (placement in ('hero', 'jumbo', 'gallery')),
  title         text        not null,
  description   text,
  media_type    text        not null
                            check (media_type in ('image', 'video')),
  media_url     text        not null,
  poster_url    text,
  show_on_home  boolean     not null default true,
  published     boolean     not null default true,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create or replace function public.community_pieces_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists community_pieces_updated_at_trigger on public.community_pieces;
create trigger community_pieces_updated_at_trigger
  before update on public.community_pieces
  for each row execute procedure public.community_pieces_set_updated_at();

create index if not exists community_pieces_rail_idx
  on public.community_pieces (placement, published, sort_order desc, created_at desc);

alter table public.community_site enable row level security;
alter table public.community_pieces enable row level security;

drop policy if exists "community_site_public_read" on public.community_site;
create policy "community_site_public_read"
  on public.community_site for select using (true);

drop policy if exists "community_site_service_all" on public.community_site;
create policy "community_site_service_all"
  on public.community_site for all using (true) with check (true);

drop policy if exists "community_pieces_public_read" on public.community_pieces;
create policy "community_pieces_public_read"
  on public.community_pieces for select using (published = true);

drop policy if exists "community_pieces_service_all" on public.community_pieces;
create policy "community_pieces_service_all"
  on public.community_pieces for all using (true) with check (true);
