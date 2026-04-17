-- Drop "celebrities" gallery category: migrate rows, then tighten CHECK constraints.

update public.gallery_images
set category = 'photorealistic'
where category = 'celebrities';

update public.gallery_films
set category = 'photorealistic'
where category = 'celebrities';

alter table public.gallery_images drop constraint if exists gallery_images_category_check;
alter table public.gallery_films drop constraint if exists gallery_films_category_check;

alter table public.gallery_images
  add constraint gallery_images_category_check
  check (category in ('photorealistic','product','animations'));

alter table public.gallery_films
  add constraint gallery_films_category_check
  check (category in ('photorealistic','product','animations'));
