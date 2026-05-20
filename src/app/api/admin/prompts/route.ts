import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllPrompts } from "@/lib/prompts/load";

export const dynamic = "force-dynamic";

// GET  /api/admin/prompts  — list all prompts (published + drafts)
export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const prompts = await adminGetAllPrompts();
  return NextResponse.json({ prompts });
}

// POST /api/admin/prompts  — create a new prompt
export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json();

  const {
    slug,
    title,
    excerpt,
    cover_image_url,
    cover_aspect,
    demo_video_url,
    og_image_url,
    media_type,
    image_category,
    video_category,
    difficulty,
    models,
    tags,
    prompt_body,
    featured,
    published,
    sort_order,
  } = body as Record<string, unknown>;

  if (!slug || !title || !media_type) {
    return NextResponse.json({ error: "slug, title, and media_type are required" }, { status: 400 });
  }

  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("prompts")
    .insert({
      slug,
      title,
      excerpt: excerpt ?? null,
      cover_image_url: cover_image_url ?? null,
      cover_aspect: cover_aspect ?? "landscape",
      demo_video_url: demo_video_url ?? null,
      og_image_url: og_image_url ?? null,
      media_type,
      image_category: image_category ?? null,
      video_category: video_category ?? null,
      difficulty: difficulty ?? "intermediate",
      models: models ?? [],
      tags: tags ?? [],
      body: prompt_body ?? "",
      featured: featured ?? false,
      published: published ?? false,
      sort_order: sort_order ?? 0,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
