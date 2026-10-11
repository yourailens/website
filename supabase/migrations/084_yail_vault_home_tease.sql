-- ============================================================
-- 084 · Homepage vault tease rows (tilted tile wall)
-- home_tease       → include this cut in the homepage promo
-- home_tease_order → order within its category row (0 = first)
-- Max 6 per category is enforced in the admin API / UI.
-- ============================================================

alter table public.yail_vault_entries
  add column if not exists home_tease boolean not null default false;

alter table public.yail_vault_entries
  add column if not exists home_tease_order integer not null default 0;

comment on column public.yail_vault_entries.home_tease is
  'When true, this cut appears in the homepage YAIL Vault tilted-tile promo row for its category.';

comment on column public.yail_vault_entries.home_tease_order is
  'Sort position within the homepage tease row (lower = earlier).';

create index if not exists yail_vault_home_tease_idx
  on public.yail_vault_entries (category, home_tease, home_tease_order)
  where home_tease = true and published = true;
