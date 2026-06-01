-- ─────────────────────────────────────────────────────────────────────────────
-- 028_remove_emoji_icons.sql
-- Clear emoji icon fields from categories and add-ons
-- ─────────────────────────────────────────────────────────────────────────────

UPDATE service_categories SET icon = NULL;
UPDATE service_addons       SET icon = NULL;
