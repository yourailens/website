-- Existing projects: add Google Meet tracking fields for call bookings.
-- Safe to run even if columns already exist.

alter table public.call_bookings
  add column if not exists google_event_id text;

alter table public.call_bookings
  add column if not exists google_meet_url text;

alter table public.call_bookings
  add column if not exists meet_error text;
