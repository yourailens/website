-- Full page color control per industry (admin-managed)

ALTER TABLE public.industries
  ADD COLUMN IF NOT EXISTS page_bg_color text,
  ADD COLUMN IF NOT EXISTS page_text_color text,
  ADD COLUMN IF NOT EXISTS page_muted_color text;

UPDATE public.industries
SET
  page_bg_color = COALESCE(page_bg_color, CASE theme_key
    WHEN 'real_estate' THEN '#f7f4ef'
    WHEN 'd2c' THEN '#faf5f6'
    ELSE '#f4f6fa'
  END),
  page_text_color = COALESCE(page_text_color, CASE theme_key
    WHEN 'real_estate' THEN '#1c1917'
    WHEN 'd2c' THEN '#4c0519'
    ELSE '#0f172a'
  END),
  page_muted_color = COALESCE(page_muted_color, CASE theme_key
    WHEN 'real_estate' THEN '#78716c'
    WHEN 'd2c' THEN '#9f1239'
    ELSE '#64748b'
  END);
