import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  StudioModule,
  StudioModuleItem,
  StudioModuleType,
  StudioModuleWithItems,
} from "@/data/studio-modules";

type ModuleRow = Record<string, unknown>;
type ItemRow = Record<string, unknown>;

function rowToItem(r: ItemRow): StudioModuleItem {
  return {
    id: String(r.id),
    module_id: String(r.module_id),
    media_type: r.media_type === "video" ? "video" : "image",
    image_url: typeof r.image_url === "string" ? r.image_url : null,
    video_url: typeof r.video_url === "string" ? r.video_url : null,
    poster_url: typeof r.poster_url === "string" ? r.poster_url : null,
    aspect_ratio: (r.aspect_ratio as StudioModuleItem["aspect_ratio"]) ?? "natural",
    caption: typeof r.caption === "string" ? r.caption : null,
    prompt: typeof r.prompt === "string" ? r.prompt : null,
    sort_order: Number(r.sort_order ?? 0),
    created_at: String(r.created_at),
  };
}

function rowToModule(r: ModuleRow): StudioModule {
  return {
    id: String(r.id),
    slug: String(r.slug),
    module_type: r.module_type as StudioModuleType,
    title: String(r.title),
    description: typeof r.description === "string" ? r.description : null,
    cover_image_url: typeof r.cover_image_url === "string" ? r.cover_image_url : null,
    cover_aspect: (r.cover_aspect as StudioModule["cover_aspect"]) ?? "portrait",
    published: Boolean(r.published),
    featured: Boolean(r.featured),
    sort_order: Number(r.sort_order ?? 0),
    view_count: Number(r.view_count ?? 0),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

async function fetchItemsForModules(moduleIds: string[]): Promise<Map<string, StudioModuleItem[]>> {
  const map = new Map<string, StudioModuleItem[]>();
  if (moduleIds.length === 0) return map;

  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_module_items")
    .select("*")
    .in("module_id", moduleIds)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);

  for (const row of data ?? []) {
    const item = rowToItem(row as ItemRow);
    const list = map.get(item.module_id) ?? [];
    list.push(item);
    map.set(item.module_id, list);
  }
  return map;
}

export async function getPublishedStudioModules(opts?: {
  type?: StudioModuleType;
  limit?: number;
}): Promise<StudioModule[]> {
  const sb = createServiceRoleClient();
  let q = sb
    .from("studio_modules")
    .select("*")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (opts?.type) q = q.eq("module_type", opts.type);
  if (opts?.limit) q = q.limit(opts.limit);

  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => rowToModule(r as ModuleRow));
}

export async function getStudioModuleBySlug(
  type: StudioModuleType,
  slug: string,
  opts?: { publishedOnly?: boolean }
): Promise<StudioModuleWithItems | null> {
  const sb = createServiceRoleClient();
  let q = sb.from("studio_modules").select("*").eq("slug", slug).eq("module_type", type);
  if (opts?.publishedOnly !== false) q = q.eq("published", true);

  const { data, error } = await q.maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const mod = rowToModule(data as ModuleRow);
  const itemsMap = await fetchItemsForModules([mod.id]);
  return { ...mod, items: itemsMap.get(mod.id) ?? [] };
}

export async function adminGetAllStudioModules(): Promise<StudioModuleWithItems[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_modules")
    .select("*")
    .order("module_type")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  const mods = (data ?? []).map((r) => rowToModule(r as ModuleRow));
  const itemsMap = await fetchItemsForModules(mods.map((m) => m.id));
  return mods.map((m) => ({ ...m, items: itemsMap.get(m.id) ?? [] }));
}

export async function adminGetStudioModuleById(id: string): Promise<StudioModuleWithItems | null> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb.from("studio_modules").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;

  const mod = rowToModule(data as ModuleRow);
  const itemsMap = await fetchItemsForModules([mod.id]);
  return { ...mod, items: itemsMap.get(mod.id) ?? [] };
}

export async function getAllStudioModuleStaticParams(): Promise<
  { typeSlug: string; slug: string }[]
> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_modules")
    .select("slug, module_type")
    .eq("published", true);

  if (error) return [];

  const { STUDIO_MODULE_TYPE_SLUGS } = await import("@/data/studio-modules");
  return (data ?? []).map((r) => ({
    typeSlug: STUDIO_MODULE_TYPE_SLUGS[r.module_type as StudioModuleType],
    slug: String(r.slug),
  }));
}
