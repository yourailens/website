import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetSampleBrandById } from "@/lib/sample-brands/load";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "industry_id",
  "slug",
  "name",
  "tagline",
  "description",
  "hero_image_url",
  "hero_media_type",
  "hero_aspect_ratio",
  "hero_poster_url",
  "hero_caption",
  "cover_image_url",
  "cover_media_type",
  "cover_aspect_ratio",
  "cover_poster_url",
  "sort_order",
  "published",
];

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const brand = await adminGetSampleBrandById(id);
  if (!brand) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ brand });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const patch = Object.fromEntries(
    Object.entries((await req.json()) as Record<string, unknown>).filter(([k]) => ALLOWED.includes(k))
  );
  const { error } = await createServiceRoleClient().from("industry_sample_brands").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("industry_sample_brands").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
