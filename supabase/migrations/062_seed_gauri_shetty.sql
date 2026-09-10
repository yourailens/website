-- ============================================================
-- 062 · Seed Gauri Shetty team profile (published)
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
  'c9e5a3d2-6f4b-4c0a-9e33-0d8a2a4f3c12',
  'gauri-shetty',
  'Gauri Shetty',
  'Product, data & electronics',
  'Product, data, UI, the board underneath. She ships the dashboard and the circuit it runs on.',
  'Gauri Shetty works across product management, data analysis, UI/UX, and electronics — semiconductor, PLC, embedded systems. Math comes in because of the coding.

An STM32 microcontroller internship covered a motor-actuation project: constant speed with variable weight. TI and Qualcomm sit on that electronics line. Ongoing research: an AI-powered smart pill dispenser with face recognition.

She was Theatrix co-design head, did UI/UX, social media management at Aarya AI, and n8n agentic AI. A student-performance analysis web app and dashboard — Claude-driven. AWS hackathon: an AI voice lead-qualification agent, a sales voice agent that filters leads on the purchase list to the most viable. Flutter fitness app: custom workouts, recipes, progress tracking. Math tutor at Auriv Learning. NSS.',
  '/images/team/gauri-shetty.png',
  true,
  30
)
on conflict (slug) do nothing;
