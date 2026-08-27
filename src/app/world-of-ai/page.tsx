import type { Metadata } from "next";
import WorldOfAiExperience from "./WorldOfAiExperience";

export const metadata: Metadata = {
  title: "World of AI Multimedia | YourAILens Studios",
  description:
    "Interpretations of AI content, Clean vs Natural Realism, AI first production systems, VFX vs AI, and how creators, businesses, and audiences see the medium.",
  openGraph: {
    title: "World of AI Multimedia | YourAILens Studios",
    description:
      "What AI content really is: capability, craft, efficiency, and the difference between regular use and professional direction.",
    url: "/world-of-ai",
  },
};

export default function WorldOfAiPage() {
  return <WorldOfAiExperience />;
}
