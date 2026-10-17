import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isPlannerDirectoryKind } from "@/data/planner";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerDirectory } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function clean(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function GET() {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json(await listPlannerDirectory());
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load directory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const url = String(b.url ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 });
  if (!url) return NextResponse.json({ error: "Link required" }, { status: 400 });
  const kind = isPlannerDirectoryKind(b.kind) ? b.kind : "other";

  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_directory")
    .insert({
      title,
      url,
      kind,
      blurb: clean(b.blurb),
      label: clean(b.label),
      notes: clean(b.notes),
      created_by: auth.member.id,
    })
    .select("id")
    .single();
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
  return NextResponse.json({ id: data?.id });
}
