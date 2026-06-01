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

// ─── Hero ─────────────────────────────────────────────────────────────────────

type Film = { src: string; posterUrl: string | null };

// Static images to mix in
const STATIC_IMAGES = [
  "/images/ai_avatar1.jpeg",
  "/images/otshirt1.png",
  "/images/ws3.png",
  "/images/cologne.png",
  "/images/shoe.png",
  "/images/otshirt2.png",
  "/images/ws1.png",
  "/images/w2.png",
];

type Cell = { type: "video"; film: Film } | { type: "image"; src: string } | { type: "skeleton" };

function BgCell({ cell, style }: { cell: Cell; style?: React.CSSProperties }) {
  const [ready, setReady] = useState(cell.type === "image");
  const vidRef = useRef<HTMLVideoElement>(null);


  return (
    <div
      className="relative overflow-hidden rounded-xl"
      style={{ background: "#111118", ...style }}
    >
      {/* Skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"
        style={{ opacity: ready ? 0 : 1, transition: "opacity 0.5s ease" }} />

      {cell.type === "video" && (
        <video ref={vidRef} autoPlay muted loop playsInline preload="auto"
          poster={cell.film.posterUrl ?? undefined}
          onCanPlay={() => setReady(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: ready ? 1 : 0, transition: "opacity 0.8s ease" }}
        >
          <source src={cell.film.src} type={cell.film.src.endsWith(".mov") ? "video/quicktime" : "video/mp4"} />
        </video>
      )}

      {cell.type === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cell.src} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      )}

      {/* Subtle inner shadow for depth */}
      <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [films, setFilms] = useState<Film[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

  useEffect(() => {
    fetch("/api/gallery/films")
      .then((r) => r.json())
      .then((j: { films?: Film[] }) => { if (Array.isArray(j.films)) setFilms(j.films); })
      .catch(() => {});

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

  // 4 video tiles — fall back to skeleton if not enough films
  const pool: Cell[] = Array.from({ length: 4 }, (_, i) =>
    films[i] ? ({ type: "video", film: films[i] } as Cell) : ({ type: "skeleton" } as Cell)
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative h-[100svh] w-full overflow-hidden bg-[#0a0a10]">

        {/* Desktop: 3-col × 2-row asymmetric grid */}
        <div
          className="absolute inset-0 hidden gap-2 p-2 lg:grid"
          style={{
            gridTemplateColumns: "1fr 1.6fr 1fr",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          {/* Tile 0: tall portrait, spans full left column */}
          <BgCell cell={pool[0]} style={{ gridColumn: "1/2", gridRow: "1/3" }} />
          {/* Tile 1: wide landscape, top centre-right */}
          <BgCell cell={pool[1]} style={{ gridColumn: "2/4", gridRow: "1/2" }} />
          {/* Tile 2: bottom centre */}
          <BgCell cell={pool[2]} style={{ gridColumn: "2/3", gridRow: "2/3" }} />
          {/* Tile 3: bottom right */}
          <BgCell cell={pool[3]} style={{ gridColumn: "3/4", gridRow: "2/3" }} />
        </div>

        {/* Mobile: 2-col × 2-row equal grid */}
        <div
          className="absolute inset-0 grid gap-1.5 p-1.5 lg:hidden"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1.4fr 1fr",
          }}
        >
          {/* Tile 0: top full-width landscape */}
          <BgCell cell={pool[0]} style={{ gridColumn: "1/3", gridRow: "1/2" }} />
          {/* Tiles 1-3: bottom row of 3... but we only have 2 cols so show 2 */}
          <BgCell cell={pool[1]} style={{ gridColumn: "1/2", gridRow: "2/3" }} />
          <BgCell cell={pool[2]} style={{ gridColumn: "2/3", gridRow: "2/3" }} />
        </div>

        {/* Very light global dim — let the grid shine through */}
        <div className="absolute inset-0 bg-black/20" />

        {/* ── Text — centered with local dark backdrop ── */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <div className="rounded-3xl px-10 py-8 backdrop-blur-md"
            style={{ background: "rgba(0,0,0,0.52)", boxShadow: "0 0 80px 40px rgba(0,0,0,0.45)" }}>

            <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.35em] text-white/45">
              AI Creative Studio
            </p>

            <h1
              className="mb-6 font-heading font-black leading-[0.88] text-white"
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

    </div>
  );
}
