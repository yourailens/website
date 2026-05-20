import { NextRequest, NextResponse } from "next/server";
import { getPublishedLocations } from "@/lib/locations/load";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const locations = await getPublishedLocations({ search: p.get("q") ?? undefined, category: p.get("category") ?? undefined, time_of_day: p.get("time") ?? undefined, weather: p.get("weather") ?? undefined, limit: Number(p.get("limit") ?? 80) });
  return NextResponse.json({ locations });
}
