import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { LightingPreset } from "@/data/lighting_presets";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}
function readClient() { try { return createServiceRoleClient(); } catch { return anonClient(); } }
type Row = Record<string, unknown>;

function rowToPreset(r: Row): LightingPreset {
  return {
    id: String(r.id ?? ""), slug: String(r.slug ?? ""), title: String(r.title ?? ""),
    description: (r.description as string | null) ?? null, image_url: String(r.image_url ?? ""),
    lighting_type: (r.lighting_type as LightingPreset["lighting_type"]) ?? "other",
    mood: (r.mood as LightingPreset["mood"]) ?? "neutral",
    color_temp: (r.color_temp as string | null) ?? null,
    style_tags: (r.style_tags as string[]) ?? [],
    aspect_ratio: (r.aspect_ratio as LightingPreset["aspect_ratio"]) ?? "landscape",
    download_count: Number(r.download_count ?? 0), view_count: Number(r.view_count ?? 0),
    featured: Boolean(r.featured), published: Boolean(r.published),
    sort_order: Number(r.sort_order ?? 0), created_at: String(r.created_at ?? ""),
  };
}

const SELECT_COLS = "id,slug,title,description,image_url,lighting_type,mood,color_temp,style_tags,aspect_ratio,download_count,view_count,featured,published,sort_order,created_at";

export async function getPublishedLightingPresets(opts?: { search?: string; lighting_type?: string; mood?: string; limit?: number; offset?: number }): Promise<LightingPreset[]> {
  const db = readClient();
  let q = db.from("lighting_presets").select(SELECT_COLS).eq("published", true).order("sort_order").order("created_at", { ascending: false });
  if (opts?.lighting_type) q = q.eq("lighting_type", opts.lighting_type);
  if (opts?.mood) q = q.eq("mood", opts.mood);
  if (opts?.search) q = q.textSearch("search_vector", opts.search, { type: "websearch" });
  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.offset) q = q.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1);
  const { data, error } = await q;
  if (error) { console.error("getPublishedLightingPresets:", error); return []; }
  return (data ?? []).map((r) => rowToPreset(r as unknown as Row));
}

export async function getLightingPresetBySlug(slug: string): Promise<LightingPreset | null> {
  const db = readClient();
  const { data, error } = await db.from("lighting_presets").select(SELECT_COLS).eq("slug", slug).eq("published", true).single();
  if (error || !data) return null;
  return rowToPreset(data as unknown as Row);
}

export async function adminGetAllLightingPresets(): Promise<LightingPreset[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("lighting_presets").select(SELECT_COLS).order("sort_order").order("created_at", { ascending: false });
  if (error) { console.error("adminGetAllLightingPresets:", error); return []; }
  return (data ?? []).map((r) => rowToPreset(r as unknown as Row));
}
