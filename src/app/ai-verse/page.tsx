import type { Metadata } from "next";
import { homeWatchAsOttCuts } from "@/data/home-watch";
import { getPublishedOttCuts } from "@/lib/ott-cuts/load";
import AiVerseExperience from "./AiVerseExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Community | YourAILens Studios",
  description:
    "The YAIL community for AI filmmakers, advertisers, and builders — workshops, critique, and community cuts from YourAILens Studios.",
  openGraph: {
    title: "AI Community | YourAILens Studios",
    description: "A professional community for people who ship AI film and ads.",
    url: "/ai-verse",
  },
};

export default async function AiVersePage() {
  const cuts = await getPublishedOttCuts("community");
  const miscCuts = homeWatchAsOttCuts("community");
  return <AiVerseExperience cuts={cuts} miscCuts={miscCuts} />;
}
