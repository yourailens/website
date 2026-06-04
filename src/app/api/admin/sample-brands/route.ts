import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllSampleBrands } from "@/lib/sample-brands/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ brands: await adminGetAllSampleBrands() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const industry_id = b.industry_id;
  const slug = b.slug;
  const name = b.name;
  if (!industry_id || !slug || !name) {
    return NextResponse.json({ error: "industry_id, slug, name required" }, { status: 400 });
  }

  const { data, error } = await createServiceRoleClient()
    .from("industry_sample_brands")
    .insert({
      industry_id,
      slug: String(slug).trim().toLowerCase(),
      name,
      tagline: b.tagline ?? null,
      description: b.description ?? null,
      hero_image_url: b.hero_image_url ?? null,
      hero_media_type: b.hero_media_type ?? "image",
      hero_aspect_ratio: b.hero_aspect_ratio ?? "landscape",
      hero_poster_url: b.hero_poster_url ?? null,
      hero_caption: b.hero_caption ?? null,
      cover_image_url: b.cover_image_url ?? null,
      cover_media_type: b.cover_media_type ?? "image",
      cover_aspect_ratio: b.cover_aspect_ratio ?? "landscape",
      cover_poster_url: b.cover_poster_url ?? null,
      sort_order: b.sort_order ?? 0,
      published: b.published ?? false,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id });
}
