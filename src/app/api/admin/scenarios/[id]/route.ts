import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
const ALLOWED = ["title","description","image_url","scenario_type","setting","mood","character_count","style_tags","aspect_ratio","featured","published","sort_order"];
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const patch = Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED.includes(k)));
  const { error } = await createServiceRoleClient().from("scenarios").update(patch).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(); if (!auth.ok) return auth.response;
  const { id } = await params;
  const { error } = await createServiceRoleClient().from("scenarios").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
