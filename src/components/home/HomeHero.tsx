"use client";

import { DeferredVideo } from "@/components/media/DeferredVideo";

export default function HomeHero() {
  return (
    <section
      id="lens"
      aria-label="Opening film"
      className="relative aspect-video w-full bg-black md:aspect-auto md:h-[100svh] md:min-h-[560px]"
    >
      <h1 className="sr-only">YourAILens Studios</h1>
      <DeferredVideo
        src="/videos/hero_new.mp4"
        eager
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent md:h-36" />

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
