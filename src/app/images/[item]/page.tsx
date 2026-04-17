import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CopyUrlButton from "@/components/CopyUrlButton";
import { categoryLabel } from "@/data/gallery";
import { findGalleryIndexByRouteId, galleryRouteId } from "@/lib/gallery/route-id";
import { getGalleryImages } from "@/lib/gallery/load";
import { pickOgImageForShare } from "@/lib/seo/og-image";

function remoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

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
  const description = `Explore ${current.title} from YourAILens Studio's AI image gallery.`;
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
    <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-md text-slate-900">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-4 sm:px-8 lg:px-10">
        <div className="min-w-0 pl-0.5">
          <p className="truncate font-heading text-lg font-bold text-slate-900 sm:text-xl">{current.title}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
            {categoryLabel(current.category)} · {String(open + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
          {current.peopleTags?.length ? (
            <p className="mt-1 text-xs text-slate-600">{current.peopleTags.join(" · ")}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={`/images/${encodeURIComponent(galleryRouteId(images[prevIndex]!, prevIndex))}`}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
            aria-label="Previous image"
          >
            ←
          </Link>
          <Link
            href={`/images/${encodeURIComponent(galleryRouteId(images[nextIndex]!, nextIndex))}`}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
            aria-label="Next image"
          >
            →
          </Link>
          <CopyUrlButton className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50" />
          <Link href="/images" className="rounded-md bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
            Back
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col bg-[#f8fafc] px-4 pb-8 pt-8 sm:px-8 lg:px-12">
        <div className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center rounded-lg bg-white p-4 shadow-inner shadow-slate-200/80 ring-1 ring-slate-100 sm:p-8">
          <div className="relative h-full max-h-[min(78dvh,calc(100dvh-10rem))] w-full">
            <Image
              src={current.src}
              alt={current.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized={remoteImage(current.src)}
            />
          </div>
        </div>
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Share this URL to open this image directly</p>
      </div>
    </div>
  );
}
