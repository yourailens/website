-- Run in Supabase SQL Editor if you already created tables with `storage_path`
-- (file uploads). New projects should use `supabase/schema.sql` only — it has no
-- `storage_path` column.

-- Gallery rows store only `public_url` (external or any HTTPS URL you paste).

alter table public.gallery_images
  drop column if exists storage_path;

alter table public.gallery_films
  drop column if exists storage_path;
