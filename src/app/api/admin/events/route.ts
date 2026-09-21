import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  adminGetAllStudioEvents,
  isStudioEventTypeGuard,
  uniqueStudioEventSlug,
} from "@/lib/events/load-studio-events";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ events: await adminGetAllStudioEvents() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const event_type = b.event_type;
  if (!isStudioEventTypeGuard(event_type)) {
    return NextResponse.json({ error: "Pick meetup, workshop, screening, or other" }, { status: 400 });
  }

  const db = createServiceRoleClient();
  const { data: last } = await db
    .from("studio_events")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order =
    typeof b.sort_order === "number" && Number.isFinite(b.sort_order)
      ? Number(b.sort_order)
      : (last?.[0]?.sort_order ?? 0) + 1;

  const slug =
    typeof b.slug === "string" && b.slug.trim()
      ? b.slug.trim().toLowerCase()
      : await uniqueStudioEventSlug(db, title);

  const { data, error } = await db
    .from("studio_events")
    .insert({
      slug,
      title,
      subtitle: String(b.subtitle ?? "").trim() || null,
      description: String(b.description ?? "").trim() || null,
      event_type,
      venue: String(b.venue ?? "").trim() || null,
      location_label: String(b.location_label ?? "").trim() || null,
      starts_at: String(b.starts_at ?? "").trim() || null,
      ends_at: String(b.ends_at ?? "").trim() || null,
      date_label: String(b.date_label ?? "").trim() || null,
      cta_label: String(b.cta_label ?? "").trim() || null,
      href: String(b.href ?? "").trim() || null,
      image_url: String(b.image_url ?? "").trim() || null,
      published: b.published !== false,
      sort_order,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
