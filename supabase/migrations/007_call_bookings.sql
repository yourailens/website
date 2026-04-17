-- Existing projects: booking table for website-native scheduling flow.

create table if not exists public.call_bookings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  brand text,
  project_summary text not null,
  budget text,
  scheduled_at timestamptz not null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'meet_failed', 'cancelled')),
  google_event_id text,
  google_meet_url text,
  meet_error text,
  created_at timestamptz not null default now()
);

create index if not exists call_bookings_scheduled_at_idx on public.call_bookings (scheduled_at);
create index if not exists call_bookings_email_idx on public.call_bookings (email);

alter table public.call_bookings enable row level security;

drop policy if exists "Public insert call_bookings" on public.call_bookings;
create policy "Public insert call_bookings"
  on public.call_bookings
  for insert
  with check (true);

-- Keep read restricted; reads happen via server role APIs.
