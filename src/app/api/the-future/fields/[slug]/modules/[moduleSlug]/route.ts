import { NextResponse } from "next/server";
import { getFutureModuleBySlugs } from "@/lib/the-future/load";

export const dynamic = "force-dynamic";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ slug: string; moduleSlug: string }> }
) {
  const { slug, moduleSlug } = await params;
  const mod = await getFutureModuleBySlugs(slug, moduleSlug);
  if (!mod) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ module: mod });
}
