import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { adminGetFutureField } from "@/lib/the-future/load";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const field = await adminGetFutureField(id);
  if (!field) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ field });
}

const ALLOWED = [
  "slug",
  "title",
  "tagline",
  "description",
  "cover_image_url",
  "cover_video_url",
  "cover_media_type",
  "cover_aspect",
  "sort_order",
  "published",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = (await req.json()) as Record<string, unknown>;
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)));

  const db = createServiceRoleClient();
  const { error } = await db.from("future_fields").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("future_fields").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
