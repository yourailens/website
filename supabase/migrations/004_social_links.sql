-- Existing projects: add social link tables for Instagram + YouTube pages.
-- New projects: this is already included in supabase/schema.sql.

create table if not exists public.instagram_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.youtube_links (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists instagram_links_sort on public.instagram_links (sort_order);
create index if not exists youtube_links_sort on public.youtube_links (sort_order);

alter table public.instagram_links enable row level security;
alter table public.youtube_links enable row level security;

drop policy if exists "Public read instagram_links" on public.instagram_links;
create policy "Public read instagram_links" on public.instagram_links for select using (true);

drop policy if exists "Public read youtube_links" on public.youtube_links;
create policy "Public read youtube_links" on public.youtube_links for select using (true);
