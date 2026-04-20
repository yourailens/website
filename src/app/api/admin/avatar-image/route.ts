import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { isAvatarSlug } from "@/lib/avatars/config";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { safeObjectFilename } from "@/lib/s3/keys";
import { formatAwsLikeError } from "@/lib/aws/format-error";

export const runtime = "nodejs";

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

  const form = await request.formData();
  const slug = String(form.get("slug") ?? "").trim().toLowerCase();
  const kind = String(form.get("kind") ?? "").trim().toLowerCase();
  const file = form.get("file");

  if (!isAvatarSlug(slug)) {
    return NextResponse.json({ error: "Invalid character" }, { status: 400 });
  }
  if (kind !== "hero" && kind !== "gallery") {
    return NextResponse.json({ error: "kind must be hero or gallery" }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  let publicUrl: string;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const key = `avatars/${slug}/${kind}-${Date.now()}-${safeObjectFilename(file.name)}`;
    const ct = file.type || "image/jpeg";
    const up = await uploadObjectToS3(key, buf, ct);
    publicUrl = up.publicUrl;
  } catch (e) {
    const { message, hint, httpStatus } = formatAwsLikeError(e);
    return NextResponse.json({ error: message, hint }, { status: httpStatus });
  }

  if (kind === "hero") {
    const { error } = await svc
      .from("avatar_characters")
      .update({ hero_image_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("slug", slug);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, publicUrl, role: "hero" });
  }

  const { data: rows } = await svc
    .from("avatar_character_images")
    .select("sort_order")
    .eq("character_slug", slug)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sort_order = (rows?.[0]?.sort_order ?? 0) + 1;

  const { data: ins, error: insErr } = await svc
    .from("avatar_character_images")
    .insert({
      character_slug: slug,
      public_url: publicUrl,
      sort_order,
    })
    .select("id")
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, publicUrl, id: ins?.id, role: "gallery" });
}
