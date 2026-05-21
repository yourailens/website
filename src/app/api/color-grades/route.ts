import { NextRequest, NextResponse } from "next/server";
import { getPublishedColorGrades } from "@/lib/color_grades/load";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const s = req.nextUrl.searchParams;
  const grades = await getPublishedColorGrades({ search: s.get("q") ?? undefined, grade_style: s.get("grade_style") ?? undefined, mood: s.get("mood") ?? undefined, limit: Number(s.get("limit") ?? 80), offset: Number(s.get("offset") ?? 0) });
  return NextResponse.json({ color_grades: grades });
}
