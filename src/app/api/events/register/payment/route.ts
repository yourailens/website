import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { WORKSHOP_EVENT_SLUG, isWorkshopRegistrationOpen } from "@/lib/events/workshop-config";
import { sendWorkshopPaymentVerificationEmails } from "@/lib/email/workshop-registration";
import { uploadObjectToS3 } from "@/lib/s3/client";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function extForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  let svc: ReturnType<typeof createServiceRoleClient>;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const registrationId = String(form.get("registrationId") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const paymentPhone = String(form.get("paymentPhone") ?? "").trim().replace(/\s+/g, "");
  const file = form.get("screenshot");

  if (!registrationId || !validEmail(email)) {
    return NextResponse.json({ error: "Registration ID and a valid email are required" }, { status: 400 });
  }

  if (!isWorkshopRegistrationOpen()) {
    return NextResponse.json(
      { error: "Registration for this workshop has closed. The event has ended." },
      { status: 403 }
    );
  }
  if (!paymentPhone || paymentPhone.length < 10) {
    return NextResponse.json({ error: "Enter the phone number you used for UPI (at least 10 digits)" }, { status: 400 });
  }
  if (!file || !(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Upload a payment screenshot (PNG, JPG, or WebP)" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Screenshot must be 5 MB or smaller" }, { status: 400 });
  }
  const mime = file.type || "application/octet-stream";
  if (!ALLOWED.has(mime)) {
    return NextResponse.json({ error: "Use PNG, JPG, or WebP for the screenshot" }, { status: 400 });
  }

  const { data: row, error: fetchErr } = await svc
    .from("workshop_registrations")
    .select("id, email, status, name, company, notes")
    .eq("id", registrationId)
    .eq("event_slug", WORKSHOP_EVENT_SLUG)
    .maybeSingle();

  if (fetchErr || !row) {
    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  }
  if (row.email !== email) {
    return NextResponse.json({ error: "Email does not match this registration" }, { status: 403 });
  }
  if (row.status !== "pending_payment") {
    if (row.status === "registered") {
      return NextResponse.json({ error: "This registration is already confirmed." }, { status: 409 });
    }
    if (row.status === "pending_verification") {
      return NextResponse.json(
        { error: "We already received your payment proof and are verifying it." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "This registration cannot accept payment" }, { status: 400 });
  }

  let buf: Buffer;
  try {
    buf = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Could not read the uploaded file" }, { status: 400 });
  }

  let publicUrl: string;
  try {
    const key = `workshop-payments/${registrationId}-${Date.now()}.${extForMime(mime)}`;
    const up = await uploadObjectToS3(key, buf, mime);
    publicUrl = up.publicUrl;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: `Could not store screenshot: ${msg}` }, { status: 503 });
  }

  const { error: updateErr } = await svc
    .from("workshop_registrations")
    .update({
      payment_phone: paymentPhone,
      payment_screenshot_url: publicUrl,
      status: "pending_verification",
    })
    .eq("id", registrationId)
    .eq("status", "pending_payment");

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  const emailResult = await sendWorkshopPaymentVerificationEmails({
    registrationId,
    name: row.name,
    email: row.email,
    phone: paymentPhone,
    paymentScreenshotUrl: publicUrl,
  });

  return NextResponse.json({
    ok: true,
    ...(emailResult.status === "failed"
      ? { note: `Saved, but confirmation email failed: ${emailResult.reason}` }
      : emailResult.status === "skipped"
        ? { note: emailResult.reason }
        : {}),
  });
}
