import type { Metadata } from "next";
import AiFilmmakingExperience from "./AiFilmmakingExperience";

export const metadata: Metadata = {
  title: "AI Filmmaking | YourAILens Studios",
  description:
    "Longer AI films with returning characters, held worlds, and cinematic craft — from brief to locked cut.",
  openGraph: {
    title: "AI Filmmaking | YourAILens Studios",
    description:
      "Not a forty five second ad. A film. Direction first, continuity held, finish that feels shot.",
    url: "/ai-filmmaking",
  },
};

export default function AiFilmmakingPage() {
  return <AiFilmmakingExperience />;
}
