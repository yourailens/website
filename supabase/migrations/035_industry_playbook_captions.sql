-- Captions / descriptions for visuals on industry & playbook pages
-- (industry_playbook_examples.caption already exists from 030; this adds hero caption)

ALTER TABLE public.industry_playbook_examples
  ADD COLUMN IF NOT EXISTS caption text;

COMMENT ON COLUMN public.industry_playbook_examples.caption IS
  'Short description under each visual in the playbook gallery';

ALTER TABLE public.industries
  ADD COLUMN IF NOT EXISTS hero_caption text;

COMMENT ON COLUMN public.industries.hero_caption IS
  'Caption under the main visual beside the industry Q&A answer';
