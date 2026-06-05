import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllOutfits } from "@/lib/outfits/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const outfits = await adminGetAllOutfits();
  return NextResponse.json({ outfits });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json() as Record<string, unknown>;
  const { slug, title, description, image_url, category, character_type,
          style_tags, color_palette, aspect_ratio, featured, published, sort_order } = body;

  if (!slug || !title || !image_url || !category) {
    return NextResponse.json({ error: "slug, title, image_url, and category are required" }, { status: 400 });
  }

  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("outfits")
    .insert({
      slug, title,
      description:    description ?? null,
      image_url,
      category,
      character_type: character_type ?? "female",
      style_tags:     style_tags ?? [],
      color_palette:  color_palette ?? [],
      aspect_ratio:   aspect_ratio ?? "portrait",
      featured:       featured ?? false,
      published:      published ?? false,
      sort_order:     sort_order ?? 0,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
