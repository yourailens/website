-- ============================================================
-- 057 · Starter AI Commercial: tone down the scratched price
-- ============================================================
-- The struck-through "original price" next to ₹30,000 was ₹1,20,000
-- (4x markup), which read as unrealistic. Bring it down to ₹45,000.
-- ============================================================

update public.services set
  original_price = 45000
where slug = 'starter-ai-commercial';
