import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { isStudioEventTypeGuard, uniqueStudioEventSlug } from "@/lib/events/load-studio-events";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};

  if (typeof b.title === "string") {
    const title = b.title.trim();
    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    patch.title = title;
  }
  if (typeof b.subtitle === "string") patch.subtitle = b.subtitle.trim() || null;
  if (typeof b.description === "string") patch.description = b.description.trim() || null;
  if (b.event_type !== undefined) {
    if (!isStudioEventTypeGuard(b.event_type)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }
    patch.event_type = b.event_type;
  }
  if (typeof b.venue === "string") patch.venue = b.venue.trim() || null;
  if (typeof b.location_label === "string") patch.location_label = b.location_label.trim() || null;
  if (typeof b.starts_at === "string") patch.starts_at = b.starts_at.trim() || null;
  if (typeof b.ends_at === "string") patch.ends_at = b.ends_at.trim() || null;
  if (typeof b.date_label === "string") patch.date_label = b.date_label.trim() || null;
  if (typeof b.cta_label === "string") patch.cta_label = b.cta_label.trim() || null;
  if (typeof b.href === "string") patch.href = b.href.trim() || null;
  if (typeof b.image_url === "string") patch.image_url = b.image_url.trim() || null;
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) patch.sort_order = b.sort_order;

  const db = createServiceRoleClient();

  if (typeof b.slug === "string" && b.slug.trim()) {
    patch.slug = b.slug.trim().toLowerCase();
  } else if (typeof b.title === "string" && b.title.trim() && b.regenerate_slug === true) {
    patch.slug = await uniqueStudioEventSlug(db, b.title.trim(), id);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { error } = await db.from("studio_events").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = createServiceRoleClient();
  const { error } = await db.from("studio_events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
