import { NextRequest, NextResponse } from "next/server";
import { getPublishedModules } from "@/lib/modules/load";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") ?? undefined;
  const discipline = searchParams.get("discipline") ?? undefined;
  const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined;
  const modules = await getPublishedModules({ search, discipline, limit });
  return NextResponse.json({ modules });
}
