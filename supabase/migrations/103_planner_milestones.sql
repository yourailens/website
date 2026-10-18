-- ============================================================
-- 103 · Planner milestones (studio targets)
-- A destination the studio is marching toward, plus who is on it
-- and a log of moves. Run in the Supabase SQL editor after 102.
-- Private: service role from /api/planner/* only. No public policies.
-- ============================================================

create table if not exists public.planner_milestones (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  intent      text,
  done_when   text,
  status      text        not null default 'moving'
                          check (status in ('queued', 'moving', 'stuck', 'landed')),
  target_on   date,
  created_by  uuid        not null references public.planner_members(id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists planner_milestones_status_idx
  on public.planner_milestones (status);

create index if not exists planner_milestones_target_idx
  on public.planner_milestones (target_on);

create table if not exists public.planner_milestone_members (
  milestone_id uuid not null references public.planner_milestones(id) on delete cascade,
  member_id    uuid not null references public.planner_members(id) on delete cascade,
  primary key (milestone_id, member_id)
);

create index if not exists planner_milestone_members_member_idx
  on public.planner_milestone_members (member_id);

create table if not exists public.planner_milestone_entries (
  id           uuid        primary key default gen_random_uuid(),
  milestone_id uuid        not null references public.planner_milestones(id) on delete cascade,
  kind         text        not null default 'move'
                           check (kind in ('move', 'decision', 'blocker', 'proof')),
  body         text        not null,
  created_by   uuid        not null references public.planner_members(id) on delete restrict,
  created_at   timestamptz not null default now()
);

create index if not exists planner_milestone_entries_milestone_idx
  on public.planner_milestone_entries (milestone_id, created_at desc);

drop trigger if exists planner_milestones_updated_at on public.planner_milestones;
create trigger planner_milestones_updated_at
  before update on public.planner_milestones
  for each row execute procedure public.planner_set_updated_at();

alter table public.planner_milestones enable row level security;
alter table public.planner_milestone_members enable row level security;
alter table public.planner_milestone_entries enable row level security;

-- No public policies. Next.js reads and writes with the service role.
