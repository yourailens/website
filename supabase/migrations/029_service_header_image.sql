-- 029_service_header_image.sql
-- Package hero/banner image for service detail pages (upload via admin).
-- Run AFTER 026_services.sql

ALTER TABLE services
  ADD COLUMN IF NOT EXISTS header_image_url text;

COMMENT ON COLUMN services.header_image_url IS
  'Wide banner image at top of /pricing/[slug] package page. Upload from admin.';

-- If cover_url was set earlier, use it as the header image
UPDATE services
SET header_image_url = cover_url
WHERE header_image_url IS NULL
  AND cover_url IS NOT NULL;
