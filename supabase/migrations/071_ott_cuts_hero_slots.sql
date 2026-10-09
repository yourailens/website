-- ============================================================
-- 071 · Hero 1, Hero 2, Hero 3 above the opening film
-- Run this in the Supabase SQL editor after 066.
-- Safe if 069 or 070 were already run.
-- ============================================================

alter table public.ott_cuts
  add column if not exists homepage_hero boolean not null default false;

alter table public.ott_cuts
  add column if not exists hero_slot text;

alter table public.ott_cuts
  drop constraint if exists ott_cuts_hero_slot_check;

alter table public.ott_cuts
  add constraint ott_cuts_hero_slot_check
  check (hero_slot is null or hero_slot in ('hero1', 'hero2', 'hero3'));

-- The old one-video lock cannot hold three heroes.
drop index if exists public.ott_cuts_one_homepage_hero;

-- Keep a video that was already switched on, and put it in Hero 1.
update public.ott_cuts
set hero_slot = 'hero1'
where homepage_hero = true
  and hero_slot is null
  and id = (
    select id
    from public.ott_cuts
    where homepage_hero = true
    order by updated_at desc
    limit 1
  );

update public.ott_cuts
set homepage_hero = hero_slot is not null;

create unique index if not exists ott_cuts_hero_slot_key
  on public.ott_cuts (hero_slot)
  where hero_slot is not null;
