-- Payment step: UPI phone + screenshot URL; pending until payment confirmed

alter table public.workshop_registrations
  add column if not exists payment_phone text,
  add column if not exists payment_screenshot_url text;

alter table public.workshop_registrations drop constraint if exists workshop_registrations_status_check;

alter table public.workshop_registrations
  add constraint workshop_registrations_status_check
  check (status = any (array['pending_payment'::text, 'registered'::text, 'cancelled'::text]));
