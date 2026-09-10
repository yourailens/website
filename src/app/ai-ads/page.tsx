import type { Metadata } from "next";
import AiAdsExperience from "./AiAdsExperience";

export const metadata: Metadata = {
  title: "AI Ads | YourAILens Studios",
  description:
    "Product commercials, launch films, and campaign packs directed with AI production — fast enough for marketing, sharp enough for brand.",
  openGraph: {
    title: "AI Ads | YourAILens Studios",
    description: "Ads that feel shot. Product clarity, campaign pace, and visual consistency.",
    url: "/ai-ads",
  },
};

export default function AiAdsPage() {
  return <AiAdsExperience />;
}
