-- ============================================================
-- 104 · Milestone depth
-- Season, one owner, proof links, tasks under a target,
-- and dependencies between targets.
-- Run in the Supabase SQL editor after 103.
-- Private: service role from /api/planner/* only. No public policies.
-- ============================================================

alter table public.planner_milestones
  add column if not exists horizon text not null default 'quarter';

do $$ begin
  alter table public.planner_milestones
    add constraint planner_milestones_horizon_check
    check (horizon in ('quarter', 'someday'));
exception when duplicate_object then null;
end $$;

alter table public.planner_milestone_members
  add column if not exists role text not null default 'helper';

do $$ begin
  alter table public.planner_milestone_members
    add constraint planner_milestone_members_role_check
    check (role in ('owner', 'helper'));
exception when duplicate_object then null;
end $$;

create unique index if not exists planner_milestone_one_owner_idx
  on public.planner_milestone_members (milestone_id)
  where role = 'owner';

alter table public.planner_milestone_entries
  add column if not exists proof_url text,
  add column if not exists proof_ref text;

alter table public.planner_tasks
  add column if not exists milestone_id uuid references public.planner_milestones(id) on delete set null;

create index if not exists planner_tasks_milestone_idx
  on public.planner_tasks (milestone_id);

create table if not exists public.planner_milestone_deps (
  milestone_id uuid not null references public.planner_milestones(id) on delete cascade,
  blocked_by   uuid not null references public.planner_milestones(id) on delete cascade,
  primary key (milestone_id, blocked_by),
  check (milestone_id <> blocked_by)
);

create index if not exists planner_milestone_deps_blocked_idx
  on public.planner_milestone_deps (blocked_by);

alter table public.planner_milestone_deps enable row level security;

-- No public policies. Next.js reads and writes with the service role.
