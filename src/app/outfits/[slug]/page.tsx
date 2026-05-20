import type { Metadata } from "next";
import { getOutfitBySlug } from "@/lib/outfits/load";
import OutfitDetailExperience from "./OutfitDetailExperience";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const outfit = await getOutfitBySlug(slug);
  if (!outfit) return { title: "Outfit Not Found" };
  return {
    title: `${outfit.title} — Outfit Reservoir | YourAILens Studios`,
    description: outfit.description ?? `An AI-generated outfit reference sheet — ${outfit.title}.`,
    openGraph: {
      title: outfit.title,
      description: outfit.description ?? "",
      images: outfit.image_url ? [{ url: outfit.image_url }] : [],
    },
  };
}

export default async function OutfitDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const outfit = await getOutfitBySlug(slug);
  if (!outfit) notFound();
  return <OutfitDetailExperience outfit={outfit} />;
}
