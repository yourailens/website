import { NextRequest, NextResponse } from "next/server";
import { getColorGradeBySlug } from "@/lib/color_grades/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const grade = await getColorGradeBySlug(slug);
  if (!grade) return NextResponse.json({ error: "Not found" }, { status: 404 });
  createServiceRoleClient().rpc("increment_color_grade_view", { grade_id: grade.id }).then(() => {});
  return NextResponse.json({ color_grade: grade });
}
export async function POST(_: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const grade = await getColorGradeBySlug(slug);
  if (!grade) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await createServiceRoleClient().rpc("increment_color_grade_download", { grade_id: grade.id });
  return NextResponse.json({ ok: true });
}
