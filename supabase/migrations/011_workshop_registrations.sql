-- Workshop / event signups (AI Creator Workshop, future events)

create table if not exists public.workshop_registrations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  name text not null,
  email text not null,
  phone text,
  company text,
  notes text,
  status text not null default 'registered'
    check (status in ('registered', 'cancelled')),
  created_at timestamptz not null default now()
);

create unique index if not exists workshop_registrations_event_email_lower
  on public.workshop_registrations (event_slug, lower(email));

create index if not exists workshop_registrations_event_idx on public.workshop_registrations (event_slug);
create index if not exists workshop_registrations_created_idx on public.workshop_registrations (created_at desc);

alter table public.workshop_registrations enable row level security;

-- Reads/writes via Next.js API (service role). No public policies.
