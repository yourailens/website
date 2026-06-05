import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Scenario } from "@/data/scenarios";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}
function readClient() { try { return createServiceRoleClient(); } catch { return anonClient(); } }

type Row = Record<string, unknown>;
function rowToScenario(r: Row): Scenario {
  return {
    id:              String(r.id ?? ""),
    slug:            String(r.slug ?? ""),
    title:           String(r.title ?? ""),
    description:     (r.description as string | null) ?? null,
    image_url:       String(r.image_url ?? ""),
    scenario_type:   (r.scenario_type as Scenario["scenario_type"]) ?? "portrait",
    setting:         (r.setting as Scenario["setting"]) ?? "outdoor",
    mood:            (r.mood as Scenario["mood"]) ?? "peaceful",
    character_count: (r.character_count as Scenario["character_count"]) ?? "solo",
    style_tags:      (r.style_tags as string[]) ?? [],
    aspect_ratio:    (r.aspect_ratio as Scenario["aspect_ratio"]) ?? "portrait",
    download_count:  Number(r.download_count ?? 0),
    view_count:      Number(r.view_count ?? 0),
    featured:        Boolean(r.featured),
    published:       Boolean(r.published),
    sort_order:      Number(r.sort_order ?? 0),
    created_at:      String(r.created_at ?? ""),
  };
}

const COLS = "id,slug,title,description,image_url,scenario_type,setting,mood,character_count,style_tags,aspect_ratio,download_count,view_count,featured,published,sort_order,created_at";

export async function getPublishedScenarios(opts?: { search?: string; scenario_type?: string; setting?: string; mood?: string; limit?: number; offset?: number }): Promise<Scenario[]> {
  const db = readClient();
  let q = db.from("scenarios").select(COLS).eq("published", true).order("sort_order").order("created_at", { ascending: false });
  if (opts?.scenario_type) q = q.eq("scenario_type", opts.scenario_type);
  if (opts?.setting) q = q.eq("setting", opts.setting);
  if (opts?.mood) q = q.eq("mood", opts.mood);
  if (opts?.search) q = q.textSearch("search_vector", opts.search, { type: "websearch" });
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) { console.error(error); return []; }
  return (data ?? []).map((r) => rowToScenario(r as unknown as Row));
}

export async function getScenarioBySlug(slug: string): Promise<Scenario | null> {
  const db = readClient();
  const { data, error } = await db.from("scenarios").select(COLS).eq("slug", slug).eq("published", true).single();
  if (error || !data) return null;
  return rowToScenario(data as unknown as Row);
}

export async function adminGetAllScenarios(): Promise<Scenario[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("scenarios").select(COLS).order("sort_order").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return (data ?? []).map((r) => rowToScenario(r as unknown as Row));
}
