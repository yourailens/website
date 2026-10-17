import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerMeetingsForMember } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const memberId = req.nextUrl.searchParams.get("member") || auth.member.id;
  try {
    return NextResponse.json({ meetings: await listPlannerMeetingsForMember(memberId) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load meetings" },
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
  const attendee_ids = Array.isArray(b.attendee_ids)
    ? [...new Set((b.attendee_ids as unknown[]).map((x) => String(x)).filter(Boolean))]
    : [auth.member.id];
  if (!attendee_ids.includes(auth.member.id)) attendee_ids.push(auth.member.id);

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_meetings")
    .insert({
      title,
      notes: String(b.notes ?? "").trim() || null,
      starts_at: String(b.starts_at ?? "").trim() || null,
      ends_at: String(b.ends_at ?? "").trim() || null,
      created_by: auth.member.id,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (data?.id && attendee_ids.length) {
    await db.from("planner_meeting_attendees").insert(
      attendee_ids.map((member_id) => ({ meeting_id: data.id, member_id }))
    );
  }
  revalidatePath("/planner/people");
  return NextResponse.json({
    meetings: await listPlannerMeetingsForMember(attendee_ids[0] ?? auth.member.id),
  });
}
