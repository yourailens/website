import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  isPlannerContactStatus,
  isPlannerFirstTouchChannel,
  isPlannerFirstTouchSide,
} from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { getPlannerContact } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function revalidate(id?: string) {
  revalidatePath("/planner/follow-ups");
  if (id) revalidatePath(`/planner/follow-ups/${id}`);
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    const contact = await getPlannerContact(id);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ contact });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load contact" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  for (const key of [
    "name",
    "company",
    "role_title",
    "phone",
    "email",
    "website",
    "notes",
    "requirement",
    "pitch",
    "immediate_need",
    "first_touch_note",
  ] as const) {
    if (key in b) {
      const v = String(b[key] ?? "").trim();
      patch[key] = key === "name" ? v : v || null;
    }
  }
  if ("contacted" in b) patch.contacted = b.contacted === true;
  if (isPlannerContactStatus(b.status)) patch.status = b.status;
  if ("first_touch_side" in b) {
    patch.first_touch_side = isPlannerFirstTouchSide(b.first_touch_side) ? b.first_touch_side : null;
  }
  if ("first_touch_channel" in b) {
    patch.first_touch_channel = isPlannerFirstTouchChannel(b.first_touch_channel) ? b.first_touch_channel : null;
  }
  if ("follow_up_booked" in b) {
    patch.follow_up_booked = b.follow_up_booked === true;
    if (patch.follow_up_booked !== true && !("next_follow_up_at" in b)) patch.next_follow_up_at = null;
  }
  if ("next_follow_up_at" in b) patch.next_follow_up_at = String(b.next_follow_up_at ?? "").trim() || null;
  if ("owner_id" in b) patch.owner_id = String(b.owner_id ?? "").trim() || null;
  if (!Object.keys(patch).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_contacts").update(patch).eq("id", id);
  if (error) {
    const missing = /immediate_need|follow_up_booked|does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/093_planner_followups.sql in the Supabase SQL editor."
          : error.message,
      },
      { status: 400 },
    );
  }
  revalidate(id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_contacts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidate();
  return NextResponse.json({ ok: true });
}
