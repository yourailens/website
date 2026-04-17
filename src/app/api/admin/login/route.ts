import { NextResponse } from "next/server";
import {
  adminPasswordMatches,
  adminSessionCookieOptions,
  createAdminSessionToken,
  ADMIN_SESSION_COOKIE,
  getAdminPasswordConfigured,
} from "@/lib/auth/admin-session";

export async function POST(request: Request) {
  if (!getAdminPasswordConfigured()) {
    return NextResponse.json(
      { error: "Server misconfiguration: set ADMIN_PASSWORD in .env.local" },
      { status: 500 }
    );
  }

  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!adminPasswordMatches(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
  return res;
}
