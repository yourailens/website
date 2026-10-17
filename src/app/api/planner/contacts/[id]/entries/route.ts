import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerEntryKind } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { getPlannerContact } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const body = String(b.body ?? "").trim();
  if (!body) return NextResponse.json({ error: "Entry text required" }, { status: 400 });
  const kind = isPlannerEntryKind(b.kind) ? b.kind : "note";
  const scheduled_at = String(b.scheduled_at ?? "").trim() || null;

  const db = createServiceRoleClient();
  const { error } = await db.from("planner_contact_entries").insert({
    contact_id: id,
    kind,
    body,
    scheduled_at,
    created_by: auth.member.id,
  });
  if (error) {
    const needsMeet = /check constraint|kind/i.test(error.message);
    return NextResponse.json(
      {
        error: needsMeet
          ? "Run supabase/migrations/093_planner_followups.sql in the Supabase SQL editor."
          : error.message,
      },
      { status: 400 },
    );
  }

  // Mirror schedule / contacted onto the contact summary when relevant
  const contactPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (kind === "contacted") contactPatch.contacted = true;
  if (kind === "scheduled" && scheduled_at) {
    contactPatch.next_follow_up_at = scheduled_at;
    contactPatch.follow_up_booked = true;
  }
  if (kind === "requirement") contactPatch.requirement = body;
  if (kind === "pitch") contactPatch.pitch = body;
  if (Object.keys(contactPatch).length > 1) {
    await db.from("planner_contacts").update(contactPatch).eq("id", id);
  }

  revalidatePath("/planner/follow-ups");
  revalidatePath(`/planner/follow-ups/${id}`);
  return NextResponse.json({ contact: await getPlannerContact(id) });
}
