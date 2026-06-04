-- ════════════════════════════════════════════════════════════
-- 030 · Industries & Playbooks
-- Vertical sales showcases: industry → playbooks → examples
-- Run this file in Supabase SQL Editor (separate from earlier migrations).
-- ════════════════════════════════════════════════════════════

-- ── Industries (verticals) ───────────────────────────────────
CREATE TABLE public.industries (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text        NOT NULL UNIQUE,
  name            text        NOT NULL,
  tagline         text,
  description     text,
  hero_image_url  text,
  cover_image_url text,
  accent_color    text        NOT NULL DEFAULT '#2563eb',
  theme_key       text        NOT NULL DEFAULT 'default'
                              CHECK (theme_key IN ('real_estate', 'd2c', 'saas')),
  icon_label      text,
  sort_order      integer     NOT NULL DEFAULT 0,
  published       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT industries_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Playbooks (modules within an industry) ───────────────────
CREATE TABLE public.industry_playbooks (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id     uuid        NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  slug            text        NOT NULL,
  name            text        NOT NULL,
  tagline         text,
  description     text,
  icon_label      text,
  sort_order      integer     NOT NULL DEFAULT 0,
  published       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (industry_id, slug),
  CONSTRAINT industry_playbooks_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Examples (media inside a playbook) ───────────────────────
CREATE TABLE public.industry_playbook_examples (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  playbook_id     uuid        NOT NULL REFERENCES public.industry_playbooks(id) ON DELETE CASCADE,
  title           text        NOT NULL,
  caption         text,
  media_url       text        NOT NULL,
  media_type      text        NOT NULL DEFAULT 'image'
                              CHECK (media_type IN ('image', 'video')),
  poster_url      text,
  aspect_ratio    text        NOT NULL DEFAULT 'landscape'
                              CHECK (aspect_ratio IN ('portrait', 'square', 'landscape')),
  service_slug    text,
  sort_order      integer     NOT NULL DEFAULT 0,
  published       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── updated_at triggers ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.industries_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

CREATE TRIGGER industries_updated_at_trigger
  BEFORE UPDATE ON public.industries
  FOR EACH ROW EXECUTE FUNCTION public.industries_set_updated_at();

CREATE OR REPLACE FUNCTION public.industry_playbooks_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

CREATE TRIGGER industry_playbooks_updated_at_trigger
  BEFORE UPDATE ON public.industry_playbooks
  FOR EACH ROW EXECUTE FUNCTION public.industry_playbooks_set_updated_at();

CREATE OR REPLACE FUNCTION public.industry_playbook_examples_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

CREATE TRIGGER industry_playbook_examples_updated_at_trigger
  BEFORE UPDATE ON public.industry_playbook_examples
  FOR EACH ROW EXECUTE FUNCTION public.industry_playbook_examples_set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX industries_pub_idx ON public.industries (published, sort_order);
CREATE INDEX industry_playbooks_industry_idx ON public.industry_playbooks (industry_id, sort_order);
CREATE INDEX industry_playbooks_pub_idx ON public.industry_playbooks (industry_id, published, sort_order);
CREATE INDEX industry_examples_playbook_idx ON public.industry_playbook_examples (playbook_id, sort_order);
CREATE INDEX industry_examples_pub_idx ON public.industry_playbook_examples (playbook_id, published, sort_order);

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_playbook_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "industries_public_read" ON public.industries
  FOR SELECT USING (published = true);

CREATE POLICY "industry_playbooks_public_read" ON public.industry_playbooks
  FOR SELECT USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.industries i
      WHERE i.id = industry_playbooks.industry_id AND i.published = true
    )
  );

CREATE POLICY "industry_examples_public_read" ON public.industry_playbook_examples
  FOR SELECT USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.industry_playbooks p
      JOIN public.industries i ON i.id = p.industry_id
      WHERE p.id = industry_playbook_examples.playbook_id
        AND p.published = true
        AND i.published = true
    )
  );

CREATE POLICY "industries_service_all" ON public.industries
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "industry_playbooks_service_all" ON public.industry_playbooks
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "industry_examples_service_all" ON public.industry_playbook_examples
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ════════════════════════════════════════════════════════════
-- Seed: 3 industries + playbooks (examples via admin upload)
-- ════════════════════════════════════════════════════════════

INSERT INTO public.industries (slug, name, tagline, description, accent_color, theme_key, icon_label, sort_order, published) VALUES
(
  'real-estate',
  'Real Estate & Property',
  'Listings, staging, and property stories — built with AI.',
  'Show leads how virtual staging, site renders, avatar hosts, and motion tours fit their brokerage or developer brand.',
  '#b45309',
  'real_estate',
  'Building',
  1,
  true
),
(
  'd2c-ecommerce',
  'D2C & E‑commerce',
  'Product drops, lifestyle mockups, and performance ads at scale.',
  'From packshots to UGC-style reels — package examples that match how consumer brands buy creative today.',
  '#db2777',
  'd2c',
  'Shopping',
  2,
  true
),
(
  'saas-b2b',
  'SaaS & B2B Tech',
  'Product UI in context, explainers, and trust-forward brand films.',
  'Demo-ready visuals for founders and product marketing teams who need UI mockups, explainers, and presenter avatars.',
  '#4f46e5',
  'saas',
  'Layers',
  3,
  true
);

-- Real Estate playbooks
INSERT INTO public.industry_playbooks (industry_id, slug, name, tagline, description, icon_label, sort_order, published)
SELECT i.id, v.slug, v.name, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  ('listing-interior-mockups', 'Listing & Interior Mockups', 'Empty rooms → furnished, renovated, or styled.', 'Virtual staging and interior sets for residential and commercial listings.', 'Home', 1),
  ('site-exterior-visuals', 'Site & Exterior Visuals', 'Plots, towers, amenities, and skyline context.', 'Exterior renders and masterplan visuals for developers and agencies.', 'Map', 2),
  ('avatar-hosts', 'Avatar Hosts', 'Photoreal agents living inside the property.', 'Consistent presenter avatars for walkthroughs, intros, and social clips.', 'User', 3),
  ('motion-tours', 'Motion & Property Tours', 'Reels, flythroughs, before/after films.', 'Short-form video for listings, launches, and channel-first marketing.', 'Film', 4),
  ('brand-brochures', 'Brand & Brochure Assets', 'Signage, OOH, pitch decks for developers.', 'Print-ready and presentation visuals for property brands.', 'File', 5)
) AS v(slug, name, tagline, description, icon_label, sort_order)
WHERE i.slug = 'real-estate';

-- D2C playbooks
INSERT INTO public.industry_playbooks (industry_id, slug, name, tagline, description, icon_label, sort_order, published)
SELECT i.id, v.slug, v.name, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  ('product-lifestyle-mockups', 'Product & Lifestyle Mockups', 'Packshots, in-context, and UGC-style stills.', 'Hero product imagery and lifestyle scenes for D2C catalogs and PDPs.', 'Image', 1),
  ('performance-ad-packs', 'Performance Ad Packs', 'Meta, TikTok, and variant hooks.', 'High-volume ad creatives with format-specific crops and copy zones.', 'Zap', 2),
  ('brand-films-launch', 'Brand Films & Launches', 'Hero films, drops, and seasonal campaigns.', 'Launch films and tentpole content for new SKUs and collections.', 'Play', 3),
  ('avatar-creators', 'Avatar Creators & Mascots', 'A consistent face for your brand.', 'Creator-style avatars for organic social and ambassador programs.', 'Sparkles', 4),
  ('print-packaging', 'Print & Packaging', 'Boxes, inserts, retail POS.', 'Physical touchpoints that match your digital campaign look.', 'Package', 5)
) AS v(slug, name, tagline, description, icon_label, sort_order)
WHERE i.slug = 'd2c-ecommerce';

-- SaaS playbooks
INSERT INTO public.industry_playbooks (industry_id, slug, name, tagline, description, icon_label, sort_order, published)
SELECT i.id, v.slug, v.name, v.tagline, v.description, v.icon_label, v.sort_order, true
FROM public.industries i
CROSS JOIN (VALUES
  ('product-ui-mockups', 'Product UI Mockups', 'Dashboards in devices, feature highlights.', 'UI-in-context for websites, ads, and sales decks.', 'Monitor', 1),
  ('explainer-demo-films', 'Explainer & Demo Films', 'Motion for features and launches.', 'Product marketing films with clear narrative beats.', 'Clapperboard', 2),
  ('avatar-presenters', 'Avatar Presenters', 'Hosts for demos, webinars, and social.', 'Trust-forward presenters without a full shoot.', 'Mic', 3),
  ('social-employer-brand', 'Social & Employer Brand', 'LinkedIn, hiring, and event assets.', 'Always-on social and culture content for B2B teams.', 'Share', 4),
  ('sales-enablement', 'Sales Enablement', 'Decks, one-pagers, and case tiles.', 'Visuals that support outbound and enterprise sales.', 'Briefcase', 5)
) AS v(slug, name, tagline, description, icon_label, sort_order)
WHERE i.slug = 'saas-b2b';
