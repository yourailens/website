import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isAvatarSlug } from "@/lib/avatars/config";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** Clear hero image, or delete one gallery row by id. */
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let svc;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  let body: { slug?: string; clearHero?: boolean; galleryImageId?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const slug = String(body.slug ?? "").trim().toLowerCase();
  if (!isAvatarSlug(slug)) {
    return NextResponse.json({ error: "Invalid character slug" }, { status: 400 });
  }

  if (body.clearHero) {
    const { error } = await svc
      .from("avatar_characters")
      .update({ hero_image_url: null, updated_at: new Date().toISOString() })
      .eq("slug", slug);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  const gid = String(body.galleryImageId ?? "").trim();
  if (!gid) {
    return NextResponse.json({ error: "galleryImageId or clearHero required" }, { status: 400 });
  }

  const { error } = await svc.from("avatar_character_images").delete().eq("id", gid).eq("character_slug", slug);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
