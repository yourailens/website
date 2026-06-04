-- ════════════════════════════════════════════════════════════
-- 036 · Industry sample brands (multimedia brand worlds)
-- Run AFTER 035_industry_playbook_captions.sql (Supabase SQL Editor).
-- ════════════════════════════════════════════════════════════

-- ── Sample brands (fictional worlds per industry) ─────────────
CREATE TABLE public.industry_sample_brands (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_id       uuid        NOT NULL REFERENCES public.industries(id) ON DELETE CASCADE,
  slug              text        NOT NULL,
  name              text        NOT NULL,
  tagline           text,
  description       text,
  hero_image_url    text,
  hero_media_type   text        NOT NULL DEFAULT 'image'
                                CHECK (hero_media_type IN ('image', 'video')),
  hero_aspect_ratio text        NOT NULL DEFAULT 'landscape'
                                CHECK (hero_aspect_ratio IN (
                                  'portrait', 'portrait_45', 'square', 'landscape', 'ultrawide'
                                )),
  hero_poster_url   text,
  hero_caption      text,
  cover_image_url   text,
  cover_media_type  text        NOT NULL DEFAULT 'image'
                                CHECK (cover_media_type IN ('image', 'video')),
  cover_aspect_ratio text       NOT NULL DEFAULT 'landscape'
                                CHECK (cover_aspect_ratio IN (
                                  'portrait', 'portrait_45', 'square', 'landscape', 'ultrawide'
                                )),
  cover_poster_url  text,
  sort_order        integer     NOT NULL DEFAULT 0,
  published         boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (industry_id, slug),
  CONSTRAINT industry_sample_brands_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$')
);

-- ── Brand media (images & videos, tagged by ratio + creative category) ──
CREATE TABLE public.industry_sample_brand_media (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id        uuid        NOT NULL REFERENCES public.industry_sample_brands(id) ON DELETE CASCADE,
  media_type      text        NOT NULL DEFAULT 'image'
                              CHECK (media_type IN ('image', 'video')),
  aspect_ratio    text        NOT NULL DEFAULT 'landscape'
                              CHECK (aspect_ratio IN (
                                'portrait', 'portrait_45', 'square', 'landscape', 'ultrawide'
                              )),
  category        text        NOT NULL DEFAULT 'situations'
                              CHECK (category IN (
                                'people',
                                'products_objects',
                                'ambience',
                                'situations',
                                'posters',
                                'social_creatives',
                                'brand_identity',
                                'campaign_hero'
                              )),
  label           text,
  caption         text,
  media_url       text        NOT NULL,
  poster_url      text,
  sort_order      integer     NOT NULL DEFAULT 0,
  published       boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── updated_at triggers ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.industry_sample_brands_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

CREATE TRIGGER industry_sample_brands_updated_at_trigger
  BEFORE UPDATE ON public.industry_sample_brands
  FOR EACH ROW EXECUTE FUNCTION public.industry_sample_brands_set_updated_at();

CREATE OR REPLACE FUNCTION public.industry_sample_brand_media_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

CREATE TRIGGER industry_sample_brand_media_updated_at_trigger
  BEFORE UPDATE ON public.industry_sample_brand_media
  FOR EACH ROW EXECUTE FUNCTION public.industry_sample_brand_media_set_updated_at();

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX industry_sample_brands_industry_idx
  ON public.industry_sample_brands (industry_id, sort_order);
CREATE INDEX industry_sample_brands_pub_idx
  ON public.industry_sample_brands (industry_id, published, sort_order);

CREATE INDEX industry_sample_brand_media_brand_idx
  ON public.industry_sample_brand_media (brand_id, sort_order);
CREATE INDEX industry_sample_brand_media_pub_idx
  ON public.industry_sample_brand_media (brand_id, published, media_type, sort_order);
CREATE INDEX industry_sample_brand_media_filter_idx
  ON public.industry_sample_brand_media (brand_id, published, media_type, aspect_ratio, category);

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.industry_sample_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.industry_sample_brand_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sample_brands_public_read" ON public.industry_sample_brands
  FOR SELECT USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.industries i
      WHERE i.id = industry_sample_brands.industry_id AND i.published = true
    )
  );

CREATE POLICY "sample_brand_media_public_read" ON public.industry_sample_brand_media
  FOR SELECT USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.industry_sample_brands b
      JOIN public.industries i ON i.id = b.industry_id
      WHERE b.id = industry_sample_brand_media.brand_id
        AND b.published = true
        AND i.published = true
    )
  );

CREATE POLICY "sample_brands_service_all" ON public.industry_sample_brands
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "sample_brand_media_service_all" ON public.industry_sample_brand_media
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ── Seed: one placeholder brand per industry (add media in admin) ──
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
    'real-estate',
    'harbor-point-residences',
    'Harbor Point Residences',
    'A waterfront developer brand — listings, tours, and lifestyle.',
    'Sample world: staging, exteriors, avatar hosts, and motion for property marketing.',
    1
  ),
  (
    'd2c-ecommerce',
    'luna-botanica',
    'Luna Botanica',
    'Plant-based skincare built for ritual, not rush.',
    'Sample world: packshots, UGC-style social, launch films, and paid variants.',
    1
  ),
  (
    'saas-b2b',
    'pulsegrid',
    'PulseGrid',
    'Ops analytics for teams who live in the dashboard.',
    'Sample world: UI-in-context, explainers, presenters, and LinkedIn-ready assets.',
    1
  )
) AS v(industry_slug, slug, name, tagline, description, sort_order)
  ON i.slug = v.industry_slug;
