import type { SupabaseClient } from "@supabase/supabase-js";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";
import {
  isYailVaultCategory,
  isYailVaultTagKind,
  type YailVaultCategory,
  type YailVaultEntry,
  type YailVaultTag,
  type YailVaultTagKind,
} from "@/data/yail-vault";
import { createServiceRoleClient } from "@/lib/supabase/admin";

type EntryRow = {
  id: string;
  slug: string;
  category: string;
  title: string;
  caption: string | null;
  notes: string | null;
  media_type: string;
  media_url: string;
  poster_url: string | null;
  ai_model: string | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type AvatarRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  bio: string | null;
  portrait_url: string;
  accent: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type TagRow = {
  id: string;
  kind: string;
  name: string;
  slug: string;
};

function slugify(raw: string) {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

function rowToTag(row: TagRow): YailVaultTag | null {
  if (!isYailVaultTagKind(row.kind)) return null;
  return { id: row.id, kind: row.kind, name: row.name, slug: row.slug };
}

function rowToAvatar(row: AvatarRow): YailVaultAvatar {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    bio: row.bio,
    portrait_url: row.portrait_url,
    accent: row.accent,
    sort_order: row.sort_order,
    published: row.published,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function rowToEntry(
  row: EntryRow,
  tags: YailVaultTag[],
  avatarIds: string[]
): YailVaultEntry | null {
  if (!isYailVaultCategory(row.category)) return null;
  if (row.media_type !== "image" && row.media_type !== "video") return null;
  return {
    id: row.id,
    slug: row.slug,
    category: row.category,
    title: row.title,
    caption: row.caption,
    notes: row.notes,
    media_type: row.media_type,
    media_url: row.media_url,
    poster_url: row.poster_url,
    ai_model: row.ai_model ?? null,
    avatar_ids: avatarIds,
    featured: row.featured,
    published: row.published,
    sort_order: row.sort_order,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags,
  };
}

async function loadTagsForEntries(
  db: SupabaseClient,
  entryIds: string[]
): Promise<Map<string, YailVaultTag[]>> {
  const map = new Map<string, YailVaultTag[]>();
  if (!entryIds.length) return map;
  const { data, error } = await db
    .from("yail_vault_entry_tags")
    .select("entry_id, tag:yail_vault_tags(id, kind, name, slug)")
    .in("entry_id", entryIds);
  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    const entryId = (row as { entry_id: string }).entry_id;
    const tagRaw = (row as { tag: TagRow | TagRow[] | null }).tag;
    const tagRow = Array.isArray(tagRaw) ? tagRaw[0] : tagRaw;
    if (!tagRow) continue;
    const tag = rowToTag(tagRow);
    if (!tag) continue;
    const list = map.get(entryId) ?? [];
    list.push(tag);
    map.set(entryId, list);
  }
  return map;
}

async function loadAvatarsForEntries(
  db: SupabaseClient,
  entryIds: string[]
): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!entryIds.length) return map;
  const { data, error } = await db
    .from("yail_vault_entry_avatars")
    .select("entry_id, avatar_id")
    .in("entry_id", entryIds);
  if (error) {
    // Junction missing before migration 079 — fail soft
    if (/does not exist|schema cache/i.test(error.message)) return map;
    throw new Error(error.message);
  }
  for (const row of data ?? []) {
    const entryId = (row as { entry_id: string }).entry_id;
    const avatarId = (row as { avatar_id: string }).avatar_id;
    if (!entryId || !avatarId) continue;
    const list = map.get(entryId) ?? [];
    list.push(avatarId);
    map.set(entryId, list);
  }
  return map;
}

async function hydrateEntries(db: SupabaseClient, rows: EntryRow[]): Promise<YailVaultEntry[]> {
  const ids = rows.map((r) => r.id);
  const [tagsByEntry, avatarsByEntry] = await Promise.all([
    loadTagsForEntries(db, ids),
    loadAvatarsForEntries(db, ids),
  ]);
  return rows
    .map((row) =>
      rowToEntry(row, tagsByEntry.get(row.id) ?? [], avatarsByEntry.get(row.id) ?? [])
    )
    .filter((e): e is YailVaultEntry => Boolean(e));
}

export async function uniqueVaultSlug(db: SupabaseClient, title: string, exceptId?: string) {
  const base = slugify(title) || "vault-cut";
  let candidate = base;
  let n = 2;
  for (;;) {
    let q = db.from("yail_vault_entries").select("id").eq("slug", candidate).limit(1);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q;
    if (!data?.length) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function ensureVaultTag(
  db: SupabaseClient,
  kind: YailVaultTagKind,
  nameRaw: string
): Promise<YailVaultTag | null> {
  const name = nameRaw.trim();
  if (!name) return null;
  const slug = slugify(name);
  if (!slug) return null;

  const { data: existing } = await db
    .from("yail_vault_tags")
    .select("id, kind, name, slug")
    .eq("kind", kind)
    .eq("slug", slug)
    .maybeSingle();
  if (existing) {
    const tag = rowToTag(existing as TagRow);
    return tag;
  }

  const { data, error } = await db
    .from("yail_vault_tags")
    .insert({ kind, name, slug })
    .select("id, kind, name, slug")
    .single();
  if (error) throw new Error(error.message);
  return rowToTag(data as TagRow);
}

export async function setEntryTags(
  db: SupabaseClient,
  entryId: string,
  tags: { kind: YailVaultTagKind; name: string }[]
) {
  const resolved: YailVaultTag[] = [];
  for (const item of tags) {
    const tag = await ensureVaultTag(db, item.kind, item.name);
    if (tag) resolved.push(tag);
  }
  // Deduplicate by id
  const unique = [...new Map(resolved.map((t) => [t.id, t])).values()];
  await db.from("yail_vault_entry_tags").delete().eq("entry_id", entryId);
  if (unique.length) {
    const { error } = await db.from("yail_vault_entry_tags").insert(
      unique.map((t) => ({ entry_id: entryId, tag_id: t.id }))
    );
    if (error) throw new Error(error.message);
  }
  return unique;
}

/** Replace avatar links on a cut. Empty array clears all. */
export async function setEntryAvatars(db: SupabaseClient, entryId: string, avatarIds: string[]) {
  const unique = [...new Set(avatarIds.map((id) => id.trim()).filter(Boolean))];
  await db.from("yail_vault_entry_avatars").delete().eq("entry_id", entryId);
  if (!unique.length) return [];
  const { error } = await db.from("yail_vault_entry_avatars").insert(
    unique.map((avatar_id) => ({ entry_id: entryId, avatar_id }))
  );
  if (error) throw new Error(error.message);
  return unique;
}

/** Parse avatar_ids from admin body (array, or legacy single avatar_id). */
export function parseAvatarIds(b: Record<string, unknown>): string[] | undefined {
  if ("avatar_ids" in b) {
    const raw = b.avatar_ids;
    if (!Array.isArray(raw)) return [];
    return [...new Set(raw.map((v) => String(v ?? "").trim()).filter(Boolean))];
  }
  if ("avatar_id" in b) {
    const raw = typeof b.avatar_id === "string" ? b.avatar_id.trim() : "";
    return raw ? [raw] : [];
  }
  return undefined;
}

export async function clearOtherFeatured(db: SupabaseClient, exceptId?: string) {
  let q = db.from("yail_vault_entries").update({ featured: false }).eq("featured", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

export async function listVaultTags(kind?: YailVaultTagKind): Promise<YailVaultTag[]> {
  const db = createServiceRoleClient();
  let q = db.from("yail_vault_tags").select("id, kind, name, slug").order("name");
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((row) => rowToTag(row as TagRow))
    .filter((t): t is YailVaultTag => Boolean(t));
}

export async function adminGetAllVaultEntries(): Promise<YailVaultEntry[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yail_vault_entries")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return hydrateEntries(db, (data ?? []) as EntryRow[]);
}

export async function getPublishedVaultEntries(category?: YailVaultCategory): Promise<YailVaultEntry[]> {
  const db = createServiceRoleClient();
  let q = db
    .from("yail_vault_entries")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error) {
    // Missing table before migration — fail soft for public page
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return hydrateEntries(db, (data ?? []) as EntryRow[]);
}

export async function getFeaturedVaultEntry(): Promise<YailVaultEntry | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yail_vault_entries")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .maybeSingle();
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return null;
    throw new Error(error.message);
  }
  if (data) {
    const [entry] = await hydrateEntries(db, [data as EntryRow]);
    if (entry) return entry;
  }
  const published = await getPublishedVaultEntries();
  return published[0] ?? null;
}

export async function getVaultEntryBySlug(slug: string): Promise<YailVaultEntry | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yail_vault_entries")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  const [entry] = await hydrateEntries(db, [data as EntryRow]);
  return entry ?? null;
}

export async function uniqueAvatarSlug(db: SupabaseClient, name: string, exceptId?: string) {
  const base = slugify(name) || "avatar";
  let candidate = base;
  let n = 2;
  for (;;) {
    let q = db.from("yail_vault_avatars").select("id").eq("slug", candidate).limit(1);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q;
    if (!data?.length) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function adminGetAllVaultAvatars(): Promise<YailVaultAvatar[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yail_vault_avatars")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return ((data ?? []) as AvatarRow[]).map(rowToAvatar);
}

export async function getPublishedVaultAvatars(): Promise<YailVaultAvatar[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yail_vault_avatars")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (/does not exist|schema cache/i.test(error.message)) return [];
    throw new Error(error.message);
  }
  return ((data ?? []) as AvatarRow[]).map(rowToAvatar);
}

export async function getVaultAvatarById(id: string): Promise<YailVaultAvatar | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("yail_vault_avatars").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return rowToAvatar(data as AvatarRow);
}

export async function getVaultAvatarsByIds(ids: string[]): Promise<YailVaultAvatar[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return [];
  const db = createServiceRoleClient();
  const { data, error } = await db.from("yail_vault_avatars").select("*").in("id", unique);
  if (error || !data) return [];
  const byId = new Map(((data ?? []) as AvatarRow[]).map((row) => [row.id, rowToAvatar(row)]));
  return unique.map((id) => byId.get(id)).filter((a): a is YailVaultAvatar => Boolean(a));
}
