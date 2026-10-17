-- ============================================================
-- 100 · Wipe Contacts (bio cards) + follow-up people
-- The Contacts page reads planner_bios, not planner_contacts.
-- 099 only wiped follow-up CRM rows — bios stayed.
-- Run in the Supabase SQL editor. Irreversible.
-- ============================================================

-- Follow-up logs + pipeline people (safe if already empty)
delete from public.planner_contact_entries;
delete from public.planner_contacts;

-- Contact cards on /planner/follow-ups/contacts
delete from public.planner_bios;
