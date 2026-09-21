-- ============================================================
-- 067 · Homepage feature flag on ott_cuts
-- Marks the one cut used as the homepage AI films trailer.
-- Run in the Supabase SQL editor after 066.
-- ============================================================

alter table public.ott_cuts
  add column if not exists homepage_feature boolean not null default false;

create index if not exists ott_cuts_homepage_feature_idx
  on public.ott_cuts (homepage_feature)
  where homepage_feature = true;
