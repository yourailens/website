"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import {
  CropMarks,
  GRID_PAPER,
  HAND,
  OfferingCta,
  PAGE,
  SectionHead,
  SectionShell,
  SketchCard,
  StickyLabel,
} from "@/components/offerings/OfferingSketch";
import { AI_ADS as C, AI_ADS_REEL } from "@/data/ai-ads-copy";

function FilmGate({
  no,
  title,
  video,
  poster,
}: {
  no: string;
  title: string;
  video: string;
  poster?: string;
}) {
  return (
    <article className="relative min-w-0">
      <div className="relative aspect-video overflow-hidden bg-black">
        <DeferredVideo
          src={video}
          poster={poster}
          rootMargin="1800px"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />
        <p className="pointer-events-none absolute left-2 top-2 font-mono text-[9px] tracking-[0.22em] text-white/90">
          {no}
        </p>
        <p className="pointer-events-none absolute bottom-2 left-2 max-w-[80%] truncate text-[11px] font-light tracking-wide text-white">
          {title}
        </p>
      </div>
    </article>
  );
}

function Hero() {
  return (
    <header className="overflow-hidden border-b border-blue-100 bg-[#f8fbff]">
      <div className={`${PAGE} pb-10 pt-12 text-center lg:pb-12 lg:pt-16`}>
        <div className="mb-4 flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-blue-400/80" aria-hidden />
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">{C.hero.eyebrow}</p>
          <span className="h-px w-8 bg-blue-400/80" aria-hidden />
        </div>
        <h1
          className="text-[clamp(2.35rem,6vw,5.25rem)] font-light leading-[1.08] text-slate-900"
          style={{ letterSpacing: "-0.04em" }}
        >
          {C.hero.title}{" "}
          <span className="relative my-2 inline-block rotate-[-1deg] whitespace-nowrap border border-blue-200/80 bg-white px-[0.22em] py-[0.08em] shadow-[0_12px_30px_-16px_rgba(37,99,235,0.55)]">
            <span className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
            <span className="relative z-[1] font-bold tracking-[-0.055em] text-blue-700">
              {C.hero.accent}
              <span className="text-blue-400">.</span>
            </span>
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-sm font-light leading-[1.85] text-slate-600 sm:text-[15px]">
          {C.hero.body}
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <StickyLabel tone="blue">SPOT 01</StickyLabel>
          <StickyLabel className="rotate-[-2deg]">ship ready</StickyLabel>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-10 lg:px-10">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/70 to-slate-100 p-2 shadow-[0_28px_70px_-32px_rgba(37,99,235,0.45)] ring-1 ring-blue-100/70 sm:p-3">
          <CropMarks />
          <div className="flex items-center justify-between gap-4 px-3 pb-2 pt-1 sm:px-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-700">YourAILens Studios</p>
            <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-blue-600/70">AI Ads</p>
          </div>
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
            <DeferredVideo
              src="/videos/d&d.mp4"
              poster="/videos/dnd-poster.jpg"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default function AiAdsExperience() {
  return (
    <div className="min-h-screen bg-white font-body text-slate-900">
      <Navbar />
      <Hero />

      <SectionShell tint>
        <SectionHead
          eyebrow={C.promise.eyebrow}
          title={C.promise.title}
          accent={C.promise.accent}
          body={C.promise.body}
          note="brand first"
        />
        <div className="mt-12 grid border border-blue-100 lg:grid-cols-3">
          {C.pillars.map((item) => (
            <div
              key={item.no}
              className="border-t border-blue-100 bg-white px-6 py-7 first:border-t-0 lg:border-l lg:border-t-0 lg:first:border-l-0"
            >
              <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">{item.no}</p>
              <h3 className="mt-3 text-2xl font-light text-slate-900">{item.title}</h3>
              <p className="mt-2 max-w-[16rem] text-sm font-light leading-relaxed text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead eyebrow={C.craft.eyebrow} title={C.craft.title} body={C.craft.body} note="look locked" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {C.craft.items.map((item, i) => (
            <SketchCard key={item.title} rotate={i % 2 === 0 ? "rotate-[-0.8deg]" : "rotate-[0.8deg]"}>
              <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 text-xl font-light text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{item.detail}</p>
            </SketchCard>
          ))}
        </div>
      </SectionShell>

      <SectionShell tint>
        <div className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 bg-blue-400/80" aria-hidden />
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">What&apos;s required</p>
        </div>
        <h2
          className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.08] text-slate-900"
          style={{ letterSpacing: "-0.04em" }}
        >
          You bring three things.
        </h2>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {["BRIEF", "BUDGET", "TIME"].map((word, i) => (
            <div
              key={word}
              className={`border border-blue-200 bg-white px-5 py-3 shadow-sm sm:px-6 ${
                i === 0 ? "rotate-[-1.5deg]" : i === 1 ? "rotate-[1deg]" : "rotate-[-0.5deg]"
              }`}
            >
              <p className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl" style={HAND}>
                {word}
              </p>
            </div>
          ))}
          <div className="rotate-[2deg] border-2 border-blue-700 bg-blue-600 px-5 py-3 shadow-sm sm:px-7">
            <p className="text-xl font-semibold tracking-tight text-white sm:text-2xl" style={HAND}>
              AD
            </p>
          </div>
        </div>
        <div className="mt-10 grid border border-blue-100 lg:grid-cols-3">
          {C.youBring.map((item) => (
            <div
              key={item.no}
              className="border-t border-blue-100 bg-white px-6 py-7 first:border-t-0 lg:border-l lg:border-t-0 lg:first:border-l-0"
            >
              <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">{item.no}</p>
              <h3 className="mt-3 text-2xl font-light text-slate-900">{item.label}</h3>
              <p className="mt-2 max-w-[16rem] text-sm font-light leading-relaxed text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead eyebrow={C.reel.eyebrow} title={C.reel.title} body={C.reel.body} />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {AI_ADS_REEL.map((film) => (
            <FilmGate key={film.no} no={film.no} title={film.title} video={film.video} poster={film.poster} />
          ))}
        </div>
      </SectionShell>

      <SectionShell tint>
        <SectionHead eyebrow={C.process.eyebrow} title={C.process.title} note="four beats" />
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {C.process.steps.map((step) => (
            <div key={step.no} className="border border-blue-100 bg-white px-5 py-6">
              <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">{step.no}</p>
              <h3 className="mt-3 text-lg font-light text-slate-900">{step.label}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell>
        <SectionHead eyebrow={C.formats.eyebrow} title={C.formats.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {C.formats.items.map((item, i) => (
            <SketchCard key={item.title} rotate={i % 2 === 0 ? "rotate-[-0.6deg]" : "rotate-[0.6deg]"}>
              <h3 className="text-xl font-light text-slate-900">{item.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{item.detail}</p>
            </SketchCard>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-blue-100 pt-10">
          <p className="text-sm font-light text-slate-600">Building longer stories?</p>
          <Link
            href="/ai-filmmaking"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-700 transition hover:text-blue-900"
          >
            See AI Filmmaking →
          </Link>
          <Link
            href="/pricing"
            className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-800"
          >
            Pricing →
          </Link>
        </div>
      </SectionShell>

      <OfferingCta eyebrow={C.cta.eyebrow} title={C.cta.title} accent={C.cta.accent} />
    </div>
  );
}
