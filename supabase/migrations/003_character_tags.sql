-- Existing projects: add character tags for gallery rows.
-- New projects: `supabase/schema.sql` already includes these columns/constraints.

alter table public.gallery_images
  add column if not exists people_tags text[] not null default '{}'::text[];

alter table public.gallery_films
  add column if not exists people_tags text[] not null default '{}'::text[];

alter table public.gallery_images
  drop constraint if exists gallery_images_people_tags_allowed;
alter table public.gallery_images
  add constraint gallery_images_people_tags_allowed
  check (people_tags <@ array['Kaira','Akriti','Niharika','Ankanksha']::text[]);

alter table public.gallery_films
  drop constraint if exists gallery_films_people_tags_allowed;
alter table public.gallery_films
  add constraint gallery_films_people_tags_allowed
  check (people_tags <@ array['Kaira','Akriti','Niharika','Ankanksha']::text[]);
