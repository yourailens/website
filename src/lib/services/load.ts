import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  Service,
  ServiceAddon,
  ServiceCategory,
  ServiceGalleryItem,
  ServiceWithGallery,
} from "@/data/services";
import { normalizeServiceIncludes } from "@/data/services";

function mapService(row: Record<string, unknown>): Service {
  return {
    id: String(row.id),
    category_slug: String(row.category_slug ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    tagline: typeof row.tagline === "string" ? row.tagline : null,
    description: typeof row.description === "string" ? row.description : null,
    price: Number(row.price ?? 0),
    original_price: row.original_price != null ? Number(row.original_price) : null,
    unit: String(row.unit ?? "per project"),
    delivery_days: Number(row.delivery_days ?? 0),
    is_popular: Boolean(row.is_popular),
    is_featured: Boolean(row.is_featured),
    is_published: Boolean(row.is_published),
    badge_label: typeof row.badge_label === "string" ? row.badge_label : null,
    badge_color: typeof row.badge_color === "string" ? row.badge_color : null,
    includes: normalizeServiceIncludes(row.includes),
    deliverables: Array.isArray(row.deliverables) ? (row.deliverables as string[]) : [],
    best_for: Array.isArray(row.best_for) ? (row.best_for as string[]) : [],
    faqs: Array.isArray(row.faqs) ? (row.faqs as { q: string; a: string }[]) : [],
    traditional_value: row.traditional_value != null ? Number(row.traditional_value) : null,
    thumbnail_url: typeof row.thumbnail_url === "string" ? row.thumbnail_url : null,
    cover_url: typeof row.cover_url === "string" ? row.cover_url : null,
    header_image_url: typeof row.header_image_url === "string" ? row.header_image_url : null,
    hero_media_type:
      row.hero_media_type === "image" || row.hero_media_type === "video"
        ? row.hero_media_type
        : null,
    hero_video_url: typeof row.hero_video_url === "string" ? row.hero_video_url : null,
    hero_image_url: typeof row.hero_image_url === "string" ? row.hero_image_url : null,
    hero_caption: typeof row.hero_caption === "string" ? row.hero_caption : null,
    hero_label: typeof row.hero_label === "string" ? row.hero_label : null,
    accent_color: typeof row.accent_color === "string" ? row.accent_color : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function mapGalleryItem(row: Record<string, unknown>): ServiceGalleryItem {
  return {
    id: String(row.id),
    service_id: String(row.service_id),
    media_type: row.media_type === "video" ? "video" : "image",
    image_url: typeof row.image_url === "string" ? row.image_url : null,
    video_url: typeof row.video_url === "string" ? row.video_url : null,
    poster_url: typeof row.poster_url === "string" ? row.poster_url : null,
    caption: typeof row.caption === "string" ? row.caption : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

export async function loadPublicServices(category?: string): Promise<Service[]> {
  const sb = createServiceRoleClient();
  let q = sb.from("services").select("*").eq("is_published", true).order("sort_order");
  if (category && category !== "all") q = q.eq("category_slug", category);
  const { data, error } = await q;
  if (error) console.error("loadPublicServices:", error.message);
  return (data ?? []).map((r) => mapService(r as Record<string, unknown>));
}

export async function loadPublicService(slug: string): Promise<Service | null> {
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from("services")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  return data ? mapService(data as Record<string, unknown>) : null;
}

export async function loadServiceGallery(serviceId: string): Promise<ServiceGalleryItem[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("service_gallery_items")
    .select("*")
    .eq("service_id", serviceId)
    .order("sort_order");
  if (error) console.error("loadServiceGallery:", error.message);
  return (data ?? []).map((r) => mapGalleryItem(r as Record<string, unknown>));
}

export async function loadPublicServiceWithGallery(
  slug: string
): Promise<ServiceWithGallery | null> {
  const service = await loadPublicService(slug);
  if (!service) return null;
  const gallery = await loadServiceGallery(service.id);
  return { ...service, gallery };
}

export async function loadCategories(): Promise<ServiceCategory[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb.from("service_categories").select("*").order("sort_order");
  if (error) console.error("loadCategories:", error.message);
  return (data ?? []) as unknown as ServiceCategory[];
}

export async function loadPublicAddons(compatibleWith?: string): Promise<ServiceAddon[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("service_addons")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");
  if (error) console.error("loadPublicAddons:", error.message);
  const all = (data ?? []) as unknown as ServiceAddon[];
  if (!compatibleWith) return all;
  return all.filter(
    (a) => a.compatible_with.length === 0 || a.compatible_with.includes(compatibleWith)
  );
}

export async function loadAdminServices(): Promise<ServiceWithGallery[]> {
  const sb = createServiceRoleClient();
  const { data } = await sb.from("services").select("*").order("sort_order");
  const services = (data ?? []).map((r) => mapService(r as Record<string, unknown>));
  if (services.length === 0) return [];

  const ids = services.map((s) => s.id);
  const { data: galleryRows } = await sb
    .from("service_gallery_items")
    .select("*")
    .in("service_id", ids)
    .order("sort_order");

  const byService = new Map<string, ServiceGalleryItem[]>();
  for (const row of galleryRows ?? []) {
    const item = mapGalleryItem(row as Record<string, unknown>);
    const list = byService.get(item.service_id) ?? [];
    list.push(item);
    byService.set(item.service_id, list);
  }

  return services.map((s) => ({ ...s, gallery: byService.get(s.id) ?? [] }));
}

export async function loadAdminService(id: string): Promise<ServiceWithGallery | null> {
  const sb = createServiceRoleClient();
  const { data } = await sb.from("services").select("*").eq("id", id).single();
  if (!data) return null;
  const service = mapService(data as Record<string, unknown>);
  const gallery = await loadServiceGallery(service.id);
  return { ...service, gallery };
}

export async function loadAdminAddons(): Promise<ServiceAddon[]> {
  const sb = createServiceRoleClient();
  const { data } = await sb.from("service_addons").select("*").order("sort_order");
  return (data ?? []) as unknown as ServiceAddon[];
}

export async function replaceServiceGallery(
  serviceId: string,
  items: Omit<ServiceGalleryItem, "id" | "service_id" | "created_at">[]
): Promise<void> {
  const sb = createServiceRoleClient();
  await sb.from("service_gallery_items").delete().eq("service_id", serviceId);
  if (items.length === 0) return;
  const rows = items.map((item, i) => ({
    service_id: serviceId,
    media_type: item.media_type,
    image_url: item.image_url,
    video_url: item.video_url,
    poster_url: item.poster_url,
    caption: item.caption,
    sort_order: item.sort_order ?? i,
  }));
  const { error } = await sb.from("service_gallery_items").insert(rows);
  if (error) throw new Error(error.message);
}
