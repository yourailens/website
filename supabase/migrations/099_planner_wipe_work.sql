-- ============================================================
-- 099 · Wipe planner work data
-- Deletes ALL tasks, contacts, and follow-up logs.
-- Does NOT touch members, bios, directory, finances, feed, notes.
-- Run in the Supabase SQL editor. Irreversible.
-- ============================================================

-- Follow-up timeline bullets (also cascade when contacts go)
delete from public.planner_contact_entries;

-- Contacts = the follow-up CRM people
delete from public.planner_contacts;

-- Tasks
delete from public.planner_tasks;
