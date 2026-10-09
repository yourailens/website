-- ============================================================
-- 079 · YAIL Vault — multiple avatars per cut
-- Junction replaces single yail_vault_entries.avatar_id.
-- ============================================================

create table if not exists public.yail_vault_entry_avatars (
  entry_id   uuid not null references public.yail_vault_entries (id) on delete cascade,
  avatar_id  uuid not null references public.yail_vault_avatars (id) on delete cascade,
  primary key (entry_id, avatar_id)
);

create index if not exists yail_vault_entry_avatars_avatar_idx
  on public.yail_vault_entry_avatars (avatar_id);

-- Copy legacy single FK into the junction
insert into public.yail_vault_entry_avatars (entry_id, avatar_id)
select id, avatar_id
from public.yail_vault_entries
where avatar_id is not null
on conflict do nothing;

alter table public.yail_vault_entries
  drop column if exists avatar_id;

alter table public.yail_vault_entry_avatars enable row level security;

drop policy if exists "yail_vault_entry_avatars_public_read" on public.yail_vault_entry_avatars;
create policy "yail_vault_entry_avatars_public_read"
  on public.yail_vault_entry_avatars for select using (true);

drop policy if exists "yail_vault_entry_avatars_service_all" on public.yail_vault_entry_avatars;
create policy "yail_vault_entry_avatars_service_all"
  on public.yail_vault_entry_avatars for all using (true) with check (true);

comment on table public.yail_vault_entry_avatars is
  'Many-to-many: vault cuts tagged with one or more AI Avatars.';
