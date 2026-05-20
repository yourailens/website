import type { Metadata } from "next";
import { getLocationBySlug } from "@/lib/locations/load";
import LocationDetailExperience from "./LocationDetailExperience";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const loc = await getLocationBySlug(slug);
  if (!loc) return { title: "Not Found" };
  return { title: `${loc.title} — Location Library | YourAILens`, description: loc.description ?? `AI location reference: ${loc.title}`, openGraph: { images: loc.image_url ? [{ url: loc.image_url }] : [] } };
}
export default async function LocationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = await getLocationBySlug(slug);
  if (!location) notFound();
  return <LocationDetailExperience location={location} />;
}
