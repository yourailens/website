import { NextRequest, NextResponse } from "next/server";
import { getPublishedScenarios } from "@/lib/scenarios/load";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const scenarios = await getPublishedScenarios({ search: p.get("q") ?? undefined, scenario_type: p.get("type") ?? undefined, setting: p.get("setting") ?? undefined, mood: p.get("mood") ?? undefined, limit: Number(p.get("limit") ?? 80) });
  return NextResponse.json({ scenarios });
}
