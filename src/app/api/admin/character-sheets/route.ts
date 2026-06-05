import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetAllCharacterSheets } from "@/lib/character_sheets/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const sheets = await adminGetAllCharacterSheets();
  return NextResponse.json({ character_sheets: sheets });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const body = await req.json() as Record<string, unknown>;
  const {
    slug, title, description, image_url,
    ethnicity, age_group, gender, skin_tone, archetype,
    nationality, hair_color, eye_color,
    style_tags, aspect_ratio, featured, published, sort_order,
  } = body;

  if (!slug || !title || !image_url || !ethnicity) {
    return NextResponse.json(
      { error: "slug, title, image_url, and ethnicity are required" },
      { status: 400 }
    );
  }

  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("character_sheets")
    .insert({
      slug, title,
      description:  description ?? null,
      image_url,
      ethnicity,
      age_group:    age_group  ?? "adult",
      gender:       gender     ?? "female",
      skin_tone:    skin_tone  ?? "medium",
      archetype:    archetype  ?? "everyman",
      nationality:  nationality ?? null,
      hair_color:   hair_color  ?? null,
      eye_color:    eye_color   ?? null,
      style_tags:   style_tags  ?? [],
      aspect_ratio: aspect_ratio ?? "portrait",
      featured:     featured     ?? false,
      published:    published    ?? false,
      sort_order:   sort_order   ?? 0,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
