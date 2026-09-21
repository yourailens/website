import type { Metadata } from "next";
import { getPublishedOttCuts } from "@/lib/ott-cuts/load";
import AiFilmmakingExperience from "./AiFilmmakingExperience";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Films | YourAILens Studios",
  description:
    "Longer AI films with returning characters, held worlds, and cinematic craft — from brief to locked cut.",
  openGraph: {
    title: "AI Films | YourAILens Studios",
    description:
      "Not a forty five second ad. A film. Direction first, continuity held, finish that feels shot.",
    url: "/ai-filmmaking",
  },
};

export default async function AiFilmmakingPage() {
  const cuts = await getPublishedOttCuts("films");
  return <AiFilmmakingExperience cuts={cuts} />;
}
