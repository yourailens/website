import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublishedIndustries } from "@/lib/industries/load";
import { getAllPublishedSampleBrands } from "@/lib/sample-brands/load";
import IndustriesHubExperience from "./IndustriesHubExperience";

export const dynamic = "force-dynamic";

function IndustriesHubFallback() {
  return <div className="ott-home min-h-screen animate-pulse bg-black" />;
}

export const metadata: Metadata = {
  title: "Industries | YourAILens Studios",
  description:
    "AI films, product visuals, and brand content for real estate, ecommerce, SaaS, and more. Production-grade deliverables from YourAILens Studios.",
};

export default async function IndustriesPage() {
  const [industries, sampleBrands] = await Promise.all([
    getPublishedIndustries(),
    getAllPublishedSampleBrands(),
  ]);
  return (
    <Suspense fallback={<IndustriesHubFallback />}>
      <IndustriesHubExperience industries={industries} sampleBrands={sampleBrands} />
    </Suspense>
  );
}
