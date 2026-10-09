-- ============================================================
-- 076 · YAIL Vault AI Avatars
-- Avatar names accumulate like genre / subject / label tags.
-- ============================================================

alter table public.yail_vault_tags
  drop constraint if exists yail_vault_tags_kind_check;

alter table public.yail_vault_tags
  add constraint yail_vault_tags_kind_check
  check (kind in ('genre', 'subject', 'label', 'avatar'));

comment on table public.yail_vault_tags is
  'Reusable vault taxonomies: genre, subject, label, avatar.';
