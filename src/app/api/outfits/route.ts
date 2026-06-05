import { NextRequest, NextResponse } from "next/server";
import { getPublishedOutfits } from "@/lib/outfits/load";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const outfits = await getPublishedOutfits({
    search:         searchParams.get("q") ?? undefined,
    category:       searchParams.get("category") ?? undefined,
    character_type: searchParams.get("character_type") ?? undefined,
    limit:          Number(searchParams.get("limit") ?? 60),
    offset:         Number(searchParams.get("offset") ?? 0),
  });
  return NextResponse.json({ outfits });
}
