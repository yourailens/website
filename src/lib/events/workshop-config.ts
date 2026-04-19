/** Public workshop: AI Creator Workshop (in person and live online hybrid messaging via email) */

export const WORKSHOP_EVENT_SLUG = "ai-creator-workshop-2026-04-29";

export const WORKSHOP_TITLE = "AI Creator Workshop";

export const WORKSHOP_SUBTITLE = "AI workflow knowledge: from zero to advanced in two days";

/** Wed–Thu cohort · Apr 29–30, 2026 */
export const WORKSHOP_START_ISO = "2026-04-29";
export const WORKSHOP_END_ISO = "2026-04-30";

/** Early bird ends end of day IST before the first session */
export const WORKSHOP_EARLY_BIRD_END_ISO = "2026-04-27T23:59:59+05:30";

/** Early bird (discounted) fee */
export const WORKSHOP_PRICE_INR = 3000;

/** Standard / list price after early bird ends */
export const WORKSHOP_LIST_PRICE_INR = 5000;

/** Whole-number discount vs list price */
export function workshopDiscountPercentOff(): number {
  return Math.round((1 - WORKSHOP_PRICE_INR / WORKSHOP_LIST_PRICE_INR) * 100);
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function isWorkshopEarlyBirdActive(now: Date = new Date()): boolean {
  const end = new Date(WORKSHOP_EARLY_BIRD_END_ISO);
  return now <= end;
}

/** Cohort size (seat cap) — used for registration limits and “sold out” logic */
export const WORKSHOP_SEATS_TOTAL = 20;

/** Shown in UI as “seats left” (marketing); real availability still uses WORKSHOP_SEATS_TOTAL */
export const WORKSHOP_SEATS_LEFT_DISPLAY = 10;

/** Counts toward seat cap until cancelled (includes awaiting payment verification). */
export const WORKSHOP_SEAT_HOLDING_STATUSES = [
  "registered",
  "pending_payment",
  "pending_verification",
] as const;

/** Shown in payment verification email if confirmation is delayed */
export const WORKSHOP_PAYMENT_SUPPORT_PHONE = "9606558600";

export function workshopDateRangeLabel(): string {
  return "April 29 and 30, 2026 · Wednesday & Thursday";
}

/** Evening sessions in IST — 4 hours per day */
export function workshopSessionTimeLabel(): string {
  return "7:00 PM to 11:00 PM IST · 4 hours each day";
}

export function workshopMeetExpectationCopy(): string {
  return "We will email you a Google Meet link before the event.";
}

export function workshopEarlyBirdDeadlineLabel(): string {
  return "11:59 PM IST · 27 April 2026";
}

const DEFAULT_WORKSHOP_UPI_ID = "9606558600@ybl";
const DEFAULT_WORKSHOP_UPI_PAYEE_NAME = "Sushmith T";

/** UPI VPA for workshop fees. Override with WORKSHOP_UPI_ID in .env.local */
export function workshopUpiId(): string {
  const fromEnv = (process.env.WORKSHOP_UPI_ID ?? "").trim();
  return fromEnv || DEFAULT_WORKSHOP_UPI_ID;
}

/** Display name for the UPI recipient. Override with WORKSHOP_UPI_PAYEE_NAME in .env.local */
export function workshopUpiPayeeName(): string {
  const fromEnv = (process.env.WORKSHOP_UPI_PAYEE_NAME ?? "").trim();
  return fromEnv || DEFAULT_WORKSHOP_UPI_PAYEE_NAME;
}
