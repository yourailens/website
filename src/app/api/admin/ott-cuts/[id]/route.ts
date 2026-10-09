import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isHeroSlot } from "@/data/ott-cuts";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { isOttCutAspect, isOttCutCategory, isOttCutMediaType, clearOtherHomepageFeatures, clearHeroSlot } from "@/lib/ott-cuts/load";

export const dynamic = "force-dynamic";

function revalidateOttSurfaces() {
  revalidatePath("/");
  revalidatePath("/ai-ads");
  revalidatePath("/ai-filmmaking");
  revalidatePath("/ai-verse");
  revalidatePath("/cut/[slug]", "page");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const b = (await req.json()) as Record<string, unknown>;
  const db = createServiceRoleClient();

  const patch: Record<string, unknown> = {};
  if (typeof b.caption === "string") patch.caption = b.caption.trim();
  if (typeof b.description === "string") patch.description = b.description.trim() || null;
  if (isOttCutCategory(b.category)) patch.category = b.category;
  if (isOttCutMediaType(b.media_type)) patch.media_type = b.media_type;
  if (typeof b.media_url === "string" && b.media_url.trim()) patch.media_url = b.media_url.trim();
  if ("poster_url" in b) patch.poster_url = String(b.poster_url ?? "").trim() || null;
  if (isOttCutAspect(b.aspect_ratio)) patch.aspect_ratio = b.aspect_ratio;
  if (typeof b.published === "boolean") patch.published = b.published;
  if (typeof b.sort_order === "number") patch.sort_order = b.sort_order;
  if (typeof b.homepage_feature === "boolean") {
    patch.homepage_feature = b.homepage_feature;
    if (b.homepage_feature) {
      await clearOtherHomepageFeatures(db, id);
    }
  }
  if ("hero_slot" in b) {
    const hero_slot = isHeroSlot(b.hero_slot) ? b.hero_slot : null;
    if (hero_slot) await clearHeroSlot(db, hero_slot, id);
    patch.hero_slot = hero_slot;
    patch.homepage_hero = Boolean(hero_slot);
  }

  // Clear stale share thumb when media changes — bake on /cut/[slug] view or rebuild-og.
  if ("media_url" in patch || "poster_url" in patch || "media_type" in patch) {
    patch.og_image_url = null;
  }

  const { error } = await db.from("ott_cuts").update(patch).eq("id", id);
  if (error) {
    const missing = /og_image_url|schema cache|does not exist/i.test(error.message);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/082_vault_ott_og_images.sql in the Supabase SQL editor first."
          : error.message,
      },
      { status: 400 }
    );
  }
  revalidateOttSurfaces();
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("ott_cuts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  revalidateOttSurfaces();
  return NextResponse.json({ ok: true });
}
