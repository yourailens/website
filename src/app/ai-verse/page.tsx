import type { Metadata } from "next";
import { getPublishedOttCuts } from "@/lib/ott-cuts/load";
import AiVerseExperience from "./AiVerseExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Community | YourAILens Studios",
  description:
    "Studio floor cuts, community shares, and work from the lot — the same channel desk as AI ads and AI films.",
  openGraph: {
    title: "AI Community | YourAILens Studios",
    description: "Cuts from the lot and the feed. Published from the studio desk.",
    url: "/ai-verse",
  },
};

export default async function AiVersePage() {
  const cuts = await getPublishedOttCuts("community");
  return <AiVerseExperience cuts={cuts} />;
}
