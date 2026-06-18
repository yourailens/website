import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "title",
  "description",
  "module_type",
  "cover_image_url",
  "cover_aspect",
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
  const { error } = await db.from("studio_modules").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (Array.isArray(body.items)) {
    await db.from("studio_module_items").delete().eq("module_id", id);
    const inserts = (body.items as Record<string, unknown>[]).map((a, i) => ({
      module_id: id,
      media_type: a.media_type === "video" ? "video" : "image",
      image_url: a.image_url ?? null,
      video_url: a.video_url ?? null,
      poster_url: a.poster_url ?? null,
      aspect_ratio: a.aspect_ratio ?? "natural",
      caption: a.caption ?? null,
      prompt: a.prompt ?? null,
      sort_order: a.sort_order ?? i,
    }));
    if (inserts.length > 0) {
      const { error: itemErr } = await db.from("studio_module_items").insert(inserts);
      if (itemErr) return NextResponse.json({ error: itemErr.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("studio_modules").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
