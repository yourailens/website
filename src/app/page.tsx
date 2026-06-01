"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
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



// ─── Service Card (homepage teaser) ──────────────────────────────────────────

function ServiceCard({ s }: { s: Service }) {
  const badge = s.badge_label && BADGE_COLORS[s.badge_color ?? "blue"];
  return (
    <div className="flex">
      <Link
        href={`/pricing/${s.slug}`}
        className="group relative flex w-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
      >
        <div className="h-1 w-full" style={{ background: s.accent_color ?? "#2563eb" }} />
        <div className="flex flex-1 flex-col p-7">
          {badge && (
            <span className={`mb-4 inline-block w-fit rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${badge.bg} ${badge.text}`}>
              {s.badge_label}
            </span>
          )}
          <h3 className="font-heading text-2xl font-black leading-tight text-slate-900 group-hover:text-blue-600 transition-colors">
            {s.name}
          </h3>
          <p className="mt-1 text-[13px] text-slate-500">{s.tagline}</p>
          <div className="mt-5 border-t border-slate-100 pb-5 pt-5">
            <span className="font-heading text-4xl font-black leading-none text-slate-900">
              {formatPrice(s.price)}
            </span>
            <span className="ml-2 text-[12px] text-slate-400">{s.unit}</span>
          </div>
          <ul className="mb-8 space-y-2.5">
            {s.includes.slice(0, 4).map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-50">
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3L3 5L7 1" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                <span className="text-slate-600">{f}</span>
              </li>
            ))}
          </ul>
          <div
            className="mt-auto block rounded-2xl py-3.5 text-center text-sm font-black text-white transition active:scale-95"
            style={{ background: s.accent_color ?? "#2563eb" }}
          >
            View details →
          </div>
        </div>
      </Link>
    </div>
  );
}

// ─── Hero tile video ─────────────────────────────────────────────────────────

/*
  Editorial grid layout (3 cols × 2 rows):
  ┌─────────┬──────────────────┐
  │         │  tile 2 (wide)   │
  │ tile 1  ├─────────┬────────┤
  │ (tall)  │ tile 3  │ tile 4 │
  └─────────┴─────────┴────────┘
*/
const HERO_TILES = [
  { src: "/videos/hero2.mp4", poster: "/videos/hero2-poster.jpg", style: "col-start-1 row-start-1 row-end-3" },
  { src: "/videos/hero.mp4",  poster: "/videos/hero-poster.jpg",  style: "col-start-2 col-end-4 row-start-1 row-end-2" },
  { src: "/videos/hero3.mp4", poster: "/videos/hero3-poster.jpg", style: "col-start-2 row-start-2 row-end-3" },
  { src: "/videos/hero4.mp4", poster: "/videos/hero4-poster.jpg", style: "col-start-3 row-start-2 row-end-3" },
];

function HeroTile({ src, poster, style }: { src: string; poster: string; style: string }) {
  const [ready, setReady] = useState(false);
  return (
    <div className={`relative overflow-hidden bg-[#0a0a10] ${style}`}>
      {/* Poster — instant */}
      <img src={poster} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover" />
      {/* Video fades in once buffered */}
      <video
        autoPlay muted loop playsInline preload="auto"
        poster={poster}
        onCanPlay={() => setReady(true)}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.ok ? r.json() : Promise.resolve({}))
      .then((j: { services?: Service[] }) => {
        if (Array.isArray(j.services)) {
          // show up to 4: prioritise is_featured then is_popular
          const sorted = [...j.services].sort((a, b) => {
            if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
            if (a.is_popular !== b.is_popular) return a.is_popular ? -1 : 1;
            return a.sort_order - b.sort_order;
          });
          setFeaturedServices(sorted.slice(0, 4));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO — 4-tile video grid ────────────────────────────────────── */}
      <section className="relative h-[100svh] w-full overflow-hidden bg-[#0a0a10]">

        {/* Editorial grid — fills entire viewport */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1">
          {HERO_TILES.map((t, i) => (
            <HeroTile key={i} src={t.src} poster={t.poster} style={t.style} />
          ))}
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/35" />

        {/* Text */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <div
            className="rounded-3xl px-10 py-8 backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.48)", boxShadow: "0 0 80px 40px rgba(0,0,0,0.4)" }}
          >
            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.35em] text-white/45">
              AI Creative Studio
            </p>
            <h1
              className="font-heading font-black leading-[0.88] text-white"
              style={{ fontSize: "clamp(2.4rem, 6vw, 6rem)", letterSpacing: "-0.04em" }}
            >
              AI creatives.<br />
              <span style={{ WebkitTextStroke: "1.8px rgba(255,255,255,0.35)", WebkitTextFillColor: "transparent" }}>
                Delivered fast.
              </span>
            </h1>
          </div>
        </div>

      </section>

      {/* ── AI MODELS ─────────────────────────────────────────────────── */}
      <section className="overflow-hidden border-y border-slate-100 bg-slate-50 py-6">
        <p className="mb-4 text-center text-[9px] font-bold uppercase tracking-[0.35em] text-slate-300">
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

      {/* ── SERVICE CATALOGUE ─────────────────────────────────────────── */}
      <section id="services" className="bg-white py-16 lg:py-20 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Services</span>
          </div>
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-heading text-3xl font-black text-slate-900 lg:text-4xl" style={{ letterSpacing: "-0.025em" }}>
              Not just videos. Everything.
            </h2>
            <Link href="/pricing" className="hidden text-sm font-semibold text-blue-600 hover:underline sm:block">
              Browse all services →
            </Link>
          </div>

          {featuredServices.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {featuredServices.map((s) => (
                <ServiceCard key={s.id} s={s} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-slate-100" />
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-600"
            >
              View all {featuredServices.length > 0 ? "services & pricing" : "services"} →
            </Link>
          </div>
        </div>
      </section>

      {/* ── WORK GALLERY ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Our Work</span>
          </div>
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-heading text-3xl font-black text-slate-900 lg:text-4xl" style={{ letterSpacing: "-0.025em" }}>
              Real brands. Real results.
            </h2>
            <Link href="/images" className="hidden text-sm font-semibold text-blue-600 hover:underline sm:block">
              Full gallery →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-12 lg:grid-rows-2">
            <div className="relative col-span-2 row-span-2 overflow-hidden rounded-2xl bg-slate-200 lg:col-span-5 lg:row-span-2" style={{ minHeight: 260 }}>
              <Image src="/images/ai_avatar1.jpeg" alt="" fill className="object-cover transition duration-500 hover:scale-[1.03]" sizes="40vw" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-5">
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">AI Avatar</span>
              </div>
            </div>
            {[
              { src: "/images/otshirt1.png", label: "Fashion",  cls: "lg:col-span-4" },
              { src: "/images/ws3.png",       label: "Lifestyle", cls: "lg:col-span-3" },
              { src: "/images/cologne.png",   label: "Product",   cls: "lg:col-span-3" },
              { src: "/images/shoe.png",      label: "D2C Brand", cls: "lg:col-span-4" },
            ].map((item, i) => (
              <div key={i} className={`relative overflow-hidden rounded-2xl bg-slate-200 ${item.cls}`} style={{ minHeight: 170 }}>
                <Image src={item.src} alt="" fill className="object-cover transition duration-500 hover:scale-[1.03]" sizes="25vw" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRADITIONAL vs AI ─────────────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">The Case for AI</span>
          </div>
          <h2 className="mb-12 font-heading text-3xl font-black text-slate-900 lg:text-4xl" style={{ letterSpacing: "-0.025em" }}>
            Same quality.<br />A fraction of the cost.
          </h2>

          <div className="grid gap-3 lg:grid-cols-2">
            {/* Traditional */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">Traditional Agency</p>
              <ul className="space-y-4">
                {[
                  { label: "Cost per campaign", value: "₹2,00,000 – ₹5,00,000" },
                  { label: "Time to delivery",  value: "3 – 6 weeks" },
                  { label: "Deliverables",      value: "3 – 5 assets" },
                  { label: "Revisions",         value: "1 – 2 rounds (charged)" },
                  { label: "Resizing / edits",  value: "Billed separately" },
                  { label: "Brand consistency", value: "Manual, variable" },
                ].map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-500">{r.label}</span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <svg className="h-2.5 w-2.5 text-red-500" fill="none" viewBox="0 0 10 10">
                          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </span>
                      {r.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI Studio */}
            <div className="rounded-2xl bg-slate-900 p-8 text-white">
              <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">YourAILens Studio</p>
              <ul className="space-y-4">
                {[
                  { label: "Cost per campaign", value: "From ₹30,000" },
                  { label: "Time to delivery",  value: "24 – 48 hours" },
                  { label: "Deliverables",      value: "50+ assets per campaign" },
                  { label: "Revisions",         value: "Unlimited, included" },
                  { label: "Resizing / edits",  value: "All platforms, included" },
                  { label: "Brand consistency", value: "AI-locked to your identity" },
                ].map((r) => (
                  <li key={r.label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <span className="text-sm text-slate-400">{r.label}</span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-white">
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                        <svg className="h-2.5 w-2.5 text-emerald-400" fill="none" viewBox="0 0 10 8">
                          <path d="M1 4l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {r.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── KEY NUMBERS ───────────────────────────────────────────────── */}
      <section className="border-y border-slate-100 bg-slate-50 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:grid-cols-4">
            {[
              { num: "10×",  label: "Faster than traditional production",     sub: "Brief to delivery in 48 hours" },
              { num: "85%",  label: "Average cost reduction vs agency pricing", sub: "Same cinematic output, less spend" },
              { num: "50+",  label: "Brand assets per campaign package",       sub: "Videos, stills, creatives, copy" },
              { num: "100%", label: "AI-generated, commercially licensed",     sub: "Fully ownable by your brand" },
            ].map((s) => (
              <div key={s.num} className="flex flex-col bg-white px-8 py-10">
                <span className="font-heading text-5xl font-black text-slate-900 lg:text-6xl" style={{ letterSpacing: "-0.04em" }}>
                  {s.num}
                </span>
                <p className="mt-3 text-sm font-semibold leading-snug text-slate-700">{s.label}</p>
                <p className="mt-1 text-xs text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW AI PRODUCTION WORKS ───────────────────────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">The Technology</span>
          </div>
          <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="font-heading text-3xl font-black text-slate-900 lg:text-4xl" style={{ letterSpacing: "-0.025em" }}>
              What used to take a crew<br />now takes a prompt.
            </h2>
            <p className="max-w-xs text-sm text-slate-500 lg:text-right">
              We use the world&apos;s leading generative AI models to produce ad-grade creative at a fraction of traditional cost — without sacrificing an inch of quality.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "AI Cinematography",
                body: "State-of-the-art video generation models produce cinematic footage — lighting, movement, depth — indistinguishable from on-set production. No crew. No location. No waiting.",
                stat: "60s film in under 2 hours",
                accent: "#2563eb",
              },
              {
                title: "Instant Asset Scaling",
                body: "One campaign brief generates dozens of size-optimised variants automatically. Meta, Google, YouTube, LinkedIn, Print — every format, every spec, zero extra cost.",
                stat: "50+ formats from one brief",
                accent: "#7c3aed",
              },
              {
                title: "Brand-Locked Output",
                body: "Your brand colors, fonts, spokesperson, tone of voice — all encoded into the generation pipeline. Every output is on-brand by default, not by chance.",
                stat: "Zero off-brand outputs",
                accent: "#0ea5e9",
              },
              {
                title: "Photorealistic Product VFX",
                body: "Product shots, lifestyle scenes, hero visuals — generated at 4K without a photographer or studio. As realistic as the best commercial photography.",
                stat: "Studio quality, zero studio cost",
                accent: "#16a34a",
              },
              {
                title: "AI Voice & Sound",
                body: "Professional voiceovers, music beds and sound design generated in minutes. Multilingual by default — scale campaigns globally without re-shooting.",
                stat: "30+ languages supported",
                accent: "#ea580c",
              },
              {
                title: "Iterate at Zero Cost",
                body: "Change the colour, the tagline, the setting, the cast — regenerate in minutes, not days. Revisions are included in every package, always.",
                stat: "Unlimited iterations included",
                accent: "#0f172a",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="group flex flex-col rounded-2xl border border-slate-100 bg-slate-50 p-7 transition hover:border-slate-200 hover:bg-white hover:shadow-md"
              >
                <div className="mb-4 h-0.5 w-8 rounded-full" style={{ background: card.accent }} />
                <h3 className="mb-2 text-base font-black text-slate-900">{card.title}</h3>
                <p className="flex-1 text-sm leading-relaxed text-slate-500">{card.body}</p>
                <div className="mt-6 rounded-xl px-3 py-2 text-xs font-bold" style={{ background: card.accent + "14", color: card.accent }}>
                  {card.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVERY FORMAT YOUR BRAND NEEDS — bento grid ────────────────── */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Use Cases</span>
          </div>
          <div className="mb-10 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="font-heading text-3xl font-black text-slate-900 lg:text-4xl" style={{ letterSpacing: "-0.025em" }}>
              Every marketing channel.<br />AI-ready.
            </h2>
            <p className="max-w-sm text-sm text-slate-500">
              From a 6-second bumper ad to a 3-minute brand documentary — AI handles every format your marketing team needs.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid auto-rows-[180px] grid-cols-2 gap-3 lg:grid-cols-4 lg:auto-rows-[200px]">
            {/* Brand Storytelling — wide + tall */}
            <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl bg-slate-900 p-8 flex flex-col justify-between">
              <div>
                <span className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white/60">Storytelling</span>
                <h3 className="font-heading text-2xl font-black leading-tight text-white lg:text-3xl">
                  Brand films that make people feel something.
                </h3>
                <p className="mt-3 text-sm text-slate-400 max-w-xs">
                  Narrative-driven AI films that communicate your brand&apos;s values, origin, and mission — at cinematic quality, without the production budget.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {["Hero films","Origin stories","Culture docs","Founder narratives"].map(t => (
                  <span key={t} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-white/50">{t}</span>
                ))}
              </div>
            </div>

            {/* Performance Ads */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-blue-500">Performance Ads</span>
                <h3 className="text-base font-black text-slate-900">Scroll-stopping ad creatives</h3>
                <p className="mt-1 text-xs text-slate-500">Meta, Google, YouTube — every spec, every format.</p>
              </div>
              <p className="text-2xl font-black text-blue-600 mt-2">10×<span className="text-sm font-semibold text-slate-400"> higher output</span></p>
            </div>

            {/* Product VFX */}
            <div className="relative overflow-hidden rounded-2xl bg-violet-600 p-6 flex flex-col justify-between">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-violet-200">Product VFX</span>
                <h3 className="text-base font-black text-white">Impossible shots. Real results.</h3>
                <p className="mt-1 text-xs text-violet-200">CGI-grade product visuals without CGI costs.</p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-violet-300 uppercase tracking-wide">4K · Photorealistic · 48hr</div>
            </div>

            {/* Educational / Explainer */}
            <div className="col-span-2 relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-emerald-500">Educational Content</span>
                  <h3 className="text-lg font-black text-slate-900">Explainers, demos & how-to videos</h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-xs">
                    Turn complex products into clear, watchable stories. AI generates step-by-step explainer videos that convert browsers into buyers.
                  </p>
                </div>
                <div className="shrink-0 text-right hidden sm:block">
                  <p className="text-3xl font-black text-emerald-600">3 min</p>
                  <p className="text-xs text-slate-400">avg. explainer length</p>
                  <p className="mt-1 text-3xl font-black text-emerald-600">40%</p>
                  <p className="text-xs text-slate-400">higher conversion rate</p>
                </div>
              </div>
            </div>

            {/* Social-native */}
            <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-6 flex flex-col justify-between">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-blue-200">Social Native</span>
                <h3 className="text-base font-black text-white">Reels. TikToks. Shorts.</h3>
                <p className="mt-1 text-xs text-blue-200">Platform-native formats built for the algorithm.</p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-blue-300 uppercase tracking-wide">9:16 · Subtitled · Hooked</div>
            </div>

            {/* Event & Launch */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-orange-500">Launches & Events</span>
                <h3 className="text-base font-black text-slate-900">Launch films that build hype</h3>
                <p className="mt-1 text-xs text-slate-500">Teasers, countdowns, reveal films — all AI.</p>
              </div>
              <p className="text-xs font-bold text-orange-500 mt-2">Ready before your launch date</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DEEP DIVES: Storytelling / VFX / Education ────────────────── */}
      <section className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-500">Deep Dive</span>
          </div>
          <h2 className="mb-14 font-heading text-3xl font-black text-slate-900 lg:text-4xl" style={{ letterSpacing: "-0.025em" }}>
            Three areas that change everything.
          </h2>

          <div className="space-y-3">

            {/* 1. Storytelling */}
            <div className="grid gap-0 overflow-hidden rounded-2xl border border-slate-200 lg:grid-cols-[1fr_1px_1fr]">
              <div className="p-8 lg:p-10">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-blue-500">01 — Brand Storytelling</span>
                <h3 className="mb-4 font-heading text-2xl font-black text-slate-900">Your story deserves a cinematic voice.</h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-500">
                  Every brand has a founding story, a mission, a set of values worth telling. Traditional storytelling required a director, a shoot, months of post-production and a six-figure budget. AI storytelling requires a brief and 48 hours. The emotional impact stays exactly the same.
                </p>
                <p className="text-sm leading-relaxed text-slate-500">
                  Our AI models handle cinematography, pacing, narration and score — producing films that genuinely move people, not just inform them. Used by brands to communicate purpose, drive loyalty and dominate the top of the funnel.
                </p>
              </div>
              <div className="hidden bg-slate-100 lg:block" />
              <div className="border-t border-slate-200 bg-slate-50 p-8 lg:border-0 lg:p-10">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">What you get</p>
                <ul className="space-y-3">
                  {[
                    "Hero brand film (60–90s) with full cinematic grade",
                    "Cut-downs for every platform (30s, 15s, 9s)",
                    "AI-generated spokesperson or voiceover",
                    "Original AI music bed, synced to your story",
                    "Subtitle-ready, multilingual versions",
                    "Delivered in 4 days, not 4 months",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 2. VFX */}
            <div className="grid gap-0 overflow-hidden rounded-2xl bg-slate-900 lg:grid-cols-[1fr_1px_1fr]">
              <div className="p-8 lg:p-10">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-violet-400">02 — AI Visual Effects</span>
                <h3 className="mb-4 font-heading text-2xl font-black text-white">Hollywood VFX. Startup budget.</h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-400">
                  Product floating in zero gravity. A shoe being assembled particle by particle. A perfume dissolving into a forest. Shots that used to require a compositing studio and weeks of rendering now take hours with AI VFX.
                </p>
                <p className="text-sm leading-relaxed text-slate-400">
                  The same generative models powering Hollywood post-production are now accessible to any brand. The result is commercial-grade visual effects that make products look extraordinary — not just photographed, but imagined.
                </p>
              </div>
              <div className="hidden bg-white/5 lg:block" />
              <div className="border-t border-white/10 p-8 lg:border-0 lg:p-10">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">What you get</p>
                <ul className="space-y-3">
                  {[
                    "4K photorealistic product visualisations",
                    "CGI-grade environment and scene generation",
                    "Physics simulations (liquid, particle, fabric)",
                    "360° product showcase videos",
                    "Composited lifestyle scenes — no photoshoot",
                    "Brand-locked visual style across all outputs",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 3. Educational */}
            <div className="grid gap-0 overflow-hidden rounded-2xl border border-slate-200 lg:grid-cols-[1fr_1px_1fr]">
              <div className="p-8 lg:p-10">
                <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-emerald-500">03 — Educational Content</span>
                <h3 className="mb-4 font-heading text-2xl font-black text-slate-900">Educate, then convert.</h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-500">
                  The brands that win in 2025 are the ones that teach. How-to videos, product explainers, ingredient breakdowns, comparison guides — educational content builds trust before a customer ever reaches your product page.
                </p>
                <p className="text-sm leading-relaxed text-slate-500">
                  AI generates structured explainer videos with voiceover, animated callouts, step-by-step visuals and branded templates. What used to require a motion designer and a week of revisions now ships in 24 hours.
                </p>
              </div>
              <div className="hidden bg-slate-100 lg:block" />
              <div className="border-t border-slate-200 bg-slate-50 p-8 lg:border-0 lg:p-10">
                <p className="mb-6 text-[10px] font-bold uppercase tracking-widest text-slate-400">What you get</p>
                <ul className="space-y-3">
                  {[
                    "Product explainer videos (60–180s)",
                    "Ingredient or feature breakdown reels",
                    "How-to and tutorial series",
                    "FAQ videos that reduce support load",
                    "Comparison videos vs. alternatives",
                    "All subtitled and platform-optimised",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 16 16">
                        <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
