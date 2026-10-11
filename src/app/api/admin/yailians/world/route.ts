import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isYailiansWorldKind } from "@/data/yailians";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllWorld, nextSortOrder } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

function revalidate() {
  revalidatePath("/yailians");
  revalidatePath("/yailians/world");
}

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ items: await adminGetAllWorld() });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to load world gallery" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const title = String(b.title ?? "").trim();
  const media_url = String(b.media_url ?? "").trim();
  const kind = isYailiansWorldKind(b.kind) ? b.kind : null;
  const media_type = b.media_type === "video" || b.media_type === "image" ? b.media_type : null;
  if (!title || !media_url || !kind || !media_type) {
    return NextResponse.json(
      { error: "Title, kind, media type, and media URL are required" },
      { status: 400 }
    );
  }

  const db = createServiceRoleClient();
  const sort_order = await nextSortOrder("yailians_world");
  const { data, error } = await db
    .from("yailians_world")
    .insert({
      title,
      kind,
      media_type,
      media_url,
      caption: String(b.caption ?? "").trim() || null,
      poster_url: String(b.poster_url ?? "").trim() || null,
      featured_on_hub: b.featured_on_hub === true,
      published: b.published !== false,
      sort_order,
    })
    .select("*")
    .single();
  if (error) {
    const missing = /does not exist|schema cache/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/085_yailians.sql in the Supabase SQL editor first."
          : error.message,
      },
      { status: 400 }
    );
  }
  revalidate();
  return NextResponse.json({ item: data, items: await adminGetAllWorld() });
}
