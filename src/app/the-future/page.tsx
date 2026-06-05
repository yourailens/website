import type { Metadata } from "next";
import { getFutureHubFields } from "@/lib/the-future/load";
import TheFutureHubExperience from "./TheFutureHubExperience";

export const metadata: Metadata = {
  title: "The Future | YourAI Lens Studio",
  description: "Explorations across science, arts, law, and emerging fields — step through each possibility.",
};

export default async function TheFuturePage() {
  const fields = await getFutureHubFields();
  return <TheFutureHubExperience fields={fields} />;
}
