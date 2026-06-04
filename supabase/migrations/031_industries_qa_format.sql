-- ════════════════════════════════════════════════════════════
-- 031 · Industries Q&A format
-- Run AFTER 030_industries_playbooks.sql (in Supabase SQL Editor).
-- Adds question + answer fields and reseeds copy as Q&A.
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.industries
  ADD COLUMN IF NOT EXISTS question text,
  ADD COLUMN IF NOT EXISTS answer text;

ALTER TABLE public.industry_playbooks
  ADD COLUMN IF NOT EXISTS question text,
  ADD COLUMN IF NOT EXISTS answer text;

-- ── Real Estate (industry) ───────────────────────────────────
UPDATE public.industries SET
  question = 'Where can I use AI in real estate?',
  answer = 'Everywhere buyers look before they visit: listing photos, empty-to-furnished staging, exterior and masterplan visuals, short video tours, and broker brand assets. AI lets you ship more listings, faster, without waiting on physical staging, weather, or a full video crew for every property.',
  tagline = 'Answers for brokers, developers, and property marketers.',
  description = 'Walk through the questions your leads actually ask — with visuals you can show on a live call.'
WHERE slug = 'real-estate';

INSERT INTO public.industry_playbooks (industry_id, slug, name, question, answer, tagline, description, sort_order, published)
SELECT
  i.id,
  'will-clients-like-ai',
  'Client trust & perception',
  'Will customers and clients like AI visuals?',
  'Yes — when the output looks photographic and matches the real space. Buyers care about clarity and aspiration, not whether a stager visited. We tune for MLS-ready realism, consistent lighting, and brand-safe presentation so agents can publish with confidence.',
  'What buyers and sellers actually notice.',
  'Show side-by-side before/after and photoreal staged rooms on your sales deck.',
  0,
  true
FROM public.industries i
WHERE i.slug = 'real-estate'
ON CONFLICT (industry_id, slug) DO UPDATE SET
  question = EXCLUDED.question,
  answer = EXCLUDED.answer,
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  published = EXCLUDED.published;

UPDATE public.industry_playbooks SET
  question = v.question,
  answer = v.answer,
  name = v.name,
  tagline = v.tagline,
  description = v.description
FROM public.industries i,
(VALUES
  (
    'will-clients-like-ai',
    'Will customers and clients like AI visuals?',
    'Yes — when the output looks photographic and matches the real space. Buyers care about clarity and aspiration, not whether a stager visited. We tune for MLS-ready realism, consistent lighting, and brand-safe presentation so agents can publish with confidence.',
    'Client trust & perception',
    'What buyers and sellers actually notice.',
    'Show side-by-side before/after and photoreal staged rooms on your sales deck.'
  ),
  (
    'listing-interior-mockups',
    'Can AI replace physical staging and renovation photos?',
    'For most residential and commercial listings, yes — for marketing visuals. Empty rooms become furnished; dated finishes can read as renovated. You still disclose reality on site visits; AI handles the scroll-stopping first impression online.',
    'Listing & interior visuals',
    'Virtual staging and interior sets.',
    'Faster turnarounds than physical staging for online listings.'
  ),
  (
    'site-exterior-visuals',
    'How do we market plots and towers before they are built?',
    'With exterior renders, amenity previews, and skyline context built from plans and references. Developers use them in pre-launch pages, investor decks, and channel partner kits — long before the site is camera-ready.',
    'Site & exterior visuals',
    'Plots, towers, amenities.',
    'Masterplan and launch creative without a construction-complete shoot.'
  ),
  (
    'avatar-hosts',
    'Do agents need to be on camera for every listing video?',
    'No. Photoreal presenter avatars can host walkthroughs, intros, and social clips — same face across listings for brand consistency, or bespoke hosts per campaign. You script once; we handle visual production.',
    'Agent & host presence',
    'Avatars inside the property story.',
    'Scale video without scheduling every agent for a shoot day.'
  ),
  (
    'motion-tours',
    'Are short video tours worth it for listings?',
    'They outperform static galleries on social and portals that support video. Reels, flythroughs, and before/after motion keep inventory fresh in feeds — especially when volume is high and calendar time is low.',
    'Motion & property tours',
    'Reels, flythroughs, before/after.',
    'Listing video at the speed of your pipeline.'
  ),
  (
    'brand-brochures',
    'Can brochures and pitch decks look premium without a large agency?',
    'AI brand systems produce signage, OOH, PDF decks, and launch kits aligned to your development or brokerage identity — useful for RERA launches, channel events, and investor rooms where polish matters.',
    'Brand & brochure assets',
    'Decks, signage, launch kits.',
    'Presentation-ready property brand without a six-week agency timeline.'
  )
) AS v(slug, question, answer, name, tagline, description)
WHERE industry_playbooks.industry_id = i.id
  AND i.slug = 'real-estate'
  AND industry_playbooks.slug = v.slug;

-- ── D2C (industry) ───────────────────────────────────────────
UPDATE public.industries SET
  question = 'Where should a D2C brand use AI in its creative workflow?',
  answer = 'Across the full funnel: product and lifestyle imagery for PDPs, high-volume performance ads, launch and seasonal films, a consistent creator face for organic social, and packaging or retail touchpoints. AI is strongest where you need many variants, fast tests, and one visual language everywhere.',
  tagline = 'Answers for founders and growth teams selling physical products online.',
  description = 'Question-led modules you can open on a call when a lead says they sell on Shopify, Amazon, or their own store.'
WHERE slug = 'd2c-ecommerce';

UPDATE public.industry_playbooks SET
  question = v.question,
  answer = v.answer,
  name = v.name,
  tagline = v.tagline,
  description = v.description
FROM public.industries i,
(VALUES
  (
    'product-lifestyle-mockups',
    'Do we still need traditional product shoots for every SKU?',
    'Not for every variant and season. Hero packshots, in-context lifestyle, and UGC-style stills can be produced and iterated in days — especially for catalogs with many SKUs, colorways, and regional offers.',
    'Product & lifestyle imagery',
    'Packshots and in-context scenes.',
    'PDP-ready visuals without reshooting the full line each drop.'
  ),
  (
    'performance-ad-packs',
    'How do we feed Meta and TikTok without burning creative teams?',
    'With structured ad packs: multiple hooks, formats, and crops from one brief. AI generates variant-ready assets so media buyers can test angles weekly instead of waiting on a single studio batch.',
    'Performance ad packs',
    'Hooks, formats, variants.',
    'Volume for paid social without linear cost per creative.'
  ),
  (
    'brand-films-launch',
    'Can a product launch film feel cinematic on a startup budget?',
    'Yes. Narrative launch films, drop teasers, and seasonal stories are storyboarded and produced with AI motion and grade — enough polish for homepage heroes and paid prospecting when you cannot book a full crew for every drop.',
    'Launch & brand films',
    'Hero films and seasonal stories.',
    'Tentpole creative without tentpole production overhead.'
  ),
  (
    'avatar-creators',
    'Should our brand have a consistent creator face online?',
    'Brands that win on social often do. A stable avatar or mascot gives you a recognizable host for tutorials, unboxings, and replies — without tying creative output to one founder''s calendar.',
    'Creator & mascot avatars',
    'A face for organic social.',
    'Ambassador-style content on repeat.'
  ),
  (
    'print-packaging',
    'Does packaging and retail still matter for a digital-first brand?',
    'When product arrives in hand, the box is your second homepage. AI helps align inserts, sleeves, and POS with the same campaign look as your ads — so offline touchpoints do not feel like a different company.',
    'Print & packaging',
    'Boxes, inserts, retail POS.',
    'Physical touchpoints matched to digital campaigns.'
  )
) AS v(slug, question, answer, name, tagline, description)
WHERE industry_playbooks.industry_id = i.id
  AND i.slug = 'd2c-ecommerce'
  AND industry_playbooks.slug = v.slug;

-- ── SaaS (industry) ──────────────────────────────────────────
UPDATE public.industries SET
  question = 'Where does AI help a SaaS or B2B team ship marketing faster?',
  answer = 'In product UI in context, explainer and demo films, presenter-led webinars, always-on social and employer brand, and sales enablement visuals. Teams use AI when ship cycles are weekly but design and video capacity is not.',
  tagline = 'Answers for product marketing, founders, and revenue teams.',
  description = 'Use on calls with B2B leads who need trust, clarity, and speed — not another generic AI demo.'
WHERE slug = 'saas-b2b';

UPDATE public.industry_playbooks SET
  question = v.question,
  answer = v.answer,
  name = v.name,
  tagline = v.tagline,
  description = v.description
FROM public.industries i,
(VALUES
  (
    'product-ui-mockups',
    'How do we show the product in context without a full design shoot?',
    'UI-in-device mockups, feature highlights, and scenario frames for ads, docs, and landing pages — built from your product and brand rules so every screenshot feels intentional, not a raw capture.',
    'Product UI mockups',
    'Dashboards in device frames.',
    'Marketing-ready UI without staging a physical desk shoot.'
  ),
  (
    'explainer-demo-films',
    'Can we ship an explainer every feature launch?',
    'With a repeatable film template, yes. Motion explainers walk through workflows, integrations, and launches — sized for homepage, in-app promo, and paid — without booking live action for each release.',
    'Explainer & demo films',
    'Motion for features and launches.',
    'Release-week video that matches release-week pace.'
  ),
  (
    'avatar-presenters',
    'Do we need a founder on every demo and webinar?',
    'Not for every asset. Presenter avatars host product tours, changelog videos, and social clips with a consistent, trustworthy on-camera presence — especially when experts are busy or camera-shy.',
    'Avatar presenters',
    'Hosts for demos and social.',
    'Scale thought leadership without scaling studio days.'
  ),
  (
    'social-employer-brand',
    'How do B2B teams stay visible on LinkedIn without a huge studio?',
    'With a stream of carousels, culture posts, event snippets, and hiring creatives generated from one visual system — so marketing and people teams publish weekly, not quarterly.',
    'Social & employer brand',
    'LinkedIn, hiring, events.',
    'Always-on B2B social without always-on production.'
  ),
  (
    'sales-enablement',
    'Can sales decks and one-pagers look custom for every vertical?',
    'AI-generated enablement tiles, verticalized one-pagers, and case-study visuals let reps tailor outbound without waiting on design for each account — while staying on brand.',
    'Sales enablement',
    'Decks, one-pagers, case tiles.',
    'Outbound visuals at the speed of pipeline.'
  )
) AS v(slug, question, answer, name, tagline, description)
WHERE industry_playbooks.industry_id = i.id
  AND i.slug = 'saas-b2b'
  AND industry_playbooks.slug = v.slug;
