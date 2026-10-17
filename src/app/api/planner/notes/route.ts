import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerNotes } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const memberId = req.nextUrl.searchParams.get("member");
  if (!memberId) return NextResponse.json({ error: "member required" }, { status: 400 });
  try {
    return NextResponse.json({ notes: await listPlannerNotes(memberId) });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const member_id = String(b.member_id ?? "").trim();
  const title = String(b.title ?? "").trim();
  if (!member_id || !title) {
    return NextResponse.json({ error: "member_id and title required" }, { status: 400 });
  }
  const body = String(b.body ?? "");
  const images = Array.isArray(b.images)
    ? (b.images as { url?: string; label?: string }[])
        .map((img, i) => ({
          url: String(img.url ?? "").trim(),
          label: String(img.label ?? "").trim() || null,
          sort_order: i,
        }))
        .filter((img) => img.url)
    : [];

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_notes")
    .insert({
      member_id,
      author_id: auth.member.id,
      title,
      body,
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (images.length && data?.id) {
    await db.from("planner_note_images").insert(
      images.map((img) => ({
        note_id: data.id,
        url: img.url,
        label: img.label,
        sort_order: img.sort_order,
      }))
    );
  }
  revalidatePath("/planner/people");
  return NextResponse.json({
    id: data?.id,
    notes: await listPlannerNotes(member_id),
  });
}
