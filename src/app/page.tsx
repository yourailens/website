"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import HomeHero from "@/components/home/HomeHero";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import HomeIndiaOlympicsStory from "@/components/home/HomeIndiaOlympicsStory";
import HomePricingPreview from "@/components/home/HomePricingPreview";

const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";

// ─── Data ─────────────────────────────────────────────────────────────────────

const AI_MODELS = [
  { name: "Higgsfield",  logo: "/images/logos/higgsfield.png" },
  { name: "Kling AI",    logo: "/images/logos/kling.png" },
  { name: "Seedance",    logo: "/images/logos/bytedance-icon.png" },
  { name: "Claude",      logo: "/images/logos/anthropic.png" },
  { name: "Gemini",      logo: "/images/logos/gemini-star.svg" },
  { name: "Veo",         logo: "/images/logos/veo.svg" },
  { name: "OpenAI",      logo: "/images/logos/openai.png" },
  { name: "Eleven Labs", logo: "/images/logos/elevenlabs.png" },
  { name: "Minimax",     logo: "/images/logos/minimax.svg", dark: true },
];

const FEATURED_FILMS = [
  {
    type: "Campaign film",
    title: "Fine Sugar",
    detail: "48 hour delivery",
    blurb: "Launch film with VO, grade, and social cuts from one brief.",
    video: "/videos/hero2.mp4",
    poster: "/videos/hero2-poster.jpg",
  },
  {
    type: "Product commercial",
    title: "Earbuds Commercial",
    detail: "Hero + paid social",
    blurb: "Product-led commercial built for launch day, organic, and paid channels.",
    video: "/videos/hero5.mp4",
    poster: "/videos/hero5-poster.jpg",
  },
  {
    type: "Drop teaser",
    title: "The Teaser",
    detail: "90 second cut",
    blurb: "Hook first edit for drop day, with vertical variants included.",
    video: "/videos/hero3.mp4",
    poster: "/videos/hero3-poster.jpg",
  },
  {
    type: "Aerial motion",
    title: "FPV Drone Shot",
    detail: "4K export",
    blurb: "Cinematic aerial passes without a location crew or drone day.",
    video: "/videos/hero4.mp4",
    poster: "/videos/hero4-poster.jpg",
  },
] as const;



function DeepDiveVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      aria-label={title}
      className="absolute inset-0 h-full w-full object-cover"
      onContextMenu={(e) => e.preventDefault()}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

type WallImage = { id: string; src: string; title: string; aspect: string };

export default function Home() {
  const [wallImages, setWallImages] = useState<WallImage[]>([]);

  useEffect(() => {
    fetch("/api/gallery/images")
      .then((r) => r.ok ? r.json() : Promise.resolve({}))
      .then((j: { images?: WallImage[] }) => {
        if (Array.isArray(j.images) && j.images.length > 0) {
          setWallImages(j.images.slice(0, 8));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />

      {/* ── HERO — blue banner, then video (separate blocks) ──────────── */}
      <HomeHero />

      {/* ── AI MODELS ─────────────────────────────────────────────────── */}
      <HomeBlueTint className="overflow-hidden border-t border-blue-100/70 py-7">
        <p className="mb-4 text-center text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/70">
          Powered by
        </p>
        <div className="flex animate-marquee gap-5 pr-5">
          {[...AI_MODELS, ...AI_MODELS].map((m, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-100/80 bg-white/90 px-4 py-2.5 shadow-sm shadow-blue-100/30">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${m.dark ? "bg-slate-800" : ""}`}>
                <Image src={m.logo} alt={m.name} width={18} height={18} className="h-4 w-4 object-contain" loading="lazy" />
              </div>
              <span className="text-[12px] font-semibold text-slate-700">{m.name}</span>
            </div>
          ))}
        </div>
      </HomeBlueTint>

      {/* ── FEATURED FILMS ────────────────────────────────────────────── */}
      <HomeBlueTint className="border-t border-blue-100/60 pt-12 pb-16 lg:pt-16 lg:pb-24">
        <div className={PAGE}>
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-6 bg-blue-400/80" />
            <span className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600/80">
              Selected work
            </span>
          </div>
          <h2
            className="max-w-xl text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.25] font-light text-slate-900"
            style={{ letterSpacing: "-0.02em" }}
          >
            Films we have{" "}
            <span className="font-semibold text-blue-700">shipped recently</span>
          </h2>
          <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-slate-600">
            Campaign films, launches, and product stories from a single AI production pipeline.
          </p>

          <div className="mt-10 space-y-5 lg:mt-12">
            {FEATURED_FILMS.map((film, i) => (
              <div
                key={film.title}
                className={`grid overflow-hidden rounded-2xl border border-blue-100/80 bg-white/80 shadow-sm shadow-blue-100/25 backdrop-blur-sm lg:min-h-[280px] ${
                  i % 2 === 1 ? "lg:grid-cols-[1.1fr_1fr]" : "lg:grid-cols-[1fr_1.1fr]"
                }`}
              >
                <div
                  className={`relative min-h-[220px] overflow-hidden bg-slate-900 lg:min-h-[280px] ${
                    i % 2 === 1 ? "lg:order-2" : ""
                  }`}
                >
                  <DeepDiveVideo src={film.video} poster={film.poster} title={film.title} />
                </div>
                <div
                  className={`flex flex-col justify-center border-blue-200/70 bg-white/95 p-6 lg:p-9 ${
                    i % 2 === 1
                      ? "border-t-4 lg:order-1 lg:border-t-0 lg:border-r-2 lg:border-r-blue-300/60"
                      : "border-t-4 lg:border-t-0 lg:border-l-2 lg:border-l-blue-300/60"
                  }`}
                >
                  <p className="text-[11px] font-light uppercase tracking-[0.22em] text-blue-600/90">
                    {film.type}
                  </p>
                  <h3
                    className="mt-2 text-2xl font-light text-slate-900 lg:text-[1.65rem]"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {film.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-blue-800/90">{film.detail}</p>
                  <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-slate-600">
                    {film.blurb}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </HomeBlueTint>

      {/* ── HOW AI PRODUCTION WORKS ───────────────────────────────────── */}
      <HomeBlueTint className="border-t border-blue-100/60 pb-0">

        {/* Image carousel — live from The Wall, horizontally scrollable */}
        <div className="mb-12 flex h-[260px] gap-3 overflow-x-auto scroll-smooth px-6 [&::-webkit-scrollbar]:hidden lg:h-[420px] lg:px-10">
          {wallImages.map((img, i) => {
            const wide = img.aspect === "landscape" || i % 3 === 1;
            return (
              <div
                key={img.id}
                className={`relative shrink-0 overflow-hidden rounded-2xl bg-slate-100 ${wide ? "w-[75vw] lg:w-[520px]" : "w-[56vw] lg:w-[320px]"}`}
              >
                <Image src={img.src} alt={img.title} fill className="object-cover" loading="lazy" unoptimized={/^https?:\/\//.test(img.src)} />
              </div>
            );
          })}
        </div>

        <div className={PAGE}>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500">What We Do</span>
          </div>
          <h2
            className="mb-4 font-body text-4xl font-black text-slate-900 lg:text-5xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.02 }}
          >
            One workflow.<br />
            <span className="text-blue-600">Every asset you need.</span>
          </h2>
          <p className="mb-10 max-w-xl text-sm font-medium leading-relaxed text-slate-600">
            We take your brief and run it through a full AI production pipeline, delivering videos, stills, ads, and brand content at a fraction of the traditional cost and time.
          </p>

          {/* Capability rows */}
          <div className="divide-y divide-slate-100 border-t border-slate-100">
            {[
              { n: "01", title: "AI Visuals and Ad Films",  stat: "60-second films in under 2 hrs" },
              { n: "02", title: "Product VFX",              stat: "4K stills, no studio needed" },
              { n: "03", title: "Brand Consistent Output",  stat: "Every asset locked to your brand" },
              { n: "04", title: "Social and Ad Creatives",  stat: "50+ formats from one brief" },
              { n: "05", title: "AI Voiceover and Audio",   stat: "30+ languages, delivered instantly" },
              { n: "06", title: "Unlimited Revisions",      stat: "Iterate in minutes, not days" },
            ].map((item) => (
              <div key={item.n} className="flex items-start gap-4 py-4 lg:items-center lg:gap-6 lg:py-5">
                <span className="mt-0.5 w-7 shrink-0 font-mono text-xs font-bold text-slate-400 lg:mt-0 lg:w-8">{item.n}</span>
                <div className="flex flex-1 flex-col lg:flex-row lg:items-center">
                  <span className="flex-1 text-[14px] font-bold text-slate-900 lg:text-[15px]">{item.title}</span>
                  <span className="mt-0.5 text-[12px] font-medium text-slate-400 lg:mt-0 lg:text-[13px] lg:text-slate-500">{item.stat}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </HomeBlueTint>


      {/* ── INDIA IN OLYMPICS — special storytelling film ───────────────── */}
      <HomeBlueTint className="border-t border-blue-100/60 py-14 lg:py-20">
        <HomeIndiaOlympicsStory />
      </HomeBlueTint>

      {/* ── THE CASE FOR AI ───────────────────────────────────────────── */}
      <HomeBlueTint className="border-t border-blue-100/60 pt-16 pb-8 lg:pt-24 lg:pb-10">
        <div className={PAGE}>
          <div className="mb-10 flex flex-col gap-2 lg:mb-12">
            <div className="flex items-center gap-2">
              <div className="h-px w-6 bg-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500">The Case for AI</span>
            </div>
            <h2 className="font-body text-4xl font-black text-slate-900 lg:text-5xl" style={{ letterSpacing: "-0.03em", lineHeight: 1.02 }}>
              Same quality.<br />
              <span className="text-blue-600">85% less cost.</span>
            </h2>
          </div>

          {/* Portrait strip — 4 tall verticals, full height on desktop */}
          <div className="mb-12 grid grid-cols-2 gap-3 lg:mb-14 lg:grid-cols-4">
            {[
              { src: "/images/ai_avatar1.jpeg", label: "AI Avatar" },
              { src: "/images/otshirt1.png",    label: "Fashion"   },
              { src: "/images/cologne.png",     label: "Product"   },
              { src: "/images/ws3.png",         label: "Lifestyle" },
            ].map((item) => (
              <div
                key={item.src}
                className="group relative h-[320px] overflow-hidden rounded-2xl bg-slate-200 sm:h-[400px] lg:h-[560px]"
              >
                <Image src={item.src} alt={item.label} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(max-width: 1024px) 50vw, 25vw" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/50 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">{item.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div>
            {/* Column headers */}
            <div className="mb-3 grid grid-cols-3 gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">What you get</span>
                <span className="text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">Traditional</span>
                <span className="text-center text-[10px] font-bold uppercase tracking-wider text-blue-500">YourAILens</span>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {[
                  { label: "Cost",             bad: "₹2L – ₹5L",          good: "From ₹30K" },
                  { label: "Delivery",         bad: "3 – 6 weeks",         good: "24 – 48 hrs" },
                  { label: "Assets delivered", bad: "3 – 5 files",         good: "50+ assets" },
                  { label: "Revisions",        bad: "1–2 (extra charge)",  good: "Unlimited" },
                  { label: "Platform resizing",bad: "Billed separately",   good: "All included" },
                  { label: "Brand consistency",bad: "Manual, inconsistent",good: "AI-locked identity" },
                ].map((row, i) => (
                  <div key={row.label} className={`grid grid-cols-3 gap-2 px-5 py-4 ${i !== 5 ? "border-b border-slate-100" : ""}`}>
                    <span className="text-sm font-medium text-slate-700">{row.label}</span>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-50">
                        <svg className="h-2.5 w-2.5 text-red-400" fill="none" viewBox="0 0 10 10">
                          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </span>
                      <span className="text-center text-xs text-slate-500">{row.bad}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                        <svg className="h-2.5 w-2.5 text-emerald-500" fill="none" viewBox="0 0 10 8">
                          <path d="M1 4l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="text-center text-xs font-semibold text-slate-800">{row.good}</span>
                    </div>
                  </div>
                ))}
              </div>

            <div className="mt-5">
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-blue-700">
                See our packages →
              </Link>
            </div>
          </div>
        </div>
      </HomeBlueTint>

      {/* ── KEY NUMBERS ───────────────────────────────────────────────── */}
      <HomeBlueTint className="border-y border-blue-100/60 py-6 lg:py-8">
        <div className={PAGE}>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
            {[
              { num: "10×",  label: "Faster than traditional production",     sub: "Brief to delivery in 48 hours" },
              { num: "85%",  label: "Average cost reduction vs agency pricing", sub: "Same cinematic output, less spend" },
              { num: "50+",  label: "Brand assets per campaign package",       sub: "Videos, stills, creatives, copy" },
              { num: "100%", label: "AI-generated, commercially licensed",     sub: "Fully ownable by your brand" },
            ].map((s) => (
              <div key={s.num} className="flex flex-col bg-white px-6 py-7 lg:px-8 lg:py-8">
                <span className="font-body text-5xl font-black text-slate-900 lg:text-6xl" style={{ letterSpacing: "-0.04em" }}>
                  {s.num}
                </span>
                <p className="mt-3 text-sm font-semibold leading-snug text-slate-700">{s.label}</p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </HomeBlueTint>

      {/* ── PACKAGES (preview) — second-to-last ─────────────────────────── */}
      <HomePricingPreview />

      {/* ── CONCLUSION CTA ──────────────────────────────────────────────── */}
      <HomeBlueTint className="border-t border-blue-100/60 py-16 lg:py-24">
        <div className={PAGE}>
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 px-6 py-14 text-center sm:px-10 lg:px-16 lg:py-20">
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-blue-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500">Get started</span>
              <div className="h-px w-8 bg-blue-500" />
            </div>
            <h2
              className="mx-auto max-w-2xl font-body text-4xl font-black text-slate-900 lg:text-5xl"
              style={{ letterSpacing: "-0.03em", lineHeight: 1.05 }}
            >
              Your brief in.<br />
              <span className="text-blue-600">A full campaign out.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm font-medium text-slate-600">
              Pick a package, add what you need, and we handle production end to end.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/pricing"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
              >
                Browse packages
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/contact"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-8 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-700 sm:w-auto"
              >
                Book a call
              </Link>
            </div>
          </div>
        </div>
      </HomeBlueTint>

    </div>
  );
}
