import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cleanProofUrl, isPlannerMilestoneEntryKind } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { milestoneSqlError } from "@/lib/planner/milestone-write";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const body = String(b.body ?? "").trim();
  const kind = isPlannerMilestoneEntryKind(b.kind) ? b.kind : "move";
  const proof = cleanProofUrl(b.proof_url);
  if ("error" in proof) return NextResponse.json({ error: proof.error }, { status: 400 });
  const proofRef = String(b.proof_ref ?? "").trim() || null;
  if (!body && !proof.url && !proofRef) return NextResponse.json({ error: "Write what happened" }, { status: 400 });

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_milestone_entries")
    .insert({
      milestone_id: id,
      kind,
      body: body || (proofRef ? proofRef : "Proof"),
      proof_url: proof.url,
      proof_ref: proofRef,
      created_by: auth.member.id,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: milestoneSqlError(error.message) }, { status: 400 });
  if (kind === "blocker") {
    await db.from("planner_milestones").update({ status: "stuck" }).eq("id", id);
  }
  revalidatePath(`/planner/milestones/${id}`);
  revalidatePath("/planner/milestones");
  return NextResponse.json({ id: data?.id });
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const entryId = req.nextUrl.searchParams.get("entry_id")?.trim();
  if (!entryId) return NextResponse.json({ error: "Log required" }, { status: 400 });
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_milestone_entries").delete().eq("id", entryId).eq("milestone_id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath(`/planner/milestones/${id}`);
  revalidatePath("/planner/milestones");
  return NextResponse.json({ ok: true });
}
