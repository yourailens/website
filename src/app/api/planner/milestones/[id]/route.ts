import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerMilestoneHorizon, isPlannerMilestoneStatus, parseMilestoneCrew } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { milestoneSqlError, replaceMilestoneCrew, replaceMilestoneDeps } from "@/lib/planner/milestone-write";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if ("title" in b) {
    const title = String(b.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Name the target" }, { status: 400 });
    patch.title = title;
  }
  if ("intent" in b) patch.intent = clean(b.intent);
  if ("done_when" in b) patch.done_when = clean(b.done_when);
  if ("status" in b) {
    if (!isPlannerMilestoneStatus(b.status)) return NextResponse.json({ error: "Unknown status" }, { status: 400 });
    patch.status = b.status;
  }
  if ("horizon" in b) {
    if (!isPlannerMilestoneHorizon(b.horizon)) return NextResponse.json({ error: "Unknown season" }, { status: 400 });
    patch.horizon = b.horizon;
  }
  if ("target_on" in b) {
    const text = String(b.target_on ?? "").trim();
    if (text && !/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return NextResponse.json({ error: "Date should be a day" }, { status: 400 });
    }
    patch.target_on = text || null;
  }

  const db = createServiceRoleClient();
  if (Object.keys(patch).length) {
    const { error } = await db.from("planner_milestones").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: milestoneSqlError(error.message) }, { status: 400 });
  }
  if ("crew" in b || "member_ids" in b) {
    const crewError = await replaceMilestoneCrew(db, id, parseMilestoneCrew(b.crew ?? b.member_ids));
    if (crewError) return NextResponse.json({ error: milestoneSqlError(crewError) }, { status: 400 });
  }
  if ("blocked_by_ids" in b) {
    const ids = Array.isArray(b.blocked_by_ids) ? b.blocked_by_ids.map((item) => String(item)) : [];
    const depError = await replaceMilestoneDeps(db, id, ids);
    if (depError) return NextResponse.json({ error: milestoneSqlError(depError) }, { status: 400 });
  }
  revalidatePath("/planner/milestones");
  revalidatePath(`/planner/milestones/${id}`);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_milestones").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/planner/milestones");
  return NextResponse.json({ ok: true });
}
