import { NextResponse } from "next/server";
import { requirePlanner } from "@/lib/planner/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requirePlanner();
  if (!auth.ok) {
    return NextResponse.json({ member: null }, { status: 401 });
  }
  return NextResponse.json({ member: auth.member });
}
