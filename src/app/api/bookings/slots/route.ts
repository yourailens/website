import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getBookingTimezone, listAvailableSlots } from "@/lib/bookings/slots";

export const runtime = "nodejs";

export async function GET() {
  let svc;
  try {
    svc = createServiceRoleClient();
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server misconfiguration";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const { data, error } = await svc
    .from("call_bookings")
    .select("scheduled_at,status")
    .in("status", ["pending", "confirmed", "meet_failed"]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const taken = new Set<string>();
  for (const row of data ?? []) {
    if (typeof row.scheduled_at === "string") {
      const iso = new Date(row.scheduled_at).toISOString().replace(".000Z", "Z");
      taken.add(iso);
    }
  }

  const slots = listAvailableSlots(taken);
  return NextResponse.json({ timezone: getBookingTimezone(), slots });
}

