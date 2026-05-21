import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMoodBoardBySlug } from "@/lib/mood_boards/load";
import MoodBoardDetailExperience from "./MoodBoardDetailExperience";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const item = await getMoodBoardBySlug(slug);
  if (!item) return { title: "Not Found" };
  return { title: `${item.title} | Mood Boards — YourAI Lens Studio`, description: item.description ?? `Aesthetic mood board: ${item.title}.`, openGraph: item.image_url ? { images: [{ url: item.image_url }] } : undefined };
}
export default async function MoodBoardDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = await getMoodBoardBySlug(slug);
  if (!item) notFound(); return <MoodBoardDetailExperience item={item} />;
}
