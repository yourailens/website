-- ============================================================
-- 083 · Per-page vault heroes
-- featured      → All labs hero (existing)
-- category_hero → hero on Filmmaking or Ads page (one per category)
-- genre_hero    → hero on that cut’s Genre page (managed in app)
-- ============================================================

alter table public.yail_vault_entries
  add column if not exists category_hero boolean not null default false;

alter table public.yail_vault_entries
  add column if not exists genre_hero boolean not null default false;

comment on column public.yail_vault_entries.category_hero is
  'When true, this cut is the hero on its category page (AI Filmmaking or AI Ads).';

comment on column public.yail_vault_entries.genre_hero is
  'When true, this cut is the hero on its Genre page under Filmmaking.';

-- One category-page hero per category
create unique index if not exists yail_vault_one_category_hero
  on public.yail_vault_entries (category)
  where category_hero = true;
