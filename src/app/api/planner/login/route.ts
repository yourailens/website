import { NextRequest, NextResponse } from "next/server";
import { hashPlannerPassword, verifyPlannerPassword } from "@/lib/planner/passwords";
import {
  PLANNER_SESSION_COOKIE,
  createPlannerSessionToken,
  plannerSessionCookieOptions,
} from "@/lib/planner/session";
import {
  countPlannerMembers,
  ensureUniquePlannerSlug,
  getPlannerMemberByEmail,
} from "@/lib/planner/load";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { slugifyPlannerName } from "@/data/planner";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const b = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const mode = String(b.mode ?? "login");

  // First-run bootstrap: create CEO when table is empty
  if (mode === "bootstrap") {
    const count = await countPlannerMembers();
    if (count > 0) {
      return NextResponse.json({ error: "Planner already set up. Sign in instead." }, { status: 400 });
    }
    const email = String(b.email ?? "").trim().toLowerCase();
    const password = String(b.password ?? "");
    const display_name = String(b.display_name ?? "").trim() || "CEO";
    if (!email || password.length < 6) {
      return NextResponse.json({ error: "Email and password (6+ chars) required" }, { status: 400 });
    }
    const db = createServiceRoleClient();
    const slug = await ensureUniquePlannerSlug(slugifyPlannerName(display_name));
    const { data, error } = await db
      .from("planner_members")
      .insert({
        email,
        password_hash: hashPlannerPassword(password),
        display_name,
        slug,
        role_title: String(b.role_title ?? "CEO").trim() || "CEO",
        is_ceo: true,
        active: true,
      })
      .select("id")
      .single();
    if (error) {
      const missing = /does not exist|schema cache/i.test(error.message);
      return NextResponse.json(
        {
          error: missing
            ? "Run supabase/migrations/088_planner.sql in the Supabase SQL editor first."
            : error.message,
        },
        { status: 400 }
      );
    }
    const token = createPlannerSessionToken(String(data.id));
    if (!token) {
      return NextResponse.json(
        { error: "Set PLANNER_SESSION_SECRET or ADMIN_SESSION_SECRET / ADMIN_PASSWORD for sessions." },
        { status: 500 }
      );
    }
    const res = NextResponse.json({ ok: true, bootstrap: true });
    res.cookies.set(PLANNER_SESSION_COOKIE, token, plannerSessionCookieOptions());
    return res;
  }

  const email = String(b.email ?? "").trim().toLowerCase();
  const password = String(b.password ?? "");
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  let member: Awaited<ReturnType<typeof getPlannerMemberByEmail>>;
  try {
    member = await getPlannerMemberByEmail(email);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Login failed";
    const missing = /does not exist|schema cache/i.test(msg);
    return NextResponse.json(
      {
        error: missing
          ? "Run supabase/migrations/088_planner.sql in the Supabase SQL editor first."
          : msg,
      },
      { status: 400 }
    );
  }

  if (!member || !member.active || !verifyPlannerPassword(password, member.password_hash)) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = createPlannerSessionToken(member.id);
  if (!token) {
    return NextResponse.json(
      { error: "Set PLANNER_SESSION_SECRET or ADMIN_SESSION_SECRET / ADMIN_PASSWORD for sessions." },
      { status: 500 }
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PLANNER_SESSION_COOKIE, token, plannerSessionCookieOptions());
  return res;
}
