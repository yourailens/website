import type { Metadata } from "next";
import PricingExperience from "./PricingExperience";

export const metadata: Metadata = {
  title: "Pricing | YourAI Lens Studio",
  description:
    "Five clear packages: Starter, Growth, and Signature AI commercials, plus Product Visuals and Campaign Stills. Fixed scope, clear deliverables.",
};

export default function PricingPage() {
  return <PricingExperience />;
}
