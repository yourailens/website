import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CutShareExperience from "@/components/ott/CutShareExperience";
import { ottCutCategoryLabel, ottCutYoutubeId } from "@/data/ott-cuts";
import { getOttCutBySlug } from "@/lib/ott-cuts/load";
import { ensureOttCutOgImage } from "@/lib/seo/bake-og-image";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import { canonicalPublicUrl, siteOriginForMetadata } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cut = await getOttCutBySlug(slug);
  if (!cut) return { title: "Cut | YourAILens Studios" };

  const yt = ottCutYoutubeId(cut.media_url);
  const youtubeThumb = yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null;
  const stored = await ensureOttCutOgImage({ ...cut, youtubeThumb });
  const bust = encodeURIComponent(cut.created_at || cut.id);
  const origin = siteOriginForMetadata();
  const title = `${cut.caption} | YourAILens Studios`;
  const description =
    cut.description ?? `${cut.caption} — ${ottCutCategoryLabel(cut.category)} from YourAILens Studios.`;
  const pageUrl = canonicalPublicUrl(`/cut/${encodeURIComponent(cut.slug)}`);
  const s3Image = stored ? `${stored}${stored.includes("?") ? "&" : "?"}v=${bust}` : null;
  const apiImage = `${origin}/api/og/ott-cut/${encodeURIComponent(cut.slug)}?v=${bust}`;
  const primary = s3Image ?? apiImage;

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
      images: [
        {
          url: primary,
          secureUrl: primary,
          alt: `${cut.caption} — YourAILens Studios`,
          type: "image/png",
          width: OG_THUMB_WIDTH,
          height: OG_THUMB_HEIGHT,
        },
        ...(s3Image
          ? [
              {
                url: apiImage,
                secureUrl: apiImage,
                alt: `${cut.caption} — YourAILens Studios`,
                type: "image/png" as const,
                width: OG_THUMB_WIDTH,
                height: OG_THUMB_HEIGHT,
              },
            ]
          : []),
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primary],
    },
  };
}

export default async function CutSharePage({ params }: Props) {
  const { slug } = await params;
  const cut = await getOttCutBySlug(slug);
  if (!cut) notFound();

  const yt = ottCutYoutubeId(cut.media_url);
  void ensureOttCutOgImage({
    ...cut,
    youtubeThumb: yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null,
  });

  return <CutShareExperience cut={cut} />;
}
