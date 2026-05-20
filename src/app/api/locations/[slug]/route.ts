import { NextRequest, NextResponse } from "next/server";
import { getLocationBySlug } from "@/lib/locations/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { const db = createServiceRoleClient(); await db.rpc("increment_location_view", { location_id: location.id }); } catch {}
  return NextResponse.json({ location });
}
export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { const db = createServiceRoleClient(); await db.rpc("increment_location_download", { location_id: location.id }); } catch {}
  return NextResponse.json({ ok: true });
}
