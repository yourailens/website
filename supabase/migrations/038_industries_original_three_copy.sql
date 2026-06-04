-- ════════════════════════════════════════════════════════════
-- 038 · Retitle original 3 industries (match 037 tone)
-- Run AFTER 037_industries_five_verticals.sql (Supabase SQL Editor).
-- Replaces "Answers for…" / question-led sales copy with deliverable-forward titles.
-- Hero question + answer on pages stay; taglines, descriptions, and playbook labels align with newer verticals.
-- ════════════════════════════════════════════════════════════

-- ── Real Estate & Property ───────────────────────────────────
UPDATE public.industries SET
  tagline = 'Listings, staging, and property stories — built with AI.',
  description = 'Show brokers and developers how virtual staging, exteriors, avatar hosts, and motion tours fit listings, launches, and channel marketing.',
  updated_at = now()
WHERE slug = 'real-estate';

UPDATE public.industry_playbooks SET
  question = v.question,
  answer = v.answer,
  name = v.name,
  tagline = v.tagline,
  description = v.description,
  updated_at = now()
FROM public.industries i,
(VALUES
  (
    'will-clients-like-ai',
    'Will buyers trust AI listing visuals?',
    'When output is photographic and true to the space, yes. Buyers want clarity and aspiration — MLS-ready light, consistent staging, and brand-safe presentation agents can publish with confidence.',
    'Trust & listing quality',
    'Photoreal staging and presentation standards.',
    'Buyer-ready visuals that hold up on portals and social.'
  ),
  (
    'listing-interior-mockups',
    'Can AI replace physical staging for listing marketing?',
    'For most residential and commercial listings, yes — for marketing stills. Empty rooms become furnished; dated finishes can read as renovated. Site visits stay honest; AI owns the scroll-stopping first impression online.',
    'Listing & interior visuals',
    'Virtual staging and interior sets.',
    'Furnished and renovated looks without physical staging lead times.'
  ),
  (
    'site-exterior-visuals',
    'How do we market plots and towers before they are built?',
    'With exterior renders, amenity previews, and skyline context from plans and references — for pre-launch pages, investor decks, and partner kits before the site is camera-ready.',
    'Site & exterior visuals',
    'Plots, towers, amenities, masterplan.',
    'Launch creative without a construction-complete shoot.'
  ),
  (
    'avatar-hosts',
    'Do agents need to be on camera for every listing video?',
    'No. Presenter avatars host walkthroughs, intros, and social clips — one face across listings or bespoke hosts per campaign. Script once; production scales without scheduling every agent.',
    'Agent & host presence',
    'Avatars inside the property story.',
    'Listing video without a shoot day per agent.'
  ),
  (
    'motion-tours',
    'Are short video tours worth it for listings?',
    'They outperform static galleries on social and video-enabled portals. Reels, flythroughs, and before/after motion keep inventory fresh when volume is high and calendar time is low.',
    'Motion & property tours',
    'Reels, flythroughs, before/after.',
    'Listing motion at the speed of your pipeline.'
  ),
  (
    'brand-brochures',
    'Can developer and brokerage brand assets look premium without a large agency?',
    'Signage, OOH, pitch decks, and launch kits aligned to your property brand — for launches, channel events, and investor rooms where polish matters.',
    'Brand & brochure assets',
    'Decks, signage, launch kits.',
    'Presentation-ready property brand on modern timelines.'
  )
) AS v(slug, question, answer, name, tagline, description)
WHERE industry_playbooks.industry_id = i.id
  AND i.slug = 'real-estate'
  AND industry_playbooks.slug = v.slug;

-- ── D2C & E‑commerce ───────────────────────────────────────────
UPDATE public.industries SET
  tagline = 'Product drops, lifestyle mockups, and performance ads at scale.',
  description = 'Show D2C and retail teams how packshots, paid variants, launch films, creator avatars, and packaging fit every drop and channel.',
  updated_at = now()
WHERE slug = 'd2c-ecommerce';

UPDATE public.industry_playbooks SET
  question = v.question,
  answer = v.answer,
  name = v.name,
  tagline = v.tagline,
  description = v.description,
  updated_at = now()
FROM public.industries i,
(VALUES
  (
    'product-lifestyle-mockups',
    'Do we still need traditional product shoots for every SKU?',
    'Not for every variant and season. Hero packshots, in-context lifestyle, and UGC-style stills ship in days — for catalogs with many SKUs, colorways, and regional offers.',
    'Product & lifestyle imagery',
    'Packshots and in-context scenes.',
    'PDP-ready visuals without reshooting the full line each drop.'
  ),
  (
    'performance-ad-packs',
    'How do we feed Meta and TikTok without burning the creative team?',
    'Structured ad packs: multiple hooks, formats, and crops from one brief. Variant-ready assets so media buyers test weekly instead of waiting on one studio batch.',
    'Performance ad packs',
    'Hooks, formats, paid variants.',
    'Paid social volume without linear cost per creative.'
  ),
  (
    'brand-films-launch',
    'Can a product launch film feel cinematic on a startup budget?',
    'Narrative launch films, drop teasers, and seasonal stories with motion and grade — homepage and paid-ready when a full crew every drop is not feasible.',
    'Launch & brand films',
    'Hero films and seasonal stories.',
    'Tentpole creative without tentpole production overhead.'
  ),
  (
    'avatar-creators',
    'Should our brand have a consistent creator face on social?',
    'Brands that win on social often do. A stable avatar or mascot hosts tutorials, unboxings, and replies — recognizable organic content without one founder''s calendar.',
    'Creator & mascot avatars',
    'A face for organic social.',
    'Ambassador-style content on repeat.'
  ),
  (
    'print-packaging',
    'Does packaging and retail still matter for a digital-first brand?',
    'The box is your second homepage. Inserts, sleeves, and POS aligned to the same campaign look as your ads — offline touchpoints that match the feed.',
    'Print & packaging',
    'Boxes, inserts, retail POS.',
    'Physical touchpoints matched to digital campaigns.'
  )
) AS v(slug, question, answer, name, tagline, description)
WHERE industry_playbooks.industry_id = i.id
  AND i.slug = 'd2c-ecommerce'
  AND industry_playbooks.slug = v.slug;

-- ── SaaS & B2B Tech ──────────────────────────────────────────
UPDATE public.industries SET
  tagline = 'Product UI in context, explainers, and trust-forward brand films.',
  description = 'Show product marketing and revenue teams how UI-in-context, explainers, presenter avatars, social, and sales enablement fit weekly ship cycles.',
  updated_at = now()
WHERE slug = 'saas-b2b';

UPDATE public.industry_playbooks SET
  question = v.question,
  answer = v.answer,
  name = v.name,
  tagline = v.tagline,
  description = v.description,
  updated_at = now()
FROM public.industries i,
(VALUES
  (
    'product-ui-mockups',
    'How do we show the product in context without a full design shoot?',
    'UI-in-device mockups, feature highlights, and scenario frames for ads, docs, and landing pages — built from your product so every frame feels intentional, not a raw capture.',
    'Product UI mockups',
    'Dashboards in device frames.',
    'Marketing-ready UI without a staged desk shoot.'
  ),
  (
    'explainer-demo-films',
    'Can we ship an explainer every feature launch?',
    'With a repeatable film template, yes. Motion explainers for workflows, integrations, and launches — homepage, in-app, and paid — without live action each release.',
    'Explainer & demo films',
    'Motion for features and launches.',
    'Release-week video that matches release-week pace.'
  ),
  (
    'avatar-presenters',
    'Do we need a founder on every demo and webinar?',
    'Not for every asset. Presenter avatars host tours, changelog videos, and social clips with consistent, trustworthy presence when experts are busy or camera-shy.',
    'Avatar presenters',
    'Hosts for demos and social.',
    'Scale thought leadership without scaling studio days.'
  ),
  (
    'social-employer-brand',
    'How do B2B teams stay visible on LinkedIn without a huge studio?',
    'Carousels, culture posts, event snippets, and hiring creatives from one visual system — marketing and people teams publish weekly, not quarterly.',
    'Social & employer brand',
    'LinkedIn, hiring, events.',
    'Always-on B2B social without always-on production.'
  ),
  (
    'sales-enablement',
    'Can sales decks and one-pagers look custom for every vertical?',
    'Enablement tiles, verticalized one-pagers, and case-study visuals let reps tailor outbound on brand — without design queue per account.',
    'Sales enablement',
    'Decks, one-pagers, case tiles.',
    'Outbound visuals at the speed of pipeline.'
  )
) AS v(slug, question, answer, name, tagline, description)
WHERE industry_playbooks.industry_id = i.id
  AND i.slug = 'saas-b2b'
  AND industry_playbooks.slug = v.slug;
