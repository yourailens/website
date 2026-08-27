import Navbar from "@/components/Navbar";
import PricingAlaCarte from "@/components/pricing/PricingAlaCarte";
import PricingHero from "@/components/pricing/PricingHero";
import { PricingHowWeTalk } from "@/components/pricing/PricingLeadGuide";

export default function PricingExperience() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      <PricingHero />
      <PricingAlaCarte />
      <PricingHowWeTalk />
    </div>
  );
}
