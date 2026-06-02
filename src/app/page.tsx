"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import HomeHeroBanner from "@/components/home/HomeHeroBanner";
import HeroFilmCoverFlow from "@/components/home/HeroFilmCoverFlow";
import type { Service } from "@/data/services";
import { formatPrice, BADGE_COLORS } from "@/data/services";

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

const STATS = [
  { v: "100+", l: "Campaigns delivered" },
  { v: "48hr", l: "Average delivery"    },
  { v: "70%",  l: "Cost vs traditional" },
  { v: "10×",  l: "Faster production"   },
];



// ─── Service Card ─────────────────────────────────────────────────────────────

const CARD_IMG: Record<string, string> = {
  "campaign-sprint":        "/images/img1.jpeg",
  "brand-film":             "/images/img2.jpeg",
  "full-launch-pack":       "/images/img3.jpeg",
  "monthly-content-engine": "/images/img4.jpeg",
  "product-stills-pack":    "/images/shoe.png",
  "social-creatives-pack":  "/images/otshirt1.png",
  "ai-brand-avatar":        "/images/ai_avatar1.jpeg",
  "product-demo-video":     "/images/cologne.png",
  "performance-ad-pack":    "/images/img5.jpeg",
  "print-creatives-pack":   "/images/otshirt2.png",
  "brand-style-guide":      "/images/ws1.png",
  "brand-kit":              "/images/ws3.png",
};
const FALLBACK_IMGS = ["/images/img1.jpeg","/images/img2.jpeg","/images/img3.jpeg","/images/ai_avatar1.jpeg"];

function ServiceCard({ s, idx }: { s: Service; idx: number }) {
  const img  = s.header_image_url ?? s.thumbnail_url ?? CARD_IMG[s.slug] ?? FALLBACK_IMGS[idx % 4];
  const imgRemote = /^https?:\/\//i.test(img);
  const accent = s.accent_color ?? "#2563eb";
  return (
    <Link
      href={`/pricing/${s.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <Image
          src={img} alt={s.name} fill loading="lazy"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
          unoptimized={imgRemote}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {/* Category */}
        <p className="mb-1.5 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400">
          {s.category_slug?.replace(/-/g, " ")}
        </p>

        {/* Name + tagline — clamped so all cards have identical text height */}
        <h3
          className="line-clamp-1 font-body text-lg font-black leading-snug text-slate-900 transition-colors group-hover:text-blue-700"
          style={{ letterSpacing: "-0.02em" }}
        >
          {s.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-slate-500" style={{ minHeight: "2.8em" }}>{s.tagline}</p>

        {/* Price */}
        <div className="mt-4 flex items-baseline gap-1.5 border-t border-slate-100 pt-4">
          <span className="font-body text-2xl font-black text-slate-900" style={{ letterSpacing: "-0.03em" }}>
            {formatPrice(s.price)}
          </span>
          {s.unit && <span className="text-[11px] text-slate-400">{s.unit}</span>}
          {s.traditional_value && (
            <span className="ml-auto text-[11px] text-slate-400 line-through">
              {formatPrice(s.traditional_value)}
            </span>
          )}
        </div>

        {/* Includes */}
        <ul className="mt-3 space-y-1.5">
          {s.includes.slice(0, 3).map((f) => (
            <li key={f} className="flex items-center gap-2 text-[12px] text-slate-600">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50">
                <svg width="7" height="5" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke={accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="line-clamp-1">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div
          className="mt-5 flex items-center justify-between rounded-xl px-4 py-3 text-[12px] font-bold text-white transition group-hover:brightness-110"
          style={{ background: accent }}
        >
          <span>View package</span>
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}

function DeepDiveVideo({ src, poster, title }: { src: string; poster: string; title: string }) {
  const [ready, setReady] = useState(false);
  return (
    <>
      <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      <video
        autoPlay muted loop playsInline preload="metadata"
        poster={poster}
        aria-label={title}
        onCanPlay={() => setReady(true)}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </>
  );
}

type WallImage = { id: string; src: string; title: string; aspect: string };

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [wallImages, setWallImages] = useState<WallImage[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.ok ? r.json() : Promise.resolve({}))
      .then((j: { services?: Service[] }) => {
        if (Array.isArray(j.services)) {
          const sorted = [...j.services].sort((a, b) => a.price - b.price);
          setFeaturedServices(sorted.slice(0, 4));
        }
      })
      .catch(() => {});

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

      {/* ── HERO — blue banner + film cover flow (YouTube test) ─────────── */}
      <div className="bg-[#0a0a0c]">
        <HomeHeroBanner />
        <HeroFilmCoverFlow />
      </div>

      {/* ── AI MODELS ─────────────────────────────────────────────────── */}
      <section className="overflow-hidden border-t border-slate-100 bg-slate-50 py-6">
        <p className="mb-4 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
          Powered by
        </p>
        <div className="flex animate-marquee gap-5 pr-5">
          {[...AI_MODELS, ...AI_MODELS].map((m, i) => (
            <div key={i} className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${m.dark ? "bg-slate-800" : ""}`}>
                <Image src={m.logo} alt={m.name} width={18} height={18} className="h-4 w-4 object-contain" loading="lazy" />
              </div>
              <span className="text-[12px] font-bold text-slate-700">{m.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW AI PRODUCTION WORKS ───────────────────────────────────── */}
      <section className="bg-white pb-0">

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

        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          {/* Eyebrow + heading */}
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
      </section>


      {/* ── SERVICE CATALOGUE ─────────────────────────────────────────── */}
      <section id="services" className="bg-white pt-10 pb-16 scroll-mt-20 lg:pt-12 lg:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          {/* Header */}
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500">What we offer</span>
          </div>
          <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            {/* Left: heading */}
            <h2
              className="font-body text-4xl font-black text-slate-900 lg:text-5xl"
              style={{ letterSpacing: "-0.03em", lineHeight: 1.02 }}
            >
              Production-grade creatives.<br className="hidden sm:block" />
              <span className="text-blue-600">Built by AI.</span>
            </h2>

            {/* Right: description + CTA stacked */}
            <div className="flex shrink-0 flex-col items-start gap-4 sm:items-end">
              <p className="max-w-xs text-sm leading-relaxed text-slate-500 sm:text-right">
                Every package includes unlimited revisions, all formats, and full rights to every asset delivered.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-black text-white shadow-md transition hover:bg-blue-700 active:scale-95"
              >
                Browse all packages & pricing
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Grid */}
          {featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {featuredServices.map((s, i) => (
                <ServiceCard key={s.id} s={s} idx={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[440px] animate-pulse rounded-2xl bg-slate-100" />
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ── THE CASE FOR AI ───────────────────────────────────────────── */}
      <section className="bg-slate-50 pt-16 pb-8 lg:pt-24 lg:pb-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          {/* Eyebrow + headline */}
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
      </section>

      {/* ── KEY NUMBERS ───────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
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
      </section>

      {/* ── DEEP DIVE ───────────────────────────────────────────────────── */}
      <section className="bg-white pt-8 pb-16 lg:pt-10 lg:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500">Deep Dive</span>
          </div>
          <h2
            className="mb-10 font-body text-4xl font-black text-slate-900 lg:mb-12 lg:text-5xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.02 }}
          >
            Where AI<br />
            <span className="text-blue-600">wins hardest.</span>
          </h2>

          <div className="space-y-4">
            {[
              {
                n: "01",
                cat: "Storytelling",
                title: "Brand films",
                stat: "4 days",
                video: "/videos/hero2.mp4",
                poster: "/videos/hero2-poster.jpg",
                border: "border-blue-500",
                tags: ["Hero film", "Cut downs", "VO"],
              },
              {
                n: "02",
                cat: "Product VFX",
                title: "Product magic",
                stat: "No studio",
                video: "/videos/hero3.mp4",
                poster: "/videos/hero3-poster.jpg",
                border: "border-violet-500",
                tags: ["4K", "Liquid FX", "Lifestyle"],
              },
              {
                n: "03",
                cat: "Educational",
                title: "Explainers",
                stat: "24 hrs",
                video: "/videos/hero4.mp4",
                poster: "/videos/hero4-poster.jpg",
                border: "border-emerald-500",
                tags: ["How to", "FAQ", "Subtitles"],
              },
            ].map((d, i) => (
              <div
                key={d.n}
                className={`grid overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:min-h-[300px] ${i % 2 === 1 ? "lg:grid-cols-[1.1fr_1fr]" : "lg:grid-cols-[1fr_1.1fr]"}`}
              >
                <div className={`relative min-h-[220px] overflow-hidden bg-slate-900 lg:min-h-[300px] ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                  <DeepDiveVideo src={d.video} poster={d.poster} title={d.title} />
                </div>
                <div className={`flex flex-col justify-center border-l-4 bg-white p-6 lg:p-10 ${d.border} ${i % 2 === 1 ? "lg:order-1 lg:border-l-0 lg:border-r-4" : ""}`}>
                  <span className="font-mono text-xs font-bold text-slate-300">{d.n}</span>
                  <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.22em] text-blue-500">{d.cat}</span>
                  <h3 className="mt-2 font-body text-3xl font-black text-slate-900 lg:text-4xl" style={{ letterSpacing: "-0.03em" }}>
                    {d.title}
                  </h3>
                  <p className="mt-3 font-body text-5xl font-black text-blue-600 lg:text-6xl" style={{ letterSpacing: "-0.04em" }}>
                    {d.stat}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {d.tags.map((t) => (
                      <span key={t} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USE CASES ─────────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-6 bg-blue-500" />
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-500">Use Cases</span>
          </div>
          <h2
            className="mb-10 font-body text-4xl font-black text-slate-900 lg:mb-12 lg:text-5xl"
            style={{ letterSpacing: "-0.03em", lineHeight: 1.02 }}
          >
            Every channel.<br />
            <span className="text-blue-600">One pipeline.</span>
          </h2>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {[
              { img: "/images/img3.jpeg",       cat: "Storytelling", title: "Brand films",   stat: "48 hrs" },
              { img: "/images/img5.jpeg",       cat: "Performance",  title: "Paid ads",      stat: "10×" },
              { img: "/images/cologne.png",     cat: "Product VFX",  title: "Hero shots",    stat: "4K" },
              { img: "/images/img4.jpeg",       cat: "Educational",  title: "Explainers",    stat: "3 min" },
              { img: "/images/ai_avatar1.jpeg", cat: "Social",       title: "Reels",         stat: "9:16" },
              { img: "/images/ws3.png",         cat: "Launches",     title: "Launch films",  stat: "Same week" },
            ].map((item, i) => (
              <div
                key={item.title}
                className={`flex items-center gap-4 px-4 py-4 sm:gap-5 sm:px-6 sm:py-5 ${i < 5 ? "border-b border-slate-100" : ""}`}
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-16 sm:w-16">
                  <Image src={item.img} alt={item.title} fill className="object-cover" sizes="64px" loading="lazy" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-blue-500">{item.cat}</p>
                  <h3 className="font-body text-base font-black text-slate-900 sm:text-lg">{item.title}</h3>
                </div>
                <span
                  className="shrink-0 font-body text-2xl font-black text-blue-600 sm:text-3xl"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {item.stat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONCLUSION CTA ──────────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
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
      </section>

    </div>
  );
}
