-- ============================================================
-- 061 · Seed Rutuja team profile (published)
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
  'b8d4f2c1-5e3a-4b9f-8d22-9c7f1f3e2b01',
  'rutuja',
  'Rutuja',
  'Marketing, strategy & consultancy',
  'IEM, managerial work. She finds the gap in the market, then writes the line that fills it.',
  'Rutuja comes from IEM with a managerial lean — marketing, strategy, and consultancy.

She did digital marketing at Cheat Sugar. A project internship at Ebin India covered LinkedIn posts and email marketing. She was a project intern at Gemini Corporation. UoV business strategy courses sit with a Google Digital Marketing course.

On campus she was debate club president at RIT, did PR and hospitality at Theatrix, and was on the E-Cell sponsorship team. NSS. Cognizant hackathon, second phase: build an AI agent. Bootcamps interviewing people in-domain. Mackezine forward program — a bootcamp into consulting roles. Drop simulation on marketing.',
  '/images/team/rutuja.png',
  true,
  20
)
on conflict (slug) do nothing;
