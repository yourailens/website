import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import type { PlannerMember } from "@/data/planner";
import { getPlannerMemberById } from "@/lib/planner/load";
import { PLANNER_SESSION_COOKIE, verifyPlannerSessionToken } from "@/lib/planner/session";

export async function requirePlanner() {
  const jar = await cookies();
  const token = jar.get(PLANNER_SESSION_COOKIE)?.value;
  const verified = verifyPlannerSessionToken(token);
  if (!verified.ok) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  const member = await getPlannerMemberById(verified.memberId);
  if (!member || !member.active) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true as const, member };
}

export async function getPlannerSessionMember(): Promise<PlannerMember | null> {
  const jar = await cookies();
  const token = jar.get(PLANNER_SESSION_COOKIE)?.value;
  const verified = verifyPlannerSessionToken(token);
  if (!verified.ok) return null;
  const member = await getPlannerMemberById(verified.memberId);
  if (!member?.active) return null;
  return member;
}

/** Server page gate — redirects to login when signed out. */
export async function requirePlannerPage(): Promise<PlannerMember> {
  const member = await getPlannerSessionMember();
  if (!member) redirect("/planner/login");
  return member;
}

/** Core-only page gate. Non-core agents bounce to tasks. */
export async function requirePlannerCorePage(): Promise<PlannerMember> {
  const member = await requirePlannerPage();
  if (!member.is_core) redirect("/planner/tasks");
  return member;
}

export async function requirePlannerCore() {
  const auth = await requirePlanner();
  if (!auth.ok) return auth;
  if (!auth.member.is_core) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Core clearance required" }, { status: 403 }),
    };
  }
  return auth;
}
