-- ============================================================
-- 090 · Planner contacts directory (bio cards)
-- Separate from planner_contacts, which is the follow up pipeline.
-- Run in the Supabase SQL editor after 088_planner.sql.
-- Private: service role from /api/planner/* only. No public policies.
-- ============================================================

create table if not exists public.planner_bios (
  id              uuid        primary key default gen_random_uuid(),
  slug            text        not null unique,
  full_name       text        not null,
  preferred_name  text,
  pronouns        text,
  company         text,
  role_title      text,
  department      text,
  email           text,
  phone           text,
  whatsapp        text,
  website         text,
  linkedin        text,
  instagram       text,
  city            text,
  country         text,
  industry        text,
  languages       text,
  category        text        not null default 'misc'
                              check (category in ('lead', 'sponsor', 'misc')),
  label           text,
  relationship    text,
  source          text,
  introduced_by   text,
  birthday        date,
  bio             text,
  notes           text,
  owner_id        uuid        references public.planner_members(id) on delete set null,
  created_by      uuid        not null references public.planner_members(id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists planner_bios_name_idx
  on public.planner_bios (full_name);

create index if not exists planner_bios_owner_idx
  on public.planner_bios (owner_id);

drop trigger if exists planner_bios_updated_at on public.planner_bios;
create trigger planner_bios_updated_at
  before update on public.planner_bios
  for each row execute procedure public.planner_set_updated_at();

alter table public.planner_bios enable row level security;

-- No public policies. Next.js reads and writes with the service role.
