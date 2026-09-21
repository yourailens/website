-- ============================================================
-- 069 · Homepage hero feature = one AI film only
-- `homepage_feature` marks the cut that plays in the homepage
-- hero (Opening film). At most one row may be true.
-- Run in the Supabase SQL editor after 067.
-- ============================================================

alter table public.ott_cuts
  add column if not exists homepage_feature boolean not null default false;

comment on column public.ott_cuts.homepage_feature is
  'When true, this cut is the homepage hero film. Only one row may be true.';

-- Prefer films for the hero. Clear illegal / duplicate flags first.
update public.ott_cuts
set homepage_feature = false
where homepage_feature = true
  and (category is distinct from 'films' or media_type is distinct from 'video');

-- If more than one valid featured row exists, keep the most recently updated.
with ranked as (
  select id,
         row_number() over (order by updated_at desc nulls last, created_at desc nulls last) as rn
  from public.ott_cuts
  where homepage_feature = true
)
update public.ott_cuts c
set homepage_feature = false
from ranked r
where c.id = r.id
  and r.rn > 1;

-- Keep a single featured cut: partial unique index.
drop index if exists public.ott_cuts_homepage_feature_idx;
drop index if exists public.ott_cuts_homepage_feature_one_idx;

create unique index ott_cuts_homepage_feature_one_idx
  on public.ott_cuts (homepage_feature)
  where homepage_feature = true;

-- Only AI films videos may carry the hero flag.
create or replace function public.ott_cuts_hero_feature_guard()
returns trigger
language plpgsql
as $$
begin
  if new.homepage_feature is true and new.category is distinct from 'films' then
    raise exception 'homepage_feature can only be set on AI films cuts';
  end if;
  if new.homepage_feature is true and new.media_type is distinct from 'video' then
    raise exception 'homepage_feature can only be set on video cuts';
  end if;
  return new;
end;
$$;

drop trigger if exists ott_cuts_hero_feature_guard_trigger on public.ott_cuts;
create trigger ott_cuts_hero_feature_guard_trigger
  before insert or update of homepage_feature, category, media_type
  on public.ott_cuts
  for each row
  execute procedure public.ott_cuts_hero_feature_guard();

-- ------------------------------------------------------------
-- One-shot: pick which film is the hero (edit the slug).
-- Uncomment and run after the DDL above.
-- ------------------------------------------------------------
-- update public.ott_cuts set homepage_feature = false where homepage_feature = true;
-- update public.ott_cuts
--   set homepage_feature = true
-- where slug = 'your-film-slug'
--   and category = 'films'
--   and media_type = 'video'
--   and published = true;
