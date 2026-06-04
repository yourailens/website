-- Remove per-industry color / theme columns (one neutral site style for all industries)

ALTER TABLE public.industries DROP CONSTRAINT IF EXISTS industries_theme_key_check;

ALTER TABLE public.industries
  DROP COLUMN IF EXISTS page_bg_color,
  DROP COLUMN IF EXISTS page_text_color,
  DROP COLUMN IF EXISTS page_muted_color,
  DROP COLUMN IF EXISTS accent_color,
  DROP COLUMN IF EXISTS theme_key;
