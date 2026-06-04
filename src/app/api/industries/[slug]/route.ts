import { NextResponse } from "next/server";
import { getIndustryBySlug } from "@/lib/industries/load";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const industry = await getIndustryBySlug(slug);
  if (!industry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ industry });
}
