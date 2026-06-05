import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { CharacterSheet } from "@/data/character_sheets";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}

function readClient() {
  try { return createServiceRoleClient(); } catch { return anonClient(); }
}

type Row = Record<string, unknown>;

function rowToCharacterSheet(r: Row): CharacterSheet {
  return {
    id:             String(r.id ?? ""),
    slug:           String(r.slug ?? ""),
    title:          String(r.title ?? ""),
    description:    (r.description as string | null) ?? null,
    image_url:      String(r.image_url ?? ""),
    ethnicity:      (r.ethnicity as CharacterSheet["ethnicity"]) ?? "other",
    age_group:      (r.age_group as CharacterSheet["age_group"]) ?? "adult",
    gender:         (r.gender as CharacterSheet["gender"]) ?? "female",
    skin_tone:      (r.skin_tone as CharacterSheet["skin_tone"]) ?? "medium",
    archetype:      (r.archetype as CharacterSheet["archetype"]) ?? "everyman",
    nationality:    (r.nationality as string | null) ?? null,
    hair_color:     (r.hair_color as string | null) ?? null,
    eye_color:      (r.eye_color as string | null) ?? null,
    style_tags:     (r.style_tags as string[]) ?? [],
    aspect_ratio:   (r.aspect_ratio as CharacterSheet["aspect_ratio"]) ?? "portrait",
    download_count: Number(r.download_count ?? 0),
    view_count:     Number(r.view_count ?? 0),
    featured:       Boolean(r.featured),
    published:      Boolean(r.published),
    sort_order:     Number(r.sort_order ?? 0),
    created_at:     String(r.created_at ?? ""),
  };
}

const SELECT_COLS = [
  "id", "slug", "title", "description", "image_url",
  "ethnicity", "age_group", "gender", "skin_tone", "archetype",
  "nationality", "hair_color", "eye_color", "style_tags", "aspect_ratio",
  "download_count", "view_count", "featured", "published", "sort_order", "created_at",
].join(", ");

export async function getPublishedCharacterSheets(opts?: {
  search?: string;
  ethnicity?: string;
  age_group?: string;
  gender?: string;
  archetype?: string;
  limit?: number;
  offset?: number;
}): Promise<CharacterSheet[]> {
  const db = readClient();
  let q = db
    .from("character_sheets")
    .select(SELECT_COLS)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts?.ethnicity) q = q.eq("ethnicity", opts.ethnicity);
  if (opts?.age_group) q = q.eq("age_group", opts.age_group);
  if (opts?.gender)    q = q.eq("gender", opts.gender);
  if (opts?.archetype) q = q.eq("archetype", opts.archetype);
  if (opts?.search)    q = q.textSearch("search_vector", opts.search, { type: "websearch" });
  if (opts?.limit)     q = q.limit(opts.limit);
  if (opts?.offset)    q = q.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1);

  const { data, error } = await q;
  if (error) { console.error("getPublishedCharacterSheets error:", error); return []; }
  return (data ?? []).map((r) => rowToCharacterSheet(r as unknown as Row));
}

export async function getCharacterSheetBySlug(slug: string): Promise<CharacterSheet | null> {
  const db = readClient();
  const { data, error } = await db
    .from("character_sheets")
    .select(SELECT_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error || !data) return null;
  return rowToCharacterSheet(data as unknown as Row);
}

export async function adminGetAllCharacterSheets(): Promise<CharacterSheet[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("character_sheets")
    .select(SELECT_COLS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) { console.error("adminGetAllCharacterSheets error:", error); return []; }
  return (data ?? []).map((r) => rowToCharacterSheet(r as unknown as Row));
}

export async function adminGetCharacterSheetById(id: string): Promise<CharacterSheet | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("character_sheets")
    .select(SELECT_COLS)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return rowToCharacterSheet(data as unknown as Row);
}
