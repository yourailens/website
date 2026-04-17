-- Existing projects: add optional tags for Instagram + YouTube links.
-- Use tags like "Morphers" for filtered subpages.

alter table public.instagram_links
  add column if not exists tag text;

alter table public.youtube_links
  add column if not exists tag text;
