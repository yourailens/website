-- ============================================================
-- 095 · Planner directory (link cards)
-- Drive, Instagram, website, and other links the team keeps.
-- Run in the Supabase SQL editor after 088_planner.sql.
-- Private: service role from /api/planner/* only. No public policies.
-- ============================================================

create table if not exists public.planner_directory (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  blurb       text,
  kind        text        not null default 'other'
                          check (kind in ('drive', 'instagram', 'website', 'doc', 'other')),
  url         text        not null,
  label       text,
  notes       text,
  created_by  uuid        not null references public.planner_members(id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists planner_directory_kind_idx
  on public.planner_directory (kind);

create index if not exists planner_directory_title_idx
  on public.planner_directory (title);

create index if not exists planner_directory_created_idx
  on public.planner_directory (created_at desc);

drop trigger if exists planner_directory_updated_at on public.planner_directory;
create trigger planner_directory_updated_at
  before update on public.planner_directory
  for each row execute procedure public.planner_set_updated_at();

alter table public.planner_directory enable row level security;

-- No public policies. Next.js reads and writes with the service role.
