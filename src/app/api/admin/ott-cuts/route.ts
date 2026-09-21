import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  adminGetAllOttCuts,
  clearOtherHomepageFeatures,
  isOttCutAspect,
  isOttCutCategory,
  isOttCutMediaType,
  uniqueOttCutSlug,
} from "@/lib/ott-cuts/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  try {
    return NextResponse.json({ cuts: await adminGetAllOttCuts() });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to load cuts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const b = (await req.json()) as Record<string, unknown>;
  const caption = String(b.caption ?? "").trim();
  const category = b.category;
  const media_type = b.media_type;
  const media_url = String(b.media_url ?? "").trim();
  const aspect_ratio = b.aspect_ratio ?? "natural";

  if (!caption) return NextResponse.json({ error: "Caption is required" }, { status: 400 });
  if (!isOttCutCategory(category)) return NextResponse.json({ error: "Pick AI ads, AI films, or AI community" }, { status: 400 });
  if (!isOttCutMediaType(media_type)) return NextResponse.json({ error: "Upload a photo or a video" }, { status: 400 });
  if (!media_url) return NextResponse.json({ error: "Media is required" }, { status: 400 });
  if (!isOttCutAspect(aspect_ratio)) return NextResponse.json({ error: "Invalid ratio" }, { status: 400 });

  const db = createServiceRoleClient();
  const homepage_feature = b.homepage_feature === true;
  if (homepage_feature) {
    await clearOtherHomepageFeatures(db);
  }

  const { data: last } = await db
    .from("ott_cuts")
    .select("sort_order")
    .eq("category", category)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (last?.[0]?.sort_order ?? 0) + 1;
  const slug = await uniqueOttCutSlug(db, caption);

  const { data, error } = await db
    .from("ott_cuts")
    .insert({
      slug,
      caption,
      description: String(b.description ?? "").trim() || null,
      category,
      media_type,
      media_url,
      poster_url: String(b.poster_url ?? "").trim() || null,
      aspect_ratio,
      published: b.published !== false,
      homepage_feature,
      sort_order,
    })
    .select("id, slug")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, id: data.id, slug: data.slug });
}
