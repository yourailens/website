import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Prop } from "@/data/props";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}
function readClient() { try { return createServiceRoleClient(); } catch { return anonClient(); } }
type Row = Record<string, unknown>;

function rowToProp(r: Row): Prop {
  return {
    id: String(r.id ?? ""), slug: String(r.slug ?? ""), title: String(r.title ?? ""),
    description: (r.description as string | null) ?? null, image_url: String(r.image_url ?? ""),
    category: (r.category as Prop["category"]) ?? "other",
    style: (r.style as Prop["style"]) ?? "realistic",
    color_tags: (r.color_tags as string[]) ?? [], style_tags: (r.style_tags as string[]) ?? [],
    aspect_ratio: (r.aspect_ratio as Prop["aspect_ratio"]) ?? "square",
    download_count: Number(r.download_count ?? 0), view_count: Number(r.view_count ?? 0),
    featured: Boolean(r.featured), published: Boolean(r.published),
    sort_order: Number(r.sort_order ?? 0), created_at: String(r.created_at ?? ""),
  };
}

const SELECT_COLS = "id,slug,title,description,image_url,category,style,color_tags,style_tags,aspect_ratio,download_count,view_count,featured,published,sort_order,created_at";

export async function getPublishedProps(opts?: { search?: string; category?: string; style?: string; limit?: number; offset?: number }): Promise<Prop[]> {
  const db = readClient();
  let q = db.from("props").select(SELECT_COLS).eq("published", true).order("sort_order").order("created_at", { ascending: false });
  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.style) q = q.eq("style", opts.style);
  if (opts?.search) q = q.textSearch("search_vector", opts.search, { type: "websearch" });
  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.offset) q = q.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1);
  const { data, error } = await q;
  if (error) { console.error("getPublishedProps:", error); return []; }
  return (data ?? []).map((r) => rowToProp(r as unknown as Row));
}

export async function getPropBySlug(slug: string): Promise<Prop | null> {
  const db = readClient();
  const { data, error } = await db.from("props").select(SELECT_COLS).eq("slug", slug).eq("published", true).single();
  if (error || !data) return null;
  return rowToProp(data as unknown as Row);
}

export async function adminGetAllProps(): Promise<Prop[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("props").select(SELECT_COLS).order("sort_order").order("created_at", { ascending: false });
  if (error) { console.error("adminGetAllProps:", error); return []; }
  return (data ?? []).map((r) => rowToProp(r as unknown as Row));
}
