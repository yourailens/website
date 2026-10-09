-- ============================================================
-- 070 · Homepage video below the opening film
-- One published cut can be switched on for the section
-- directly under the existing homepage hero.
-- Run this in the Supabase SQL editor after 066 and 067.
-- Safe to run again if you already ran 069.
-- ============================================================

alter table public.ott_cuts
  add column if not exists homepage_hero boolean not null default false;

-- Keep only the latest flagged cut, so the one-slot index can be created.
with keep as (
  select id
  from public.ott_cuts
  where homepage_hero = true
  order by updated_at desc
  limit 1
)
update public.ott_cuts
set homepage_hero = false
where homepage_hero = true
  and not exists (select 1 from keep where keep.id = ott_cuts.id);

-- If nothing is flagged yet, use the mattress ad.
update public.ott_cuts
set homepage_hero = true
where id = (
  select id
  from public.ott_cuts
  where published = true
    and lower(regexp_replace(trim(caption), '\s+', ' ', 'g')) = 'the mattress ad'
  order by updated_at desc
  limit 1
)
and not exists (
  select 1 from public.ott_cuts where homepage_hero = true
);

drop index if exists public.ott_cuts_one_homepage_hero;
create unique index if not exists ott_cuts_one_homepage_hero
  on public.ott_cuts (homepage_hero)
  where homepage_hero = true;
