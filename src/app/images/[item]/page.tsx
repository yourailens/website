import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryLabel } from "@/data/gallery";
import { findGalleryIndexByRouteId, galleryRouteId } from "@/lib/gallery/route-id";
import { getGalleryImages } from "@/lib/gallery/load";
import { pickOgImageForShare } from "@/lib/seo/og-image";
import ImageDetailExperience from "./ImageDetailExperience";

export const dynamic = "force-dynamic";

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export async function generateMetadata(props: { params: Promise<{ item: string }> }): Promise<Metadata> {
  const { item } = await props.params;
  const images = await getGalleryImages();
  const open = findGalleryIndexByRouteId(images, decodeURIComponent(item));
  if (open < 0) return {};

  const current = images[open]!;
  const pageUrl = `${siteUrl()}/images/${encodeURIComponent(galleryRouteId(current, open))}`;
  const title = `${current.title} | YourAILens Images`;
  const description = `Explore ${current.title} from the YourAILens Studios AI image gallery.`;
  const og = pickOgImageForShare(siteUrl(), current.src);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      images: [
        {
          url: og.url,
          secureUrl: og.url.startsWith("https://") ? og.url : undefined,
          alt: current.title,
          type: og.type,
          ...(og.width != null && og.height != null
            ? { width: og.width, height: og.height }
            : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: og.url, alt: current.title }],
    },
    other: {
      "og:image:secure_url": og.url,
      "og:image:type": og.type,
      ...(og.width != null && og.height != null
        ? { "og:image:width": String(og.width), "og:image:height": String(og.height) }
        : {}),
    },
  };
}

export default async function ImageDetailPage(props: { params: Promise<{ item: string }> }) {
  const { item } = await props.params;
  const images = await getGalleryImages();
  const open = findGalleryIndexByRouteId(images, decodeURIComponent(item));
  if (open < 0) notFound();

  const n = images.length;
  const prevIndex = (open - 1 + n) % n;
  const nextIndex = (open + 1) % n;
  const current = images[open]!;

  return (
    <ImageDetailExperience
      images={images}
      openIndex={open}
      categoryLabel={categoryLabel(current.category)}
      prevHref={`/images/${encodeURIComponent(galleryRouteId(images[prevIndex]!, prevIndex))}`}
      nextHref={`/images/${encodeURIComponent(galleryRouteId(images[nextIndex]!, nextIndex))}`}
      backHref="/images"
    />
  );
}
