import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPromptBySlug, getPublishedPrompts } from "@/lib/prompts/load";
import PromptDetailExperience from "./PromptDetailExperience";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const prompt = await getPromptBySlug(slug);
  if (!prompt) return { title: "Not Found" };

  const description = prompt.excerpt ?? `An AI ${prompt.media_type} workflow by YourAILens Studios.`;
  const image = prompt.og_image_url ?? prompt.cover_image_url;

  return {
    title: `${prompt.title} — Prompts · YourAILens Studios`,
    description,
    openGraph: {
      title: prompt.title,
      description,
      url: `https://yourailens.studio/prompts/${slug}`,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: prompt.title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function PromptPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [prompt, { prompts: related }] = await Promise.all([
    getPromptBySlug(slug),
    getPublishedPrompts({ media_type: undefined, limit: 4 }),
  ]);
  if (!prompt) notFound();

  // Filter out current from related
  const relatedFiltered = related.filter((r) => r.slug !== slug).slice(0, 3);

  return <PromptDetailExperience prompt={prompt} related={relatedFiltered} />;
}
