import { createClient } from "@supabase/supabase-js";
import {
  FALLBACK_STUDIO_EVENTS,
  isStudioEventType,
  type StudioEvent,
  type StudioEventType,
} from "@/data/studio-events";
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

const SELECT =
  "id,slug,title,subtitle,description,event_type,venue,location_label,starts_at,ends_at,date_label,cta_label,href,image_url,published,sort_order,created_at";

function rowToEvent(row: Record<string, unknown>): StudioEvent {
  const event_type = isStudioEventType(row.event_type) ? row.event_type : "other";
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title ?? ""),
    subtitle: typeof row.subtitle === "string" ? row.subtitle : null,
    description: typeof row.description === "string" ? row.description : null,
    event_type,
    venue: typeof row.venue === "string" ? row.venue : null,
    location_label: typeof row.location_label === "string" ? row.location_label : null,
    starts_at: typeof row.starts_at === "string" ? row.starts_at : null,
    ends_at: typeof row.ends_at === "string" ? row.ends_at : null,
    date_label: typeof row.date_label === "string" ? row.date_label : null,
    cta_label: typeof row.cta_label === "string" ? row.cta_label : null,
    href: typeof row.href === "string" ? row.href : null,
    image_url: typeof row.image_url === "string" ? row.image_url : null,
    published: Boolean(row.published),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
  };
}

function isMissingTable(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = error.message ?? "";
  return /does not exist|schema cache|Could not find the table/i.test(msg) || error.code === "42P01";
}

export async function getPublishedStudioEvents(): Promise<StudioEvent[]> {
  const supabase = readClient();
  if (!supabase) return FALLBACK_STUDIO_EVENTS;
  const { data, error } = await supabase
    .from("studio_events")
    .select(SELECT)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("starts_at", { ascending: true, nullsFirst: false });
  if (error) {
    if (isMissingTable(error)) return FALLBACK_STUDIO_EVENTS;
    return FALLBACK_STUDIO_EVENTS;
  }
  if (!data?.length) return FALLBACK_STUDIO_EVENTS;
  return data.map((row) => rowToEvent(row as Record<string, unknown>));
}

export async function adminGetAllStudioEvents(): Promise<StudioEvent[]> {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("studio_events")
    .select(SELECT)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => rowToEvent(row as Record<string, unknown>));
}

export function slugifyStudioEvent(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export async function uniqueStudioEventSlug(
  db: ReturnType<typeof createServiceRoleClient>,
  title: string,
  exceptId?: string
): Promise<string> {
  const base = slugifyStudioEvent(title) || "event";
  let slug = base;
  let n = 2;
  for (;;) {
    let q = db.from("studio_events").select("id").eq("slug", slug).limit(1);
    if (exceptId) q = q.neq("id", exceptId);
    const { data } = await q;
    if (!data?.length) return slug;
    slug = `${base}-${n}`;
    n += 1;
  }
}

export function isStudioEventTypeGuard(v: unknown): v is StudioEventType {
  return isStudioEventType(v);
}
