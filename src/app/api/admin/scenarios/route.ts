import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllScenarios } from "@/lib/scenarios/load";
export const dynamic = "force-dynamic";
export async function GET() {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  return NextResponse.json({ scenarios: await adminGetAllScenarios() });
}
export async function POST(req: NextRequest) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const body = await req.json() as Record<string, unknown>;
  const { slug, title, description, image_url, scenario_type, setting, mood, character_count, style_tags, aspect_ratio, featured, published, sort_order } = body;
  if (!slug || !title || !image_url || !scenario_type) return NextResponse.json({ error: "slug, title, image_url, scenario_type required" }, { status: 400 });
  const sb = createServiceRoleClient();
  const { data, error } = await sb.from("scenarios").insert({ slug, title, description: description ?? null, image_url, scenario_type, setting: setting ?? "outdoor", mood: mood ?? "peaceful", character_count: character_count ?? "solo", style_tags: style_tags ?? [], aspect_ratio: aspect_ratio ?? "portrait", featured: featured ?? false, published: published ?? false, sort_order: sort_order ?? 0 }).select("id, slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
