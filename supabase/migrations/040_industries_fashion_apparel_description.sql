-- ════════════════════════════════════════════════════════════
-- 040 · Fashion & Apparel hub description (drop "Show…" copy)
-- Run AFTER 039_industries_original_three_descriptions.sql (Supabase SQL Editor).
-- ════════════════════════════════════════════════════════════

UPDATE public.industries SET
  description = 'For fashion and apparel brands who need editorial stills, ecommerce grades, launch films, and creator avatars — one visual language from lookbook to PDP to Reels across every seasonal drop.',
  updated_at = now()
WHERE slug = 'fashion-apparel';
