import { NextRequest, NextResponse } from "next/server";
import { loadPublicAddons } from "@/lib/services/load";

export async function GET(req: NextRequest) {
  const compat = req.nextUrl.searchParams.get("for") ?? undefined;
  const addons = await loadPublicAddons(compat);
  return NextResponse.json({ addons });
}
