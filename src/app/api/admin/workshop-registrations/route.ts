import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { WORKSHOP_EVENT_SLUG } from "@/lib/events/workshop-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let svc: ReturnType<typeof createServiceRoleClient>;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await svc
    .from("workshop_registrations")
    .select(
      "id, name, email, status, payment_phone, payment_screenshot_url, payment_verified_at, company, notes, created_at"
    )
    .eq("event_slug", WORKSHOP_EVENT_SLUG)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ registrations: data ?? [] });
}
