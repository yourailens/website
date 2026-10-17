import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerDirectoryKind } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { getPlannerDirectoryItem } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  try {
    const item = await getPlannerDirectoryItem(id);
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ item });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const b = (await req.json()) as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if ("title" in b) {
    const title = String(b.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
    patch.title = title;
  }
  if ("url" in b) {
    const url = String(b.url ?? "").trim();
    if (!url) return NextResponse.json({ error: "Link required" }, { status: 400 });
    patch.url = url;
  }
  if ("kind" in b && isPlannerDirectoryKind(b.kind)) patch.kind = b.kind;
  if ("blurb" in b) patch.blurb = clean(b.blurb);
  if ("label" in b) patch.label = clean(b.label);
  if ("notes" in b) patch.notes = clean(b.notes);
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const db = createServiceRoleClient();
  const { error } = await db.from("planner_directory").update(patch).eq("id", id);
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/095_planner_directory.sql in the Supabase SQL editor."
          : error.message,
      },
      { status: 400 },
    );
  }
  revalidatePath("/planner/directory");
  revalidatePath(`/planner/directory/${id}`);
  return NextResponse.json({ item: await getPlannerDirectoryItem(id) });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const { id } = await ctx.params;
  const db = createServiceRoleClient();
  const { error } = await db.from("planner_directory").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidatePath("/planner/directory");
  return NextResponse.json({ ok: true });
}
