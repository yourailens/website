import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  FutureField,
  FutureFieldSummary,
  FutureFieldWithModules,
  FutureMediaType,
  FutureModule,
  FutureModuleListItem,
  FutureModuleWithFrames,
  FutureSequenceFrame,
} from "@/data/the-future";
import type { ModuleCoverAspectId } from "@/data/module-covers";
import { attachPreviewsToModules } from "@/lib/the-future/preview";

type Row = Record<string, unknown>;

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

function asAspect(v: unknown): ModuleCoverAspectId {
  const ids = ["portrait", "square", "landscape", "wide", "story"] as const;
  return ids.includes(v as ModuleCoverAspectId) ? (v as ModuleCoverAspectId) : "landscape";
}

function asMediaType(v: unknown): FutureMediaType {
  return v === "video" ? "video" : "image";
}

function rowToField(r: Row): FutureField {
  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    title: String(r.title ?? ""),
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    cover_image_url: (r.cover_image_url as string | null) ?? null,
    cover_video_url: (r.cover_video_url as string | null) ?? null,
    cover_media_type: asMediaType(r.cover_media_type),
    cover_aspect: asAspect(r.cover_aspect),
    sort_order: Number(r.sort_order ?? 0),
    published: Boolean(r.published),
  };
}

function rowToModule(r: Row): FutureModule {
  return {
    id: String(r.id ?? ""),
    field_id: String(r.field_id ?? ""),
    slug: String(r.slug ?? ""),
    title: String(r.title ?? ""),
    tagline: (r.tagline as string | null) ?? null,
    intro: (r.intro as string | null) ?? null,
    cover_image_url: (r.cover_image_url as string | null) ?? null,
    cover_video_url: (r.cover_video_url as string | null) ?? null,
    cover_media_type: asMediaType(r.cover_media_type),
    cover_aspect: asAspect(r.cover_aspect),
    view_count: Number(r.view_count ?? 0),
    sort_order: Number(r.sort_order ?? 0),
    published: Boolean(r.published),
  };
}

async function firstFramesByModuleId(
  db: ReturnType<typeof readClient>,
  moduleIds: string[]
): Promise<Map<string, FutureSequenceFrame>> {
  const map = new Map<string, FutureSequenceFrame>();
  if (moduleIds.length === 0) return map;
  const { data } = await db
    .from("future_sequence_frames")
    .select("*")
    .in("module_id", moduleIds)
    .order("sort_order", { ascending: true });
  for (const r of data ?? []) {
    const frame = rowToFrame(r as Row);
    if (!map.has(frame.module_id)) map.set(frame.module_id, frame);
  }
  return map;
}

function rowToFrame(r: Row): FutureSequenceFrame {
  return {
    id: String(r.id ?? ""),
    module_id: String(r.module_id ?? ""),
    label: String(r.label ?? ""),
    caption: (r.caption as string | null) ?? null,
    media_type: asMediaType(r.media_type),
    image_url: (r.image_url as string | null) ?? null,
    video_url: (r.video_url as string | null) ?? null,
    poster_url: (r.poster_url as string | null) ?? null,
    aspect_ratio: asAspect(r.aspect_ratio),
    sort_order: Number(r.sort_order ?? 0),
  };
}

export async function getFutureHubFields(): Promise<FutureFieldSummary[]> {
  const db = readClient();
  const { data: fields, error } = await db
    .from("future_fields")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  if (error || !fields?.length) return [];

  const { data: mods } = await db
    .from("future_modules")
    .select("field_id")
    .eq("published", true);

  const counts = new Map<string, number>();
  for (const m of mods ?? []) {
    const fid = String((m as Row).field_id);
    counts.set(fid, (counts.get(fid) ?? 0) + 1);
  }

  return fields.map((r) => {
    const f = rowToField(r as Row);
    return { ...f, module_count: counts.get(f.id) ?? 0 };
  });
}

export async function getFutureFieldBySlug(slug: string): Promise<FutureFieldWithModules | null> {
  const db = readClient();
  const { data: fieldRow } = await db.from("future_fields").select("*").eq("slug", slug).eq("published", true).maybeSingle();
  if (!fieldRow) return null;

  const fieldId = String((fieldRow as Row).id);
  const { data: modRows } = await db
    .from("future_modules")
    .select("*")
    .eq("field_id", fieldId)
    .eq("published", true)
    .order("sort_order", { ascending: true });

  const modules = (modRows ?? []).map((r) => rowToModule(r as Row));
  const frameMap = await firstFramesByModuleId(
    db,
    modules.map((m) => m.id)
  );

  return {
    ...rowToField(fieldRow as Row),
    modules: attachPreviewsToModules(modules, frameMap),
  };
}

export async function getFutureModuleBySlugs(
  fieldSlug: string,
  moduleSlug: string
): Promise<(FutureModuleWithFrames & { field: FutureField }) | null> {
  const db = readClient();
  const { data: fieldRow } = await db.from("future_fields").select("*").eq("slug", fieldSlug).eq("published", true).maybeSingle();
  if (!fieldRow) return null;

  const { data: modRow } = await db
    .from("future_modules")
    .select("*")
    .eq("field_id", (fieldRow as Row).id)
    .eq("slug", moduleSlug)
    .eq("published", true)
    .maybeSingle();
  if (!modRow) return null;

  const { data: frameRows } = await db
    .from("future_sequence_frames")
    .select("*")
    .eq("module_id", (modRow as Row).id)
    .order("sort_order", { ascending: true });

  return {
    field: rowToField(fieldRow as Row),
    ...rowToModule(modRow as Row),
    frames: (frameRows ?? []).map((r) => rowToFrame(r as Row)),
  };
}

export async function incrementFutureModuleView(id: string) {
  const db = readClient();
  await db.rpc("increment_future_module_view", { m_id: id });
}

// ── Admin ─────────────────────────────────────────────────────

export async function adminGetAllFutureData(): Promise<FutureFieldWithModules[]> {
  const db = createServiceRoleClient();
  const { data: fields } = await db.from("future_fields").select("*").order("sort_order", { ascending: true });
  if (!fields?.length) return [];

  const { data: mods } = await db.from("future_modules").select("*").order("sort_order", { ascending: true });

  const allMods = (mods ?? []).map((m) => rowToModule(m as Row));
  const frameMap = await firstFramesByModuleId(
    db,
    allMods.map((m) => m.id)
  );

  return fields.map((r) => {
    const f = rowToField(r as Row);
    const fieldMods = allMods.filter((m) => m.field_id === f.id);
    return {
      ...f,
      modules: attachPreviewsToModules(fieldMods, frameMap) as FutureModuleListItem[],
    };
  });
}

export async function adminGetFutureModule(id: string): Promise<FutureModuleWithFrames | null> {
  const db = createServiceRoleClient();
  const { data: modRow } = await db.from("future_modules").select("*").eq("id", id).maybeSingle();
  if (!modRow) return null;

  const { data: frameRows } = await db
    .from("future_sequence_frames")
    .select("*")
    .eq("module_id", id)
    .order("sort_order", { ascending: true });

  return {
    ...rowToModule(modRow as Row),
    frames: (frameRows ?? []).map((r) => rowToFrame(r as Row)),
  };
}

export async function adminGetFutureModuleWithField(
  id: string
): Promise<(FutureModuleWithFrames & { field: FutureField }) | null> {
  const mod = await adminGetFutureModule(id);
  if (!mod) return null;
  const db = createServiceRoleClient();
  const { data: fieldRow } = await db.from("future_fields").select("*").eq("id", mod.field_id).maybeSingle();
  if (!fieldRow) return null;
  return { ...mod, field: rowToField(fieldRow as Row) };
}

export async function adminGetFutureField(id: string): Promise<FutureField | null> {
  const db = createServiceRoleClient();
  const { data } = await db.from("future_fields").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return rowToField(data as Row);
}

export type FutureFrameInput = {
  label?: string;
  caption?: string | null;
  media_type?: FutureMediaType;
  image_url?: string | null;
  video_url?: string | null;
  poster_url?: string | null;
  aspect_ratio?: ModuleCoverAspectId;
  sort_order?: number;
};

export async function adminReplaceModuleFrames(moduleId: string, frames: FutureFrameInput[]) {
  const db = createServiceRoleClient();
  await db.from("future_sequence_frames").delete().eq("module_id", moduleId);
  if (frames.length === 0) return;

  const inserts = frames.map((f, i) => ({
    module_id: moduleId,
    label: f.label ?? `Frame ${i + 1}`,
    caption: f.caption ?? null,
    media_type: f.media_type ?? "image",
    image_url: f.image_url ?? null,
    video_url: f.video_url ?? null,
    poster_url: f.poster_url ?? null,
    aspect_ratio: f.aspect_ratio ?? "landscape",
    sort_order: f.sort_order ?? i,
  }));

  const { error } = await db.from("future_sequence_frames").insert(inserts);
  if (error) throw new Error(error.message);
}
