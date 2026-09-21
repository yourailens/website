import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HOME_WATCH_TITLES, getHomeWatch } from "@/data/home-watch";
import { OG_FALLBACK_IMAGE_HEIGHT, OG_FALLBACK_IMAGE_PATH, OG_FALLBACK_IMAGE_WIDTH, absoluteUrl } from "@/lib/seo/og-image";
import WatchExperience from "./WatchExperience";

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export function generateStaticParams() {
  return HOME_WATCH_TITLES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const title = getHomeWatch(slug);
  if (!title) return {};

  const pageUrl = `${siteUrl()}/watch/${title.slug}`;
  const metaTitle = `${title.title} | YourAILens Studios`;
  const poster = title.poster ? absoluteUrl(siteUrl(), title.poster) : absoluteUrl(siteUrl(), OG_FALLBACK_IMAGE_PATH);
  const videoAbs = title.video ? absoluteUrl(siteUrl(), title.video) : undefined;

  return {
    title: metaTitle,
    description: title.description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: metaTitle,
      description: title.description,
      url: pageUrl,
      type: title.video || title.youtubeId ? "video.other" : "website",
      images: [
        {
          url: poster,
          alt: `${title.title} — YourAILens Studios`,
          type: "image/jpeg",
          width: OG_FALLBACK_IMAGE_WIDTH,
          height: OG_FALLBACK_IMAGE_HEIGHT,
        },
      ],
      ...(videoAbs ? { videos: [{ url: videoAbs, type: "video/mp4" }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: title.description,
      images: [{ url: poster, alt: `${title.title} — YourAILens Studios` }],
    },
  };
}

export default async function WatchPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const title = getHomeWatch(slug);
  if (!title) notFound();

  const pageUrl = `${siteUrl()}/watch/${title.slug}`;
  const ld = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: title.title,
    description: title.description,
    thumbnailUrl: title.poster ? absoluteUrl(siteUrl(), title.poster) : absoluteUrl(siteUrl(), OG_FALLBACK_IMAGE_PATH),
    ...(title.video ? { contentUrl: absoluteUrl(siteUrl(), title.video) } : {}),
    ...(title.watchUrl ? { embedUrl: title.watchUrl } : {}),
    url: pageUrl,
    publisher: { "@type": "Organization", name: "YourAILens Studios" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <WatchExperience title={title} />
    </>
  );
}
