import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerTaskStatus } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerTasks, nextPlannerSortOrder } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/planner");
  revalidatePath("/planner/tasks");
  revalidatePath("/planner/people");
}

export async function GET(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const assigneeId = req.nextUrl.searchParams.get("assignee") || undefined;
  try {
    return NextResponse.json({ tasks: await listPlannerTasks({ assigneeId }) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load tasks" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  const assignee_id = String(b.assignee_id ?? auth.member.id).trim();
  const status = isPlannerTaskStatus(b.status) ? b.status : "open";
  const deadline = String(b.deadline ?? "").trim() || null;
  const notes = String(b.notes ?? "").trim() || null;

  const db = createServiceRoleClient();
  const sort_order = await nextPlannerSortOrder("planner_tasks");
  const { error } = await db.from("planner_tasks").insert({
    title,
    notes,
    deadline,
    status,
    created_by: auth.member.id,
    assignee_id,
    sort_order,
  });
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/088_planner.sql in the Supabase SQL editor first."
          : error.message,
      },
      { status: 400 }
    );
  }
  revalidate();
  return NextResponse.json({ tasks: await listPlannerTasks() });
}
