import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllMoodBoards } from "@/lib/mood_boards/load";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  return NextResponse.json({ mood_boards: await adminGetAllMoodBoards() });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const b = await req.json() as Record<string, unknown>;
  const { slug, title, description, image_url, aesthetic, era, color_palette, style_tags, aspect_ratio, featured, published, sort_order } = b;
  if (!slug || !title || !image_url || !aesthetic) return NextResponse.json({ error: "slug, title, image_url, aesthetic required" }, { status: 400 });
  const { data, error } = await createServiceRoleClient().from("mood_boards").insert({ slug, title, description: description ?? null, image_url, aesthetic, era: era ?? "modern", color_palette: color_palette ?? [], style_tags: style_tags ?? [], aspect_ratio: aspect_ratio ?? "landscape", featured: featured ?? false, published: published ?? false, sort_order: sort_order ?? 0 }).select("id,slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
