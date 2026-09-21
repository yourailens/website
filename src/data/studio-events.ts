export type StudioEventType = "meetup" | "workshop" | "screening" | "other";

export const STUDIO_EVENT_TYPES: { id: StudioEventType; label: string }[] = [
  { id: "meetup", label: "Meetup" },
  { id: "workshop", label: "Workshop" },
  { id: "screening", label: "Screening" },
  { id: "other", label: "Other" },
];

export type StudioEvent = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  event_type: StudioEventType;
  venue: string | null;
  location_label: string | null;
  starts_at: string | null;
  ends_at: string | null;
  date_label: string | null;
  cta_label: string | null;
  href: string | null;
  image_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export function studioEventTypeLabel(id: StudioEventType): string {
  return STUDIO_EVENT_TYPES.find((t) => t.id === id)?.label ?? id;
}

export function isStudioEventType(v: unknown): v is StudioEventType {
  return v === "meetup" || v === "workshop" || v === "screening" || v === "other";
}

/** Fallback when the studio_events table is not migrated yet. */
export const FALLBACK_STUDIO_EVENTS: StudioEvent[] = [
  {
    id: "fallback-yail-01",
    slug: "yail-01-ai-creators-meetup",
    title: "YAIL 01: AI Creators Meetup",
    subtitle: "The Theatre Showcase",
    description: "Our first creators meetup. Details coming soon.",
    event_type: "meetup",
    venue: "The Theatre Showcase",
    location_label: null,
    starts_at: null,
    ends_at: null,
    date_label: "Details soon",
    cta_label: "Coming soon",
    href: null,
    image_url: null,
    published: true,
    sort_order: 1,
    created_at: "",
  },
  {
    id: "fallback-workshop",
    slug: "ai-creator-workshop",
    title: "AI Creator Workshop",
    subtitle: "AI workflow knowledge: from zero to advanced in two days",
    description: "Hands-on workshop for creators, marketers, and filmmakers.",
    event_type: "workshop",
    venue: null,
    location_label: "Live online",
    starts_at: "2026-05-06T00:00:00+05:30",
    ends_at: "2026-05-07T23:59:59+05:30",
    date_label: "May 6 and 7, 2026",
    cta_label: "View details & register",
    href: "/events/ai-creator-workshop",
    image_url: null,
    published: true,
    sort_order: 2,
    created_at: "",
  },
];

export function studioEventIsPast(event: StudioEvent, now = new Date()): boolean {
  if (event.ends_at) return now > new Date(event.ends_at);
  if (event.starts_at) {
    const start = new Date(event.starts_at);
    const dayAfter = new Date(start);
    dayAfter.setDate(dayAfter.getDate() + 1);
    return now > dayAfter;
  }
  return false;
}
