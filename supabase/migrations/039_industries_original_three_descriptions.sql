-- ════════════════════════════════════════════════════════════
-- 039 · Original 3 industry hub descriptions (drop "Show…" copy)
-- Run AFTER 038_industries_original_three_copy.sql (Supabase SQL Editor).
-- Hub cards use `description`; replaces sales-deck "Show X how Y" with deliverable-forward lines
-- aligned with Fashion/Food/Healthcare/Education/Hospitality tone in 037.
-- ════════════════════════════════════════════════════════════

UPDATE public.industries SET
  description = 'For brokers and developers who need virtual staging, exterior renders, avatar hosts, and motion tours — listing stills, pre-launch campaigns, and channel marketing without a crew on every property.',
  updated_at = now()
WHERE slug = 'real-estate';

UPDATE public.industries SET
  description = 'For D2C and retail brands who need packshots, paid variants, launch films, creator avatars, and packaging — shipped on the cadence of every drop, channel, and season.',
  updated_at = now()
WHERE slug = 'd2c-ecommerce';

UPDATE public.industries SET
  description = 'For product marketing and revenue teams who need UI-in-context, explainers, presenter avatars, social, and sales enablement — built for weekly ship cycles and launch deadlines.',
  updated_at = now()
WHERE slug = 'saas-b2b';
