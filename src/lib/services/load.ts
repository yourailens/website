import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Service, ServiceAddon, ServiceCategory } from "@/data/services";

// Public queries use the service-role client (server-only routes).
// The is_published filter is applied explicitly so only live items are returned.

// ── Public ────────────────────────────────────────────────────────────────────

export async function loadPublicServices(category?: string): Promise<Service[]> {
  const sb = createServiceRoleClient();
  let q = sb.from("services").select("*").eq("is_published", true).order("sort_order");
  if (category && category !== "all") q = q.eq("category_slug", category);
  const { data, error } = await q;
  if (error) console.error("loadPublicServices:", error.message);
  return (data ?? []) as unknown as Service[];
}

export async function loadPublicService(slug: string): Promise<Service | null> {
  const sb = createServiceRoleClient();
  const { data } = await sb.from("services").select("*").eq("slug", slug).eq("is_published", true).single();
  return data ? (data as unknown as Service) : null;
}

export async function loadCategories(): Promise<ServiceCategory[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb.from("service_categories").select("*").order("sort_order");
  if (error) console.error("loadCategories:", error.message);
  return (data ?? []) as unknown as ServiceCategory[];
}

export async function loadPublicAddons(compatibleWith?: string): Promise<ServiceAddon[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb.from("service_addons").select("*").eq("is_published", true).order("sort_order");
  if (error) console.error("loadPublicAddons:", error.message);
  const all = (data ?? []) as unknown as ServiceAddon[];
  if (!compatibleWith) return all;
  return all.filter(
    (a) => a.compatible_with.length === 0 || a.compatible_with.includes(compatibleWith)
  );
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export async function loadAdminServices(): Promise<Service[]> {
  const sb = createServiceRoleClient();
  const { data } = await sb.from("services").select("*").order("sort_order");
  return (data ?? []) as unknown as Service[];
}

export async function loadAdminService(id: string): Promise<Service | null> {
  const sb = createServiceRoleClient();
  const { data } = await sb.from("services").select("*").eq("id", id).single();
  return data ? (data as unknown as Service) : null;
}

export async function loadAdminAddons(): Promise<ServiceAddon[]> {
  const sb = createServiceRoleClient();
  const { data } = await sb.from("service_addons").select("*").order("sort_order");
  return (data ?? []) as unknown as ServiceAddon[];
}
