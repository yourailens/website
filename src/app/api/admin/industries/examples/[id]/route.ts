import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ALLOWED = [
  "title",
  "caption",
  "media_url",
  "media_type",
  "poster_url",
  "aspect_ratio",
  "service_slug",
  "sort_order",
  "published",
];

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const patch = Object.fromEntries(
    Object.entries((await req.json()) as Record<string, unknown>).filter(([k]) => ALLOWED.includes(k))
  );
  const { error } = await createServiceRoleClient().from("industry_playbook_examples").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("industry_playbook_examples").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
