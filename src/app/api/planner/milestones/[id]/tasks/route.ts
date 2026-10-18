import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePlanner } from "@/lib/planner/auth";
import { nextPlannerSortOrder } from "@/lib/planner/load";
import { milestoneSqlError } from "@/lib/planner/milestone-write";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function revalidate(id: string) {
  revalidatePath("/planner/tasks");
  revalidatePath("/planner/milestones");
  revalidatePath(`/planner/milestones/${id}`);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const db = createServiceRoleClient();

  const taskId = String(b.task_id ?? "").trim();
  if (taskId) {
    const { error } = await db.from("planner_tasks").update({ milestone_id: id }).eq("id", taskId);
    if (error) return NextResponse.json({ error: milestoneSqlError(error.message) }, { status: 400 });
    revalidate(id);
    return NextResponse.json({ id: taskId });
  }

  const title = String(b.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Name the task" }, { status: 400 });
  const assignee_id = String(b.assignee_id ?? auth.member.id).trim() || auth.member.id;
  const sort_order = await nextPlannerSortOrder("planner_tasks");
  const { data, error } = await db
    .from("planner_tasks")
    .insert({
      title,
      notes: null,
      deadline: null,
      status: "open",
      created_by: auth.member.id,
      assignee_id,
      sort_order,
      milestone_id: id,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: milestoneSqlError(error.message) }, { status: 400 });
  revalidate(id);
  return NextResponse.json({ id: data?.id });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const taskId = req.nextUrl.searchParams.get("task_id")?.trim();
  if (!taskId) return NextResponse.json({ error: "Task required" }, { status: 400 });
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_tasks").update({ milestone_id: null }).eq("id", taskId).eq("milestone_id", id);
  if (error) return NextResponse.json({ error: milestoneSqlError(error.message) }, { status: 400 });
  revalidate(id);
  return NextResponse.json({ ok: true });
}
