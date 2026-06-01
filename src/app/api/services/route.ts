import { NextRequest, NextResponse } from "next/server";
import { loadPublicServices, loadCategories } from "@/lib/services/load";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") ?? undefined;
  const [services, categories] = await Promise.all([
    loadPublicServices(category),
    loadCategories(),
  ]);
  return NextResponse.json({ services, categories });
}
