import { NextRequest, NextResponse } from "next/server";
import { getPublishedMoodBoards } from "@/lib/mood_boards/load";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const boards = await getPublishedMoodBoards({ search: s.get("q") ?? undefined, aesthetic: s.get("aesthetic") ?? undefined, era: s.get("era") ?? undefined, limit: Number(s.get("limit") ?? 80), offset: Number(s.get("offset") ?? 0) });
  return NextResponse.json({ mood_boards: boards });
}
