-- ============================================================
-- 077 · YAIL Vault AI model credit
-- Stores catalog id (see src/data/yail-vault-models.ts).
-- ============================================================

alter table public.yail_vault_entries
  add column if not exists ai_model text;

comment on column public.yail_vault_entries.ai_model is
  'Optional AI model catalog id from YAIL_VAULT_AI_MODELS.';
