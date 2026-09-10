"use client";

import Image from "next/image";
import Link from "next/link";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import { WORLD_OF_AI as C } from "@/data/world-of-ai-copy";

const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";
const HAND = { fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" } as const;
const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

function StickyLabel({
  children,
  className = "",
  tone = "paper",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "paper" | "blue";
}) {
  return (
    <p
      className={`inline-block border px-3 py-1.5 text-lg shadow-sm ${
        tone === "blue"
          ? "border-2 border-blue-700 bg-blue-600 text-white"
          : "border border-blue-600 bg-white text-slate-900"
      } ${className}`}
      style={HAND}
    >
      {children}
    </p>
  );
}

function SectionShell({
  children,
  className = "",
  id,
  tint = false,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tint?: boolean;
}) {
  const inner = (
    <div id={id} className={`${PAGE} py-14 lg:py-20 ${className}`}>
      {children}
    </div>
  );
  if (tint) {
    return <HomeBlueTint className="border-t border-blue-100/60">{inner}</HomeBlueTint>;
  }
  return <section className="border-t border-blue-100/60 bg-white">{inner}</section>;
}

function SectionHead({
  index,
  eyebrow,
  title,
  body,
  note,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  body?: string;
  note?: string;
}) {
  return (
    <div className="relative max-w-3xl">
      {index ? (
        <p
          className="pointer-events-none absolute -left-2 -top-12 font-heading text-[clamp(5rem,14vw,9rem)] leading-none text-blue-600/[0.08] sm:-top-16"
          aria-hidden
        >
          {index}
        </p>
      ) : null}
      <div className="mb-4 flex items-center gap-3">
        <span className="h-px w-8 bg-blue-400/80" aria-hidden />
        <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">{eyebrow}</p>
      </div>
      <h2
        className="font-heading text-[clamp(2.2rem,5.4vw,4.2rem)] leading-[0.92] text-slate-900"
        style={{ letterSpacing: "-0.05em" }}
      >
        {title}
      </h2>
      {body ? (
        <p className="mt-4 max-w-2xl text-[15px] font-light leading-relaxed text-slate-600">{body}</p>
      ) : null}
      {note ? (
        <p className="mt-3 inline-block rotate-[6deg] text-sm font-light text-blue-600" style={HAND}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

function Still({
  src,
  alt,
  className = "",
  sizes = "(min-width: 1024px) 42vw, 100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-blue-50 ${className}`}>
      <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} />
    </div>
  );
}

function Clip({
  src,
  className = "",
  stamp,
}: {
  src: string;
  className?: string;
  stamp?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-slate-950 ${className}`}>
      <DeferredVideo src={src} className="absolute inset-0 h-full w-full object-cover" rootMargin="500px" />
      {stamp ? (
        <span className="pointer-events-none absolute left-2.5 top-2.5 font-mono text-[9px] tracking-[0.2em] text-white/85">
          {stamp}
        </span>
      ) : null}
    </div>
  );
}

function Shot({
  children,
  className = "",
  rotate = "",
  label,
  tone = "paper",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
  label?: string;
  tone?: "paper" | "blue";
}) {
  return (
    <figure className={`relative ${rotate} ${className}`}>
      <div className="relative border border-blue-200 bg-white p-1.5 shadow-[0_22px_50px_-30px_rgba(37,99,235,0.5)]">
        <span className="pointer-events-none absolute left-0 top-0 z-[1] h-2.5 w-2.5 border-l border-t border-blue-400" aria-hidden />
        <span className="pointer-events-none absolute right-0 top-0 z-[1] h-2.5 w-2.5 border-r border-t border-blue-400" aria-hidden />
        <span className="pointer-events-none absolute bottom-0 left-0 z-[1] h-2.5 w-2.5 border-b border-l border-blue-400" aria-hidden />
        <span className="pointer-events-none absolute bottom-0 right-0 z-[1] h-2.5 w-2.5 border-b border-r border-blue-400" aria-hidden />
        {children}
      </div>
      {label ? (
        <figcaption className="mt-2">
          <StickyLabel tone={tone} className="!text-sm">
            {label}
          </StickyLabel>
        </figcaption>
      ) : null}
    </figure>
  );
}

function VsBadge() {
  return (
    <div className="relative z-[2] flex items-center justify-center md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
      <span
        className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-200/60"
        style={HAND}
      >
        vs
      </span>
    </div>
  );
}

function PromptSlab({
  label,
  prompt,
  tone = "paper",
}: {
  label: string;
  prompt: string;
  tone?: "paper" | "blue";
}) {
  return (
    <div
      className={`border px-4 py-3 font-mono text-[12px] leading-relaxed ${
        tone === "blue" ? "border-blue-600 bg-blue-600 text-white" : "border-blue-200 bg-white text-slate-600"
      }`}
    >
      <p className={`text-[9px] uppercase tracking-[0.22em] ${tone === "blue" ? "text-blue-100" : "text-blue-500"}`}>
        {label}
      </p>
      <p className="mt-2">{prompt}</p>
    </div>
  );
}

function DiceMark() {
  return (
    <div
      className="inline-flex h-12 w-12 rotate-[8deg] items-center justify-center border-2 border-blue-600 bg-white shadow-sm"
      aria-hidden
    >
      <span className="grid grid-cols-2 gap-1 p-1">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
      </span>
    </div>
  );
}

const CS = ["/videos/cs1.mp4", "/videos/cs2.mp4", "/videos/cs3.mp4", "/videos/cs4.mp4"] as const;
const SE = ["/videos/se1.mp4", "/videos/se2.mp4", "/videos/se3.mp4", "/videos/se4.mp4"] as const;
const WE = ["/videos/we1.mp4", "/videos/we2.mp4", "/videos/we3.mp4", "/videos/we4.mp4"] as const;
const PROOF = [
  { src: "/images/cologne.png", alt: "Fragrance still" },
  { src: "/images/shoe.png", alt: "Footwear still" },
  { src: "/images/otshirt1.png", alt: "Apparel still one" },
  { src: "/images/otshirt2.png", alt: "Apparel still two" },
  { src: "/images/img6.png", alt: "Product hero still" },
  { src: "/images/img7.png", alt: "Social suite still" },
] as const;
const CAST = [
  { src: "/images/img1.jpeg", alt: "Talent frame one" },
  { src: "/images/img2.jpeg", alt: "Talent frame two" },
  { src: "/images/ws1.png", alt: "Talent frame three" },
  { src: "/images/ai_avatar1.jpeg", alt: "Directed character still" },
] as const;

export default function WorldOfAiBody() {
  return (
    <>
      <SectionShell>
        <SectionHead
          index="01"
          eyebrow={C.interpretations.eyebrow}
          title={C.interpretations.title}
          body={C.interpretations.body}
          note="pick a take. own it."
        />
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <article>
            <Shot rotate="rotate-[-1.5deg]" label={C.interpretations.takes[0].label}>
              <Still src="/images/img3.jpeg" alt="Playful generated still" className="aspect-[3/4]" />
            </Shot>
            <p className="mt-4 font-mono text-[9px] tracking-[0.22em] text-blue-500">TAKE 01</p>
            <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{C.interpretations.takes[0].text}</p>
          </article>
          <article>
            <Shot rotate="rotate-[1.5deg]" label={C.interpretations.takes[1].label}>
              <Still src="/images/img2.jpeg" alt="Editorial portrait with a harder read" className="aspect-[3/4]" />
            </Shot>
            <p className="mt-4 font-mono text-[9px] tracking-[0.22em] text-blue-500">TAKE 02</p>
            <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{C.interpretations.takes[1].text}</p>
          </article>
          <article className="sm:col-span-2">
            <Shot rotate="rotate-[-0.4deg]" label={C.interpretations.takes[2].label} tone="blue">
              <Clip src="/videos/yailhp.mp4" stamp="03" className="aspect-video" />
            </Shot>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">TAKE 03</p>
                <p className="mt-2 max-w-2xl text-sm font-light leading-relaxed text-slate-600">
                  {C.interpretations.takes[2].text}
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.22em] text-blue-600" style={HAND}>
                ← this is us
              </p>
            </div>
          </article>
        </div>
      </SectionShell>

      <SectionShell tint>
        <SectionHead
          index="02"
          eyebrow={C.capability.eyebrow}
          title={C.capability.title}
          body={C.capability.body}
          note="studio level, not party tricks"
        />

        <article className="mt-12 grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">01</p>
            <h3 className="mt-2 font-heading text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.95] text-slate-900">
              {C.capability.points[0].title}
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{C.capability.points[0].text}</p>
            <StickyLabel tone="blue" className="mt-5 rotate-[-1.5deg] !text-sm">
              same world, many frames
            </StickyLabel>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {CS.map((src, i) => (
              <Shot key={src} rotate={i % 2 ? "rotate-[1.2deg]" : "rotate-[-1deg]"}>
                <Clip src={src} stamp={String(i + 1).padStart(2, "0")} className="aspect-video" />
              </Shot>
            ))}
          </div>
        </article>

        <article className="mt-16">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-lg">
              <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">02</p>
              <h3 className="mt-2 font-heading text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.95] text-slate-900">
                {C.capability.points[1].title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{C.capability.points[1].text}</p>
            </div>
            <StickyLabel className="rotate-[2deg] !text-sm">ten looks before lunch</StickyLabel>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {SE.map((src, i) => (
              <Shot key={src} className="min-w-[70%] sm:min-w-[40%] lg:min-w-0 lg:flex-1" rotate={i === 1 || i === 3 ? "rotate-[1deg]" : "rotate-[-1deg]"}>
                <Clip src={src} stamp={String(i + 1).padStart(2, "0")} className="aspect-[4/5] sm:aspect-video" />
              </Shot>
            ))}
          </div>
        </article>

        <article className="mt-16 grid items-center gap-10 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-lg overflow-hidden p-3 sm:p-4">
            <div className="relative aspect-[4/3] w-full">
              {WE.slice(0, 3).map((src, i) => (
                <Shot
                  key={src}
                  className={`absolute w-[68%] ${
                    i === 0
                      ? "left-0 top-6 z-[1] rotate-[-7deg]"
                      : i === 1
                        ? "right-0 top-0 z-[2] rotate-[5deg]"
                        : "bottom-0 left-[16%] z-[3] rotate-[-2deg]"
                  }`}
                >
                  <Clip src={src} stamp={String(i + 1).padStart(2, "0")} className="aspect-video" />
                </Shot>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">03</p>
            <h3 className="mt-2 font-heading text-[clamp(1.8rem,3vw,2.8rem)] leading-[0.95] text-slate-900">
              {C.capability.points[2].title}
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{C.capability.points[2].text}</p>
            <StickyLabel tone="blue" className="mt-5 rotate-[1.5deg] !text-sm">
              worlds on demand
            </StickyLabel>
          </div>
        </article>

        <article className="relative mt-16 overflow-hidden border border-blue-200">
          <Still src="/images/hr1.png" alt="Directed campaign still" className="min-h-[320px] aspect-[16/8] lg:min-h-[420px]" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/88 to-transparent" />
          <div className="absolute inset-0 flex items-center px-5 sm:px-10">
            <div className="max-w-md">
              <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">04</p>
              <h3 className="mt-2 font-heading text-[clamp(2rem,4vw,3.4rem)] leading-[0.92] text-slate-900">
                {C.capability.points[3].title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{C.capability.points[3].text}</p>
              <p className="mt-4 text-sm text-blue-600" style={HAND}>
                taste still wins
              </p>
            </div>
          </div>
        </article>
      </SectionShell>

      <SectionShell>
        <SectionHead
          index="03"
          eyebrow={C.lenses.eyebrow}
          title={C.lenses.title}
          body={C.lenses.body}
          note="same tools. three jobs."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            { item: C.lenses.items[0], media: "still" as const, src: "/images/ws3.png", alt: "Creator facing camera" },
            { item: C.lenses.items[1], media: "clip" as const, src: "/videos/sd1.mp4", alt: "" },
            { item: C.lenses.items[2], media: "still" as const, src: "/images/ws1.png", alt: "Audience facing still" },
          ].map((row, i) => (
            <article
              key={row.item.who}
              className={`group relative min-h-[460px] overflow-hidden border border-blue-200 ${
                i === 1 ? "md:-translate-y-6 md:shadow-[0_28px_60px_-32px_rgba(37,99,235,0.45)]" : ""
              }`}
            >
              {row.media === "clip" ? (
                <Clip src={row.src} className="absolute inset-0" stamp={`L${String(i + 1).padStart(2, "0")}`} />
              ) : (
                <Still src={row.src} alt={row.alt} className="absolute inset-0" sizes="(min-width: 768px) 33vw, 100vw" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">
                  LENS {String(i + 1).padStart(2, "0")}
                </p>
                <StickyLabel tone={i === 1 ? "blue" : "paper"} className="mt-3 !text-sm">
                  {row.item.who}
                </StickyLabel>
                <h3 className="mt-3 font-heading text-[clamp(1.6rem,2.4vw,2.1rem)] leading-[0.95] text-slate-900">
                  {row.item.view}
                </h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{row.item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell tint>
        <SectionHead
          index="04"
          eyebrow={C.realism.eyebrow}
          title={C.realism.title}
          body={C.realism.body}
          note="pick one language. hold it."
        />
        <div className="relative mt-12 grid overflow-hidden border border-blue-200 md:grid-cols-2">
          <div className="relative min-h-[380px]">
            <Still src="/images/cologne.png" alt="Clean studio product still" className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <StickyLabel className="rotate-[-1deg]">{C.realism.clean.title}</StickyLabel>
              <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-slate-700">{C.realism.clean.text}</p>
            </div>
          </div>
          <VsBadge />
          <div className="relative min-h-[380px] border-t border-blue-200 md:border-l md:border-t-0">
            <Still src="/images/w2.png" alt="Natural lifestyle still" className="absolute inset-0" />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/55 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <StickyLabel tone="blue" className="rotate-[1deg]">
                {C.realism.natural.title}
              </StickyLabel>
              <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-slate-700">{C.realism.natural.text}</p>
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-slate-500">{C.realism.note}</p>
      </SectionShell>

      <SectionShell>
        <SectionHead
          index="05"
          eyebrow={C.efficiency.eyebrow}
          title={C.efficiency.title}
          body={C.efficiency.body}
          note="front load taste. multiply output."
        />
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {PROOF.map((img, i) => (
            <Shot key={img.src} rotate={i % 2 ? "rotate-[1.4deg]" : "rotate-[-1.2deg]"}>
              <Still src={img.src} alt={img.alt} className="aspect-square" sizes="(min-width: 1024px) 16vw, 50vw" />
            </Shot>
          ))}
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          {C.efficiency.rows.map((row, i) => (
            <div key={row.label} className="grid overflow-hidden border border-blue-200 bg-white sm:grid-cols-2">
              <div className="border-b border-blue-100 px-5 py-4 sm:col-span-2 sm:border-b sm:border-blue-100">
                <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 font-heading text-2xl leading-none text-slate-900">{row.label}</h3>
              </div>
              <div className="border-b border-blue-100 px-5 py-4 sm:border-b-0 sm:border-r">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-slate-400">Traditional</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-slate-500">{row.traditional}</p>
              </div>
              <div className="bg-blue-50/80 px-5 py-4">
                <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-blue-600">AI first</p>
                <p className="mt-2 text-sm font-light leading-relaxed text-slate-800">{row.aiFirst}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionShell>

      <SectionShell tint>
        <SectionHead index="06" eyebrow={C.vfx.eyebrow} title={C.vfx.title} body={C.vfx.body} note="pros use both" />
        <div className="relative mt-12 grid gap-6 lg:grid-cols-2">
          <Shot className="lg:translate-y-6" rotate="rotate-[-2deg]" label={C.vfx.left.title}>
            <Clip src="/videos/fpv.mp4" stamp="VFX" className="aspect-video" />
          </Shot>
          <Shot className="lg:-translate-y-4" rotate="rotate-[2.2deg]" label={C.vfx.right.title} tone="blue">
            <Clip src="/videos/yailintro.mp4" stamp="AI" className="aspect-video" />
          </Shot>
          <VsBadge />
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ul className="space-y-3">
            {C.vfx.left.points.map((p) => (
              <li key={p} className="flex gap-2 text-sm font-light leading-relaxed text-slate-600">
                <span className="text-blue-600" aria-hidden>
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
          <ul className="space-y-3">
            {C.vfx.right.points.map((p) => (
              <li key={p} className="flex gap-2 text-sm font-light leading-relaxed text-slate-600">
                <span className="text-blue-600" aria-hidden>
                  ✓
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </SectionShell>

      <SectionShell id="pipelines">
        <SectionHead
          index="07"
          eyebrow={C.pureVsIntegrated.eyebrow}
          title={C.pureVsIntegrated.title}
          note="two valid pipelines"
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <article>
            <div className="grid grid-cols-[1fr_0.72fr] gap-2">
              <Shot rotate="rotate-[-1.5deg]">
                <Clip src="/videos/vf01.mp4" stamp="A" className="aspect-[3/4]" />
              </Shot>
              <Shot rotate="rotate-[2deg]" className="self-end">
                <Still src="/images/ai_avatar1.jpeg" alt="Pure generated character" className="aspect-[3/4]" />
              </Shot>
            </div>
            <p className="mt-5 font-mono text-[9px] tracking-[0.22em] text-blue-500">PIPELINE A</p>
            <StickyLabel className="mt-2 rotate-[-1deg]">{C.pureVsIntegrated.pure.title}</StickyLabel>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{C.pureVsIntegrated.pure.text}</p>
          </article>
          <article>
            <div className="grid grid-cols-[0.72fr_1fr] gap-2">
              <Shot rotate="rotate-[-2deg]" className="self-end">
                <Still src="/images/shoe.png" alt="Captured product plate" className="aspect-[3/4]" />
              </Shot>
              <Shot rotate="rotate-[1.5deg]" label="live + gen" tone="blue">
                <Clip src="/videos/earbuds_commercial.mp4" stamp="B" className="aspect-[3/4] sm:aspect-video lg:aspect-[3/4]" />
              </Shot>
            </div>
            <p className="mt-5 font-mono text-[9px] tracking-[0.22em] text-blue-500">PIPELINE B</p>
            <StickyLabel tone="blue" className="mt-2 rotate-[1deg]">
              {C.pureVsIntegrated.integrated.title}
            </StickyLabel>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{C.pureVsIntegrated.integrated.text}</p>
          </article>
        </div>
      </SectionShell>

      <SectionShell tint>
        <SectionHead
          index="08"
          eyebrow={C.usage.eyebrow}
          title={C.usage.title}
          body={C.usage.body}
          note="same model. two jobs."
        />

        <div className="relative mt-12 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <article className="min-w-0 border border-blue-200 bg-white p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">TAKE A</p>
                <StickyLabel className="mt-3 rotate-[-1.5deg]">{C.usage.regular.title}</StickyLabel>
                <p className="mt-3 text-sm text-blue-600" style={HAND}>
                  {C.usage.regular.kicker}
                </p>
              </div>
              <DiceMark />
            </div>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">{C.usage.regular.text}</p>
            <div className="mt-5">
              <PromptSlab label="prompt" prompt={C.usage.regular.prompt} />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { src: "/images/img3.jpeg", alt: "Unguided still one" },
                { src: "/images/img1.jpeg", alt: "Unguided still two" },
                { src: "/images/ai_avatar2.jpeg", alt: "Unguided still three" },
              ].map((img, i) => (
                <Shot key={img.src} rotate={i === 1 ? "rotate-[2deg]" : "rotate-[-2deg]"}>
                  <Still src={img.src} alt={img.alt} className="aspect-[3/4]" sizes="20vw" />
                  <span className="pointer-events-none absolute left-1.5 top-1.5 z-[2] border border-blue-200 bg-white px-1.5 py-0.5 font-mono text-[8px] tracking-[0.14em] text-blue-600">
                    ?
                  </span>
                </Shot>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {C.usage.regular.chips.map((chip) => (
                <span
                  key={chip}
                  className="border border-dashed border-blue-300 bg-blue-50 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500"
                >
                  {chip}
                </span>
              ))}
            </div>
          </article>

          <div className="flex items-center justify-center lg:hidden">
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-sm font-bold uppercase tracking-[0.12em] text-white"
              style={HAND}
            >
              vs
            </span>
          </div>

          <article className="min-w-0 border-2 border-blue-600 bg-white p-4 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">TAKE B</p>
                <StickyLabel tone="blue" className="mt-3 rotate-[1deg]">
                  {C.usage.professional.title}
                </StickyLabel>
                <p className="mt-3 text-sm text-blue-600" style={HAND}>
                  {C.usage.professional.kicker}
                </p>
              </div>
              <p className="text-right font-mono text-[10px] tracking-[0.18em] text-blue-500">
                35 mm
                <br />
                f 2.8
              </p>
            </div>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">{C.usage.professional.text}</p>
            <div className="mt-5">
              <PromptSlab label="shot brief" prompt={C.usage.professional.prompt} tone="blue" />
            </div>
            <Shot className="mt-4" rotate="rotate-[-0.6deg]">
              <div className="relative">
                <Still src="/images/img5.jpeg" alt="Directed frame with camera language" className="aspect-[16/10]" />
                <span className="pointer-events-none absolute left-3 top-3 border border-white/70 bg-white/90 px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-blue-700">
                  MCU
                </span>
                <span className="pointer-events-none absolute right-3 top-3 border border-white/70 bg-white/90 px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-blue-700">
                  tungsten
                </span>
                <span className="pointer-events-none absolute bottom-3 left-3 border border-white/70 bg-white/90 px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-blue-700">
                  eyeline hold
                </span>
                <span className="pointer-events-none absolute bottom-3 right-3 border border-white/70 bg-white/90 px-2 py-0.5 font-mono text-[9px] tracking-[0.16em] text-blue-700">
                  take 04
                </span>
                <span className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 border border-white/60" aria-hidden />
              </div>
            </Shot>
            <div className="mt-4 flex flex-wrap gap-2">
              {C.usage.professional.chips.map((chip) => (
                <span
                  key={chip}
                  className="border border-blue-600 bg-blue-600 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-white"
                >
                  {chip}
                </span>
              ))}
            </div>
          </article>

          <div className="pointer-events-none absolute left-1/2 top-1/2 z-[3] hidden -translate-x-1/2 -translate-y-1/2 lg:block">
            <span
              className="inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-blue-600 bg-blue-600 text-sm font-bold uppercase tracking-[0.12em] text-white shadow-lg shadow-blue-200/60"
              style={HAND}
            >
              vs
            </span>
          </div>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">{C.tool.eyebrow}</p>
            <h2
              className="mt-3 font-heading text-[clamp(2rem,5vw,3.6rem)] leading-[0.92] text-slate-900"
              style={{ letterSpacing: "-0.04em" }}
            >
              {C.tool.title}
            </h2>
            <p className="mt-5 max-w-xl text-[15px] font-light leading-relaxed text-slate-600">{C.tool.body}</p>
            <StickyLabel tone="blue" className="mt-6 rotate-[-1.5deg]">
              Storyboard first
            </StickyLabel>
            <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-500">
              Frames on paper before frames on screen. Direction lives here, then AI fills the world.
            </p>
          </div>
          <Shot rotate="rotate-[1.8deg]" label="the cut" tone="blue">
            <Clip src="/videos/conssc.mp4" stamp="LIVE" className="aspect-video" />
          </Shot>
        </div>
        <Shot className="mt-8" rotate="rotate-[-0.4deg]" label="boards before generate">
          <div className="relative aspect-[16/9] overflow-hidden bg-white">
            <Image
              src="/images/storyboarding.png"
              alt="Hand drawn storyboard: sixteen panels from a quiet room to a snow filled hallway with penguins"
              fill
              className="object-contain object-center"
              sizes="(min-width: 1280px) 1200px, 100vw"
            />
          </div>
        </Shot>
      </SectionShell>

      <SectionShell tint>
        <SectionHead index="09" eyebrow={C.problems.eyebrow} title={C.problems.title} note="quietly fixed" />
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <article className="border border-blue-200 bg-white p-4 md:col-span-3">
            <Shot rotate="rotate-[-1deg]">
              <Still src="/images/hr1.png" alt="Custom scene instead of stock" className="aspect-[16/10]" />
            </Shot>
            <h3 className="mt-4 font-heading text-2xl text-slate-900">{C.problems.items[0].title}</h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{C.problems.items[0].text}</p>
          </article>
          <article className="border border-blue-200 bg-white p-4 md:col-span-3">
            <Shot rotate="rotate-[1deg]">
              <Clip src="/videos/w2.mp4" stamp="B-ROLL" className="aspect-[16/10]" />
            </Shot>
            <h3 className="mt-4 font-heading text-2xl text-slate-900">{C.problems.items[1].title}</h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{C.problems.items[1].text}</p>
          </article>
          <article className="border border-blue-200 bg-white p-4 md:col-span-4">
            <div className="grid grid-cols-4 gap-2">
              {CAST.map((img) => (
                <Shot key={img.src}>
                  <Still src={img.src} alt={img.alt} className="aspect-[3/4]" sizes="20vw" />
                </Shot>
              ))}
            </div>
            <h3 className="mt-4 font-heading text-2xl text-slate-900">{C.problems.items[2].title}</h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{C.problems.items[2].text}</p>
          </article>
          <article className="border border-blue-200 bg-white p-4 md:col-span-2">
            <div className="grid grid-cols-2 gap-2">
              <Shot rotate="rotate-[-2deg]">
                <Still src="/images/otshirt1.png" alt="Market cut one" className="aspect-square" sizes="20vw" />
              </Shot>
              <Shot rotate="rotate-[2deg]">
                <Still src="/images/otshirt2.png" alt="Market cut two" className="aspect-square" sizes="20vw" />
              </Shot>
            </div>
            <h3 className="mt-4 font-heading text-2xl text-slate-900">{C.problems.items[3].title}</h3>
            <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{C.problems.items[3].text}</p>
          </article>
        </div>
      </SectionShell>

      <SectionShell>
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">{C.visualization.eyebrow}</p>
            <h2
              className="mt-3 font-heading text-[clamp(2rem,4.5vw,3.2rem)] leading-[0.92] text-slate-900"
              style={{ letterSpacing: "-0.04em" }}
            >
              {C.visualization.title}
            </h2>
            <p className="mt-4 text-[15px] font-light leading-relaxed text-slate-600">{C.visualization.body}</p>
            <ul className="mt-6 space-y-2">
              {C.visualization.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm font-light text-slate-700">
                  <span className="text-blue-600" aria-hidden>
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <Shot className="lg:col-span-7" rotate="rotate-[-0.8deg]">
            <Still
              src="/images/r1.png"
              alt="Property visualization shown on site"
              className="aspect-[16/10] min-h-[280px]"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
          </Shot>
          <Shot className="lg:col-span-4 lg:-mt-8" rotate="rotate-[2deg]">
            <Still src="/images/ws2.png" alt="Lifestyle interior mood" className="aspect-[4/3]" />
          </Shot>
          <Shot className="lg:col-span-4 lg:-mt-8" rotate="rotate-[-1.5deg]">
            <Still src="/images/bmacro.png" alt="Material and detail study" className="aspect-[4/3]" />
          </Shot>
          <Shot className="lg:col-span-4 lg:-mt-8" rotate="rotate-[1deg]">
            <Still src="/images/bd2.jpeg" alt="Furnished room study" className="aspect-[4/3]" />
          </Shot>
        </div>
      </SectionShell>

      <SectionShell tint>
        <SectionHead eyebrow={C.print.eyebrow} title={C.print.title} body={C.print.body} />
        <div className="mt-10 border border-blue-200 bg-white p-3 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">PROOF · BLEED 3mm</p>
            <p className="text-xs text-blue-600" style={HAND}>
              survives ink
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[
              { src: "/images/cologne.png", alt: "Print ready fragrance key" },
              { src: "/images/shoe.png", alt: "Print ready footwear key" },
              { src: "/images/otshirt1.png", alt: "Print ready apparel key" },
              { src: "/images/hqps.png", alt: "Print ready campaign still" },
            ].map((img, i) => (
              <Shot key={img.src} rotate={i % 2 ? "rotate-[0.8deg]" : "rotate-[-0.8deg]"}>
                <Still src={img.src} alt={img.alt} className="aspect-[3/4]" sizes="25vw" />
              </Shot>
            ))}
          </div>
        </div>
        <div className="mt-8 grid items-center gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">{C.enhance.eyebrow}</p>
            <h3 className="mt-3 font-heading text-[clamp(1.8rem,3vw,2.6rem)] leading-[0.95] text-slate-900">
              {C.enhance.title}
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{C.enhance.body}</p>
          </div>
          <Shot rotate="rotate-[1.5deg]" label="last mile">
            <Still src="/images/img4.jpeg" alt="Delivery ready enhanced still" className="aspect-[4/3]" />
          </Shot>
        </div>
      </SectionShell>

      <section className="border-t border-blue-100 bg-white py-14 lg:py-20">
        <div className={PAGE}>
          <div className="grid overflow-hidden border-2 border-blue-700 bg-blue-600 text-white lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative px-5 py-10 sm:px-8 sm:py-14">
              <div className="pointer-events-none absolute inset-0 opacity-20" style={GRID_PAPER} aria-hidden />
              <div className="relative max-w-2xl">
                <h2
                  className="font-heading text-[clamp(2rem,5vw,3.6rem)] leading-[0.92]"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {C.close.title}
                </h2>
                <p className="mt-4 text-[15px] font-light leading-relaxed text-blue-100">{C.close.body}</p>
                <Link
                  href="/contact"
                  className="mt-8 inline-block rotate-[-1.5deg] border-2 border-white bg-white px-6 py-3 text-lg font-light text-blue-700 shadow-sm transition hover:bg-blue-50"
                  style={HAND}
                >
                  {C.close.cta}
                </Link>
              </div>
            </div>
            <div className="relative min-h-[220px] border-t border-white/20 lg:border-l lg:border-t-0">
              <Still src="/images/hr1.png" alt="Directed frame worth shipping" className="absolute inset-0" sizes="40vw" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
