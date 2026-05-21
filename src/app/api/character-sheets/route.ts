import { NextRequest, NextResponse } from "next/server";
import { getPublishedCharacterSheets } from "@/lib/character_sheets/load";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sheets = await getPublishedCharacterSheets({
    search:    searchParams.get("q")          ?? undefined,
    ethnicity: searchParams.get("ethnicity")  ?? undefined,
    age_group: searchParams.get("age_group")  ?? undefined,
    gender:    searchParams.get("gender")     ?? undefined,
    archetype: searchParams.get("archetype")  ?? undefined,
    limit:     Number(searchParams.get("limit")  ?? 80),
    offset:    Number(searchParams.get("offset") ?? 0),
  });
  return NextResponse.json({ character_sheets: sheets });
}
