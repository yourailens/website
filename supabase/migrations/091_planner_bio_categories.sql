-- ============================================================
-- 091 · Contact categories
-- Every bio card is a Lead, a Sponsor, or Misc.
-- Lead labels: Warm, Hot, Cold, Client
-- Sponsor labels: Big, Small, Medium
-- Misc labels are free text, reused from earlier cards.
-- Run in the Supabase SQL editor after 090_planner_bios.sql.
-- ============================================================

alter table public.planner_bios
  add column if not exists category text;

alter table public.planner_bios
  add column if not exists label text;

update public.planner_bios
set category = 'lead',
    label = 'Client'
where category is null
  and lower(coalesce(relationship, '')) = 'client';

update public.planner_bios
set category = 'misc',
    label = nullif(trim(relationship), '')
where category is null;

alter table public.planner_bios
  alter column category set default 'misc';

alter table public.planner_bios
  alter column category set not null;

alter table public.planner_bios
  drop constraint if exists planner_bios_category_check;

alter table public.planner_bios
  add constraint planner_bios_category_check
  check (category in ('lead', 'sponsor', 'misc'));

create index if not exists planner_bios_category_idx
  on public.planner_bios (category, label);
