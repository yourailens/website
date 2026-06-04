import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const { brand_id, media_url } = b;
  if (!brand_id || !media_url) {
    return NextResponse.json({ error: "brand_id, media_url required" }, { status: 400 });
  }

  const { data, error } = await createServiceRoleClient()
    .from("industry_sample_brand_media")
    .insert({
      brand_id,
      media_url,
      media_type: b.media_type ?? "image",
      aspect_ratio: b.aspect_ratio ?? "landscape",
      category: b.category ?? "situations",
      label: b.label ?? null,
      caption: b.caption ?? null,
      poster_url: b.poster_url ?? null,
      sort_order: b.sort_order ?? 0,
      published: b.published ?? true,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id });
}
