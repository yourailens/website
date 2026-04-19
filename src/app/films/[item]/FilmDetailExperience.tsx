"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import CopyUrlButton from "@/components/CopyUrlButton";
import type { GalleryFilm } from "@/data/gallery";

function videoMime(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDownloadVideoProps = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

type Props = {
  film: GalleryFilm;
  index: number;
  total: number;
  categoryLabel: string;
  prevHref: string;
  nextHref: string;
};

export default function FilmDetailExperience({
  film,
  index,
  total,
  categoryLabel,
  prevHref,
  nextHref,
}: Props) {
  const bgRef = useRef<HTMLVideoElement>(null);
  const mainRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const kickMain = () => {
      const m = mainRef.current;
      if (!m) return;
      m.play().catch(() => {
        m.muted = true;
        void m.play().catch(() => {});
      });
    };
    const kick = () => {
      void bgRef.current?.play().catch(() => {});
      kickMain();
    };
    kick();
    const m = mainRef.current;
    const onVis = () => {
      if (document.visibilityState === "visible") kick();
    };
    m?.addEventListener("loadeddata", kick);
    m?.addEventListener("canplay", kickMain);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      m?.removeEventListener("loadeddata", kick);
      m?.removeEventListener("canplay", kickMain);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [film.src]);

  const mime = videoMime(film.src);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-zinc-950 text-white">
      {/*
        Centered square larger than the viewport (100vmax) so object-cover never leaves side gaps.
        The old h/w 120% + -translate exposed the page background on one edge (black strip).
      */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        <video
          ref={bgRef}
          key={`bg-${film.src}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 object-cover opacity-100"
          style={{
            width: "100vmax",
            height: "100vmax",
            filter: "blur(18px) brightness(0.88) saturate(1.15)",
          }}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          poster={film.posterUrl}
        >
          <source src={film.src} type={mime} />
        </video>
      </div>

      {/* Frosted header — low-opacity tint + blur: video shows through, text stays readable */}
      <header className="relative z-20 flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-white/10 bg-black/25 px-4 py-4 backdrop-blur-md sm:px-8 lg:px-12">
        <Link
          href="/films"
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/35"
        >
          <span aria-hidden className="text-lg leading-none">
            ←
          </span>
          <span>Back to films</span>
        </Link>

        <div className="min-w-0 flex-1 text-right sm:max-w-[min(100%,32rem)] sm:flex-none">
          <h1 className="font-heading text-xl font-black leading-tight tracking-tight text-white sm:text-2xl lg:text-3xl">
            {film.title}
          </h1>
          <p className="mt-1 text-[11px] font-medium text-sky-50/95 sm:text-xs">
            {categoryLabel} · Clip {index + 1} of {total}
          </p>
          {film.peopleTags?.length ? (
            <p className="mt-1.5 text-xs text-white/90">{film.peopleTags.join(" · ")}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
            <Link
              href={prevHref}
              className="rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
              aria-label="Previous film"
            >
              ←
            </Link>
            <Link
              href={nextHref}
              className="rounded-xl border border-white/20 bg-black/25 px-3 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
              aria-label="Next film"
            >
              →
            </Link>
            <CopyUrlButton
              idleLabel="Copy link"
              copiedLabel="Copied"
              className="rounded-xl border border-white/20 bg-black/25 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-black/40"
            />
          </div>
        </div>
      </header>

      {/* Main player */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-4 pb-8 pt-4 sm:px-8 lg:px-12">
        <video
          ref={mainRef}
          key={film.src}
          className="max-h-[min(78dvh,calc(100dvh-12rem))] w-auto max-w-full rounded-2xl bg-black object-contain shadow-2xl shadow-black/60 ring-2 ring-white/15"
          controls
          autoPlay
          playsInline
          preload="auto"
          poster={film.posterUrl}
          {...noDownloadVideoProps}
        >
          <source src={film.src} type={mime} />
        </video>
        <p
          className="mt-5 max-w-md text-center text-[11px] text-white/90"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.65)" }}
        >
          Share this URL to open this film directly
        </p>
      </div>
    </div>
  );
}
