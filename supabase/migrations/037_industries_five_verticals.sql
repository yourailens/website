-- ════════════════════════════════════════════════════════════
-- 037 · Five additional industries (playbooks + sample brands)
-- Run AFTER 036_industry_sample_brands.sql (Supabase SQL Editor).
-- Adds: Fashion, Food & Beverage, Healthcare, Education, Hospitality
-- ════════════════════════════════════════════════════════════

-- ── Industries ─────────────────────────────────────────────────
INSERT INTO public.industries (
  slug, name, tagline, description, question, answer, icon_label, sort_order, published
) VALUES
(
  'fashion-apparel',
  'Fashion & Apparel',
  'Lookbooks, drops, and performance creative — built with AI.',
  'Show fashion and retail leads how editorial stills, ecommerce grades, launch films, and creator avatars fit their seasonal calendar.',
  'Where should fashion and apparel brands use AI in creative production?',
  'Across lookbooks and editorial, ecommerce product and on-model grades, seasonal campaign films, paid social variants, and a consistent creator or muse for organic channels. AI wins when you ship multiple drops a year and need one visual language from runway to PDP to Reels.',
  'Shirt',
  4,
  true
),
(
  'food-beverage',
  'Food & Beverage',
  'Menus, packaging, and appetite-forward motion — at studio speed.',
  'For restaurants, CPG, and franchise brands who need product, ambience, and shelf-ready assets without reshooting every SKU and location.',
  'How can food and beverage brands use AI without losing appetite appeal?',
  'For hero product shots, menu and packaging systems, location ambience, recipe motion, and franchise kits — when lighting, steam, and texture read as craveable. AI handles volume and localization; your team approves what goes live.',
  'Utensils',
  5,
  true
),
(
  'healthcare-wellness',
  'Healthcare & Wellness',
  'Trust-forward visuals for clinics, brands, and patient education.',
  'Sensitive, compliant-tone creative for providers, telehealth, supplements, and wellness programs — explainers, lifestyle, and presenter-led education.',
  'Is AI appropriate for healthcare and wellness marketing?',
  'Yes — for patient education, service explainers, supplement lifestyle, community social, and provider-hosted content when tone stays calm, accurate, and brand-safe. We avoid misleading claims; you own medical review. AI scales warm, human visuals without putting every clinician on a shoot schedule.',
  'Heart',
  6,
  true
),
(
  'education-edtech',
  'Education & EdTech',
  'Enrollment films, platform demos, and instructor presence — scaled.',
  'For schools, course creators, and edtech platforms that need enrollment creative, UI-in-context, success stories, and repeatable lesson hosts.',
  'Where does AI help education and edtech teams grow enrollment?',
  'In course and program promos, platform UI demos, student outcome stories, campus and event films, and instructor or guide avatars for lessons and social. Teams ship terms and feature launches faster when video and stills are not blocked on one production window.',
  'GraduationCap',
  7,
  true
),
(
  'hospitality-travel',
  'Hospitality & Travel',
  'Resort hero, destination campaigns, and booking-first social.',
  'Hotels, retreats, and travel brands — room and amenity stories, destination emotion, and conversion-ready paid and organic assets.',
  'How do hospitality and travel brands use AI for marketing visuals?',
  'For property hero imagery, destination campaigns, experience and amenity galleries, booking-driven social, and loyalty brand films — especially when you promote many properties or seasons and cannot fly a crew to every location for each offer.',
  'Plane',
  8,
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

-- ── Fashion & Apparel playbooks ────────────────────────────────
INSERT INTO public.industry_playbooks (
  industry_id, slug, name, question, answer, tagline, description, icon_label, sort_order, published
)
SELECT i.id, v.slug, v.name, v.question, v.answer, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  (
    'will-customers-trust-ai-campaigns',
    'Client trust & campaign perception',
    'Will shoppers notice that campaign imagery is AI-assisted?',
    'When texture, fit, and lighting match your brand grade, shoppers respond to aspiration and clarity — not production method. We align to your art direction and retouch standards so ecommerce and editorial feel cohesive.',
    'What customers actually see.',
    'Side-by-side grades and on-brand editorial for sales conversations.',
    'Sparkles', 0
  ),
  (
    'lookbooks-editorial',
    'Lookbooks & editorial',
    'Can we ship a seasonal lookbook without a multi-city shoot?',
    'Yes — for marketing lookbooks and campaign stills. Editorial sets, on-model grades, and location moods can be produced from briefs and references, then iterated for channels. Physical samples still ground fit; AI accelerates the visual story around them.',
    'Editorial & seasonal stories',
    'Campaign stills and lookbook chapters.',
    'Camera', 1
  ),
  (
    'ecommerce-product-grades',
    'Ecommerce & product grades',
    'How do we keep PDP imagery consistent across hundreds of SKUs?',
    'With a locked product grade: lighting, shadow, and background rules applied across colorways and categories. AI generates packshots and laydowns so merchandising can publish faster between drops.',
    'PDP & catalog imagery',
    'Packshots, laydowns, on-model grades.',
    'Image', 2
  ),
  (
    'seasonal-campaign-films',
    'Seasonal campaign films',
    'Can a seasonal film feel premium without a full production crew?',
    'Campaign films, drop teasers, and runway-adjacent motion can be storyboarded and produced with cinematic grade — strong enough for homepage heroes and paid when the calendar does not allow a traditional shoot every season.',
    'Launch & seasonal films',
    'Hero films, teasers, motion banners.',
    'Film', 3
  ),
  (
    'influencer-avatar-creators',
    'Creator & muse avatars',
    'Should our brand have a consistent face on social?',
    'Fashion brands that win on social often do. A stable muse or creator avatar hosts try-ons, styling tips, and drop countdowns — same energy as influencer content without tying output to one freelancer schedule.',
    'Organic social hosts',
    'Muse, creator, ambassador avatars.',
    'User', 4
  )
) AS v(slug, name, question, answer, tagline, description, icon_label, sort_order)
WHERE i.slug = 'fashion-apparel'
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

-- ── Food & Beverage playbooks ──────────────────────────────────
INSERT INTO public.industry_playbooks (
  industry_id, slug, name, question, answer, tagline, description, icon_label, sort_order, published
)
SELECT i.id, v.slug, v.name, v.question, v.answer, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  (
    'hero-product-appetite',
    'Hero product & appetite appeal',
    'Will AI food photography look appetizing enough to run?',
    'When steam, pour, crunch, and color are art-directed, yes. We reference your plating rules and brand palette so product and pour shots read as craveable on menus, delivery apps, and paid — not flat or synthetic.',
    'Product & appetite',
    'Hero dishes, pours, pack shots.',
    'Image', 0
  ),
  (
    'menu-delivery-imagery',
    'Menu & delivery imagery',
    'How do we refresh menu photos for every market and season?',
    'Localized menu stills and LTO visuals from one brief — new items, regional variants, and seasonal specials without flying photographers to every store.',
    'Menus & apps',
    'Item shots for menus and delivery.',
    'Clipboard', 1
  ),
  (
    'cpg-packaging-shelf',
    'CPG packaging & shelf',
    'Can packaging and shelf visuals match our campaign look?',
    'AI aligns sleeves, cartons, and retail POS with the same grade as your digital ads — so the aisle and the feed feel like one brand.',
    'Packaging & retail',
    'Boxes, sleeves, POS, shelf context.',
    'Package', 2
  ),
  (
    'location-ambience-brand',
    'Location & ambience',
    'How do we show restaurant vibe without shooting every location?',
    'Interior ambience, seating, and neighborhood context built from references and brand rules — useful for franchise prospecting, openings, and brand pages when every site is not shoot-ready the same week.',
    'Spaces & ambience',
    'Interiors, patios, neighborhood mood.',
    'MapPin', 3
  ),
  (
    'recipe-social-motion',
    'Recipe & social motion',
    'Do recipe reels and short motion still matter for food brands?',
    'They drive discovery and delivery conversion. Step motion, ingredient macros, and offer hooks keep feeds active between LTOs — especially when culinary teams cannot be on set for every clip.',
    'Motion & social',
    'Reels, recipes, offer hooks.',
    'Play', 4
  )
) AS v(slug, name, question, answer, tagline, description, icon_label, sort_order)
WHERE i.slug = 'food-beverage'
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

-- ── Healthcare & Wellness playbooks ────────────────────────────
INSERT INTO public.industry_playbooks (
  industry_id, slug, name, question, answer, tagline, description, icon_label, sort_order, published
)
SELECT i.id, v.slug, v.name, v.question, v.answer, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  (
    'patient-trust-tone',
    'Patient trust & tone',
    'Can healthcare marketing feel warm without feeling casual?',
    'Yes — with calm lighting, diverse representation, and copy you approve. We stay away from sensational claims; visuals support education and access, not diagnosis promises.',
    'Trust & tone',
    'Warm, compliant-forward stills.',
    'Shield', 0
  ),
  (
    'clinic-service-explainer',
    'Clinic & service explainers',
    'How do we explain services without overwhelming patients?',
    'Short explainers and still sequences walk through visits, telehealth, and programs — clear steps, friendly faces, and environments that feel real and approachable.',
    'Service explainers',
    'Visits, programs, telehealth flows.',
    'Video', 1
  ),
  (
    'supplement-lifestyle-product',
    'Supplement & product lifestyle',
    'Do supplement brands still need lifestyle and product sets?',
    'For DTC and retail, yes. Product, ritual, and in-context lifestyle can be produced at the cadence of formulation launches and retailer resets — aligned to your claims and legal review.',
    'Product & lifestyle',
    'Bottles, rituals, in-context use.',
    'Pill', 2
  ),
  (
    'wellness-social-community',
    'Wellness social & community',
    'How do wellness brands stay active on social responsibly?',
    'With a stream of tips, community stories, and habit-focused posts from one visual system — educational tone, not hype — so marketing can publish weekly with brand and compliance alignment.',
    'Social & community',
    'Tips, habits, community stories.',
    'Share', 3
  ),
  (
    'provider-avatar-education',
    'Provider & educator avatars',
    'Can clinicians and educators host videos without being on camera every week?',
    'Presenter avatars can host FAQs, program intros, and follow-up content in a consistent, trustworthy style — especially when providers are clinical-first, not content-first.',
    'Educator avatars',
    'Hosts for education and follow-up.',
    'Mic', 4
  )
) AS v(slug, name, question, answer, tagline, description, icon_label, sort_order)
WHERE i.slug = 'healthcare-wellness'
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

-- ── Education & EdTech playbooks ───────────────────────────────
INSERT INTO public.industry_playbooks (
  industry_id, slug, name, question, answer, tagline, description, icon_label, sort_order, published
)
SELECT i.id, v.slug, v.name, v.question, v.answer, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  (
    'enrollment-promo-films',
    'Enrollment & promo films',
    'Can we produce enrollment films every intake cycle?',
    'With repeatable story templates, yes. Program promos, deadline hooks, and outcome-led films sized for web, paid, and email — without booking campus crews for every term.',
    'Enrollment films',
    'Intake promos and deadline campaigns.',
    'Film', 0
  ),
  (
    'platform-ui-demo',
    'Platform & UI demos',
    'How do we show the learning platform in context?',
    'UI-in-device mockups, feature highlights, and learner journey frames for ads, landing pages, and sales — built from your product so prospects see the real experience, polished.',
    'Platform demos',
    'UI in context for web and ads.',
    'Monitor', 1
  ),
  (
    'student-success-stories',
    'Student success & outcomes',
    'Do outcome stories still convert for edtech?',
    'They anchor trust. Student and alumni story stills and short films — diverse paths, credible settings — support consideration when claims are approved by your team.',
    'Success stories',
    'Outcomes, alumni, credibility.',
    'Award', 2
  ),
  (
    'campus-event-films',
    'Campus & event films',
    'How do we cover events and open days at scale?',
    'Event recap motion, open-day heroes, and community galleries from briefs and brand rules — useful when every campus cannot host a full film crew the same weekend.',
    'Events & campus',
    'Open days, recaps, community.',
    'Calendar', 3
  ),
  (
    'instructor-avatar-lessons',
    'Instructor & guide avatars',
    'Should courses have a consistent instructor presence?',
    'Learners connect to a guide. Avatars host intros, module summaries, and social clips with stable, friendly presence — without scheduling faculty for every micro-update.',
    'Instructor avatars',
    'Guides for lessons and social.',
    'User', 4
  )
) AS v(slug, name, question, answer, tagline, description, icon_label, sort_order)
WHERE i.slug = 'education-edtech'
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

-- ── Hospitality & Travel playbooks ─────────────────────────────
INSERT INTO public.industry_playbooks (
  industry_id, slug, name, question, answer, tagline, description, icon_label, sort_order, published
)
SELECT i.id, v.slug, v.name, v.question, v.answer, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  (
    'property-hero-imagery',
    'Property hero imagery',
    'Can resort and hotel heroes compete with destination photography?',
    'When light, weather, and composition are art-directed, yes. Room, suite, and property heroes for web and paid — including golden-hour and amenity-forward frames — without waiting on perfect on-site conditions for every campaign.',
    'Property heroes',
    'Rooms, suites, signature views.',
    'Image', 0
  ),
  (
    'destination-campaigns',
    'Destination campaigns',
    'How do we market destinations before peak season shoots?',
    'Destination emotion, culture, and itinerary visuals from references and brand rules — for pre-season campaigns, partner co-marketing, and OTA listings when crews are not on location yet.',
    'Destination stories',
    'Culture, landscape, itinerary mood.',
    'Globe', 1
  ),
  (
    'experience-amenities',
    'Experience & amenities',
    'Do spa, dining, and experience visuals still drive bookings?',
    'They close the gap between search and booking. Amenity, dining, and experience galleries answer what it feels like to stay — produced at the cadence of renovations and new offers.',
    'Experiences & amenities',
    'Spa, dining, activities, details.',
    'Sparkles', 2
  ),
  (
    'booking-conversion-social',
    'Booking & conversion social',
    'How do travel brands feed paid and organic without endless shoots?',
    'Offer hooks, UGC-style guest moments, and format-specific crops from one brief — so performance and social teams test angles weekly across properties and seasons.',
    'Paid & organic social',
    'Offers, hooks, guest moments.',
    'Zap', 3
  ),
  (
    'loyalty-brand-films',
    'Loyalty & brand films',
    'Can loyalty and brand films feel cinematic for hospitality groups?',
    'Brand films and loyalty stories with consistent grade across properties — strong enough for homepage and email — when a traditional shoot per property is not feasible each quarter.',
    'Brand & loyalty films',
    'Group brand, member stories.',
    'Play', 4
  )
) AS v(slug, name, question, answer, tagline, description, icon_label, sort_order)
WHERE i.slug = 'hospitality-travel'
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

-- ── Sample brands (draft — add media in admin) ─────────────────
INSERT INTO public.industry_sample_brands (
  industry_id, slug, name, tagline, description, sort_order, published
)
SELECT
  i.id,
  v.slug,
  v.name,
  v.tagline,
  v.description,
  v.sort_order,
  false
FROM public.industries i
JOIN (VALUES
  (
    'fashion-apparel',
    'atelier-novus',
    'Atelier Novus',
    'Contemporary essentials with a quiet-luxury grade.',
    'Sample world: lookbook stills, PDP grades, seasonal film frames, and muse-led social.',
    1
  ),
  (
    'food-beverage',
    'ember-roast-co',
    'Ember Roast Co.',
    'Specialty coffee built for slow mornings and bold pours.',
    'Sample world: product pours, menu stills, café ambience, packaging, and recipe motion.',
    1
  ),
  (
    'healthcare-wellness',
    'calmora-health',
    'Calmora Health',
    'Integrated wellness for mind and body — clinic to home.',
    'Sample world: calm service explainers, supplement lifestyle, community social, educator hosts.',
    1
  ),
  (
    'education-edtech',
    'brightpath-academy',
    'Brightpath Academy',
    'Live cohort learning for skills that move careers forward.',
    'Sample world: enrollment films, platform UI, success stories, event recaps, guide avatars.',
    1
  ),
  (
    'hospitality-travel',
    'solara-retreats',
    'Solara Retreats',
    'Boutique coastal stays — light, space, and unhurried mornings.',
    'Sample world: property heroes, destination mood, amenity galleries, offer social, brand films.',
    1
  )
) AS v(industry_slug, slug, name, tagline, description, sort_order)
  ON i.slug = v.industry_slug
ON CONFLICT (industry_id, slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
