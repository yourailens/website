import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isYailiansScreeningStatus } from "@/data/yailians";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllScreenings } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function revalidate() {
  revalidatePath("/yailians");
  revalidatePath("/yailians/screenings");
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") patch.title = b.title.trim();
  if (isYailiansScreeningStatus(b.status)) patch.status = b.status;
  if ("venue" in b) patch.venue = String(b.venue ?? "").trim() || null;
  if ("city" in b) patch.city = String(b.city ?? "").trim() || null;
  if ("starts_at" in b) patch.starts_at = String(b.starts_at ?? "").trim() || null;
  if ("ends_at" in b) patch.ends_at = String(b.ends_at ?? "").trim() || null;
  if ("notes" in b) patch.notes = String(b.notes ?? "").trim() || null;
  if ("cover_url" in b) patch.cover_url = String(b.cover_url ?? "").trim() || null;
  if ("ticket_url" in b) patch.ticket_url = String(b.ticket_url ?? "").trim() || null;
  if (typeof b.featured_on_hub === "boolean") patch.featured_on_hub = b.featured_on_hub;
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.round(b.sort_order);
  }
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const db = createServiceRoleClient();
  const { error } = await db.from("yailians_screenings").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ screenings: await adminGetAllScreenings() });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("yailians_screenings").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ screenings: await adminGetAllScreenings() });
}
