-- ============================================================
-- 078 · YAIL Vault AI Avatar directory
-- Catalog of studio avatars (portrait + bio) linked to cuts.
-- ============================================================

create table if not exists public.yail_vault_avatars (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null unique,
  name          text        not null,
  tagline       text,
  bio           text,
  portrait_url  text        not null,
  accent        text,
  sort_order    integer     not null default 0,
  published     boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint yail_vault_avatars_slug_format
    check (slug ~ '^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$')
);

create or replace function public.yail_vault_avatars_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists yail_vault_avatars_updated_at_trigger on public.yail_vault_avatars;
create trigger yail_vault_avatars_updated_at_trigger
  before update on public.yail_vault_avatars
  for each row execute procedure public.yail_vault_avatars_set_updated_at();

create index if not exists yail_vault_avatars_rail_idx
  on public.yail_vault_avatars (published, sort_order desc, created_at desc);

alter table public.yail_vault_entries
  add column if not exists avatar_id uuid
    references public.yail_vault_avatars (id) on delete set null;

create index if not exists yail_vault_entries_avatar_idx
  on public.yail_vault_entries (avatar_id);

alter table public.yail_vault_avatars enable row level security;

drop policy if exists "yail_vault_avatars_public_read" on public.yail_vault_avatars;
create policy "yail_vault_avatars_public_read"
  on public.yail_vault_avatars for select using (published = true);

drop policy if exists "yail_vault_avatars_service_all" on public.yail_vault_avatars;
create policy "yail_vault_avatars_service_all"
  on public.yail_vault_avatars for all using (true) with check (true);

comment on table public.yail_vault_avatars is
  'YAIL Vault AI Avatar directory — portraits shown as jumbotron profiles.';
