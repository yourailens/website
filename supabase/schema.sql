-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
-- Admin adds image/film rows by pasting a URL; only `public_url` is stored (no Storage upload).

create table if not exists public.gallery_images (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('photorealistic','product','animations','celebrities')),
  aspect text check (aspect in ('square','portrait','landscape')),
  people_tags text[] not null default '{}'::text[],
  constraint gallery_images_people_tags_allowed
    check (people_tags <@ array['Kaira','Akriti','Niharika','Ankanksha']::text[]),
  public_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.gallery_films (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('photorealistic','product','animations','celebrities')),
  orientation text check (orientation in ('landscape','portrait')),
  people_tags text[] not null default '{}'::text[],
  constraint gallery_films_people_tags_allowed
    check (people_tags <@ array['Kaira','Akriti','Niharika','Ankanksha']::text[]),
  public_url text not null,
  poster_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.instagram_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  thumbnail_url text,
  tag text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.youtube_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  thumbnail_url text,
  tag text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.call_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  brand text,
  project_summary text not null,
  budget text,
  scheduled_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'meet_failed', 'cancelled')),
  google_event_id text,
  google_meet_url text,
  meet_error text,
  created_at timestamptz not null default now()
);

create index if not exists gallery_images_sort on public.gallery_images (sort_order);
create index if not exists gallery_films_sort on public.gallery_films (sort_order);
create index if not exists instagram_links_sort on public.instagram_links (sort_order);
create index if not exists youtube_links_sort on public.youtube_links (sort_order);
create index if not exists call_bookings_scheduled_at_idx on public.call_bookings (scheduled_at);
create index if not exists call_bookings_email_idx on public.call_bookings (email);

alter table public.gallery_images enable row level security;
alter table public.gallery_films enable row level security;
alter table public.instagram_links enable row level security;
alter table public.youtube_links enable row level security;
alter table public.call_bookings enable row level security;

-- Public read (site + Next.js anon client)
drop policy if exists "Public read gallery_images" on public.gallery_images;
create policy "Public read gallery_images" on public.gallery_images for select using (true);

drop policy if exists "Public read gallery_films" on public.gallery_films;
create policy "Public read gallery_films" on public.gallery_films for select using (true);

drop policy if exists "Public read instagram_links" on public.instagram_links;
create policy "Public read instagram_links" on public.instagram_links for select using (true);

drop policy if exists "Public read youtube_links" on public.youtube_links;
create policy "Public read youtube_links" on public.youtube_links for select using (true);

drop policy if exists "Public insert call_bookings" on public.call_bookings;
create policy "Public insert call_bookings" on public.call_bookings for insert with check (true);

-- Writes go through Next.js API with service role (bypasses RLS). No insert policies for anon.
