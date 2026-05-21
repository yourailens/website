import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCharacterSheetBySlug } from "@/lib/character_sheets/load";
import CharacterSheetDetailExperience from "./CharacterSheetDetailExperience";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const sheet = await getCharacterSheetBySlug(slug);
  if (!sheet) return { title: "Not Found" };
  return {
    title: `${sheet.title} | Character Sheets — YourAI Lens Studio`,
    description: sheet.description ?? `Download the ${sheet.title} AI character sheet.`,
    openGraph: sheet.image_url
      ? { images: [{ url: sheet.image_url }] }
      : undefined,
  };
}

export default async function CharacterSheetDetailPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sheet = await getCharacterSheetBySlug(slug);
  if (!sheet) notFound();
  return <CharacterSheetDetailExperience sheet={sheet} />;
}
