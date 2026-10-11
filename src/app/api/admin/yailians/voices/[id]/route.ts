import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllVoices } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function revalidate() {
  revalidatePath("/yailians");
  revalidatePath("/yailians/voices");
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.name === "string") patch.name = b.name.trim();
  if (typeof b.quote === "string") patch.quote = b.quote.trim();
  if ("role" in b) patch.role = String(b.role ?? "").trim() || null;
  if ("portrait_url" in b) patch.portrait_url = String(b.portrait_url ?? "").trim() || null;
  if ("video_url" in b) patch.video_url = String(b.video_url ?? "").trim() || null;
  if (typeof b.featured_on_hub === "boolean") patch.featured_on_hub = b.featured_on_hub;
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.round(b.sort_order);
  }

  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const db = createServiceRoleClient();
  const { error } = await db.from("yailians_voices").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ voices: await adminGetAllVoices() });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("yailians_voices").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ voices: await adminGetAllVoices() });
}
