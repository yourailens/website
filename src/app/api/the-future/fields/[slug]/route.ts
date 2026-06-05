import { NextResponse } from "next/server";
import { getFutureFieldBySlug } from "@/lib/the-future/load";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const field = await getFutureFieldBySlug(slug);
  if (!field) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ field });
}
