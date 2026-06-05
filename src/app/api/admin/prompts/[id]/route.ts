import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// PATCH /api/admin/prompts/[id]  — update a prompt
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await req.json();

  const updates: Record<string, unknown> = {};
  const allowed = [
    "slug", "title", "excerpt", "cover_image_url", "cover_aspect", "demo_video_url", "og_image_url",
    "media_type", "image_category", "video_category", "difficulty",
    "models", "tags", "featured", "published", "sort_order",
  ];
  for (const k of allowed) {
    if (k in body) updates[k] = body[k];
  }
  // body is a reserved word in the table but JS object key is fine
  if ("prompt_body" in body) updates["body"] = body.prompt_body;

  const sb = createServiceRoleClient();
  const { error } = await sb.from("prompts").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/prompts/[id]  — delete a prompt
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const sb = createServiceRoleClient();
  const { error } = await sb.from("prompts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
