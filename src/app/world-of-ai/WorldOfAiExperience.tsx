"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
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

const ROTATES = [
  "rotate-[-1.5deg]",
  "rotate-[1deg]",
  "rotate-[-0.8deg]",
  "rotate-[1.5deg]",
  "rotate-[-1deg]",
  "rotate-[0.8deg]",
] as const;

function StickyLabel({
  children,
  className = "",
  tone = "white",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "white" | "blue";
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
  eyebrow,
  title,
  body,
  note,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  note?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">{eyebrow}</p>
      <h2
        className="mt-3 text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.08] text-slate-900"
        style={{ ...HAND, letterSpacing: "-0.03em" }}
      >
        {title}
      </h2>
      {body ? <p className="mt-4 text-[15px] font-light leading-relaxed text-slate-600">{body}</p> : null}
      {note ? (
        <p className="mt-3 inline-block rotate-[6deg] text-sm font-light text-blue-600" style={HAND}>
          {note}
        </p>
      ) : null}
    </div>
  );
}

function SketchCard({
  children,
  className = "",
  rotate = "",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
}) {
  return (
    <div className={`relative border border-blue-200 bg-white p-5 shadow-sm ${rotate} ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" strokeLinejoin="round" />
      {muted ? (
        <path d="m16 9 5 6M21 9l-5 6" strokeLinecap="round" />
      ) : (
        <>
          <path d="M15 9.5a4 4 0 0 1 0 5" strokeLinecap="round" />
          <path d="M18 7a7.5 7.5 0 0 1 0 10" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

function WorldOfAiHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(false);
  const [needsGesture, setNeedsGesture] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = false;
    video.volume = 1;

    const tryPlay = () => {
      void video
        .play()
        .then(() => {
          setNeedsGesture(false);
          if (!video.muted) setMuted(false);
        })
        .catch(() => {
          setNeedsGesture(true);
        });
    };

    if (video.readyState >= 2) tryPlay();
    else video.addEventListener("loadeddata", tryPlay, { once: true });

    return () => video.removeEventListener("loadeddata", tryPlay);
  }, []);

  const enableSoundAndPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    setMuted(false);
    setNeedsGesture(false);
    void video.play().catch(() => {});
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (needsGesture || video.paused) {
      enableSoundAndPlay();
      return;
    }

    video.muted = !video.muted;
    setMuted(video.muted);
  };

  return (
    <header className="overflow-hidden border-b border-blue-100 bg-[#f8fbff]">
      <div className="px-6 pb-5 pt-10 text-center sm:px-8 sm:pt-12">
        <h1
          className="text-[clamp(2.35rem,6vw,5.25rem)] font-light leading-[1.08] text-slate-900"
          style={{ letterSpacing: "-0.04em" }}
        >
          World of AI{" "}
          <span className="font-bold text-blue-700">Multimedia</span>
        </h1>

        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={toggleMute}
            className={`inline-flex items-center gap-2.5 px-4 py-2.5 transition ${
              needsGesture || !muted
                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-300 ring-offset-2 ring-offset-[#f8fbff] hover:bg-blue-700"
                : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300"
            }`}
            aria-label={
              needsGesture ? "Play with sound" : muted ? "Unmute video" : "Mute video"
            }
          >
            <VolumeIcon muted={needsGesture ? false : muted} />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">
              {needsGesture ? "Play with sound" : muted ? "Unmute" : "Mute"}
            </span>
          </button>
        </div>
      </div>

      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <video
          ref={videoRef}
          src="/videos/aiss.mp4"
          poster="/videos/aiss-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          loop
          preload="auto"
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </header>
  );
}

export default function WorldOfAiExperience() {
  return (
    <div className="min-h-screen bg-[#f4f7fc] font-body text-slate-900">
      <Navbar />
      <WorldOfAiHero />

      {/* Interpretations */}
      <SectionShell>
        <SectionHead
          eyebrow={C.interpretations.eyebrow}
          title={C.interpretations.title}
          body={C.interpretations.body}
          note="three takes"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {C.interpretations.takes.map((take, i) => (
            <SketchCard key={take.label} rotate={ROTATES[i]}>
              <StickyLabel className={`text-base ${i === 2 ? "rotate-[1deg]" : "rotate-[-1deg]"}`}>
                {take.label}
              </StickyLabel>
              <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">{take.text}</p>
            </SketchCard>
          ))}
        </div>
      </SectionShell>

      {/* Capability */}
      <SectionShell tint>
        <SectionHead eyebrow={C.capability.eyebrow} title={C.capability.title} body={C.capability.body} />

        <div className="mt-10 overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-6 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] text-blue-500">01</p>
                <h3 className="mt-2 text-2xl font-light text-slate-900" style={HAND}>
                  {C.capability.points[0].title}
                </h3>
                <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-slate-600">
                  {C.capability.points[0].text}
                </p>
              </div>
              <StickyLabel tone="blue" className="rotate-[1.5deg]">
                same world, many frames
              </StickyLabel>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-px bg-blue-100">
            {(["/videos/cs1.mp4", "/videos/cs2.mp4", "/videos/cs3.mp4", "/videos/cs4.mp4"] as const).map(
              (src, i) => (
                <div key={src} className="relative aspect-video bg-slate-950">
                  <DeferredVideo
                    src={src}
                    className="absolute inset-0 h-full w-full object-cover"
                    rootMargin="600px"
                  />
                  <span className="pointer-events-none absolute left-2 top-2 font-mono text-[9px] tracking-[0.18em] text-white/70 sm:left-3 sm:top-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-4 overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-6 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] text-blue-500">02</p>
                <h3 className="mt-2 text-2xl font-light text-slate-900" style={HAND}>
                  {C.capability.points[1].title}
                </h3>
                <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-slate-600">
                  {C.capability.points[1].text}
                </p>
              </div>
              <StickyLabel tone="blue" className="rotate-[-1deg]">
                ten looks before lunch
              </StickyLabel>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-px bg-blue-100">
            {(["/videos/se1.mp4", "/videos/se2.mp4", "/videos/se3.mp4", "/videos/se4.mp4"] as const).map(
              (src, i) => (
                <div key={src} className="relative aspect-video bg-slate-950">
                  <DeferredVideo
                    src={src}
                    className="absolute inset-0 h-full w-full object-cover"
                    rootMargin="600px"
                  />
                  <span className="pointer-events-none absolute left-2 top-2 font-mono text-[9px] tracking-[0.18em] text-white/70 sm:left-3 sm:top-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-4 overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-6 sm:px-8">
            <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
            <div className="relative flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] tracking-[0.2em] text-blue-500">03</p>
                <h3 className="mt-2 text-2xl font-light text-slate-900" style={HAND}>
                  {C.capability.points[2].title}
                </h3>
                <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-slate-600">
                  {C.capability.points[2].text}
                </p>
              </div>
              <StickyLabel className="rotate-[-1.5deg]">worlds on demand</StickyLabel>
            </div>
          </div>
          <div className="relative grid grid-cols-2 gap-px bg-blue-100">
            {(["/videos/we1.mp4", "/videos/we2.mp4", "/videos/we3.mp4", "/videos/we4.mp4"] as const).map(
              (src, i) => (
                <div key={src} className="relative aspect-video bg-slate-950">
                  <DeferredVideo
                    src={src}
                    className="absolute inset-0 h-full w-full object-cover"
                    rootMargin="600px"
                  />
                  <span className="pointer-events-none absolute left-2 top-2 font-mono text-[9px] tracking-[0.18em] text-white/70 sm:left-3 sm:top-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mt-4">
          <SketchCard rotate="rotate-[0.8deg]">
            <p className="font-mono text-[9px] tracking-[0.2em] text-blue-500">04</p>
            <h3 className="mt-2 text-xl font-light text-slate-900" style={HAND}>
              {C.capability.points[3].title}
            </h3>
            <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">
              {C.capability.points[3].text}
            </p>
          </SketchCard>
        </div>
      </SectionShell>

      {/* Three lenses */}
      <SectionShell>
        <SectionHead
          eyebrow={C.lenses.eyebrow}
          title={C.lenses.title}
          body={C.lenses.body}
          note="same tools. three jobs."
        />
        <div className="mt-10 overflow-hidden border border-blue-200 bg-white">
          {C.lenses.items.map((item, i) => (
            <article
              key={item.who}
              className={`relative grid gap-4 px-5 py-8 sm:px-8 md:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)] md:gap-10 ${
                i > 0 ? "border-t border-blue-100" : ""
              }`}
            >
              <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
              <div className="relative">
                <StickyLabel tone={i === 1 ? "blue" : "white"} className={ROTATES[i]}>
                  {item.who}
                </StickyLabel>
                <h3 className="mt-4 text-2xl font-light text-slate-900" style={HAND}>
                  {item.view}
                </h3>
              </div>
              <p className="relative text-[15px] font-light leading-relaxed text-slate-600 md:pt-2">
                {item.text}
              </p>
            </article>
          ))}
        </div>
      </SectionShell>

      {/* Clean vs Natural Realism */}
      <SectionShell tint>
        <SectionHead eyebrow={C.realism.eyebrow} title={C.realism.title} body={C.realism.body} />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <SketchCard rotate="rotate-[-1.5deg]">
            <StickyLabel className="rotate-[-1deg]">{C.realism.clean.title}</StickyLabel>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">{C.realism.clean.text}</p>
          </SketchCard>
          <SketchCard rotate="rotate-[1.5deg]">
            <StickyLabel tone="blue" className="rotate-[1deg]">
              {C.realism.natural.title}
            </StickyLabel>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">{C.realism.natural.text}</p>
          </SketchCard>
        </div>
        <p className="mt-6 max-w-2xl text-sm font-light leading-relaxed text-slate-500">{C.realism.note}</p>
      </SectionShell>

      {/* Efficiency */}
      <SectionShell>
        <SectionHead eyebrow={C.efficiency.eyebrow} title={C.efficiency.title} body={C.efficiency.body} />
        <div className="relative mt-10 overflow-hidden border border-blue-200 bg-white">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-blue-100">
                  <th className="px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Stage
                  </th>
                  <th className="px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                    Traditional
                  </th>
                  <th className="px-5 py-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">
                    AI first
                  </th>
                </tr>
              </thead>
              <tbody>
                {C.efficiency.rows.map((row) => (
                  <tr key={row.label} className="border-b border-blue-50 align-top last:border-0">
                    <td className="px-5 py-5 font-light text-slate-900" style={HAND}>
                      {row.label}
                    </td>
                    <td className="px-5 py-5 font-light text-slate-500">{row.traditional}</td>
                    <td className="px-5 py-5 font-light text-slate-800">{row.aiFirst}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionShell>

      {/* VFX vs AI */}
      <SectionShell tint>
        <SectionHead eyebrow={C.vfx.eyebrow} title={C.vfx.title} body={C.vfx.body} />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <SketchCard rotate="rotate-[-1deg]">
            <StickyLabel>{C.vfx.left.title}</StickyLabel>
            <ul className="mt-5 space-y-3">
              {C.vfx.left.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm font-light leading-relaxed text-slate-600">
                  <span className="text-blue-600" aria-hidden>
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </SketchCard>
          <SketchCard rotate="rotate-[1deg]">
            <StickyLabel tone="blue">{C.vfx.right.title}</StickyLabel>
            <ul className="mt-5 space-y-3">
              {C.vfx.right.points.map((p) => (
                <li key={p} className="flex gap-2 text-sm font-light leading-relaxed text-slate-600">
                  <span className="text-blue-600" aria-hidden>
                    ✓
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </SketchCard>
        </div>
      </SectionShell>

      {/* Pure vs Integrated */}
      <SectionShell id="pipelines">
        <SectionHead eyebrow={C.pureVsIntegrated.eyebrow} title={C.pureVsIntegrated.title} />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <SketchCard rotate="rotate-[-1.5deg]">
            <StickyLabel className="rotate-[-1deg]">{C.pureVsIntegrated.pure.title}</StickyLabel>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">
              {C.pureVsIntegrated.pure.text}
            </p>
          </SketchCard>
          <SketchCard rotate="rotate-[1.5deg]">
            <StickyLabel tone="blue" className="rotate-[1deg]">
              {C.pureVsIntegrated.integrated.title}
            </StickyLabel>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">
              {C.pureVsIntegrated.integrated.text}
            </p>
          </SketchCard>
        </div>
      </SectionShell>

      {/* Regular vs Professional */}
      <SectionShell tint>
        <SectionHead eyebrow={C.usage.eyebrow} title={C.usage.title} note="discipline decides the look" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <SketchCard rotate="rotate-[-1deg]">
            <StickyLabel>{C.usage.regular.title}</StickyLabel>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">{C.usage.regular.text}</p>
          </SketchCard>
          <SketchCard rotate="rotate-[1deg]">
            <StickyLabel tone="blue">{C.usage.professional.title}</StickyLabel>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">
              {C.usage.professional.text}
            </p>
          </SketchCard>
        </div>
      </SectionShell>

      {/* AI as a tool + storyboard */}
      <SectionShell>
        <div className="overflow-hidden border border-blue-200 bg-white">
          <div className="relative border-b border-blue-100 px-5 py-10 sm:px-8 sm:py-12">
            <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
            <div className="relative max-w-3xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">{C.tool.eyebrow}</p>
              <h2
                className="mt-3 text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.08] text-slate-900"
                style={{ ...HAND, letterSpacing: "-0.03em" }}
              >
                {C.tool.title}
              </h2>
              <p className="mt-5 text-[15px] font-light leading-relaxed text-slate-600">{C.tool.body}</p>
              <StickyLabel className="mt-6 rotate-[-1.5deg]">Storyboard first</StickyLabel>
              <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-slate-500">
                Frames on paper before frames on screen. Direction lives here, then AI fills the world.
              </p>
            </div>
          </div>
          <div className="relative bg-slate-50 p-3 sm:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-30" style={GRID_PAPER} aria-hidden />
            <div className="relative overflow-hidden border border-blue-200 bg-white shadow-sm">
              <Image
                src="/images/storyboarding.png"
                alt="Hand drawn storyboard: sixteen panels from a quiet room to a snow filled hallway with penguins"
                width={2752}
                height={1536}
                className="block h-auto w-full"
                sizes="(min-width: 1280px) 1200px, 100vw"
              />
            </div>
            <p
              className="relative mt-3 text-right text-sm font-light text-blue-600"
              style={HAND}
              aria-hidden
            >
              boards before generate
            </p>
          </div>
        </div>
      </SectionShell>

      {/* Problems */}
      <SectionShell tint>
        <SectionHead eyebrow={C.problems.eyebrow} title={C.problems.title} />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {C.problems.items.map((item, i) => (
            <SketchCard key={item.title} rotate={ROTATES[i]}>
              <h3 className="text-xl font-light text-slate-900" style={HAND}>
                {item.title}
              </h3>
              <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">{item.text}</p>
            </SketchCard>
          ))}
        </div>
      </SectionShell>

      {/* Visualization */}
      <SectionShell>
        <div className="overflow-hidden border border-blue-200 bg-white">
          <div className="grid lg:grid-cols-2">
            <div className="relative px-5 py-8 sm:px-8 sm:py-10">
              <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
              <div className="relative">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-blue-600">
                  {C.visualization.eyebrow}
                </p>
                <h2
                  className="mt-3 text-[clamp(2rem,4.5vw,3rem)] font-light leading-[1.08] text-slate-900"
                  style={{ ...HAND, letterSpacing: "-0.03em" }}
                >
                  {C.visualization.title}
                </h2>
                <p className="mt-4 text-[15px] font-light leading-relaxed text-slate-600">
                  {C.visualization.body}
                </p>
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
            </div>
            <div
              className="min-h-[280px] bg-cover bg-center lg:min-h-full"
              style={{ backgroundImage: "url(/images/r1.png)" }}
              role="img"
              aria-label="Property and interior visualization mood"
            />
          </div>
        </div>
      </SectionShell>

      {/* Print */}
      <SectionShell tint>
        <SectionHead eyebrow={C.print.eyebrow} title={C.print.title} body={C.print.body} />
      </SectionShell>

      {/* Enhancement */}
      <SectionShell>
        <SectionHead eyebrow={C.enhance.eyebrow} title={C.enhance.title} body={C.enhance.body} />
      </SectionShell>

      {/* Close CTA */}
      <section className="border-t border-blue-100/60 bg-white py-14 lg:py-20">
        <div className={PAGE}>
          <div className="overflow-hidden border-2 border-blue-700 bg-blue-600 text-white shadow-sm">
            <div className="relative px-5 py-10 sm:px-8 sm:py-14">
              <div className="pointer-events-none absolute inset-0 opacity-20" style={GRID_PAPER} aria-hidden />
              <div className="relative max-w-2xl">
                <h2
                  className="text-[clamp(2rem,5vw,3.4rem)] font-light leading-[1.08]"
                  style={{ ...HAND, letterSpacing: "-0.03em" }}
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
          </div>
        </div>
      </section>
    </div>
  );
}
