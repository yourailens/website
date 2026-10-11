-- ============================================================
-- 086 · YAILIANS hub hero image (landscape)
-- Run in the Supabase SQL editor after 085_yailians.sql
-- ============================================================

alter table public.yailians_site
  add column if not exists hero_image_url text;
