import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CutShareExperience from "@/components/ott/CutShareExperience";
import { ottCutCategoryLabel, ottCutYoutubeId } from "@/data/ott-cuts";
import { getOttCutBySlug } from "@/lib/ott-cuts/load";
import { canonicalPublicUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function cutPreviewImage(cut: {
  media_type: string;
  media_url: string;
  poster_url: string | null;
}): string | undefined {
  if (cut.poster_url?.trim()) return cut.poster_url.trim();
  const yt = ottCutYoutubeId(cut.media_url);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  if (cut.media_type === "image" && cut.media_url?.trim()) return cut.media_url.trim();
  return undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cut = await getOttCutBySlug(slug);
  if (!cut) return { title: "Cut | YourAILens Studios" };

  const title = `${cut.caption} | YourAILens Studios`;
  const description =
    cut.description ?? `${cut.caption} — ${ottCutCategoryLabel(cut.category)} from YourAILens Studios.`;
  const pageUrl = canonicalPublicUrl(`/cut/${encodeURIComponent(cut.slug)}`);
  const image = cutPreviewImage(cut);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: "YourAILens Studios",
      type: cut.media_type === "video" ? "video.other" : "website",
      ...(image ? { images: [{ url: image, alt: cut.caption }] } : {}),
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function CutSharePage({ params }: Props) {
  const { slug } = await params;
  const cut = await getOttCutBySlug(slug);
  if (!cut) notFound();
  return <CutShareExperience cut={cut} />;
}
