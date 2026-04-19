import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categoryLabel } from "@/data/gallery";
import { findGalleryIndexByRouteId, galleryRouteId } from "@/lib/gallery/route-id";
import { getGalleryFilms } from "@/lib/gallery/load";
import { absoluteUrl, pickFilmOgImage } from "@/lib/seo/og-image";
import FilmDetailExperience from "./FilmDetailExperience";

export const dynamic = "force-dynamic";

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

function videoTypeForMeta(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

export async function generateMetadata(props: { params: Promise<{ item: string }> }): Promise<Metadata> {
  const { item } = await props.params;
  const films = await getGalleryFilms();
  const open = findGalleryIndexByRouteId(films, decodeURIComponent(item));
  if (open < 0) return {};

  const current = films[open]!;
  const pageUrl = `${siteUrl()}/films/${encodeURIComponent(galleryRouteId(current, open))}`;
  const title = `${current.title} | YourAILens Films`;
  const description = `Watch ${current.title} from the YourAILens Studios AI film gallery.`;
  const og = pickFilmOgImage(siteUrl(), current.posterUrl);
  const videoAbs = absoluteUrl(siteUrl(), current.src);

  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "video.other",
      images: [
        {
          url: og.url,
          secureUrl: og.url.startsWith("https://") ? og.url : undefined,
          alt: `${current.title} — YourAILens Films`,
          type: og.type,
          ...(og.width != null && og.height != null ? { width: og.width, height: og.height } : {}),
        },
      ],
      videos: [{ url: current.src, type: videoTypeForMeta(current.src) }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: og.url, alt: `${current.title} — YourAILens Films` }],
    },
    other: {
      "og:image:secure_url": og.url,
      "og:image:type": og.type,
      ...(og.width != null && og.height != null
        ? { "og:image:width": String(og.width), "og:image:height": String(og.height) }
        : {}),
      "og:video:secure_url": videoAbs,
    },
  };
}

export default async function FilmDetailPage(props: { params: Promise<{ item: string }> }) {
  const { item } = await props.params;
  const films = await getGalleryFilms();
  const open = findGalleryIndexByRouteId(films, decodeURIComponent(item));
  if (open < 0) notFound();

  const n = films.length;
  const prevIndex = (open - 1 + n) % n;
  const nextIndex = (open + 1) % n;
  const current = films[open]!;

  return (
    <FilmDetailExperience
      film={current}
      index={open}
      total={n}
      categoryLabel={categoryLabel(current.category)}
      prevHref={`/films/${encodeURIComponent(galleryRouteId(films[prevIndex]!, prevIndex))}`}
      nextHref={`/films/${encodeURIComponent(galleryRouteId(films[nextIndex]!, nextIndex))}`}
    />
  );
}
