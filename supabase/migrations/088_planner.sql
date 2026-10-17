-- ============================================================
-- 088 · Studio Planner (team OS)
-- Members · tasks · follow-ups (CRM) · people feed · notes
-- Run in Supabase SQL editor. Private to signed-in planner users
-- (service role from Next.js APIs — no public anon policies).
-- ============================================================

-- Members -----------------------------------------------------------------
create table if not exists public.planner_members (
  id              uuid        primary key default gen_random_uuid(),
  email           text        not null unique,
  password_hash   text        not null,
  display_name    text        not null,
  slug            text        not null unique,
  role_title      text,
  is_ceo          boolean     not null default false,
  active          boolean     not null default true,
  avatar_url      text,
  bio             text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists planner_members_active_idx
  on public.planner_members (active, display_name);

-- Tasks (studio planner) --------------------------------------------------
create table if not exists public.planner_tasks (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  notes           text,
  deadline        date,
  status          text        not null default 'open'
                              check (status in ('open', 'doing', 'done', 'blocked')),
  created_by      uuid        not null references public.planner_members(id) on delete restrict,
  assignee_id     uuid        not null references public.planner_members(id) on delete restrict,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists planner_tasks_assignee_idx
  on public.planner_tasks (assignee_id, status, deadline nulls last);

create index if not exists planner_tasks_rail_idx
  on public.planner_tasks (status, sort_order desc, created_at desc);

-- Follow-up CRM -----------------------------------------------------------
create table if not exists public.planner_contacts (
  id                uuid        primary key default gen_random_uuid(),
  name              text        not null,
  company           text,
  role_title        text,
  phone             text,
  email             text,
  website           text,
  notes             text,
  -- pipeline
  contacted         boolean     not null default false,
  status            text        not null default 'new'
                                check (status in ('new', 'contacted', 'active', 'won', 'lost', 'paused')),
  next_follow_up_at timestamptz,
  follow_up_booked  boolean     not null default false,
  immediate_need    text,
  requirement       text,
  pitch             text,
  owner_id          uuid        references public.planner_members(id) on delete set null,
  created_by        uuid        not null references public.planner_members(id) on delete restrict,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists planner_contacts_pipeline_idx
  on public.planner_contacts (status, next_follow_up_at nulls last, updated_at desc);

create index if not exists planner_contacts_owner_idx
  on public.planner_contacts (owner_id, updated_at desc);

-- Chronological bullet log on a contact (calls, outcomes, asks, pitches…)
create table if not exists public.planner_contact_entries (
  id              uuid        primary key default gen_random_uuid(),
  contact_id      uuid        not null references public.planner_contacts(id) on delete cascade,
  kind            text        not null default 'note'
                              check (kind in (
                                'meet', 'contacted', 'outcome', 'next', 'requirement',
                                'pitch', 'note', 'scheduled', 'ask'
                              )),
  body            text        not null,
  scheduled_at    timestamptz,
  created_by      uuid        not null references public.planner_members(id) on delete restrict,
  created_at      timestamptz not null default now()
);

create index if not exists planner_contact_entries_contact_idx
  on public.planner_contact_entries (contact_id, created_at desc);

-- Meetings ----------------------------------------------------------------
create table if not exists public.planner_meetings (
  id              uuid        primary key default gen_random_uuid(),
  title           text        not null,
  notes           text,
  starts_at       timestamptz,
  ends_at         timestamptz,
  created_by      uuid        not null references public.planner_members(id) on delete restrict,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.planner_meeting_attendees (
  meeting_id      uuid not null references public.planner_meetings(id) on delete cascade,
  member_id       uuid not null references public.planner_members(id) on delete cascade,
  primary key (meeting_id, member_id)
);

create index if not exists planner_meetings_starts_idx
  on public.planner_meetings (starts_at desc nulls last);

-- Twitter-style posts (person page + common feed) -------------------------
create table if not exists public.planner_posts (
  id              uuid        primary key default gen_random_uuid(),
  author_id       uuid        not null references public.planner_members(id) on delete cascade,
  body            text        not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists planner_posts_feed_idx
  on public.planner_posts (created_at desc);

create index if not exists planner_posts_author_idx
  on public.planner_posts (author_id, created_at desc);

create table if not exists public.planner_post_images (
  id              uuid        primary key default gen_random_uuid(),
  post_id         uuid        not null references public.planner_posts(id) on delete cascade,
  url             text        not null,
  label           text,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists planner_post_images_post_idx
  on public.planner_post_images (post_id, sort_order);

-- Person notes (sub-pages / running notes) --------------------------------
create table if not exists public.planner_notes (
  id              uuid        primary key default gen_random_uuid(),
  member_id       uuid        not null references public.planner_members(id) on delete cascade,
  author_id       uuid        not null references public.planner_members(id) on delete restrict,
  title           text        not null,
  body            text        not null default '',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists planner_notes_member_idx
  on public.planner_notes (member_id, updated_at desc);

create table if not exists public.planner_note_images (
  id              uuid        primary key default gen_random_uuid(),
  note_id         uuid        not null references public.planner_notes(id) on delete cascade,
  url             text        not null,
  label           text,
  sort_order      integer     not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists planner_note_images_note_idx
  on public.planner_note_images (note_id, sort_order);

-- updated_at triggers -----------------------------------------------------
create or replace function public.planner_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists planner_members_updated_at on public.planner_members;
create trigger planner_members_updated_at
  before update on public.planner_members
  for each row execute procedure public.planner_set_updated_at();

drop trigger if exists planner_tasks_updated_at on public.planner_tasks;
create trigger planner_tasks_updated_at
  before update on public.planner_tasks
  for each row execute procedure public.planner_set_updated_at();

drop trigger if exists planner_contacts_updated_at on public.planner_contacts;
create trigger planner_contacts_updated_at
  before update on public.planner_contacts
  for each row execute procedure public.planner_set_updated_at();

drop trigger if exists planner_meetings_updated_at on public.planner_meetings;
create trigger planner_meetings_updated_at
  before update on public.planner_meetings
  for each row execute procedure public.planner_set_updated_at();

drop trigger if exists planner_posts_updated_at on public.planner_posts;
create trigger planner_posts_updated_at
  before update on public.planner_posts
  for each row execute procedure public.planner_set_updated_at();

drop trigger if exists planner_notes_updated_at on public.planner_notes;
create trigger planner_notes_updated_at
  before update on public.planner_notes
  for each row execute procedure public.planner_set_updated_at();

-- RLS: block anon/authenticated; Next uses service role --------------------
alter table public.planner_members enable row level security;
alter table public.planner_tasks enable row level security;
alter table public.planner_contacts enable row level security;
alter table public.planner_contact_entries enable row level security;
alter table public.planner_meetings enable row level security;
alter table public.planner_meeting_attendees enable row level security;
alter table public.planner_posts enable row level security;
alter table public.planner_post_images enable row level security;
alter table public.planner_notes enable row level security;
alter table public.planner_note_images enable row level security;

-- No public policies — all access via service role from /api/planner/*
