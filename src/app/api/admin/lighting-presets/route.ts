import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllLightingPresets } from "@/lib/lighting_presets/load";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  return NextResponse.json({ lighting_presets: await adminGetAllLightingPresets() });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const b = await req.json() as Record<string, unknown>;
  const { slug, title, description, image_url, lighting_type, mood, color_temp, style_tags, aspect_ratio, featured, published, sort_order } = b;
  if (!slug || !title || !image_url || !lighting_type) return NextResponse.json({ error: "slug, title, image_url, lighting_type required" }, { status: 400 });
  const { data, error } = await createServiceRoleClient().from("lighting_presets").insert({ slug, title, description: description ?? null, image_url, lighting_type, mood: mood ?? "neutral", color_temp: color_temp ?? null, style_tags: style_tags ?? [], aspect_ratio: aspect_ratio ?? "landscape", featured: featured ?? false, published: published ?? false, sort_order: sort_order ?? 0 }).select("id,slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
