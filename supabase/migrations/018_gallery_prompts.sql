-- Optional admin-only prompts shown in fullscreen viewers (Images + Films).

alter table public.gallery_images
  add column if not exists prompt text;

alter table public.gallery_films
  add column if not exists prompt text;

