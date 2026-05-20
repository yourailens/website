import { NextRequest, NextResponse } from "next/server";
import { getScenarioBySlug } from "@/lib/scenarios/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scenario = await getScenarioBySlug(slug);
  if (!scenario) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { const db = createServiceRoleClient(); await db.rpc("increment_scenario_view", { scenario_id: scenario.id }); } catch {}
  return NextResponse.json({ scenario });
}
export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scenario = await getScenarioBySlug(slug);
  if (!scenario) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try { const db = createServiceRoleClient(); await db.rpc("increment_scenario_download", { scenario_id: scenario.id }); } catch {}
  return NextResponse.json({ ok: true });
}
