import type { Metadata } from "next";
import WorldOfAiExperience from "../world-of-ai/WorldOfAiExperience";

export const metadata: Metadata = {
  title: "AI Verse | YourAILens Studios",
  description:
    "Interpretations of AI content, Clean vs Natural Realism, AI first production systems, VFX vs AI, and how creators, businesses, and audiences see the medium.",
  openGraph: {
    title: "AI Verse | YourAILens Studios",
    description:
      "What AI content really is: capability, craft, efficiency, and the difference between regular use and professional direction.",
    url: "/ai-verse",
  },
};

export default function AiVersePage() {
  return <WorldOfAiExperience />;
}
