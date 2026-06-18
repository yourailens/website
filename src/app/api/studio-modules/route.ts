import { NextRequest, NextResponse } from "next/server";
import { getPublishedStudioModules } from "@/lib/studio-modules/load";
import type { StudioModuleType } from "@/data/studio-modules";
import { ALL_STUDIO_MODULE_TYPES } from "@/data/studio-modules";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") as StudioModuleType | null;
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "0") || undefined;

  if (type && !ALL_STUDIO_MODULE_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  const modules = await getPublishedStudioModules({ type: type ?? undefined, limit });
  return NextResponse.json({ modules });
}
