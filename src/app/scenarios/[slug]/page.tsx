import type { Metadata } from "next";
import { getScenarioBySlug } from "@/lib/scenarios/load";
import ScenarioDetailExperience from "./ScenarioDetailExperience";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScenarioBySlug(slug);
  if (!s) return { title: "Not Found" };
  return { title: `${s.title} — Reference Scenarios | YourAILens`, description: s.description ?? `AI reference scenario: ${s.title}`, openGraph: { images: s.image_url ? [{ url: s.image_url }] : [] } };
}
export default async function ScenarioDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scenario = await getScenarioBySlug(slug);
  if (!scenario) notFound();
  return <ScenarioDetailExperience scenario={scenario} />;
}
