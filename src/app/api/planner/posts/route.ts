import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requirePlanner } from "@/lib/planner/auth";
import { listPlannerPosts } from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/planner");
  revalidatePath("/planner/people");
}

export async function GET(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const authorId = req.nextUrl.searchParams.get("author") || undefined;
  try {
    return NextResponse.json({
      posts: await listPlannerPosts({ authorId, limit: authorId ? 50 : 80 }),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load posts" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requirePlanner();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const body = String(b.body ?? "").trim();
  if (!body) return NextResponse.json({ error: "Post text required" }, { status: 400 });
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
    .from("planner_posts")
    .insert({ author_id: auth.member.id, body })
    .select("id")
    .single();
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/088_planner.sql in the Supabase SQL editor first."
          : error.message,
      },
      { status: 400 }
    );
  }
  if (images.length && data?.id) {
    const { error: imgErr } = await db.from("planner_post_images").insert(
      images.map((img) => ({
        post_id: data.id,
        url: img.url,
        label: img.label,
        sort_order: img.sort_order,
      }))
    );
    if (imgErr) return NextResponse.json({ error: imgErr.message }, { status: 400 });
  }
  revalidate();
  return NextResponse.json({ posts: await listPlannerPosts({ limit: 80 }) });
}
