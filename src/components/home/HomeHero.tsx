"use client";

import Link from "next/link";
import { DeferredVideo } from "@/components/media/DeferredVideo";

export type HomeHeroFeature = {
  slug: string;
  caption: string;
  mediaUrl: string;
  posterUrl?: string | null;
  youtubeId?: string | null;
  href: string;
};

const FALLBACK_SRC = "/videos/hero_new.mp4";

export default function HomeHero({ feature }: { feature?: HomeHeroFeature | null }) {
  const youtubeId = feature?.youtubeId ?? null;
  const videoSrc = !youtubeId && feature?.mediaUrl ? feature.mediaUrl : null;
  const href = feature?.href ?? "#ads";
  const caption = feature?.caption ?? null;

  return (
    <section
      id="lens"
      aria-label="Opening film"
      className="relative aspect-video w-full bg-black md:aspect-auto md:h-[100svh] md:min-h-[560px]"
    >
      <h1 className="sr-only">YourAILens Studios</h1>

      {youtubeId ? (
        <iframe
          title={caption ?? "Featured film"}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${youtubeId}&playsinline=1&rel=0&modestbranding=1&showinfo=0`}
          className="pointer-events-none absolute inset-0 h-full w-full scale-[1.35] border-0 object-cover md:scale-[1.2]"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <DeferredVideo
          src={videoSrc ?? FALLBACK_SRC}
          poster={feature?.posterUrl ?? undefined}
          eager
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 to-transparent md:h-40" />

      {feature ? (
        <div className="pointer-events-none absolute left-5 top-20 z-20 max-w-[min(22rem,70vw)] sm:left-8 sm:top-24 lg:left-16 xl:left-52">
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-300">FEATURED</p>
          <p className="mt-2 font-body text-lg font-semibold leading-tight tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)] sm:text-2xl">
            {caption}
          </p>
          <Link
            href={href}
            className="pointer-events-auto mt-3 inline-flex text-[10px] font-medium uppercase tracking-[0.28em] text-white/70 transition hover:text-blue-300"
          >
            Open film
          </Link>
        </div>
      ) : null}

      <a
        href="#ads"
        className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)] transition hover:text-blue-300 md:bottom-10 xl:bottom-12"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.32em]">Explore</span>
        <svg viewBox="0 0 24 24" className="h-6 w-6 animate-bounce" fill="none" aria-hidden>
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </section>
  );
}
