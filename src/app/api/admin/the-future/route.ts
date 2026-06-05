import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllFutureData } from "@/lib/the-future/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ fields: await adminGetAllFutureData() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const kind = b.kind as string;

  const db = createServiceRoleClient();

  if (kind === "field") {
    const { slug, title } = b;
    if (!slug || !title) {
      return NextResponse.json({ error: "slug and title required" }, { status: 400 });
    }
    const { data, error } = await db
      .from("future_fields")
      .insert({
        slug,
        title,
        tagline: b.tagline ?? null,
        description: b.description ?? null,
        cover_image_url: b.cover_image_url ?? null,
        cover_video_url: b.cover_video_url ?? null,
        cover_media_type: b.cover_media_type ?? "image",
        cover_aspect: b.cover_aspect ?? "landscape",
        sort_order: b.sort_order ?? 0,
        published: b.published ?? false,
      })
      .select("id,slug")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  }

  if (kind === "module") {
    const { field_id, slug, title } = b;
    if (!field_id || !slug || !title) {
      return NextResponse.json({ error: "field_id, slug and title required" }, { status: 400 });
    }
    const { data, error } = await db
      .from("future_modules")
      .insert({
        field_id,
        slug,
        title,
        tagline: b.tagline ?? null,
        intro: b.intro ?? null,
        cover_image_url: b.cover_image_url ?? null,
        cover_video_url: b.cover_video_url ?? null,
        cover_media_type: b.cover_media_type ?? "image",
        cover_aspect: b.cover_aspect ?? "landscape",
        sort_order: b.sort_order ?? 0,
        published: b.published ?? false,
      })
      .select("id,slug")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
  }

  return NextResponse.json({ error: "Invalid kind" }, { status: 400 });
}
