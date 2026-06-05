-- ════════════════════════════════════════════════════════════
-- 049 · Beauty & Cosmetics industry (9th vertical — balances nav columns 3×3)
-- Run AFTER 048_restore_resources_libraries.sql
-- ════════════════════════════════════════════════════════════

INSERT INTO public.industries (
  slug, name, tagline, description, question, answer, icon_label, sort_order, published
) VALUES (
  'beauty-cosmetics',
  'Beauty & Cosmetics',
  'Product texture, shade systems, and creator-grade campaigns — at scale.',
  'For skincare, makeup, and fragrance brands who need shade-accurate product, tutorial motion, and ambassador content without reshooting every SKU and shade extension.',
  'How can beauty and cosmetics brands use AI without losing product truth?',
  'For hero product and texture macros, shade and SKU variant systems, routine and tutorial motion, retail and Sephora-style PDP grades, and a consistent creator or aesthetician host — when lighting, finish, and color must match your brand lab. AI handles volume across shades and markets; your team approves what goes live.',
  'Sparkles',
  9,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  icon_label = EXCLUDED.icon_label,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  updated_at = now();

-- ── Beauty & Cosmetics playbooks ───────────────────────────────
INSERT INTO public.industry_playbooks (
  industry_id, slug, name, question, answer, tagline, description, icon_label, sort_order, published
)
SELECT i.id, v.slug, v.name, v.question, v.answer, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  (
    'product-texture-macros',
    'Product & texture macros',
    'Will AI capture gloss, shimmer, and skin-care texture convincingly?',
    'When lighting, pour, and macro rules match your brand lab, yes. We reference your product physics and color standards so serums, compacts, and applicators read as premium on PDP, retail, and paid — not flat or plastic.',
    'Product & texture',
    'Macros, pours, compacts, applicators.',
    'Image', 0
  ),
  (
    'shade-variant-systems',
    'Shade & variant systems',
    'How do we launch shade extensions without a shoot per SKU?',
    'Locked grades across undertones, finishes, and collections — from arm swatches to shade grids — so merchandising can publish extensions faster while keeping skin-tone representation intentional and on-brand.',
    'Shades & variants',
    'Swatches, grids, collection rules.',
    'Palette', 1
  ),
  (
    'routine-tutorial-motion',
    'Routine & tutorial motion',
    'Can tutorial and routine reels still feel hands-on and credible?',
    'Step motion, application sequences, and before/after beats keep education and conversion feeds active between launches — especially when creators and clinicians are not on set for every format.',
    'Tutorials & routines',
    'Steps, application, before/after.',
    'Play', 2
  ),
  (
    'retail-pdp-grades',
    'Retail & PDP grades',
    'How do we keep Sephora-style PDP imagery consistent across categories?',
    'With a locked retail grade: shadow, reflection, and background rules for skincare, color, and fragrance — so marketplaces, DTC, and wholesale portals feel like one house.',
    'Retail & PDP',
    'Packshots, laydowns, retailer crops.',
    'Package', 3
  ),
  (
    'creator-aesthetician-hosts',
    'Creator & aesthetician hosts',
    'Should our brand have a consistent face for education and social?',
    'Beauty brands that win on social often do. A stable creator or aesthetician avatar hosts routines, shade matching, and drop countdowns — same trust as influencer content without tying output to one freelancer schedule.',
    'Hosts & ambassadors',
    'Creator, aesthetician, muse avatars.',
    'User', 4
  )
) AS v(slug, name, question, answer, tagline, description, icon_label, sort_order)
WHERE i.slug = 'beauty-cosmetics'
ON CONFLICT (industry_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  icon_label = EXCLUDED.icon_label,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published,
  updated_at = now();

-- ── Sample brand (draft — add media in admin) ──────────────────
INSERT INTO public.industry_sample_brands (
  industry_id, slug, name, tagline, description, sort_order, published
)
SELECT
  i.id,
  'lumiere-skin-lab',
  'Lumière Skin Lab',
  'Clinical-meets-luxury skincare with a calm, luminous grade.',
  'Sample world: texture macros, shade grids, routine motion, retail PDP, and educator-led social.',
  1,
  false
FROM public.industries i
WHERE i.slug = 'beauty-cosmetics'
ON CONFLICT (industry_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
