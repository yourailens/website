import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerTaskStatus } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerTasks } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function revalidate() {
  revalidatePath("/planner");
  revalidatePath("/planner/tasks");
  revalidatePath("/planner/people");
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (typeof b.title === "string") patch.title = b.title.trim();
  if ("notes" in b) patch.notes = String(b.notes ?? "").trim() || null;
  if ("deadline" in b) patch.deadline = String(b.deadline ?? "").trim() || null;
  if (isPlannerTaskStatus(b.status)) patch.status = b.status;
  if (typeof b.assignee_id === "string" && b.assignee_id.trim()) patch.assignee_id = b.assignee_id.trim();
  if (typeof b.sort_order === "number" && Number.isFinite(b.sort_order)) {
    patch.sort_order = Math.round(b.sort_order);
  }
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const db = createServiceRoleClient();
  if (patch.status) {
    const { data: existing } = await db.from("planner_tasks").select("assignee_id").eq("id", id).maybeSingle();
    if (!existing || existing.assignee_id !== auth.member.id) {
      return NextResponse.json({ error: "Only the assignee can change this" }, { status: 403 });
    }
  }
  const { error } = await db.from("planner_tasks").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ tasks: await listPlannerTasks() });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ tasks: await listPlannerTasks() });
}
