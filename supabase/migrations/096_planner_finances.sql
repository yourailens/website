-- ============================================================
-- 096 · Planner finances (expenses + revenue)
-- Money out and money in. Net = revenue − expenses.
-- paid_at defaults to now() when the row is created.
-- Run in the Supabase SQL editor after 088_planner.sql.
-- Private: service role from /api/planner/* only. No public policies.
-- ============================================================

create table if not exists public.planner_finance_entries (
  id              uuid           primary key default gen_random_uuid(),
  kind            text           not null
                                 check (kind in ('expense', 'revenue')),
  amount          numeric(14, 2) not null check (amount > 0),
  currency        text           not null default 'INR',
  title           text           not null,
  party           text           not null,
  payment_method  text           not null
                                 check (payment_method in ('upi', 'bank')),
  notes           text,
  paid_at         timestamptz    not null default now(),
  created_by      uuid           not null references public.planner_members(id) on delete restrict,
  created_at      timestamptz    not null default now(),
  updated_at      timestamptz    not null default now()
);

create index if not exists planner_finance_kind_idx
  on public.planner_finance_entries (kind, paid_at desc);

create index if not exists planner_finance_paid_idx
  on public.planner_finance_entries (paid_at desc);

create index if not exists planner_finance_created_by_idx
  on public.planner_finance_entries (created_by);

drop trigger if exists planner_finance_entries_updated_at on public.planner_finance_entries;
create trigger planner_finance_entries_updated_at
  before update on public.planner_finance_entries
  for each row execute procedure public.planner_set_updated_at();

alter table public.planner_finance_entries enable row level security;

-- No public policies. Next.js reads and writes with the service role.
