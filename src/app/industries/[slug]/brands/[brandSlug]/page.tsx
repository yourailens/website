import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSampleBrandStaticParams, getSampleBrandPage } from "@/lib/sample-brands/load";
import SampleBrandExperience from "./SampleBrandExperience";

type Props = { params: Promise<{ slug: string; brandSlug: string }> };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllSampleBrandStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, brandSlug } = await params;
  const data = await getSampleBrandPage(slug, brandSlug);
  if (!data) return { title: "YourAI Lens Studio" };
  const desc =
    data.brand.tagline ??
    data.brand.description ??
    `Sample brand world for ${data.industry.name}. AI films, stills, and campaign creatives.`;
  return {
    title: `${data.brand.name}, ${data.industry.name} | YourAI Lens Studio`,
    description: desc,
  };
}

export default async function SampleBrandPage({ params }: Props) {
  const { slug, brandSlug } = await params;
  const data = await getSampleBrandPage(slug, brandSlug);
  if (!data) notFound();
  return <SampleBrandExperience data={data} />;
}
