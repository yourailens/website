import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllModules } from "@/lib/modules/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ modules: await adminGetAllModules() });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const b = (await req.json()) as Record<string, unknown>;
  const { slug, title } = b;
  if (!slug || !title) {
    return NextResponse.json({ error: "slug and title required" }, { status: 400 });
  }

  const row = {
    slug,
    title,
    tagline: b.tagline ?? null,
    description: b.description ?? null,
    discipline: b.discipline ?? "other",
    cover_image_url: b.cover_image_url ?? null,
    cover_aspect: b.cover_aspect ?? "landscape",
    cover_variants: b.cover_variants ?? {},
    director_brief: b.director_brief ?? null,
    camera_body: b.camera_body ?? null,
    lens_model: b.lens_model ?? null,
    focal_length: b.focal_length ?? null,
    aperture: b.aperture ?? null,
    camera_notes: b.camera_notes ?? null,
    lighting_presets: b.lighting_presets ?? [],
    color_grade_presets: b.color_grade_presets ?? [],
    mood_presets: b.mood_presets ?? [],
    composition_presets: b.composition_presets ?? [],
    shot_type_presets: b.shot_type_presets ?? [],
    aspect_ratio: b.aspect_ratio ?? null,
    camera_setup: b.camera_setup ?? null,
    lighting_setup: b.lighting_setup ?? null,
    lens_and_focal: b.lens_and_focal ?? null,
    composition_notes: b.composition_notes ?? null,
    color_and_mood: b.color_and_mood ?? null,
    workflow_steps: b.workflow_steps ?? [],
    recommended_models: b.recommended_models ?? [],
    prompt_structure: b.prompt_structure ?? null,
    prompt_tips: b.prompt_tips ?? null,
    common_mistakes: b.common_mistakes ?? null,
    featured: b.featured ?? false,
    published: b.published ?? false,
    sort_order: b.sort_order ?? 0,
  };

  const db = createServiceRoleClient();
  const { data, error } = await db.from("modules").insert(row).select("id,slug").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const assets = Array.isArray(b.assets) ? b.assets : [];
  if (assets.length > 0) {
    const inserts = assets.map((a: Record<string, unknown>, i: number) => ({
      module_id: data.id,
      title: a.title ?? "Asset",
      caption: a.caption ?? null,
      kind: a.kind ?? "reference",
      image_url: a.image_url ?? null,
      video_url: a.video_url ?? null,
      aspect_ratio: a.aspect_ratio ?? "landscape",
      sort_order: a.sort_order ?? i,
    }));
    await db.from("module_assets").insert(inserts);
  }

  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
