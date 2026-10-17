import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePlanner } from "@/lib/planner/auth";
import { getPlannerNote, listPlannerNotes } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const note = await getPlannerNote(id);
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ note });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const existing = await getPlannerNote(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.author_id !== auth.member.id && !auth.member.is_ceo) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") patch.title = b.title.trim();
  if (typeof b.body === "string") patch.body = b.body;
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_notes").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(b.images)) {
    const images = (b.images as { url?: string; label?: string }[])
      .map((img, i) => ({
        url: String(img.url ?? "").trim(),
        label: String(img.label ?? "").trim() || null,
        sort_order: i,
      }))
      .filter((img) => img.url);
    await db.from("planner_note_images").delete().eq("note_id", id);
    if (images.length) {
      await db.from("planner_note_images").insert(
        images.map((img) => ({
          note_id: id,
          url: img.url,
          label: img.label,
          sort_order: img.sort_order,
        }))
      );
    }
  }

  revalidatePath("/planner/people");
  return NextResponse.json({
    note: await getPlannerNote(id),
    notes: await listPlannerNotes(existing.member_id),
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const existing = await getPlannerNote(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (existing.author_id !== auth.member.id && !auth.member.is_ceo) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_notes").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/planner/people");
  return NextResponse.json({ notes: await listPlannerNotes(existing.member_id) });
}
