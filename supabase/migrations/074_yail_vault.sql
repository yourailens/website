-- ============================================================
-- 074 · YAIL Vault
-- GenAI lab experiments for AI Filmmaking and AI Ads.
-- Tags (genre / subject / label) accumulate for reuse.
-- ============================================================

create table if not exists public.yail_vault_tags (
  id          uuid        primary key default gen_random_uuid(),
  kind        text        not null
                          check (kind in ('genre', 'subject', 'label')),
  name        text        not null,
  slug        text        not null,
  created_at  timestamptz not null default now(),
  constraint yail_vault_tags_slug_format
    check (slug ~ '^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$'),
  constraint yail_vault_tags_kind_slug unique (kind, slug)
);

create index if not exists yail_vault_tags_kind_name_idx
  on public.yail_vault_tags (kind, name);

create table if not exists public.yail_vault_entries (
  id            uuid        primary key default gen_random_uuid(),
  slug          text        not null unique,
  category      text        not null
                            check (category in ('filmmaking', 'ads')),
  title         text        not null,
  caption       text,
  notes         text,
  media_type    text        not null
                            check (media_type in ('image', 'video')),
  media_url     text        not null,
  poster_url    text,
  featured      boolean     not null default false,
  published     boolean     not null default true,
  sort_order    integer     not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint yail_vault_entries_slug_format
    check (slug ~ '^[a-z0-9]([a-z0-9\-]*[a-z0-9])?$')
);

create or replace function public.yail_vault_entries_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists yail_vault_entries_updated_at_trigger on public.yail_vault_entries;
create trigger yail_vault_entries_updated_at_trigger
  before update on public.yail_vault_entries
  for each row execute procedure public.yail_vault_entries_set_updated_at();

-- Only one featured hero at a time
create unique index if not exists yail_vault_one_featured
  on public.yail_vault_entries ((true))
  where featured = true;

create index if not exists yail_vault_entries_rail_idx
  on public.yail_vault_entries (category, published, sort_order desc, created_at desc);

create table if not exists public.yail_vault_entry_tags (
  entry_id  uuid not null references public.yail_vault_entries (id) on delete cascade,
  tag_id    uuid not null references public.yail_vault_tags (id) on delete cascade,
  primary key (entry_id, tag_id)
);

create index if not exists yail_vault_entry_tags_tag_idx
  on public.yail_vault_entry_tags (tag_id);

alter table public.yail_vault_tags enable row level security;
alter table public.yail_vault_entries enable row level security;
alter table public.yail_vault_entry_tags enable row level security;

drop policy if exists "yail_vault_tags_public_read" on public.yail_vault_tags;
create policy "yail_vault_tags_public_read"
  on public.yail_vault_tags for select using (true);

drop policy if exists "yail_vault_tags_service_all" on public.yail_vault_tags;
create policy "yail_vault_tags_service_all"
  on public.yail_vault_tags for all using (true) with check (true);

drop policy if exists "yail_vault_entries_public_read" on public.yail_vault_entries;
create policy "yail_vault_entries_public_read"
  on public.yail_vault_entries for select using (published = true);

drop policy if exists "yail_vault_entries_service_all" on public.yail_vault_entries;
create policy "yail_vault_entries_service_all"
  on public.yail_vault_entries for all using (true) with check (true);

drop policy if exists "yail_vault_entry_tags_public_read" on public.yail_vault_entry_tags;
create policy "yail_vault_entry_tags_public_read"
  on public.yail_vault_entry_tags for select using (true);

drop policy if exists "yail_vault_entry_tags_service_all" on public.yail_vault_entry_tags;
create policy "yail_vault_entry_tags_service_all"
  on public.yail_vault_entry_tags for all using (true) with check (true);
