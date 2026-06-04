-- ============================================================
-- 046 · Multiple cover crops per aspect ratio
-- ============================================================

alter table public.modules
  add column if not exists cover_variants jsonb not null default '{}'::jsonb;

alter table public.modules drop constraint if exists modules_cover_aspect_check;

alter table public.modules
  add constraint modules_cover_aspect_check
  check (cover_aspect in ('portrait', 'square', 'landscape', 'wide', 'story'));
