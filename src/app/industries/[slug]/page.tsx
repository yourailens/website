import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndustryPageData, getPublishedIndustries } from "@/lib/industries/load";
import IndustryExperience from "./IndustryExperience";

type Props = { params: Promise<{ slug: string }> };

/** Revalidate every minute — avoids blocking every visit on live Supabase round-trips */
export const revalidate = 60;

export async function generateStaticParams() {
  const industries = await getPublishedIndustries();
  return industries.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getIndustryPageData(slug);
  const industry = data?.industry;
  if (!industry) return { title: "Industry | YourAI Lens Studio" };
  const desc =
    industry.description ??
    industry.tagline ??
    `AI production for ${industry.name}. Films, visuals, and campaign content from YourAI Lens Studio.`;
  return {
    title: `${industry.name} | YourAI Lens Studio`,
    description: desc,
  };
}

export default async function IndustryPage({ params }: Props) {
  const { slug } = await params;
  const data = await getIndustryPageData(slug);
  if (!data) notFound();
  return <IndustryExperience industry={data.industry} sampleBrands={data.sampleBrands} />;
}
