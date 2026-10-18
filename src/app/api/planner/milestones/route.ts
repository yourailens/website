import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerMilestoneHorizon, isPlannerMilestoneStatus, parseMilestoneCrew } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerMilestones } from "@/lib/planner/load";
import { milestoneSqlError, replaceMilestoneCrew, replaceMilestoneDeps } from "@/lib/planner/milestone-write";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function dateOrNull(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

export async function GET() {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await listPlannerMilestones());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load milestones" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Name the target" }, { status: 400 });
  const status = isPlannerMilestoneStatus(b.status) ? b.status : "moving";
  const horizon = isPlannerMilestoneHorizon(b.horizon) ? b.horizon : "quarter";
  const crew = parseMilestoneCrew(b.crew ?? b.member_ids);
  const blockedBy = Array.isArray(b.blocked_by_ids) ? b.blocked_by_ids.map((id) => String(id)) : [];

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_milestones")
    .insert({
      title,
      intent: clean(b.intent),
      done_when: clean(b.done_when),
      status,
      horizon,
      target_on: dateOrNull(b.target_on),
      created_by: auth.member.id,
    })
    .select("id")
    .single();
  if (error) {
    return NextResponse.json({ error: milestoneSqlError(error.message) }, { status: 400 });
  }
  const id = data?.id as string | undefined;
  if (id && crew.length) {
    const crewError = await replaceMilestoneCrew(db, id, crew);
    if (crewError) return NextResponse.json({ error: milestoneSqlError(crewError), id }, { status: 400 });
  }
  if (id && blockedBy.length) {
    const depError = await replaceMilestoneDeps(db, id, blockedBy);
    if (depError) return NextResponse.json({ error: milestoneSqlError(depError), id }, { status: 400 });
  }
  revalidatePath("/planner/milestones");
  return NextResponse.json({ id });
}
