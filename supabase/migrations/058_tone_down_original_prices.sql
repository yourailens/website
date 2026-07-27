-- ============================================================
-- 058 · Tone down scratched "original price" across all packages
-- ============================================================
-- 057 already fixed Starter (₹1,20,000 → ₹45,000, ~1.5x real price).
-- The other four packages still had a ~4x markup, which read as
-- unrealistic. Bring them all to the same believable ~1.5x ratio.
-- ============================================================

update public.services set original_price = 82500  where slug = 'growth-ai-commercial';     -- ₹55,000 → ₹82,500
update public.services set original_price = 142500 where slug = 'signature-ai-commercial';  -- ₹95,000 → ₹1,42,500
update public.services set original_price = 22500  where slug = 'product-visuals-pack';     -- ₹15,000 → ₹22,500
update public.services set original_price = 52500  where slug = 'campaign-stills-suite';    -- ₹35,000 → ₹52,500
