import type { Metadata } from "next";
import AboutExperience from "./AboutExperience";

const TITLE = "About | YourAILens Studios";
const DESCRIPTION =
  "Applied AI production desk. Ads, films, stills, and websites built on Seedance, Kling AI, Veo, Wan, Grok, MiniMax, Seedream, and Gemini.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/about" },
};

export default function AboutPage() {
  return <AboutExperience />;
}
