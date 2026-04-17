import { DateTime } from "luxon";

export type BookingSlot = {
  iso: string;
  dayLabel: string;
  timeLabel: string;
};

const BOOKING_TIMEZONE = process.env.BOOKING_TIMEZONE?.trim() || "Asia/Kolkata";
const BOOKING_SLOT_MINUTES = 30;
const BOOKING_DAYS_AHEAD = 21;

// Monday-Friday, 10:00 to 19:00 local timezone.
const WEEKLY_WINDOWS: Record<number, Array<{ startHour: number; endHour: number }>> = {
  1: [{ startHour: 10, endHour: 19 }],
  2: [{ startHour: 10, endHour: 19 }],
  3: [{ startHour: 10, endHour: 19 }],
  4: [{ startHour: 10, endHour: 19 }],
  5: [{ startHour: 10, endHour: 19 }],
};

export function getBookingTimezone() {
  return BOOKING_TIMEZONE;
}

export function listAvailableSlots(
  takenIsoTimes: Set<string>,
  now = DateTime.now().setZone(BOOKING_TIMEZONE)
): BookingSlot[] {
  const firstDay = now.startOf("day");
  const cutoff = now.plus({ hours: 2 });
  const output: BookingSlot[] = [];

  for (let dayOffset = 0; dayOffset < BOOKING_DAYS_AHEAD; dayOffset += 1) {
    const date = firstDay.plus({ days: dayOffset });
    const windows = WEEKLY_WINDOWS[date.weekday] ?? [];
    if (windows.length === 0) continue;

    for (const window of windows) {
      let cursor = date.set({ hour: window.startHour, minute: 0, second: 0, millisecond: 0 });
      const end = date.set({ hour: window.endHour, minute: 0, second: 0, millisecond: 0 });

      while (cursor < end) {
        if (cursor > cutoff) {
          const isoUtc = cursor.toUTC().toISO({ suppressMilliseconds: true });
          if (isoUtc && !takenIsoTimes.has(isoUtc)) {
            output.push({
              iso: isoUtc,
              dayLabel: cursor.toFormat("ccc, dd LLL"),
              timeLabel: cursor.toFormat("hh:mm a"),
            });
          }
        }
        cursor = cursor.plus({ minutes: BOOKING_SLOT_MINUTES });
      }
    }
  }

  return output;
}

export function isSlotWithinConfig(isoUtc: string): boolean {
  const dt = DateTime.fromISO(isoUtc, { zone: "utc" }).setZone(BOOKING_TIMEZONE);
  if (!dt.isValid) return false;
  const windows = WEEKLY_WINDOWS[dt.weekday] ?? [];
  if (windows.length === 0) return false;
  const minuteBlock = dt.minute % BOOKING_SLOT_MINUTES === 0 && dt.second === 0;
  if (!minuteBlock) return false;
  return windows.some((window) => dt.hour >= window.startHour && dt.hour < window.endHour);
}

