import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePlanner } from "@/lib/planner/auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function revalidate(id: string) {
  revalidatePath("/planner/tasks");
  revalidatePath(`/planner/tasks/${id}`);
  revalidatePath("/planner/people");
}

function missing(message: string) {
  return /does not exist|schema cache/i.test(message)
    ? "Run supabase/migrations/105_planner_task_log.sql in the Supabase SQL editor."
    : message;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const body = String(b.body ?? "").trim();
  if (!body) return NextResponse.json({ error: "Write what happened" }, { status: 400 });
  const kind = b.kind === "progress" || b.kind === "roadblock" ? b.kind : null;
  if (!kind) return NextResponse.json({ error: "Unknown kind" }, { status: 400 });

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_task_entries")
    .insert({
      task_id: id,
      kind,
      body,
      created_by: auth.member.id,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: missing(error.message) }, { status: 400 });

  if (kind === "progress") {
    await db.from("planner_tasks").update({ status: "doing" }).eq("id", id).neq("status", "done");
  }

  revalidate(id);
  return NextResponse.json({ id: data?.id });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const entryId = req.nextUrl.searchParams.get("entry_id")?.trim();
  if (!entryId) return NextResponse.json({ error: "Log required" }, { status: 400 });
  const db = createServiceRoleClient();
  const { error } = await db
    .from("planner_task_entries")
    .update({ resolved_at: new Date().toISOString() })
    .eq("id", entryId)
    .eq("task_id", id)
    .eq("kind", "roadblock");
  if (error) return NextResponse.json({ error: missing(error.message) }, { status: 400 });

  const { data: open } = await db
    .from("planner_task_entries")
    .select("id")
    .eq("task_id", id)
    .eq("kind", "roadblock")
    .is("resolved_at", null);
  if (!open?.length) {
    const { data: progress } = await db.from("planner_task_entries").select("id").eq("task_id", id).eq("kind", "progress").limit(1);
    await db
      .from("planner_tasks")
      .update({ status: progress?.length ? "doing" : "open" })
      .eq("id", id)
      .neq("status", "done");
  }

  revalidate(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const entryId = req.nextUrl.searchParams.get("entry_id")?.trim();
  if (!entryId) return NextResponse.json({ error: "Log required" }, { status: 400 });
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_task_entries").delete().eq("id", entryId).eq("task_id", id);
  if (error) return NextResponse.json({ error: missing(error.message) }, { status: 400 });
  revalidate(id);
  return NextResponse.json({ ok: true });
}
