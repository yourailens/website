import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { WORKSHOP_EVENT_SLUG } from "@/lib/events/workshop-config";
import { sendWorkshopRegistrationEmails } from "@/lib/email/workshop-registration";

export const runtime = "nodejs";

type Body = { id?: string };

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  let svc: ReturnType<typeof createServiceRoleClient>;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: row, error: fetchErr } = await svc
    .from("workshop_registrations")
    .select("id, email, status, name, company, notes, payment_phone, payment_screenshot_url")
    .eq("id", id)
    .eq("event_slug", WORKSHOP_EVENT_SLUG)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }

  if (row.status === "registered") {
    return NextResponse.json({ error: "Already approved" }, { status: 400 });
  }
  if (row.status !== "pending_verification") {
    return NextResponse.json({ error: "This booking is not awaiting payment verification" }, { status: 400 });
  }

  const { error: updateErr } = await svc
    .from("workshop_registrations")
    .update({
      status: "registered",
      payment_verified_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("status", "pending_verification");

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const emailResult = await sendWorkshopRegistrationEmails(
    {
      registrationId: row.id,
      name: row.name,
      email: row.email,
      phone: row.payment_phone ?? undefined,
      ...(row.company ? { company: row.company } : {}),
      ...(row.notes ? { notes: row.notes } : {}),
      paymentScreenshotUrl: row.payment_screenshot_url ?? undefined,
    },
    { skipOwnerNotification: true }
  );

  if (emailResult.status === "failed") {
    return NextResponse.json({
      ok: true,
      emailStatus: "failed",
      emailReason: emailResult.reason,
    });
  }

  if (emailResult.status === "skipped") {
    return NextResponse.json({
      ok: true,
      emailStatus: "skipped",
      emailReason: emailResult.reason,
    });
  }

  return NextResponse.json({ ok: true, emailStatus: "sent" });
}
