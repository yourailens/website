import { NextResponse } from "next/server";
import { requirePlanner } from "@/lib/planner/auth";
import { countPlannerMembers } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requirePlanner();
  if (!auth.ok) {
    const count = await countPlannerMembers().catch(() => 0);
    return NextResponse.json({ member: null, needsBootstrap: count === 0 }, { status: 401 });
  }
  return NextResponse.json({ member: auth.member, needsBootstrap: false });
}
