-- ─────────────────────────────────────────────────────────────────────────────
-- 027_services_update.sql
-- Revised service packages — generous inclusions, strong value positioning
-- Run AFTER 026_services.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Brand Kit  ─ ₹10,000  (new entry-level) ───────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, traditional_value,
  accent_color, sort_order
) VALUES (
  'brand-identity', 'Brand Kit', 'brand-kit',
  'Everything to look like a real brand',
  'The perfect starting point. A complete AI-powered brand foundation — intro video, product visuals, social creatives, and a brand guide — all delivered in 24 hours at a price that makes sense for early-stage brands.',
  10000, 40000, 'one-time', 1,
  false, false, true,
  'Starter', 'blue',
  '["1 × brand intro video (15s)", "10 × AI product / brand visuals", "10 × social media creatives (Reels, Stories, Feed)", "5 × ad-ready creatives", "Brand colour + font guide (PDF)", "Logo usage rules", "2 revision rounds", "24-hour delivery"]',
  '["MP4 intro video", "High-res image pack (PNG/JPG)", "Social creatives pack", "Brand guide PDF"]',
  ARRAY['New Brands','Solopreneurs','D2C Startups'],
  40000,
  '#0ea5e9', 0
)
ON CONFLICT (slug) DO UPDATE SET
  name             = EXCLUDED.name,
  tagline          = EXCLUDED.tagline,
  description      = EXCLUDED.description,
  price            = EXCLUDED.price,
  original_price   = EXCLUDED.original_price,
  unit             = EXCLUDED.unit,
  delivery_days    = EXCLUDED.delivery_days,
  is_popular       = EXCLUDED.is_popular,
  is_featured      = EXCLUDED.is_featured,
  is_published     = EXCLUDED.is_published,
  badge_label      = EXCLUDED.badge_label,
  badge_color      = EXCLUDED.badge_color,
  includes         = EXCLUDED.includes,
  deliverables     = EXCLUDED.deliverables,
  best_for         = EXCLUDED.best_for,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 2. Campaign Sprint  ─ ₹30,000  (flagship) ────────────────────────────────
UPDATE services SET
  tagline          = 'Launch-ready in 48 hours. 10 films. 50+ assets.',
  description      = 'Everything a brand needs for one high-converting AI campaign. Ten films, fifty-plus visual assets, twenty social posters, and ad copy for every format — all in 48 hours. The package most growing brands start with.',
  price            = 30000,
  original_price   = 200000,
  unit             = 'per campaign',
  delivery_days    = 2,
  is_popular       = true,
  is_featured      = true,
  badge_label      = 'Most Popular',
  badge_color      = 'blue',
  includes         = '["10 × AI ad films (15–30s each)", "50+ brand asset pack (product stills + creatives)", "20 × posters across all social platforms", "Ad copy for every creative", "5 × platform-optimised video cuts (Reels, Stories, Feed, YouTube Shorts)", "3 revision rounds", "48-hour delivery"]',
  deliverables     = '["All MP4 video files (full-res)", "50+ image files (PNG/JPG, print-ready)", "Social poster pack (all sizes)", "Copy document", "Platform-ready compressed set"]',
  best_for         = ARRAY['D2C Brands','Product Launches','Funded Startups'],
  traditional_value= 200000,
  accent_color     = '#2563eb',
  sort_order       = 1
WHERE slug = 'campaign-sprint';

-- ── 3. Brand Film  ─ ₹50,000 ─────────────────────────────────────────────────
UPDATE services SET
  tagline          = 'One cinematic film. Multiple formats.',
  description      = 'A premium AI-generated hero brand film (60–90s) with all cut-downs and stills baked in. One brief, one turnaround, ready to run on every channel.',
  price            = 50000,
  original_price   = 250000,
  unit             = 'per film',
  delivery_days    = 4,
  includes         = '["1 × hero brand film (60–90s, cinematic grade)", "1 × 30s cut-down", "1 × 15s teaser", "1 × 9s bumper", "15 × AI stills sourced from the film", "5 × platform-sized video versions", "Full colour grade + sound mix", "3 revision rounds"]',
  deliverables     = '["Master MP4 (4K)", "Web-optimised H264 set", "All platform cuts", "15 high-res stills"]',
  best_for         = ARRAY['Established Brands','Series A+ Startups','Luxury Products'],
  traditional_value= 250000,
  accent_color     = '#1e40af',
  sort_order       = 4
WHERE slug = 'brand-film';

-- ── 4. Full Launch Pack  ─ ₹1,20,000 ─────────────────────────────────────────
UPDATE services SET
  tagline          = '30 films. 200+ assets. Complete launch in 5 days.',
  description      = 'The ultimate AI-powered product launch kit. Thirty films, 200-plus visual assets, a full social suite, print posters, pitch deck visuals, and an AI brand avatar — everything you need to dominate every channel from day one.',
  price            = 120000,
  original_price   = 600000,
  unit             = 'per launch',
  delivery_days    = 5,
  is_featured      = true,
  badge_label      = 'Best Value',
  badge_color      = 'green',
  includes         = '["30 × AI films (all formats: 60s, 30s, 15s, 9s)", "200+ brand asset pack (stills, creatives, banners)", "Complete social media suite (all platforms, all sizes)", "10 × print-ready posters / OOH banners (300 DPI)", "1 × AI brand avatar (5 styled looks)", "5 × pitch deck slides", "Full ad copy library", "5 revision rounds", "Dedicated creative lead", "5-day delivery"]',
  deliverables     = '["All MP4 video files", "200+ image asset library", "Print-ready PDFs", "Pitch deck (PowerPoint + Figma)", "AI avatar reference pack", "Full ad copy doc"]',
  best_for         = ARRAY['Funded Startups','FMCG Brands','E-commerce'],
  traditional_value= 600000,
  accent_color     = '#16a34a',
  sort_order       = 2
WHERE slug = 'full-launch-pack';

-- ── 5. Monthly Content Engine  ─ ₹75,000 / month ────────────────────────────
UPDATE services SET
  tagline          = '20 films + 100 assets. Every single month.',
  description      = 'Your own AI content team on a monthly retainer. Twenty campaign-grade videos, 100-plus brand assets, a weekly social drop, and priority 24-hour turnaround. The brands that never run out of content win.',
  price            = 75000,
  original_price   = NULL,
  unit             = 'per month',
  delivery_days    = 1,
  badge_label      = 'Retainer',
  badge_color      = 'violet',
  includes         = '["20 × AI brand videos per month (weekly drops)", "100+ brand asset pack (stills + creatives)", "Full social media suite for every video", "Ad copy for every asset", "Priority 24-hour turnaround", "Unlimited revisions", "Monthly strategy call + performance report"]',
  deliverables     = '["Weekly content drops", "Monthly asset library (100+ files)", "Performance report", "Ad copy document"]',
  best_for         = ARRAY['Growing Brands','Agencies','E-commerce Stores'],
  traditional_value= 350000,
  accent_color     = '#7c3aed',
  sort_order       = 3
WHERE slug = 'monthly-content-engine';

-- ── 6. Product Stills Pack  ─ ₹12,000 ────────────────────────────────────────
UPDATE services SET
  tagline          = '20 studio-quality shots. No studio.',
  includes         = '["20 × AI product stills (multiple angles)", "5 × lifestyle context shots", "All standard e-commerce sizes", "Print-ready 300 DPI versions", "Web-optimised set included", "2 revision rounds", "24-hour delivery"]',
  deliverables     = '["20 high-res PNG/JPG files", "Web-optimised set", "E-commerce-ready crop set"]',
  traditional_value= 80000,
  sort_order       = 6
WHERE slug = 'product-stills-pack';

-- ── 7. Social Creatives Pack  ─ ₹15,000 ──────────────────────────────────────
UPDATE services SET
  tagline          = '30 creatives. Every platform. 48 hours.',
  includes         = '["30 × AI-generated creatives", "All platform sizes (1:1, 9:16, 16:9, 4:5)", "Feed posts, story formats, ad formats", "3 design style variants per creative", "Ad-ready versions included", "2 revision rounds", "48-hour delivery"]',
  deliverables     = '["Zipped creative pack (30 files)", "Organised by platform", "Editable Canva / Figma link"]',
  traditional_value= 90000,
  sort_order       = 7
WHERE slug = 'social-creatives-pack';

-- ── 8. AI Brand Avatar  ─ ₹20,000 ────────────────────────────────────────────
UPDATE services SET
  tagline          = 'Your brand''s digital face, forever',
  includes         = '["1 × custom AI brand character (fully unique)", "10 × styled looks (different outfits / settings)", "5 × mood and expression variants", "3 × animated intro clips (5s each)", "Commercial usage license", "HD reference sheets", "Brand alignment session included", "3-day delivery"]',
  deliverables     = '["AI character reference pack", "10 styled look renders (PNG)", "3 animated clips (MP4)", "Commercial license doc"]',
  traditional_value= 120000,
  sort_order       = 8
WHERE slug = 'ai-brand-avatar';

-- ── 9. Product Demo Video  ─ ₹18,000 ─────────────────────────────────────────
UPDATE services SET
  includes         = '["1 × product demo video (30s, professional grade)", "1 × 15s cut-down", "1 × 9s bumper", "Script writing included", "3 × platform-sized versions", "2 revision rounds", "48-hour delivery"]',
  traditional_value= 80000
WHERE slug = 'product-demo-video';

-- ── 10. Performance Ad Pack  ─ ₹20,000 ───────────────────────────────────────
UPDATE services SET
  tagline          = '10 high-converting ad creatives. Ready to launch.',
  includes         = '["10 × ad creatives (static + video)", "A/B testing variants for each creative", "Ad copy for every format", "Platform-specific sizing (Meta, Google, LinkedIn)", "3 design directions to choose from", "2 revision rounds", "48-hour delivery"]',
  deliverables     = '["10 ad creative files", "Copy document", "Spec sheet for ad manager", "A/B variant set"]',
  traditional_value= 100000,
  sort_order       = 10
WHERE slug = 'performance-ad-pack';

-- ── 11. Print Creatives Pack  ─ ₹12,000 ──────────────────────────────────────
UPDATE services SET
  includes         = '["15 × print-ready AI creatives", "OOH format (6×4 ft + 12×4 ft)", "In-store display sizes (A0, A1, A2, A3, A4)", "Digital print formats (web banners, digital signage)", "300 DPI resolution on all files", "2 revision rounds", "2-day delivery"]',
  deliverables     = '["Print-ready PDF files (all sizes)", "Editable source files"]',
  traditional_value= 60000
WHERE slug = 'print-creatives-pack';

-- ── 12. Brand Style Guide  ─ ₹25,000 ─────────────────────────────────────────
UPDATE services SET
  includes         = '["Colour palette (primary, secondary, accent)", "Typography system (2 font pairings)", "Logo usage rules + safe-zones", "Tone of voice guide (3 brand voices)", "Visual direction moodboard (20 reference images)", "Do / Don''t examples", "Social media template (3 formats)", "PDF brand book + Figma file", "3-day delivery"]',
  deliverables     = '["Brand guidelines PDF", "Figma source file", "Digital + print-ready versions", "Social media template pack"]',
  traditional_value= 100000
WHERE slug = 'brand-style-guide';
