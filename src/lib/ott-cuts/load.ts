import { createClient } from "@supabase/supabase-js";
import type { OttCut, OttCutAspect, OttCutCategory, OttCutMediaType } from "@/data/ott-cuts";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

function readClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return anonClient();
  }
}

function rowToCut(row: Record<string, unknown>): OttCut {
  return {
    id: String(row.id),
    slug: String(row.slug),
    caption: String(row.caption ?? ""),
    description: typeof row.description === "string" ? row.description : null,
    category: row.category as OttCutCategory,
    media_type: row.media_type === "video" ? "video" : "image",
    media_url: String(row.media_url ?? ""),
    poster_url: typeof row.poster_url === "string" ? row.poster_url : null,
    aspect_ratio: (row.aspect_ratio as OttCutAspect) ?? "natural",
    published: Boolean(row.published),
    homepage_feature: Boolean(row.homepage_feature),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

const SELECT =
  "id,slug,caption,description,category,media_type,media_url,poster_url,aspect_ratio,published,homepage_feature,sort_order,created_at";

export async function getPublishedOttCuts(category?: OttCutCategory): Promise<OttCut[]> {
  const supabase = readClient();
  if (!supabase) return [];
  let q = supabase.from("ott_cuts").select(SELECT).eq("published", true).order("sort_order", { ascending: true });
  if (category) q = q.eq("category", category);
  const { data, error } = await q;
  if (error || !data?.length) return [];
  return data.map((row) => rowToCut(row as Record<string, unknown>));
}

/** The single published AI film marked for the homepage hero. */
export async function getHomepageFeatureOttCut(): Promise<OttCut | null> {
  const supabase = readClient();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("ott_cuts")
    .select(SELECT)
    .eq("published", true)
    .eq("category", "films")
    .eq("media_type", "video")
    .eq("homepage_feature", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return rowToCut(data as Record<string, unknown>);
}

/** Clears homepage_feature on every other cut so only one stays featured. */
export async function clearOtherHomepageFeatures(
  db: ReturnType<typeof createServiceRoleClient>,
  exceptId?: string
) {
  let q = db.from("ott_cuts").update({ homepage_feature: false }).eq("homepage_feature", true);
  if (exceptId) q = q.neq("id", exceptId);
  await q;
}

export async function adminGetAllOttCuts(): Promise<OttCut[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("ott_cuts")
    .select(SELECT)
    .order("category", { ascending: true })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  if (!data?.length) return [];
  return data.map((row) => rowToCut(row as Record<string, unknown>));
}

export function slugifyOttCut(text: string) {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "cut"
  );
}

export async function uniqueOttCutSlug(
  db: ReturnType<typeof createServiceRoleClient>,
  base: string,
  exceptId?: string
) {
  const root = slugifyOttCut(base);
  for (let n = 0; n < 80; n++) {
    const slug = n === 0 ? root : `${root}-${n}`;
    let q = db.from("ott_cuts").select("id").eq("slug", slug);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q.maybeSingle();
    if (!data) return slug;
  }
  return `${root}-${Date.now().toString(36)}`;
}

export function isOttCutCategory(v: unknown): v is OttCutCategory {
  return v === "ads" || v === "films" || v === "community";
}

export function isOttCutAspect(v: unknown): v is OttCutAspect {
  return (
    v === "natural" ||
    v === "portrait" ||
    v === "square" ||
    v === "landscape" ||
    v === "wide" ||
    v === "story"
  );
}

export function isOttCutMediaType(v: unknown): v is OttCutMediaType {
  return v === "image" || v === "video";
}
