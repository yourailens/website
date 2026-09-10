-- ============================================================
-- 060 · Seed Lalitha team profile (published)
-- Portrait is a local placeholder until a real still is uploaded.
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
  'a7c3e1b0-4d2f-4a8e-9c11-8b6f0e2d1a90',
  'lalitha',
  'Lalitha',
  'Graphic design & picture',
  'Chemical engineering, managerial roles. She designs, cuts, and keeps the numbers honest.',
  'Lalitha comes from chemical engineering with a managerial lean — plant data, information, and how work actually moves, not a lab-paper track.

She interned as a data analyst, including data analysis in Excel, and holds a GATE rank certificate in chemical reaction engineering. CAD engineering drawing sits on that same technical line. Operations research and mathematical modeling are part of how she thinks.

On the picture side she has been a video editor and graphic designer at Cheat Sugar, a graphic designer for TEDx RIT, and part of UI/UX at RIT. She was in 19A design club (literature club), took a mini design project, taught English and Math at a government school, and served with NSS. Tech fest: chemical quiz.',
  '/images/team/lalitha.png',
  true,
  10
)
on conflict (slug) do nothing;
