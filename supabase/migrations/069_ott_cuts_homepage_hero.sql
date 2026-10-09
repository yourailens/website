-- ============================================================
-- 069 · homepage_hero column on ott_cuts
-- Prefer 070. It places one video below the opening film
-- and is safe if this file was already run.
-- ============================================================

alter table public.ott_cuts
  add column if not exists homepage_hero boolean not null default false;

drop index if exists ott_cuts_one_homepage_hero;

-- Keep the current mattress film in that slot, if it is still published.
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
