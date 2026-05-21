import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLightingPresetBySlug } from "@/lib/lighting_presets/load";
import LightingPresetDetailExperience from "./LightingPresetDetailExperience";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const item = await getLightingPresetBySlug(slug);
  if (!item) return { title: "Not Found" };
  return { title: `${item.title} | Lighting Presets — YourAI Lens Studio`, description: item.description ?? `Lighting reference: ${item.title}.`, openGraph: item.image_url ? { images: [{ url: item.image_url }] } : undefined };
}
export default async function LightingPresetDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = await getLightingPresetBySlug(slug);
  if (!item) notFound(); return <LightingPresetDetailExperience item={item} />;
}
