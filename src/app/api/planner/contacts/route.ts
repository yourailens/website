import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  isPlannerContactStatus,
  isPlannerFirstTouchChannel,
  isPlannerFirstTouchSide,
  plannerFirstTouchLine,
} from "@/data/planner";
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

  const first_touch_side = isPlannerFirstTouchSide(b.first_touch_side) ? b.first_touch_side : null;
  const first_touch_channel = isPlannerFirstTouchChannel(b.first_touch_channel) ? b.first_touch_channel : null;
  const first_touch_note = String(b.first_touch_note ?? "").trim() || null;
  const firstLine = plannerFirstTouchLine({
    side: first_touch_side,
    channel: first_touch_channel,
    note: first_touch_note,
  });

  const db = createServiceRoleClient();
  const row: Record<string, unknown> = {
    name,
    company: String(b.company ?? "").trim() || null,
    role_title: String(b.role_title ?? "").trim() || null,
    phone: String(b.phone ?? "").trim() || null,
    email: String(b.email ?? "").trim() || null,
    website: String(b.website ?? "").trim() || null,
    notes: String(b.notes ?? "").trim() || null,
    contacted: b.contacted === true || Boolean(firstLine),
    status: isPlannerContactStatus(b.status) ? b.status : firstLine ? "contacted" : "new",
    next_follow_up_at: String(b.next_follow_up_at ?? "").trim() || null,
    follow_up_booked: b.follow_up_booked === true,
    immediate_need: String(b.immediate_need ?? "").trim() || null,
    requirement: String(b.requirement ?? "").trim() || null,
    pitch: String(b.pitch ?? "").trim() || null,
    first_touch_side,
    first_touch_channel,
    first_touch_note,
    owner_id: String(b.owner_id ?? auth.member.id).trim() || auth.member.id,
    created_by: auth.member.id,
    bio_id: String(b.bio_id ?? "").trim() || null,
  };
  let { data, error } = await db.from("planner_contacts").insert(row).select("id").single();
  if (error && /bio_id/i.test(error.message)) {
    delete row.bio_id;
    ({ data, error } = await db.from("planner_contacts").insert(row).select("id").single());
  }
  if (error && /first_touch/i.test(error.message)) {
    delete row.first_touch_side;
    delete row.first_touch_channel;
    delete row.first_touch_note;
    ({ data, error } = await db.from("planner_contacts").insert(row).select("id").single());
  }
  if (error) {
    const needsTouch = /first_touch/i.test(error.message);
    const needsFollow = /immediate_need|follow_up_booked/i.test(error.message);
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: needsTouch
          ? "Run supabase/migrations/102_planner_first_touch.sql in the Supabase SQL editor."
          : needsFollow
            ? "Run supabase/migrations/093_planner_followups.sql in the Supabase SQL editor."
            : missing
              ? "Run supabase/migrations/088_planner.sql in the Supabase SQL editor first."
              : error.message,
      },
      { status: 400 }
    );
  }

  const contactId = data?.id ? String(data.id) : "";
  if (contactId && firstLine) {
    await db.from("planner_contact_entries").insert({
      contact_id: contactId,
      kind: "contacted",
      body: firstLine,
      created_by: auth.member.id,
    });
  }

  revalidate();
  return NextResponse.json({
    id: contactId || data?.id,
    contacts: await listPlannerContacts(),
  });
}
