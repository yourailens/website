import type { Metadata } from "next";
import PrDeck from "./PrDeck";

export const metadata: Metadata = {
  title: "PR Strategy | YourAILens Studios",
  description: "A 5 pillar PR strategy for Nalapad Academy, aimed at heavier footfall in October and November.",
};

export default function PrStrategyPage() {
  return <PrDeck />;
}
