-- ============================================================
-- 075 · YAIL Vault thumbnails
-- poster_url holds the still used on rail cards (play overlay).
-- Auto-filled on video upload; images use their own media_url.
-- ============================================================

alter table public.yail_vault_entries
  add column if not exists poster_url text;

comment on column public.yail_vault_entries.poster_url is
  'Thumbnail still for vault cards. Videos: frame grabbed on upload. Images: usually the same as media_url.';

create index if not exists yail_vault_entries_poster_idx
  on public.yail_vault_entries (id)
  where poster_url is not null;
