import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerContactStatus } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerContacts } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/planner/follow-ups");
}

export async function GET() {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ contacts: await listPlannerContacts() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load contacts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const name = String(b.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const db = createServiceRoleClient();
  const row: Record<string, unknown> = {
    name,
    company: String(b.company ?? "").trim() || null,
    role_title: String(b.role_title ?? "").trim() || null,
    phone: String(b.phone ?? "").trim() || null,
    email: String(b.email ?? "").trim() || null,
    website: String(b.website ?? "").trim() || null,
    notes: String(b.notes ?? "").trim() || null,
    contacted: b.contacted === true,
    status: isPlannerContactStatus(b.status) ? b.status : "new",
    next_follow_up_at: String(b.next_follow_up_at ?? "").trim() || null,
    follow_up_booked: b.follow_up_booked === true,
    immediate_need: String(b.immediate_need ?? "").trim() || null,
    requirement: String(b.requirement ?? "").trim() || null,
    pitch: String(b.pitch ?? "").trim() || null,
    owner_id: String(b.owner_id ?? auth.member.id).trim() || auth.member.id,
    created_by: auth.member.id,
    bio_id: String(b.bio_id ?? "").trim() || null,
  };
  let { data, error } = await db.from("planner_contacts").insert(row).select("id").single();
  if (error && /bio_id/i.test(error.message)) {
    delete row.bio_id;
    ({ data, error } = await db.from("planner_contacts").insert(row).select("id").single());
  }
  if (error) {
    const needsFollow = /immediate_need|follow_up_booked/i.test(error.message);
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: needsFollow
          ? "Run supabase/migrations/093_planner_followups.sql in the Supabase SQL editor."
          : missing
            ? "Run supabase/migrations/088_planner.sql in the Supabase SQL editor first."
            : error.message,
      },
      { status: 400 }
    );
  }
  revalidate();
  return NextResponse.json({
    id: data?.id,
    contacts: await listPlannerContacts(),
  });
}
