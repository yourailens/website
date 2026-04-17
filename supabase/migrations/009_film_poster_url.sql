-- Per-film poster image (first video frame, generated on upload) for OG / WhatsApp previews.

alter table public.gallery_films
  add column if not exists poster_url text;
