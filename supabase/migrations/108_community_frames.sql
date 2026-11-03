-- ============================================================
-- 108 · Community jumbotron stills
-- Frames taken from a video, stored with the piece.
-- Run this in the Supabase SQL editor.
-- ============================================================

alter table public.community_pieces
  add column if not exists frame_stills jsonb not null default '[]'::jsonb;
