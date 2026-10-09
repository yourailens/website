-- ============================================================
-- 080 · YAIL Vault media aspect (any ratio)
-- Store pixel size so rails can size cards to the real frame.
-- ============================================================

alter table public.yail_vault_entries
  add column if not exists aspect_width  integer,
  add column if not exists aspect_height integer;

alter table public.yail_vault_entries
  drop constraint if exists yail_vault_entries_aspect_positive;

alter table public.yail_vault_entries
  add constraint yail_vault_entries_aspect_positive
  check (
    (aspect_width is null and aspect_height is null)
    or (aspect_width > 0 and aspect_height > 0)
  );
