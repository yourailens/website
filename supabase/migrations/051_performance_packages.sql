-- ════════════════════════════════════════════════════════════
-- 051 · Performance Packages™ (8 outcome-driven service tiers)
-- Run AFTER 026_services.sql (and 027+ if applied).
-- Set price / is_published in admin before going live if needed.
-- ════════════════════════════════════════════════════════════

INSERT INTO service_categories (name, slug, description, icon, sort_order)
VALUES (
  'Performance Packages',
  'performance-packages',
  'Outcome-driven creative systems for paid social, launches, and growth',
  NULL,
  0
)
ON CONFLICT (slug) DO UPDATE SET
  name        = EXCLUDED.name,
  description = EXCLUDED.description,
  sort_order  = EXCLUDED.sort_order;

-- ── 1. The Hook Package™ ─────────────────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Hook Package™',
  'the-hook-package',
  'Stop the scroll.',
  'Focused on creating high-performing hooks designed to capture attention in the first 3 seconds.',
  35000, 140000, 'per project', 3,
  false, false, false,
  NULL, 'blue',
  '[
    "Creative strategy session with the client",
    "Ideation and scripting by the YourAILens team",
    "10–15 unique hook concepts",
    "10–15 hook clips (3–5 seconds each)",
    "3 videos up to 30 seconds",
    "1 custom video up to 60 seconds",
    "All raw assets and reference ingredients included",
    "Primary KPI · Hook rate",
    "Primary KPI · Thumb-stop rate",
    "Primary KPI · Watch time"
  ]'::jsonb,
  '[]'::jsonb,
  ARRAY['Meta Ads', 'Reels', 'TikTok', 'Product Launches'],
  '[]'::jsonb,
  140000,
  '#2563eb', 20
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 2. The Engagement Package™ ─────────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Engagement Package™',
  'the-engagement-package',
  'Turn viewers into participants.',
  'Focused on generating comments, shares, saves, and audience interaction.',
  38000, 150000, 'per project', 4,
  false, false, false,
  NULL, 'blue',
  '[
    "Creative strategy session with the client",
    "Audience psychology workshop",
    "5 engagement-focused video concepts",
    "Multiple interaction mechanics",
    "Poll-style creatives",
    "Debate-style creatives",
    "Community-trigger creatives",
    "Primary KPI · Comments",
    "Primary KPI · Shares",
    "Primary KPI · Saves",
    "Primary KPI · Community interaction"
  ]'::jsonb,
  '[
    "5 videos",
    "Multiple CTA variations",
    "Engagement-focused creative frameworks"
  ]'::jsonb,
  ARRAY['Organic Social', 'Community Brands', 'Creator-Led Campaigns', 'Reels & TikTok'],
  '[]'::jsonb,
  150000,
  '#0891b2', 21
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 3. The Launch Package™ ───────────────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Launch Package™',
  'the-launch-package',
  'Turn product launches into events.',
  'Focused on generating excitement before, during, and after launch.',
  85000, 350000, 'per launch', 5,
  false, true, false,
  'Launch', 'green',
  '[
    "Launch strategy",
    "Product storytelling",
    "Teaser campaign planning",
    "Launch campaign architecture",
    "Hero creative direction",
    "Primary KPI · Launch reach",
    "Primary KPI · Launch revenue",
    "Primary KPI · Product awareness",
    "Primary KPI · Preorders"
  ]'::jsonb,
  '[
    "3 teasers",
    "1 launch film",
    "5 launch creatives",
    "10 supporting assets"
  ]'::jsonb,
  ARRAY['Product Launches', 'D2C Brands', 'App & SaaS Releases', 'Drop Culture'],
  '[]'::jsonb,
  350000,
  '#16a34a', 22
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 4. The Demand Package™ ───────────────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Demand Package™',
  'the-demand-package',
  'Make people want what you sell.',
  'Focused on creating desire rather than simply explaining features.',
  42000, 170000, 'per project', 4,
  false, false, false,
  NULL, 'blue',
  '[
    "Demand generation strategy",
    "Audience desire mapping",
    "Creative concept development",
    "Product positioning narratives",
    "Primary KPI · Purchase intent",
    "Primary KPI · CTR",
    "Primary KPI · Add-to-cart rate",
    "Primary KPI · Conversion rate"
  ]'::jsonb,
  '[
    "5 demand-focused videos",
    "15 supporting creatives",
    "Multiple messaging angles"
  ]'::jsonb,
  ARRAY['E-commerce', 'D2C Brands', 'Performance Marketing', 'Paid Social'],
  '[]'::jsonb,
  170000,
  '#db2777', 23
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 5. The Trust Package™ ────────────────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Trust Package™',
  'the-trust-package',
  'Turn skepticism into confidence.',
  'Focused on building credibility and reducing purchase hesitation.',
  48000, 190000, 'per project', 5,
  false, false, false,
  NULL, 'blue',
  '[
    "Trust audit",
    "Social proof strategy",
    "Authority positioning",
    "Founder storytelling",
    "Primary KPI · Conversion rate",
    "Primary KPI · Lead quality",
    "Primary KPI · Sales cycle length"
  ]'::jsonb,
  '[
    "3 trust videos",
    "Case study assets",
    "Founder story assets",
    "Proof-based creatives"
  ]'::jsonb,
  ARRAY['B2B SaaS', 'High-Ticket D2C', 'Healthcare & Wellness', 'Financial Services'],
  '[]'::jsonb,
  190000,
  '#4f46e5', 24
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 6. The Brand Distinctiveness Package™ ────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Brand Distinctiveness Package™',
  'the-brand-distinctiveness-package',
  'Stop looking like everyone else.',
  'Focused on helping brands become memorable and recognizable.',
  55000, 220000, 'per project', 7,
  false, false, false,
  NULL, 'violet',
  '[
    "Brand territory workshop",
    "Creative positioning",
    "Visual direction",
    "Distinctiveness strategy",
    "Primary KPI · Brand recall",
    "Primary KPI · Recognition",
    "Primary KPI · Share of voice"
  ]'::jsonb,
  '[
    "Brand visual territory",
    "10 signature creatives",
    "Creative playbook",
    "Brand guidelines"
  ]'::jsonb,
  ARRAY['Rebrands', 'Category Leaders', 'Premium D2C', 'Agencies'],
  '[]'::jsonb,
  220000,
  '#7c3aed', 25
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 7. The Market Testing Package™ ───────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Market Testing Package™',
  'the-market-testing-package',
  'Find winning creatives before spending big.',
  'Creative hypothesis generation, concept exploration, and a testing roadmap — so you learn what works before scaling media spend.',
  65000, 280000, 'per project', 5,
  true, true, false,
  'Recommended', 'orange',
  '[
    "Creative hypothesis generation",
    "Concept exploration across multiple territories",
    "Multiple creative territories mapped",
    "Testing roadmap and prioritisation framework",
    "Primary KPI · Lower CAC",
    "Primary KPI · Higher CTR",
    "Primary KPI · Creative learnings"
  ]'::jsonb,
  '[
    "50 creative concepts",
    "20 creative variations",
    "5 recommended directions",
    "Testing framework"
  ]'::jsonb,
  ARRAY['Performance Teams', 'Growth Marketers', 'D2C Brands', 'Meta & Google Ads'],
  '[]'::jsonb,
  280000,
  '#f97316', 26
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;

-- ── 8. The Content Engine Package™ ───────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, faqs, traditional_value,
  accent_color, sort_order
) VALUES (
  'performance-packages',
  'The Content Engine Package™',
  'the-content-engine-package',
  'Build a consistent content machine.',
  'Focused on brands that need content at scale — monthly planning, creative systems, production, and asset generation.',
  75000, NULL, 'per month', 2,
  false, false, false,
  'Retainer', 'violet',
  '[
    "Monthly planning and content calendar",
    "Creative systems and repeatable frameworks",
    "Ongoing content production",
    "Asset generation at scale",
    "Primary KPI · Content output",
    "Primary KPI · Posting consistency",
    "Primary KPI · Cost per asset"
  ]'::jsonb,
  '[
    "30+ creatives per month",
    "10 videos per month",
    "Monthly content calendar",
    "Creative asset library"
  ]'::jsonb,
  ARRAY['Growing Brands', 'E-commerce', 'Agencies', 'Always-On Social'],
  '[]'::jsonb,
  300000,
  '#7c3aed', 27
)
ON CONFLICT (slug) DO UPDATE SET
  category_slug    = EXCLUDED.category_slug,
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
  faqs             = EXCLUDED.faqs,
  traditional_value= EXCLUDED.traditional_value,
  accent_color     = EXCLUDED.accent_color,
  sort_order       = EXCLUDED.sort_order;
