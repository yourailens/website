import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  Module,
  ModuleAsset,
  ModuleWithAssets,
  WorkflowStep,
  WorkflowStepMedia,
  WorkflowStepMediaRole,
} from "@/data/modules";
import { parseCoverVariants, type ModuleCoverAspectId } from "@/data/module-covers";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}

function readClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return anonClient();
  }
}

type Row = Record<string, unknown>;

function parseWorkflowMedia(raw: unknown): WorkflowStepMedia[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((m): m is Record<string, unknown> => typeof m === "object" && m !== null)
    .map((m, i): WorkflowStepMedia => ({
      id: String(m.id ?? `m${i}`),
      media_type: m.media_type === "video" ? "video" : "image",
      url: String(m.url ?? ""),
      caption: m.caption != null ? String(m.caption) : undefined,
      role: (["input", "prompt_ref", "output"].includes(String(m.role))
        ? m.role
        : "prompt_ref") as WorkflowStepMediaRole,
    }))
    .filter((m) => m.url.trim());
}

function parseWorkflowSteps(raw: unknown): WorkflowStep[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is Record<string, unknown> => typeof s === "object" && s !== null)
    .map((s) => ({
      title: String(s.title ?? ""),
      body: s.body != null ? String(s.body) : undefined,
      duration: s.duration != null ? String(s.duration) : undefined,
      inputs: s.inputs != null ? String(s.inputs) : undefined,
      prompt: s.prompt != null ? String(s.prompt) : undefined,
      output: s.output != null ? String(s.output) : undefined,
      assets: parseWorkflowMedia(s.assets),
    }))
    .filter(
      (s) =>
        s.title.trim() ||
        (s.body?.trim() ?? "") ||
        (s.inputs?.trim() ?? "") ||
        (s.prompt?.trim() ?? "") ||
        (s.output?.trim() ?? "") ||
        (s.assets?.length ?? 0) > 0
    );
}

function rowToModule(r: Row): Module {
  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    title: String(r.title ?? ""),
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    discipline: (r.discipline as Module["discipline"]) ?? "other",
    cover_image_url: (r.cover_image_url as string | null) ?? null,
    cover_aspect: (r.cover_aspect as ModuleCoverAspectId) ?? "landscape",
    cover_variants: parseCoverVariants(r.cover_variants),
    director_brief: (r.director_brief as string | null) ?? null,
    camera_body: (r.camera_body as string | null) ?? null,
    lens_model: (r.lens_model as string | null) ?? null,
    focal_length: (r.focal_length as string | null) ?? null,
    aperture: (r.aperture as string | null) ?? null,
    camera_notes: (r.camera_notes as string | null) ?? null,
    lighting_presets: (r.lighting_presets as string[]) ?? [],
    color_grade_presets: (r.color_grade_presets as string[]) ?? [],
    mood_presets: (r.mood_presets as string[]) ?? [],
    composition_presets: (r.composition_presets as string[]) ?? [],
    shot_type_presets: (r.shot_type_presets as string[]) ?? [],
    aspect_ratio: (r.aspect_ratio as string | null) ?? null,
    camera_setup: (r.camera_setup as string | null) ?? null,
    lighting_setup: (r.lighting_setup as string | null) ?? null,
    lens_and_focal: (r.lens_and_focal as string | null) ?? null,
    composition_notes: (r.composition_notes as string | null) ?? null,
    color_and_mood: (r.color_and_mood as string | null) ?? null,
    workflow_steps: parseWorkflowSteps(r.workflow_steps),
    recommended_models: (r.recommended_models as string[]) ?? [],
    prompt_structure: (r.prompt_structure as string | null) ?? null,
    prompt_tips: (r.prompt_tips as string | null) ?? null,
    common_mistakes: (r.common_mistakes as string | null) ?? null,
    view_count: Number(r.view_count ?? 0),
    featured: Boolean(r.featured),
    published: Boolean(r.published),
    sort_order: Number(r.sort_order ?? 0),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function rowToAsset(r: Row): ModuleAsset {
  return {
    id: String(r.id ?? ""),
    module_id: String(r.module_id ?? ""),
    title: String(r.title ?? ""),
    caption: (r.caption as string | null) ?? null,
    kind: (r.kind as ModuleAsset["kind"]) ?? "reference",
    image_url: (r.image_url as string | null) ?? null,
    video_url: (r.video_url as string | null) ?? null,
    aspect_ratio: (r.aspect_ratio as ModuleAsset["aspect_ratio"]) ?? "landscape",
    sort_order: Number(r.sort_order ?? 0),
  };
}

const MODULE_COLS =
  "id,slug,title,tagline,description,discipline,cover_image_url,cover_aspect,cover_variants,director_brief,camera_body,lens_model,focal_length,aperture,camera_notes,lighting_presets,color_grade_presets,mood_presets,composition_presets,shot_type_presets,aspect_ratio,camera_setup,lighting_setup,lens_and_focal,composition_notes,color_and_mood,workflow_steps,recommended_models,prompt_structure,prompt_tips,common_mistakes,view_count,featured,published,sort_order,created_at,updated_at";

const ASSET_COLS = "id,module_id,title,caption,kind,image_url,video_url,aspect_ratio,sort_order";

export async function getPublishedModules(opts?: {
  search?: string;
  discipline?: string;
  limit?: number;
  offset?: number;
}): Promise<Module[]> {
  const db = readClient();
  let q = db
    .from("modules")
    .select(MODULE_COLS)
    .eq("published", true)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (opts?.discipline) q = q.eq("discipline", opts.discipline);
  if (opts?.search) q = q.textSearch("search_vector", opts.search, { type: "websearch" });
  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.offset) q = q.range(opts.offset, (opts.offset + (opts.limit ?? 50)) - 1);
  const { data, error } = await q;
  if (error) {
    console.error("getPublishedModules:", error);
    return [];
  }
  return (data ?? []).map((r) => rowToModule(r as unknown as Row));
}

export async function getModuleBySlug(slug: string): Promise<ModuleWithAssets | null> {
  const db = readClient();
  const { data: mod, error } = await db
    .from("modules")
    .select(MODULE_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (error || !mod) return null;

  const { data: assets } = await db
    .from("module_assets")
    .select(ASSET_COLS)
    .eq("module_id", (mod as Row).id)
    .order("sort_order");

  return {
    ...rowToModule(mod as unknown as Row),
    assets: (assets ?? []).map((a) => rowToAsset(a as unknown as Row)),
  };
}

export async function adminGetAllModules(): Promise<ModuleWithAssets[]> {
  const db = createServiceRoleClient();
  const { data: mods, error } = await db
    .from("modules")
    .select(MODULE_COLS)
    .order("sort_order")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("adminGetAllModules:", error);
    return [];
  }
  const list = (mods ?? []).map((r) => rowToModule(r as unknown as Row));
  if (list.length === 0) return [];

  const ids = list.map((m) => m.id);
  const { data: assets } = await db
    .from("module_assets")
    .select(ASSET_COLS)
    .in("module_id", ids)
    .order("sort_order");

  const byModule = new Map<string, ModuleAsset[]>();
  for (const a of assets ?? []) {
    const asset = rowToAsset(a as unknown as Row);
    const arr = byModule.get(asset.module_id) ?? [];
    arr.push(asset);
    byModule.set(asset.module_id, arr);
  }

  return list.map((m) => ({ ...m, assets: byModule.get(m.id) ?? [] }));
}

export async function adminGetModuleById(id: string): Promise<ModuleWithAssets | null> {
  const db = createServiceRoleClient();
  const { data: mod, error } = await db.from("modules").select(MODULE_COLS).eq("id", id).single();
  if (error || !mod) return null;
  const { data: assets } = await db
    .from("module_assets")
    .select(ASSET_COLS)
    .eq("module_id", id)
    .order("sort_order");
  return {
    ...rowToModule(mod as unknown as Row),
    assets: (assets ?? []).map((a) => rowToAsset(a as unknown as Row)),
  };
}
