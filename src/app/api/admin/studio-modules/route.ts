import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllStudioModules } from "@/lib/studio-modules/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ modules: await adminGetAllStudioModules() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as Record<string, unknown>;
  const { slug, title, module_type } = b;
  if (!slug || !title || !module_type) {
    return NextResponse.json({ error: "slug, title, and module_type required" }, { status: 400 });
  }

  const row = {
    slug,
    title,
    module_type,
    description: b.description ?? null,
    cover_image_url: b.cover_image_url ?? null,
    cover_aspect: b.cover_aspect ?? "portrait",
    featured: b.featured ?? false,
    published: b.published ?? false,
    sort_order: b.sort_order ?? 0,
  };

  const db = createServiceRoleClient();
  const { data, error } = await db.from("studio_modules").insert(row).select("id, slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const items = Array.isArray(b.items) ? b.items : [];
  if (items.length > 0) {
    const inserts = items.map((a: Record<string, unknown>, i: number) => ({
      module_id: data.id,
      media_type: a.media_type === "video" ? "video" : "image",
      image_url: a.image_url ?? null,
      video_url: a.video_url ?? null,
      poster_url: a.poster_url ?? null,
          aspect_ratio: a.aspect_ratio ?? "natural",
      caption: a.caption ?? null,
      prompt: a.prompt ?? null,
      sort_order: a.sort_order ?? i,
    }));
    const { error: itemErr } = await db.from("studio_module_items").insert(inserts);
    if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
