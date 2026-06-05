import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFutureFieldBySlug } from "@/lib/the-future/load";
import TheFutureFieldExperience from "./TheFutureFieldExperience";

type Props = { params: Promise<{ fieldSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { fieldSlug } = await params;
  const field = await getFutureFieldBySlug(fieldSlug);
  if (!field) return { title: "The Future | YourAI Lens Studio" };
  return {
    title: `${field.title} | The Future | YourAI Lens Studio`,
    description: field.tagline ?? field.description ?? undefined,
  };
}

export default async function TheFutureFieldPage({ params }: Props) {
  const { fieldSlug } = await params;
  const field = await getFutureFieldBySlug(fieldSlug);
  if (!field) notFound();
  return <TheFutureFieldExperience field={field} />;
}
