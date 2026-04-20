-- Avatar character pages: copy + hero + optional gallery images (URLs from S3 via admin API).

create table if not exists public.avatar_characters (
  slug text primary key check (slug in ('kaira', 'akriti', 'niharika', 'akanksha')),
  display_name text not null,
  headline text not null default '',
  story text not null default '',
  hero_image_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.avatar_character_images (
  id uuid primary key default gen_random_uuid(),
  character_slug text not null references public.avatar_characters (slug) on delete cascade,
  public_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists avatar_character_images_slug_sort
  on public.avatar_character_images (character_slug, sort_order);

alter table public.avatar_characters enable row level security;
alter table public.avatar_character_images enable row level security;

drop policy if exists "Public read avatar_characters" on public.avatar_characters;
create policy "Public read avatar_characters" on public.avatar_characters for select using (true);

drop policy if exists "Public read avatar_character_images" on public.avatar_character_images;
create policy "Public read avatar_character_images" on public.avatar_character_images for select using (true);

insert into public.avatar_characters (slug, display_name, headline, story)
values
  (
    'kaira',
    'Kaira',
    'Creative lead & visual voice',
    'Kaira shapes how stories look and feel on screen. Update this text in Admin → Avatars.'
  ),
  (
    'akriti',
    'Akriti',
    'Motion, pacing, and polish',
    'Akriti bridges concept and delivery — from rough cuts to final grade. Edit copy in Admin → Avatars.'
  ),
  (
    'niharika',
    'Niharika',
    'Strategy meets craft',
    'Niharika keeps campaigns honest to the brand while pushing the craft forward. Edit in Admin → Avatars.'
  ),
  (
    'akanksha',
    'Akanksha',
    'Sound, identity, presence',
    'Akanksha tunes tone, audio, and the little details people remember. Edit in Admin → Avatars.'
  )
on conflict (slug) do nothing;
