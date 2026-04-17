import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getBookingTimezone, isSlotWithinConfig } from "@/lib/bookings/slots";
import { createGoogleMeetEvent, googleMeetConfigured } from "@/lib/google/meet";
import { sendBookingEmails } from "@/lib/email/bookings";

export const runtime = "nodejs";

type BookingBody = {
  name?: string;
  email?: string;
  brand?: string;
  projectSummary?: string;
  budget?: string;
  scheduledAt?: string;
};

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: BookingBody;
  try {
    body = (await request.json()) as BookingBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const brand = String(body.brand ?? "").trim();
  const projectSummary = String(body.projectSummary ?? "").trim();
  const budget = String(body.budget ?? "").trim();
  const scheduledAtRaw = String(body.scheduledAt ?? "").trim();

  if (!name || !email || !projectSummary || !scheduledAtRaw) {
    return NextResponse.json({ error: "Name, email, project summary, and slot are required" }, { status: 400 });
  }
  if (!validEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  const dtUtc = DateTime.fromISO(scheduledAtRaw, { zone: "utc" });
  if (!dtUtc.isValid) {
    return NextResponse.json({ error: "Invalid slot time" }, { status: 400 });
  }
  const scheduledAt = dtUtc.toISO({ suppressMilliseconds: true });
  if (!scheduledAt || dtUtc <= DateTime.utc()) {
    return NextResponse.json({ error: "Selected slot must be in the future" }, { status: 400 });
  }
  if (!isSlotWithinConfig(scheduledAt)) {
    return NextResponse.json({ error: "Selected slot is outside booking window" }, { status: 400 });
  }

  let svc;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: conflict, error: conflictErr } = await svc
    .from("call_bookings")
    .select("id")
    .eq("scheduled_at", scheduledAt)
    .in("status", ["pending", "confirmed", "meet_failed"])
    .limit(1);
  if (conflictErr) {
    return NextResponse.json({ error: conflictErr.message }, { status: 500 });
  }
  if ((conflict ?? []).length > 0) {
    return NextResponse.json({ error: "This slot was just booked. Please choose another time." }, { status: 409 });
  }

  const { data: created, error: insertErr } = await svc
    .from("call_bookings")
    .insert({
      name,
      email,
      brand: brand || null,
      project_summary: projectSummary,
      budget: budget || null,
      scheduled_at: scheduledAt,
      status: "pending",
    })
    .select("id")
    .single();

  if (insertErr || !created?.id) {
    return NextResponse.json({ error: insertErr?.message || "Could not save booking" }, { status: 500 });
  }

  const timezone = getBookingTimezone();

  if (!googleMeetConfigured()) {
    await svc.from("call_bookings").update({ status: "confirmed" }).eq("id", created.id);
    const emailResult = await sendBookingEmails({
      bookingId: created.id,
      name,
      email,
      ...(brand ? { brand } : {}),
      projectSummary,
      scheduledAtIsoUtc: scheduledAt,
      timezone,
    });
    return NextResponse.json({
      ok: true,
      bookingId: created.id,
      scheduledAt,
      timezone,
      note:
        emailResult.status === "failed"
          ? `Booking saved. Google Meet is not configured yet. Email failed: ${emailResult.reason}`
          : "Booking saved. Google Meet is not configured yet.",
    });
  }

  try {
    const meet = await createGoogleMeetEvent({
      name,
      email,
      ...(brand ? { brand } : {}),
      notes: projectSummary,
      scheduledAtIsoUtc: scheduledAt,
      timezone,
    });

    await svc
      .from("call_bookings")
      .update({
        status: "confirmed",
        google_event_id: meet.eventId,
        google_meet_url: meet.meetLink ?? null,
      })
      .eq("id", created.id);

    const emailResult = await sendBookingEmails({
      bookingId: created.id,
      name,
      email,
      ...(brand ? { brand } : {}),
      projectSummary,
      scheduledAtIsoUtc: scheduledAt,
      timezone,
      ...(meet.meetLink ? { meetUrl: meet.meetLink } : {}),
    });

    return NextResponse.json({
      ok: true,
      bookingId: created.id,
      scheduledAt,
      timezone,
      meetUrl: meet.meetLink,
      ...(emailResult.status === "failed"
        ? { note: `Booking confirmed, but email failed: ${emailResult.reason}` }
        : {}),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Google Meet setup failed";
    await svc
      .from("call_bookings")
      .update({
        status: "meet_failed",
        meet_error: message,
      })
      .eq("id", created.id);

    return NextResponse.json(
      {
        ok: true,
        bookingId: created.id,
        scheduledAt,
        timezone,
        note: "Booking saved, but Google Meet could not be generated yet.",
        meetError: message,
      },
      { status: 202 }
    );
  }
}

