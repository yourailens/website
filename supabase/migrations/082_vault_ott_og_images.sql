-- ============================================================
-- 082 · Pre-baked OG share thumbs for vault cuts + OTT cuts
-- 1200×630 JPEGs on S3 for WhatsApp / link previews.
-- ============================================================

alter table public.yail_vault_entries
  add column if not exists og_image_url text;

alter table public.ott_cuts
  add column if not exists og_image_url text;

comment on column public.yail_vault_entries.og_image_url is
  'Public S3 URL of 1200×630 JPEG for og:image / WhatsApp.';

comment on column public.ott_cuts.og_image_url is
  'Public S3 URL of 1200×630 JPEG for og:image / WhatsApp.';
