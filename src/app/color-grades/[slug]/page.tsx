import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getColorGradeBySlug } from "@/lib/color_grades/load";
import ColorGradeDetailExperience from "./ColorGradeDetailExperience";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const item = await getColorGradeBySlug(slug);
  if (!item) return { title: "Not Found" };
  return { title: `${item.title} | Color Grades — YourAI Lens Studio`, description: item.description ?? `Color grading reference: ${item.title}.`, openGraph: item.image_url ? { images: [{ url: item.image_url }] } : undefined };
}
export default async function ColorGradeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = await getColorGradeBySlug(slug);
  if (!item) notFound(); return <ColorGradeDetailExperience item={item} />;
}
