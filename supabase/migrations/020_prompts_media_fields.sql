-- ============================================================
-- 020 · Prompts – media fields
-- Adds cover aspect ratio and an optional demo video URL.
-- ============================================================

-- cover_aspect: how the thumbnail/cover image is cropped/displayed
alter table public.prompts
  add column if not exists cover_aspect text
    check (cover_aspect in ('square', 'portrait', 'landscape'))
    default 'landscape';

-- demo_video_url: an S3-hosted or external video showing the prompt in action
-- (visible on the public prompt page, below the cover)
alter table public.prompts
  add column if not exists demo_video_url text;
