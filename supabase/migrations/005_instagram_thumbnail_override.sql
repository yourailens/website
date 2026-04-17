-- Existing projects: optional thumbnail URLs for Instagram + YouTube links.
-- New projects: this is already included in supabase/schema.sql.

alter table public.instagram_links
  add column if not exists thumbnail_url text;

alter table public.youtube_links
  add column if not exists thumbnail_url text;
