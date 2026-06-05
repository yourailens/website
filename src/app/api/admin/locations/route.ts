import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllLocations } from "@/lib/locations/load";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  return NextResponse.json({ locations: await adminGetAllLocations() });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const { slug, title, description, image_url, category, time_of_day, weather, style_tags, aspect_ratio, featured, published, sort_order } = body;
  if (!slug || !title || !image_url || !category) return NextResponse.json({ error: "slug, title, image_url, category required" }, { status: 400 });
  const sb = createServiceRoleClient();
  const { data, error } = await sb.from("locations").insert({ slug, title, description: description ?? null, image_url, category, time_of_day: time_of_day ?? "any", weather: weather ?? "any", style_tags: style_tags ?? [], aspect_ratio: aspect_ratio ?? "landscape", featured: featured ?? false, published: published ?? false, sort_order: sort_order ?? 0 }).select("id, slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
