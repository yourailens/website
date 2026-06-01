-- ─────────────────────────────────────────────────────────────────────────────
-- 026_services.sql  –  Digital service catalogue with add-ons
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Service categories ────────────────────────────────────────────────────────
CREATE TABLE service_categories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        UNIQUE NOT NULL,
  description text,
  icon        text,                          -- emoji or SVG key
  sort_order  int         NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── Services (the products) ───────────────────────────────────────────────────
CREATE TABLE services (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  category_slug   text        NOT NULL REFERENCES service_categories(slug) ON DELETE SET NULL,
  name            text        NOT NULL,
  slug            text        UNIQUE NOT NULL,
  tagline         text,
  description     text,

  price           int         NOT NULL,          -- INR, paise-free integer
  original_price  int,                           -- strike-through price
  unit            text        NOT NULL DEFAULT 'per project',
  delivery_days   int         NOT NULL DEFAULT 2,

  -- marketing
  is_popular      bool        NOT NULL DEFAULT false,
  is_featured     bool        NOT NULL DEFAULT false,
  is_published    bool        NOT NULL DEFAULT false,
  badge_label     text,                          -- e.g. "Best Value", "New"
  badge_color     text        DEFAULT 'blue',    -- blue | green | violet | orange

  -- structured content stored as JSON arrays of strings
  includes        jsonb       NOT NULL DEFAULT '[]',   -- bullet list of what's included
  deliverables    jsonb       NOT NULL DEFAULT '[]',   -- what they receive
  best_for        text[]      DEFAULT '{}',             -- e.g. {"D2C brands","Startups"}
  faqs            jsonb       NOT NULL DEFAULT '[]',   -- [{q,a}]

  -- traditional value (for "you save X" calculator)
  traditional_value int,     -- what an agency would charge

  -- media
  thumbnail_url   text,
  cover_url       text,
  accent_color    text        DEFAULT '#2563eb',

  sort_order      int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Add-ons ───────────────────────────────────────────────────────────────────
CREATE TABLE service_addons (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  slug            text        UNIQUE NOT NULL,
  description     text,
  price           int         NOT NULL,
  -- empty array means compatible with ALL services
  compatible_with text[]      DEFAULT '{}',
  is_published    bool        NOT NULL DEFAULT true,
  icon            text,
  sort_order      int         NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ── updated_at trigger ────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_services_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION set_services_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services            ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addons      ENABLE ROW LEVEL SECURITY;

-- Public: read published rows
CREATE POLICY "public read categories"
  ON service_categories FOR SELECT USING (true);

CREATE POLICY "public read services"
  ON services FOR SELECT USING (is_published = true);

CREATE POLICY "public read addons"
  ON service_addons FOR SELECT USING (is_published = true);

-- Service-role: full access
CREATE POLICY "service role all categories"
  ON service_categories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service role all services"
  ON services FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "service role all addons"
  ON service_addons FOR ALL USING (true) WITH CHECK (true);

-- ── Seed: categories ─────────────────────────────────────────────────────────
INSERT INTO service_categories (name, slug, description, icon, sort_order) VALUES
  ('Campaigns',      'campaigns',      'Full-stack AI campaign packages',          '🎯', 1),
  ('Videos',         'videos',         'AI video production & brand films',        '🎬', 2),
  ('Visuals',        'visuals',        'AI-generated photos, stills & creatives',  '🖼️', 3),
  ('Brand Identity', 'brand-identity', 'Avatars, guidelines & reusable assets',    '✨', 4),
  ('Social & Ads',   'social-ads',     'Performance content for every platform',   '📱', 5),
  ('Print & OOH',    'print',          'Posters, banners, packaging, pitch decks', '🖨️', 6);

-- ── Seed: services ───────────────────────────────────────────────────────────
INSERT INTO services (
  category_slug, name, slug, tagline, description,
  price, original_price, unit, delivery_days,
  is_popular, is_featured, is_published,
  badge_label, badge_color,
  includes, deliverables, best_for, traditional_value,
  accent_color, sort_order
) VALUES

-- ── CAMPAIGNS ────────────────────────────────────────────────────────────────
(
  'campaigns', 'Campaign Sprint', 'campaign-sprint',
  'Launch-ready in 48 hours',
  'Everything a brand needs for one high-converting AI campaign — brand video, product stills, ad copy and platform-ready cuts. Ideal for product drops, launches or seasonal pushes.',
  30000, 90000, 'per campaign', 2,
  true, true, true,
  'Most Popular', 'blue',
  '["1 × brand video (30–60s)", "5 × AI product stills", "3 × ad copy variants", "3 × platform-sized video cuts (Reels, Stories, Feed)", "2 revision rounds", "48-hour delivery"]',
  '["MP4 video files", "High-res image files (PNG/JPG)", "Copy doc", "All platform-ready sizes"]',
  ARRAY['D2C Brands','Startups','Product Launches'],
  90000,
  '#2563eb', 1
),
(
  'campaigns', 'Full Launch Pack', 'full-launch-pack',
  'Everything you need to launch a product',
  'A complete AI-powered product launch kit — hero film, product visuals, social media suite, performance ad creatives, print posters and pitch deck visuals. One brief, one team, delivered in 5 days.',
  120000, 400000, 'per launch', 5,
  false, true, true,
  'Best Value', 'green',
  '["1 × hero brand film (60–90s)", "2 × product demo videos (30s each)", "10 × AI product stills", "20 × social media creatives (all platforms)", "5 × performance ad creatives", "3 × print-ready posters/banners", "5 × pitch deck slides", "5 revision rounds", "Dedicated creative lead"]',
  '["All MP4 video files", "Print-ready PDFs", "Social media pack", "Ad creative pack", "PowerPoint/Figma pitch slides"]',
  ARRAY['Funded Startups','FMCG Brands','E-commerce'],
  400000,
  '#16a34a', 2
),
(
  'campaigns', 'Monthly Content Engine', 'monthly-content-engine',
  'Consistent AI content, every single week',
  'Your own AI content team on retainer. Four campaign-grade videos per month, 20 AI-generated stills, weekly social drops and priority turnaround. Never run out of content again.',
  75000, NULL, 'per month', 2,
  false, false, true,
  'Retainer', 'violet',
  '["4 × brand videos (30–60s each)", "20 × AI product stills", "Full social media suite per video", "Ad copy for every asset", "Priority 24-hour turnaround", "Unlimited revisions", "Monthly strategy call"]',
  '["Weekly content drops", "Monthly asset library", "Performance report at month end"]',
  ARRAY['Growing Brands','Agencies','E-commerce Stores'],
  250000,
  '#7c3aed', 3
),

-- ── VIDEOS ───────────────────────────────────────────────────────────────────
(
  'videos', 'Brand Film', 'brand-film',
  'Cinematic. Emotional. Unforgettable.',
  'A premium AI-generated brand film (60–90s) that tells your brand story with cinematic quality. Perfect as a hero video for your website, campaign launches or investor presentations.',
  50000, 200000, 'per film', 5,
  false, false, true,
  NULL, 'blue',
  '["1 × hero brand film (60–90s)", "1 × 30s cut-down", "1 × 15s teaser", "Cinematic grade + colour correct", "3 × platform-sized versions", "3 revision rounds"]',
  '["Master MP4 (4K)", "Web-optimised H264 file", "All platform cuts"]',
  ARRAY['Established Brands','Series A+ Startups','Luxury Products'],
  200000,
  '#1e40af', 4
),
(
  'videos', 'Product Demo Video', 'product-demo-video',
  'Show your product in action',
  'A focused 30-second AI product demo video that showcases features, benefits and use cases. Clean, professional, optimised for ads and landing pages.',
  18000, 60000, 'per video', 2,
  false, false, true,
  NULL, 'blue',
  '["1 × product demo video (30s)", "Script writing included", "2 × platform-sized cuts", "2 revision rounds", "48-hour delivery"]',
  '["MP4 video file", "Platform-sized cuts"]',
  ARRAY['SaaS Products','Consumer Goods','App Launches'],
  60000,
  '#3b82f6', 5
),

-- ── VISUALS ──────────────────────────────────────────────────────────────────
(
  'visuals', 'Product Stills Pack', 'product-stills-pack',
  'Studio-quality shots. No studio.',
  '10 photorealistic AI-generated product images in multiple angles, settings and styles. Ready for e-commerce listings, social media and print.',
  12000, 50000, 'per pack', 1,
  false, false, true,
  NULL, 'blue',
  '["10 × AI product stills", "Multiple angles & backgrounds", "3 × lifestyle context shots", "Print-ready resolution (300 DPI)", "Web-optimised versions included"]',
  '["High-res PNG/JPG files", "Web-optimised set"]',
  ARRAY['E-commerce Brands','Consumer Products','Fashion'],
  50000,
  '#0ea5e9', 6
),
(
  'visuals', 'Social Creatives Pack', 'social-creatives-pack',
  '20 creatives. Every platform. 48 hours.',
  '20 AI-generated visual creatives optimised for Instagram, Facebook, LinkedIn, X and Pinterest. Story formats, feed posts and banner ads — all on-brand.',
  15000, 60000, 'per pack', 2,
  false, false, true,
  'New', 'orange',
  '["20 × AI-generated creatives", "All platform sizes (1:1, 9:16, 16:9)", "Feed posts + story formats", "Ad-ready versions", "3 design style variants", "2 revision rounds"]',
  '["Zipped creative pack", "Organised by platform", "Editable Canva/Figma link"]',
  ARRAY['D2C Brands','Agencies','Content Teams'],
  60000,
  '#f97316', 7
),

-- ── BRAND IDENTITY ───────────────────────────────────────────────────────────
(
  'brand-identity', 'AI Brand Avatar', 'ai-brand-avatar',
  'Your brand''s digital face, forever',
  'A custom AI character trained on your brand aesthetics. Unique, ownable and reusable across every campaign, ad and social post. The ultimate brand asset.',
  20000, 80000, 'one-time', 3,
  false, true, true,
  'Asset', 'violet',
  '["Custom AI character design", "5 × styled looks", "3 × expressions/moods", "Brand alignment session", "HD reference sheets", "Commercial usage license", "3-day delivery"]',
  '["AI character reference pack", "Usage license doc", "PNG renders in all looks"]',
  ARRAY['D2C Brands','Influencer Brands','Content Creators'],
  80000,
  '#8b5cf6', 8
),
(
  'brand-identity', 'Brand Style Guide', 'brand-style-guide',
  'Your brand in a box',
  'A comprehensive AI-assisted brand style guide — colour system, typography pairing, tone of voice, visual direction and usage rules. Built in 3 days.',
  25000, 80000, 'one-time', 3,
  false, false, true,
  NULL, 'violet',
  '["Colour palette (primary + secondary)", "Typography system", "Logo usage rules", "Tone of voice guide", "Visual direction moodboard", "Do/Don''t examples", "PDF + Figma deliverable"]',
  '["Brand guidelines PDF", "Figma file", "Digital + print-ready versions"]',
  ARRAY['New Brands','Rebranding Companies','Funded Startups'],
  80000,
  '#7c3aed', 9
),

-- ── SOCIAL & ADS ─────────────────────────────────────────────────────────────
(
  'social-ads', 'Performance Ad Pack', 'performance-ad-pack',
  'Ad creatives that actually convert',
  '5 high-performance AI ad creatives tested and optimised for Meta and Google. Includes static images, video ads and copy variants — ready to launch.',
  20000, 75000, 'per pack', 2,
  false, false, true,
  NULL, 'blue',
  '["5 × ad creatives (static + video)", "A/B testing variants", "Ad copy for each creative", "Platform-specific sizing", "2 revision rounds", "48-hour delivery"]',
  '["Ad creative files", "Copy doc", "Spec sheet for ad manager"]',
  ARRAY['Performance Marketers','D2C Brands','E-commerce'],
  75000,
  '#2563eb', 10
),

-- ── PRINT ────────────────────────────────────────────────────────────────────
(
  'print', 'Print Creatives Pack', 'print-creatives-pack',
  'From digital to physical, instantly',
  '10 print-ready AI-generated posters, banners and creatives. Includes outdoor (OOH), in-store display and digital print formats — all at 300 DPI.',
  12000, 45000, 'per pack', 2,
  false, false, true,
  NULL, 'blue',
  '["10 × print-ready creatives", "OOH format (6×4 ft)", "In-store display sizes", "A4/A3 poster formats", "300 DPI resolution", "2 revision rounds"]',
  '["Print-ready PDF files", "Editable source files"]',
  ARRAY['Retail Brands','Events','FMCG'],
  45000,
  '#0284c7', 11
);

-- ── Seed: add-ons ─────────────────────────────────────────────────────────────
INSERT INTO service_addons (name, slug, description, price, compatible_with, icon, sort_order) VALUES
  ('Rush Delivery (24hr)',        'rush-delivery',       'Get your deliverables in 24 hours instead of the standard turnaround.',      8000,  '{}',                       '⚡', 1),
  ('Extra Revision Round',        'extra-revision',      'One additional round of revisions on top of what''s included.',              3000,  '{}',                       '✏️', 2),
  ('Platform Optimisation Pack',  'platform-pack',       'All assets resized and optimised for every major platform.',                 5000,  '{}',                       '📐', 3),
  ('Multilingual Dubbing',        'multilingual-dub',    'AI-powered dubbing in any language. Price is per language.',                 7000,  ARRAY['brand-film','campaign-sprint','product-demo-video'],   '🌐', 4),
  ('Raw + Source Files',          'raw-source-files',    'Receive all raw project files, source assets and editable formats.',         5000,  '{}',                       '📦', 5),
  ('Extended Usage License',      'extended-license',    'Use assets in broadcast TV, OOH and large-scale campaigns.',                10000, '{}',                       '📜', 6),
  ('Performance Analytics Report','analytics-report',    'Post-campaign performance breakdown and creative recommendations.',          4000,  ARRAY['performance-ad-pack','social-creatives-pack','campaign-sprint'], '📊', 7),
  ('Pitch Deck Visuals (5 slides)','pitch-deck-addon',   'AI-generated pitch deck slides that match your brand.',                     8000,  '{}',                       '💼', 8);
