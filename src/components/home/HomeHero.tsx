"use client";

import Link from "next/link";
import HomeHeroBanner from "@/components/home/HomeHeroBanner";

/** Done & Dusted — compressed hero (public/videos/hero.mp4). */
const HERO_VIDEO_SRC = "/videos/hero.mp4";

export default function HomeHero() {
  return (
    <div className="font-body w-full">
      <HomeHeroBanner />

      <section
        aria-label="Hero"
        className="border-b border-slate-100 bg-gradient-to-b from-slate-50 via-white to-white py-12 lg:py-20"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-10">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <p className="text-[11px] font-light italic tracking-[0.32em] text-blue-500 uppercase">
              YourAILens Studios
            </p>

            <h1
              className="mt-4 text-[clamp(2rem,5vw,3.25rem)] leading-[1.08] font-light text-slate-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              AI creatives that feel{" "}
              <span className="font-semibold not-italic text-slate-800">hand-crafted</span>
              <br />
              <span className="font-medium italic text-blue-600">not machine-made.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed font-light text-slate-500">
              Full campaign films, ads, and brand assets —{" "}
              <span className="font-medium italic text-slate-700">production-grade</span>, delivered in{" "}
              <span className="font-semibold text-slate-900">48 hours</span>, starting under{" "}
              <span className="font-semibold text-slate-900">₹50,000</span>.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-md shadow-blue-200/60 transition hover:bg-blue-700"
              >
                View packages
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-light italic text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
              >
                Book a free call →
              </Link>
            </div>

            <p className="mt-6 text-[11px] font-light tracking-[0.18em] text-slate-400 uppercase">
              <span className="font-medium not-italic text-slate-500">Now playing</span>
              {" · "}
              <span className="italic text-slate-600">Done &amp; Dusted</span>
            </p>
          </div>

          {/* Video card */}
          <div className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="h-full w-full object-cover object-center"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={HERO_VIDEO_SRC} type="video/mp4" />
                </video>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                <span className="pointer-events-none absolute bottom-3 left-3 rounded-md bg-black/45 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-white/90 uppercase backdrop-blur-sm">
                  Hero film
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Done &amp; Dusted</p>
                  <p className="text-xs font-light italic text-slate-500">Launch film · Product story</p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-medium tracking-wider text-blue-600 uppercase">
                  4K
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
