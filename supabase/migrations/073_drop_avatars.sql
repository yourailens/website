-- ============================================================
-- 073 · Drop AI Avatars
-- Removes avatar character pages and their image galleries.
-- Safe to re-run: every drop uses IF EXISTS.
-- ============================================================

drop table if exists public.avatar_character_images cascade;
drop table if exists public.avatar_characters cascade;
