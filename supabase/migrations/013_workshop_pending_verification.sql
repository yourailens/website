-- Manual payment verification: after screenshot upload, status is pending_verification until admin approves.
-- Adds audit column and extends status check (run after 012_workshop_payment_fields.sql).

alter table public.workshop_registrations
  add column if not exists payment_verified_at timestamptz;

alter table public.workshop_registrations drop constraint if exists workshop_registrations_status_check;

alter table public.workshop_registrations
  add constraint workshop_registrations_status_check
  check (
    status = any (
      array[
        'pending_payment'::text,
        'pending_verification'::text,
        'registered'::text,
        'cancelled'::text
      ]
    )
  );

comment on column public.workshop_registrations.payment_verified_at is
  'Set when admin approves payment (status becomes registered).';
