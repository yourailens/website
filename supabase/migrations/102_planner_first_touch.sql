-- ============================================================
-- 102 · First touch on a follow up
-- How the relationship started: who reached out, which channel,
-- and where that first move stands (e.g. waiting for reply).
-- Run in the Supabase SQL editor after 088 / 093.
-- ============================================================

alter table public.planner_contacts
  add column if not exists first_touch_side text
    check (first_touch_side is null or first_touch_side in ('us', 'them'));

alter table public.planner_contacts
  add column if not exists first_touch_channel text
    check (
      first_touch_channel is null
      or first_touch_channel in (
        'email', 'call', 'whatsapp', 'instagram', 'linkedin', 'meet', 'referral', 'other'
      )
    );

alter table public.planner_contacts
  add column if not exists first_touch_note text;

comment on column public.planner_contacts.first_touch_side is
  'Who started it: us (outbound) or them (inbound).';
comment on column public.planner_contacts.first_touch_channel is
  'Channel of the first interaction.';
comment on column public.planner_contacts.first_touch_note is
  'Where that first move stands, e.g. Waiting for reply.';
