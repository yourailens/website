import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerPosts } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { data } = await db.from("planner_posts").select("author_id").eq("id", id).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String((data as { author_id: string }).author_id) !== auth.member.id && !auth.member.is_ceo) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { error } = await db.from("planner_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/planner");
  revalidatePath("/planner/people");
  return NextResponse.json({ posts: await listPlannerPosts({ limit: 80 }) });
}
