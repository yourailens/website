import { NextRequest, NextResponse } from "next/server";
import { loadPublicService, loadPublicAddons } from "@/lib/services/load";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [service, addons] = await Promise.all([
    loadPublicService(slug),
    loadPublicAddons(slug),
  ]);
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ service, addons });
}
