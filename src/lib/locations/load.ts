import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Location } from "@/data/locations";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}
function readClient() { try { return createServiceRoleClient(); } catch { return anonClient(); } }

type Row = Record<string, unknown>;
function rowToLocation(r: Row): Location {
  return {
    id:            String(r.id ?? ""),
    slug:          String(r.slug ?? ""),
    title:         String(r.title ?? ""),
    description:   (r.description as string | null) ?? null,
    image_url:     String(r.image_url ?? ""),
    category:      (r.category as Location["category"]) ?? "nature",
    time_of_day:   (r.time_of_day as Location["time_of_day"]) ?? "any",
    weather:       (r.weather as Location["weather"]) ?? "any",
    style_tags:    (r.style_tags as string[]) ?? [],
    aspect_ratio:  (r.aspect_ratio as Location["aspect_ratio"]) ?? "landscape",
    download_count: Number(r.download_count ?? 0),
    view_count:    Number(r.view_count ?? 0),
    featured:      Boolean(r.featured),
    published:     Boolean(r.published),
    sort_order:    Number(r.sort_order ?? 0),
    created_at:    String(r.created_at ?? ""),
  };
}

const COLS = "id,slug,title,description,image_url,category,time_of_day,weather,style_tags,aspect_ratio,download_count,view_count,featured,published,sort_order,created_at";

export async function getPublishedLocations(opts?: { search?: string; category?: string; time_of_day?: string; weather?: string; limit?: number }): Promise<Location[]> {
  const db = readClient();
  let q = db.from("locations").select(COLS).eq("published", true).order("sort_order").order("created_at", { ascending: false });
  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.time_of_day) q = q.eq("time_of_day", opts.time_of_day);
  if (opts?.weather) q = q.eq("weather", opts.weather);
  if (opts?.search) q = q.textSearch("search_vector", opts.search, { type: "websearch" });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error(error); return []; }
  return (data ?? []).map((r) => rowToLocation(r as unknown as Row));
}

export async function getLocationBySlug(slug: string): Promise<Location | null> {
  const db = readClient();
  const { data, error } = await db.from("locations").select(COLS).eq("slug", slug).eq("published", true).single();
  if (error || !data) return null;
  return rowToLocation(data as unknown as Row);
}

export async function adminGetAllLocations(): Promise<Location[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("locations").select(COLS).order("sort_order").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map((r) => rowToLocation(r as unknown as Row));
}
