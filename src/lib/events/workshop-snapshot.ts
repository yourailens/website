import { cache } from "react";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  WORKSHOP_EVENT_SLUG,
  WORKSHOP_SEAT_HOLDING_STATUSES,
  WORKSHOP_SEATS_TOTAL,
  isWorkshopEarlyBirdActive,
  isWorkshopRegistrationOpen,
} from "@/lib/events/workshop-config";

export type WorkshopPublicSnapshot = {
  /** Count of rows with status registered or pending_payment (holds a seat). */
  registered: number;
  seatsLeft: number;
  soldOut: boolean;
  earlyBirdActive: boolean;
  registrationClosed: boolean;
};

export const getWorkshopPublicSnapshot = cache(async (): Promise<WorkshopPublicSnapshot> => {
  let taken = 0;
  try {
    const svc = createServiceRoleClient();
    const { count, error } = await svc
      .from("workshop_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_slug", WORKSHOP_EVENT_SLUG)
      .in("status", [...WORKSHOP_SEAT_HOLDING_STATUSES]);
    if (!error && typeof count === "number") taken = count;
  } catch {
    /* table missing / env — treat as 0 */
  }
  const seatsLeft = Math.max(0, WORKSHOP_SEATS_TOTAL - taken);
  return {
    registered: taken,
    seatsLeft,
    soldOut: taken >= WORKSHOP_SEATS_TOTAL,
    earlyBirdActive: isWorkshopEarlyBirdActive(),
    registrationClosed: !isWorkshopRegistrationOpen(),
  };
});
