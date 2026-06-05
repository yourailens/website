import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllProps } from "@/lib/props/load";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  return NextResponse.json({ props: await adminGetAllProps() });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const b = await req.json() as Record<string, unknown>;
  const { slug, title, description, image_url, category, style, color_tags, style_tags, aspect_ratio, featured, published, sort_order } = b;
  if (!slug || !title || !image_url || !category) return NextResponse.json({ error: "slug, title, image_url, category required" }, { status: 400 });
  const { data, error } = await createServiceRoleClient().from("props").insert({ slug, title, description: description ?? null, image_url, category, style: style ?? "realistic", color_tags: color_tags ?? [], style_tags: style_tags ?? [], aspect_ratio: aspect_ratio ?? "square", featured: featured ?? false, published: published ?? false, sort_order: sort_order ?? 0 }).select("id,slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
