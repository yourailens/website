import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Outfit } from "@/data/outfits";

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

function rowToOutfit(r: Row): Outfit {
  return {
    id:             String(r.id ?? ""),
    slug:           String(r.slug ?? ""),
    title:          String(r.title ?? ""),
    description:    (r.description as string | null) ?? null,
    image_url:      String(r.image_url ?? ""),
    category:       (r.category as Outfit["category"]) ?? "casual",
    character_type: (r.character_type as Outfit["character_type"]) ?? "female",
    style_tags:     (r.style_tags as string[]) ?? [],
    color_palette:  (r.color_palette as string[]) ?? [],
    aspect_ratio:   (r.aspect_ratio as Outfit["aspect_ratio"]) ?? "portrait",
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
  "category", "character_type", "style_tags", "color_palette", "aspect_ratio",
  "download_count", "view_count", "featured", "published", "sort_order", "created_at",
].join(", ");

export async function getPublishedOutfits(opts?: {
  search?: string;
  category?: string;
  character_type?: string;
  limit?: number;
  offset?: number;
}): Promise<Outfit[]> {
  const db = readClient();
  let q = db
    .from("outfits")
    .select(SELECT_COLS)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.character_type) q = q.eq("character_type", opts.character_type);
  if (opts?.search) q = q.textSearch("search_vector", opts.search, { type: "websearch" });
  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.offset) q = q.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1);

  const { data, error } = await q;
  if (error) { console.error("getPublishedOutfits error:", error); return []; }
  return (data ?? []).map((r) => rowToOutfit(r as unknown as Row));
}

export async function getOutfitBySlug(slug: string): Promise<Outfit | null> {
  const db = readClient();
  const { data, error } = await db
    .from("outfits")
    .select(SELECT_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error || !data) return null;
  return rowToOutfit(data as unknown as Row);
}

export async function adminGetAllOutfits(): Promise<Outfit[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("outfits")
    .select(SELECT_COLS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) { console.error("adminGetAllOutfits error:", error); return []; }
  return (data ?? []).map((r) => rowToOutfit(r as unknown as Row));
}

export async function adminGetOutfitById(id: string): Promise<Outfit | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("outfits")
    .select(SELECT_COLS)
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return rowToOutfit(data as unknown as Row);
}
