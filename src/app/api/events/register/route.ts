import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  WORKSHOP_EVENT_SLUG,
  WORKSHOP_SEAT_HOLDING_STATUSES,
  WORKSHOP_SEATS_TOTAL,
} from "@/lib/events/workshop-config";

export const runtime = "nodejs";

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

type Body = {
  eventSlug?: string;
  name?: string;
  email?: string;
  company?: string;
  notes?: string;
};

async function countTakenSeats(svc: ReturnType<typeof createServiceRoleClient>): Promise<number> {
  const { count, error } = await svc
    .from("workshop_registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_slug", WORKSHOP_EVENT_SLUG)
    .in("status", [...WORKSHOP_SEAT_HOLDING_STATUSES]);
  if (error || typeof count !== "number") return 0;
  return count;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const eventSlug = String(body.eventSlug ?? "").trim();
  if (eventSlug !== WORKSHOP_EVENT_SLUG) {
    return NextResponse.json({ error: "Unknown event" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const company = String(body.company ?? "").trim() || null;
  const notes = String(body.notes ?? "").trim() || null;

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  if (!validEmail(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }

  let svc: ReturnType<typeof createServiceRoleClient>;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data: existing } = await svc
    .from("workshop_registrations")
    .select("id, status")
    .eq("event_slug", WORKSHOP_EVENT_SLUG)
    .eq("email", email)
    .maybeSingle();

  if (existing?.status === "registered") {
    return NextResponse.json(
      { error: "You’re already registered for this workshop with this email." },
      { status: 409 }
    );
  }

  if (existing?.status === "pending_verification") {
    return NextResponse.json(
      {
        error:
          "We already have your payment proof and are verifying it. Check your email—we’ll confirm you soon.",
      },
      { status: 409 }
    );
  }

  if (existing?.status === "pending_payment") {
    return NextResponse.json({
      ok: true,
      registrationId: existing.id,
      resumePayment: true,
    });
  }

  const taken = await countTakenSeats(svc);
  if (taken >= WORKSHOP_SEATS_TOTAL) {
    return NextResponse.json(
      { error: "This workshop is full (20 seats). Email us to join the waitlist." },
      { status: 409 }
    );
  }

  const { data: created, error: insertErr } = await svc
    .from("workshop_registrations")
    .insert({
      event_slug: eventSlug,
      name,
      email,
      phone: null,
      company,
      notes,
      status: "pending_payment",
    })
    .select("id")
    .single();

  if (insertErr) {
    const code = (insertErr as { code?: string }).code;
    const msg = insertErr.message?.toLowerCase() ?? "";
    if (code === "23505" || msg.includes("duplicate") || msg.includes("unique")) {
      const { data: row } = await svc
        .from("workshop_registrations")
        .select("id, status")
        .eq("event_slug", WORKSHOP_EVENT_SLUG)
        .eq("email", email)
        .maybeSingle();
      if (row?.status === "pending_payment") {
        return NextResponse.json({ ok: true, registrationId: row.id, resumePayment: true });
      }
      if (row?.status === "pending_verification") {
        return NextResponse.json(
          {
            error:
              "We already have your payment proof and are verifying it. Check your email—we’ll confirm you soon.",
          },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "You’re already registered for this workshop with this email." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 });
  }

  if (!created?.id) {
    return NextResponse.json({ error: "Could not save registration" }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    registrationId: created.id,
    resumePayment: false,
  });
}
