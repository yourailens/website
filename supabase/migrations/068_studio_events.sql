-- ============================================================
-- 068 · Studio events (OTT listings)
-- Meetups, workshops, screenings editable from admin.
-- Run this in the Supabase SQL editor (or via CLI migrate).
-- ============================================================

create table if not exists public.studio_events (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null unique,
  title         text        not null,
  subtitle      text,
  description   text,
  event_type    text        not null default 'meetup'
                            check (event_type in ('meetup', 'workshop', 'screening', 'other')),
  venue         text,
  location_label text,
  starts_at     timestamptz,
  ends_at       timestamptz,
  date_label    text,
  cta_label     text,
  href          text,
  image_url     text,
  published     boolean     not null default true,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),

  constraint studio_events_slug_format check (slug ~ '^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$')
);

create or replace function public.studio_events_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists studio_events_updated_at_trigger on public.studio_events;
create trigger studio_events_updated_at_trigger
  before update on public.studio_events
  for each row execute procedure public.studio_events_set_updated_at();

create index if not exists studio_events_list_idx
  on public.studio_events (published, sort_order, starts_at nulls last);

alter table public.studio_events enable row level security;

drop policy if exists "studio_events_public_read" on public.studio_events;
create policy "studio_events_public_read"
  on public.studio_events for select
  using (published = true);

drop policy if exists "studio_events_service_all" on public.studio_events;
create policy "studio_events_service_all"
  on public.studio_events for all
  using (true) with check (true);

-- Seed: YAIL 01 first, workshop second (safe to re-run)
insert into public.studio_events (
  slug, title, subtitle, description, event_type, venue, location_label,
  date_label, cta_label, href, published, sort_order
)
values
  (
    'yail-01-ai-creators-meetup',
    'YAIL 01: AI Creators Meetup',
    'The Theatre Showcase',
    'Our first creators meetup. Details coming soon.',
    'meetup',
    'The Theatre Showcase',
    null,
    'Details soon',
    'Coming soon',
    null,
    true,
    1
  ),
  (
    'ai-creator-workshop',
    'AI Creator Workshop',
    'AI workflow knowledge: from zero to advanced in two days',
    'Hands-on workshop for creators, marketers, and filmmakers.',
    'workshop',
    null,
    'Live online',
    'May 6 and 7, 2026',
    'View details & register',
    '/events/ai-creator-workshop',
    true,
    2
  )
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  event_type = excluded.event_type,
  venue = excluded.venue,
  location_label = excluded.location_label,
  date_label = excluded.date_label,
  cta_label = excluded.cta_label,
  href = excluded.href,
  published = excluded.published,
  sort_order = excluded.sort_order,
  updated_at = now();
