import type { Metadata } from "next";
import EventsExperience from "./EventsExperience";
import { getPublishedStudioEvents } from "@/lib/events/load-studio-events";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events | YourAILens Studios",
  description:
    "YAIL meetups, workshops, and theatre showcases from YourAILens Studios. AI creators, live sessions, and studio nights.",
};

export default async function EventsPage() {
  const events = await getPublishedStudioEvents();
  return <EventsExperience events={events} />;
}
