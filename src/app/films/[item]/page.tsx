import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyUrlButton from "@/components/CopyUrlButton";
import { categoryLabel } from "@/data/gallery";
import { findGalleryIndexByRouteId, galleryRouteId } from "@/lib/gallery/route-id";
import { getGalleryFilms } from "@/lib/gallery/load";
import { absoluteUrl, pickFilmOgImage } from "@/lib/seo/og-image";

function videoType(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDownloadVideoProps = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
};

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
  const description = `Watch ${current.title} from YourAILens Studio's AI film gallery.`;
  // Poster = first-frame JPEG from upload (`poster_url`) or site fallback; og:video is the file.
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
    <div className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-b from-blue-50/95 via-white/95 to-sky-50/90 backdrop-blur-xl text-slate-900">
      <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-blue-200/60 bg-white/85 px-4 py-4 shadow-sm shadow-blue-100/50 sm:px-8 lg:px-12">
        <div className="min-w-0 pl-1">
          <p className="truncate font-heading text-lg font-bold text-blue-950 sm:text-xl">{current.title}</p>
          <p className="mt-0.5 text-[11px] font-medium text-blue-700/70">
            {categoryLabel(current.category)} · Clip {open + 1} of {n}
          </p>
          {current.peopleTags?.length ? (
            <p className="mt-1 text-xs text-blue-700/75">{current.peopleTags.join(" · ")}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/films/${encodeURIComponent(galleryRouteId(films[prevIndex]!, prevIndex))}`}
            className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            aria-label="Previous film"
          >
            ←
          </Link>
          <Link
            href={`/films/${encodeURIComponent(galleryRouteId(films[nextIndex]!, nextIndex))}`}
            className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
            aria-label="Next film"
          >
            →
          </Link>
          <CopyUrlButton className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50" />
          <Link href="/films" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-700">
            Back
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-8 pt-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="mx-auto flex w-full max-w-[min(100%,1600px)] flex-1 flex-col">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <video
              key={current.src}
              className="block max-h-[min(78dvh,calc(100dvh-10rem))] max-w-full w-auto rounded-2xl bg-slate-950 object-contain shadow-2xl shadow-blue-200/40 ring-2 ring-blue-200/60"
              controls
              playsInline
              preload="auto"
              {...noDownloadVideoProps}
            >
              <source src={current.src} type={videoType(current.src)} />
            </video>
          </div>
          <p className="mt-4 text-center text-[11px] text-blue-800/50">Share this URL to open this film directly</p>
        </div>
      </div>
    </div>
  );
}
