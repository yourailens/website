-- ============================================================
-- 081 · YAIL Vault avatar OG share thumbnails
-- Pre-baked 1200×630 JPEGs on S3 for WhatsApp / link previews.
-- ============================================================

alter table public.yail_vault_avatars
  add column if not exists og_image_url text;

comment on column public.yail_vault_avatars.og_image_url is
  'Public S3 URL of the 1200×630 JPEG used for og:image / WhatsApp share.';
