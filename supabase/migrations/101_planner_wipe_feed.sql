-- ============================================================
-- 101 · Wipe planner feed
-- Deletes all posts and their images.
-- Run in the Supabase SQL editor. Irreversible.
-- ============================================================

delete from public.planner_post_images;
delete from public.planner_posts;
