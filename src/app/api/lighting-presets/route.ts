import { NextRequest, NextResponse } from "next/server";
import { getPublishedLightingPresets } from "@/lib/lighting_presets/load";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const presets = await getPublishedLightingPresets({ search: s.get("q") ?? undefined, lighting_type: s.get("lighting_type") ?? undefined, mood: s.get("mood") ?? undefined, limit: Number(s.get("limit") ?? 80), offset: Number(s.get("offset") ?? 0) });
  return NextResponse.json({ lighting_presets: presets });
}
