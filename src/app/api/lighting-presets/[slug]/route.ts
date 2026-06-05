import { NextRequest, NextResponse } from "next/server";
import { getLightingPresetBySlug } from "@/lib/lighting_presets/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preset = await getLightingPresetBySlug(slug);
  if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  createServiceRoleClient().rpc("increment_lighting_preset_view", { preset_id: preset.id }).then(() => {});
  return NextResponse.json({ lighting_preset: preset });
}
export async function POST(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const preset = await getLightingPresetBySlug(slug);
  if (!preset) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await createServiceRoleClient().rpc("increment_lighting_preset_download", { preset_id: preset.id });
  return NextResponse.json({ ok: true });
}
