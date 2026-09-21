import type { Metadata } from "next";
import { getPublishedOttCuts } from "@/lib/ott-cuts/load";
import AiAdsExperience from "./AiAdsExperience";

export const dynamic = "force-dynamic";

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

export default async function AiAdsPage() {
  const cuts = await getPublishedOttCuts("ads");
  return <AiAdsExperience cuts={cuts} />;
}
