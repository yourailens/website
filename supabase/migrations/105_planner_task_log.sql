-- ============================================================
-- 105 · Task progress and roadblocks
-- A log on each planner task. An open roadblock is unresolved
-- until someone marks it sorted.
-- Run in the Supabase SQL editor after 104.
-- Private: service role from /api/planner/* only. No public policies.
-- ============================================================

create table if not exists public.planner_task_entries (
  id          uuid        primary key default gen_random_uuid(),
  task_id     uuid        not null references public.planner_tasks(id) on delete cascade,
  kind        text        not null
                          check (kind in ('progress', 'roadblock')),
  body        text        not null,
  resolved_at timestamptz,
  created_by  uuid        not null references public.planner_members(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create index if not exists planner_task_entries_task_idx
  on public.planner_task_entries (task_id, created_at desc);

alter table public.planner_task_entries enable row level security;

-- No public policies. Next.js reads and writes with the service role.
