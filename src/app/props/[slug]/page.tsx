import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPropBySlug } from "@/lib/props/load";
import PropDetailExperience from "./PropDetailExperience";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const item = await getPropBySlug(slug);
  if (!item) return { title: "Not Found" };
  return { title: `${item.title} | Props Library — YourAI Lens Studio`, description: item.description ?? `Download the ${item.title} prop reference sheet.`, openGraph: item.image_url ? { images: [{ url: item.image_url }] } : undefined };
}
export default async function PropDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const item = await getPropBySlug(slug);
  if (!item) notFound(); return <PropDetailExperience item={item} />;
}
