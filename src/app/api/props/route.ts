import { NextRequest, NextResponse } from "next/server";
import { getPublishedProps } from "@/lib/props/load";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const props = await getPublishedProps({ search: s.get("q") ?? undefined, category: s.get("category") ?? undefined, style: s.get("style") ?? undefined, limit: Number(s.get("limit") ?? 80), offset: Number(s.get("offset") ?? 0) });
  return NextResponse.json({ props });
}
