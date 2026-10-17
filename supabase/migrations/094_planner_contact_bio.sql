-- Tie a follow up to the person in Contacts.
-- Safe to run more than once. Run after 090.

alter table public.planner_contacts
  add column if not exists bio_id uuid references public.planner_bios(id) on delete set null;

create index if not exists planner_contacts_bio_idx
  on public.planner_contacts (bio_id);
