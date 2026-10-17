import { NextResponse } from "next/server";
import { PLANNER_SESSION_COOKIE, plannerSessionCookieOptions } from "@/lib/planner/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PLANNER_SESSION_COOKIE, "", { ...plannerSessionCookieOptions(), maxAge: 0 });
  return res;
}
