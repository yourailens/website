import { NextRequest, NextResponse } from "next/server";
import { getPropBySlug } from "@/lib/props/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prop = await getPropBySlug(slug);
  if (!prop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  createServiceRoleClient().rpc("increment_prop_view", { prop_id: prop.id }).then(() => {});
  return NextResponse.json({ prop });
}
export async function POST(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prop = await getPropBySlug(slug);
  if (!prop) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await createServiceRoleClient().rpc("increment_prop_download", { prop_id: prop.id });
  return NextResponse.json({ ok: true });
}
