import { NextRequest, NextResponse } from "next/server";
import { verifyPlannerPassword } from "@/lib/planner/passwords";
import {
  PLANNER_SESSION_COOKIE,
  createPlannerSessionToken,
  plannerSessionCookieOptions,
} from "@/lib/planner/session";
import { getPlannerMemberAuthById, listPlannerLoginAgents } from "@/lib/planner/load";

export const dynamic = "force-dynamic";

/** Agent dossier for the spy login picker. */
export async function GET() {
  try {
    const agents = await listPlannerLoginAgents();
    return NextResponse.json({ agents });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load agents";
    const missing = /does not exist|schema cache/i.test(msg);
    return NextResponse.json(
      {
        agents: [],
        error: missing
          ? "Run supabase/migrations/097_planner_agents.sql in the Supabase SQL editor first."
          : msg,
      },
      { status: missing ? 400 : 500 }
    );
  }
}

/** Identify as an agent + clearance code. No signup. */
export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const memberId = String(b.member_id ?? b.agent_id ?? "").trim();
  const code = String(b.code ?? b.password ?? "").trim();

  if (!memberId || !/^\d{3}$/.test(code)) {
    return NextResponse.json({ error: "Select an agent and enter your 3-digit code." }, { status: 400 });
  }

  let member: Awaited<ReturnType<typeof getPlannerMemberAuthById>>;
  try {
    member = await getPlannerMemberAuthById(memberId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    const missing = /does not exist|schema cache/i.test(msg);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/097_planner_agents.sql in the Supabase SQL editor first."
          : msg,
      },
      { status: 400 }
    );
  }

  if (!member || !member.active || !verifyPlannerPassword(code, member.password_hash)) {
    return NextResponse.json({ error: "Clearance denied. Check your code." }, { status: 401 });
  }

  const token = createPlannerSessionToken(member.id);
  if (!token) {
    return NextResponse.json(
      { error: "Set PLANNER_SESSION_SECRET or ADMIN_SESSION_SECRET / ADMIN_PASSWORD for sessions." },
      { status: 500 }
    );
  }
  const res = NextResponse.json({
    ok: true,
    member: {
      id: member.id,
      display_name: member.display_name,
      slug: member.slug,
      is_core: member.is_core,
    },
  });
  res.cookies.set(PLANNER_SESSION_COOKIE, token, plannerSessionCookieOptions());
  return res;
}
