import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "title",
  "tagline",
  "description",
  "discipline",
  "cover_image_url",
  "cover_aspect",
  "cover_variants",
  "director_brief",
  "camera_body",
  "lens_model",
  "focal_length",
  "aperture",
  "camera_notes",
  "lighting_presets",
  "color_grade_presets",
  "mood_presets",
  "composition_presets",
  "shot_type_presets",
  "aspect_ratio",
  "camera_setup",
  "lighting_setup",
  "lens_and_focal",
  "composition_notes",
  "color_and_mood",
  "workflow_steps",
  "recommended_models",
  "prompt_structure",
  "prompt_tips",
  "common_mistakes",
  "featured",
  "published",
  "sort_order",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)));

  const db = createServiceRoleClient();
  const { error } = await db.from("modules").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(body.assets)) {
    await db.from("module_assets").delete().eq("module_id", id);
    const inserts = (body.assets as Record<string, unknown>[]).map((a, i) => ({
      module_id: id,
      title: a.title ?? "Asset",
      caption: a.caption ?? null,
      kind: a.kind ?? "reference",
      image_url: a.image_url ?? null,
      video_url: a.video_url ?? null,
      aspect_ratio: a.aspect_ratio ?? "landscape",
      sort_order: a.sort_order ?? i,
    }));
    if (inserts.length > 0) {
      const { error: aErr } = await db.from("module_assets").insert(inserts);
      if (aErr) return NextResponse.json({ error: aErr.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("modules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
