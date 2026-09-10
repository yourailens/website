-- ============================================================
-- 064 · Seed Chakrika team profile (published)
-- Portrait cropped from the provided still.
-- ============================================================

insert into public.studio_team_members (
  id,
  slug,
  name,
  role,
  short_bio,
  bio,
  portrait_url,
  published,
  sort_order
) values (
  'e1a7c5f4-8b6d-4e2c-b055-2f0c4c6f5e34',
  'chakrika',
  'Chakrika',
  'Process, data & AI',
  'Chemical process, a minor in AI, a data internship. She holds both rooms.',
  'Chakrika works across chemical process and data — process engineering and design, petrochemical engineering, with a weekend pharmaceutical internship in research last year.

The focus line is the AI and analysis track: a minor degree in artificial intelligence, a course in Python, and an internship in data analysis.

Event management at Waveyn Sports. Theatrix. UI/UX. Cheat Sugar. NSS. Cross-domain skills, held in the same person.',
  '/images/team/chakrika.png',
  true,
  50
)
on conflict (slug) do nothing;
