"use client";

import Link from "next/link";
import HomeHeroBanner from "@/components/home/HomeHeroBanner";

const HERO_VIDEO_SRC = "/videos/hero.mp4";

export default function HomeHero() {
  return (
    <div className="font-body w-full">
      <HomeHeroBanner />

      <section
        aria-label="Hero"
        className="relative overflow-hidden border-b border-blue-100/80 bg-gradient-to-br from-sky-50 via-blue-50/40 to-white py-12 lg:py-20"
      >
        {/* Ambient blue glows */}
        <div
          className="pointer-events-none absolute -top-24 -left-20 h-[min(420px,55vw)] w-[min(420px,55vw)] rounded-full bg-blue-400/25 blur-[90px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-1/3 -right-16 h-[min(380px,48vw)] w-[min(380px,48vw)] rounded-full bg-cyan-400/20 blur-[100px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-[min(640px,70vw)] -translate-x-1/2 rounded-full bg-indigo-300/15 blur-[80px]"
          aria-hidden
        />

        {/* Soft mesh tint */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(59,130,246,0.12),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_30%,rgba(34,211,238,0.1),transparent_50%)]"
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-10">
          {/* Copy */}
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-3 py-1.5 shadow-sm shadow-blue-100/50 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
              <p className="text-[11px] font-light italic tracking-[0.28em] text-blue-600 uppercase">
                YourAILens Studios
              </p>
            </div>

            <h1
              className="mt-5 text-[clamp(2rem,5vw,3.25rem)] leading-[1.2] font-light text-slate-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              AI creatives that feel{" "}
              <span className="font-semibold not-italic text-slate-800">handcrafted</span>
              <br />
              <span
                className="hero-paper-strip font-body relative z-10 mt-1 inline-block rotate-[-1.2deg] bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-4 py-2 font-medium italic !text-white shadow-lg shadow-blue-600/35"
              >
                not machine made.
              </span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-relaxed font-light text-slate-600">
              Full campaign films, ads, and brand assets,{" "}
              <span className="font-medium italic text-slate-700">production grade</span>, delivered in{" "}
              <span className="font-semibold text-blue-800">48 hours</span>, starting under{" "}
              <span className="font-semibold text-blue-800">₹50,000</span>.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20"
              >
                View packages
                <span className="text-blue-200" aria-hidden>
                  →
                </span>
              </Link>
              <Link
                href="/contact"
                className="text-sm font-light italic text-slate-600 underline decoration-blue-300/80 decoration-2 underline-offset-[6px]"
              >
                Book a free call
              </Link>
            </div>
          </div>

          {/* Video card */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div
                className="pointer-events-none absolute -inset-3 rounded-[1.35rem] bg-gradient-to-br from-blue-400/30 via-cyan-300/20 to-indigo-400/25 blur-md"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-b from-white to-blue-50/30 p-2 shadow-[0_28px_64px_-24px_rgba(37,99,235,0.35)] ring-1 ring-blue-100/80">
                <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-900 ring-1 ring-blue-900/20">
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
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-950/40 via-transparent to-blue-400/10" />
                  <span className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-white/10 bg-blue-950/50 px-2.5 py-1 text-[10px] font-medium tracking-[0.14em] text-white/95 uppercase backdrop-blur-sm">
                    Hero film
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 px-3 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Done &amp; Dusted</p>
                    <p className="text-xs font-light italic text-blue-600/80">Launch film, product story</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-gradient-to-r from-blue-100 to-cyan-100 px-3 py-1 text-[10px] font-medium tracking-wider text-blue-700 uppercase">
                    4K
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
