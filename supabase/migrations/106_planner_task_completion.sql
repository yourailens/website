-- ============================================================
-- 106 · Task completion note
-- The assignee writes what got finished before a task can be marked done.
-- Run in the Supabase SQL editor after 105.
-- ============================================================

alter table public.planner_tasks
  add column if not exists completion_note text;
