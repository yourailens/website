-- ============================================================
-- 063 · Seed Chinmay team profile (published)
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
  'd0f6b4e3-7a5c-4d1b-af44-1e9b3b5e4d23',
  'chinmay',
  'Chinmay',
  'Process design & simulation',
  'Chemical plant, simulation, the model that holds it. He designs the process, then teaches it to learn.',
  'Chinmay continues in chemical — process plant designer, R&D engineering in chemical plants, process design or simulation.

He is working with Sravati AI Technologies on a problem statement to design a whole process plant to a production target. Simulation software: DWSIM and ASPEN. He has created and printed 3D models.

Paper publication, co-author: research on free fatty acid reduction — result analysis, organized data analysis, visualization, and a machine learning model. Editha: research member in image navigation systems for one year. Conferences: IICHE SchemCon, BioChess by SIT. Competitions: second in IICHE Chemathon.

Cross-domain: chemical plus data analysis — NumPy, KNN, linear regressions — plus Python, C, AutoCAD, Fusion 360. Independent work: predictive analysis of chemical reactions using ML, and a digital twin for a chemical reactor using ML and RL models.',
  '/images/team/chinmay.png',
  true,
  40
)
on conflict (slug) do nothing;
