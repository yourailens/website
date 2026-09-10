"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { WORLD_OF_AI as C } from "@/data/world-of-ai-copy";
import WorldOfAiBody from "./WorldOfAiBody";

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

function formatTimecode(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = Math.floor(safe % 60);
  const f = Math.floor((safe % 1) * 24);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;
}

const HERO_TICKER = [
  "the medium",
  "not a filter",
  "directed generation",
  "consistency",
  "speed with taste",
  "worlds on demand",
  "human cut",
  "look through the lens",
] as const;

function FilmSprockets({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col justify-between py-2 ${className}`} aria-hidden>
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} className="mx-auto block h-3 w-3 rounded-[2px] bg-blue-600/80" />
      ))}
    </div>
  );
}

function LensFocusRing() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full animate-spin"
      style={{ animationDuration: "28s" }}
      aria-hidden
    >
      <circle cx="50" cy="50" r="49.2" fill="none" stroke="#93c5fd" strokeWidth="0.35" />
      <circle
        cx="50"
        cy="50"
        r="47.4"
        fill="none"
        stroke="#2563eb"
        strokeWidth="1.15"
        strokeDasharray="0.55 2.35"
        opacity="0.85"
      />
      <circle cx="50" cy="50" r="44.8" fill="none" stroke="#bfdbfe" strokeWidth="0.25" />
    </svg>
  );
}

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
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
  const [muted, setMuted] = useState(true);
  const [clock, setClock] = useState("00:00:00:00");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.volume = 1;
    const tryPlay = () => void video.play().catch(() => {});
    const onTime = () => setClock(formatTimecode(video.currentTime));
    tryPlay();
    video.addEventListener("canplay", tryPlay);
    video.addEventListener("timeupdate", onTime);
    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.removeEventListener("timeupdate", onTime);
    };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    if (!video.muted) video.volume = 1;
    setMuted(video.muted);
    if (video.paused) void video.play().catch(() => {});
  };

  return (
    <header className="relative overflow-x-hidden border-b border-blue-100 bg-[#f8fbff]">
      <style>{`
        @keyframes woai-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
      <div className="pointer-events-none absolute inset-0 opacity-60" style={GRID_PAPER} aria-hidden />
      <div
        className="pointer-events-none absolute -left-24 top-10 h-[28rem] w-[28rem] rounded-full bg-blue-400/20 blur-[110px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-blue-300/25 blur-[90px]"
        aria-hidden
      />

      <div className={`${PAGE} relative z-[1] pt-8 lg:pt-10`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <StickyLabel tone="blue" className="rotate-[-2deg] !text-sm">
              {C.eyebrow}
            </StickyLabel>
            <StickyLabel className="rotate-[3deg] !text-sm">essay 01</StickyLabel>
          </div>
          <p className="flex items-center gap-3 font-mono text-[10px] tracking-[0.28em] text-blue-500">
            <span className="inline-flex items-center gap-1.5 text-blue-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" aria-hidden />
              LIVE
            </span>
            <span>{clock}</span>
          </p>
        </div>

        <div className="relative mt-6 grid items-center gap-10 pb-10 lg:mt-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,32rem)] lg:gap-0 lg:pb-8">
          <div className="relative z-[2] lg:py-8 lg:pr-4">
            <p className="mb-3 text-sm font-light text-blue-600 sm:rotate-[-2deg]" style={HAND}>
              look through it. then decide.
            </p>
            <h1 className="font-heading leading-[0.78] text-slate-900" style={{ letterSpacing: "-0.06em" }}>
              <span className="block text-[clamp(4.5rem,15vw,10.5rem)]">AI</span>
              <span className="mt-1 flex flex-wrap items-end gap-x-4 gap-y-2">
                <span className="relative text-[clamp(4.5rem,15vw,10.5rem)] text-blue-600">
                  Verse
                  <span
                    className="pointer-events-none absolute -right-4 -top-3 hidden rotate-[12deg] text-base text-blue-600 sm:block"
                    style={HAND}
                    aria-hidden
                  >
                    ← the lens
                  </span>
                </span>
              </span>
            </h1>
            <p
              className="mt-4 inline-block rotate-[-1.5deg] border border-blue-200 bg-white px-3 py-1 text-[clamp(1.4rem,3vw,2.1rem)] font-light text-blue-700 shadow-sm"
              style={HAND}
            >
              Multimedia.
            </p>
            <p className="mt-6 max-w-md text-[15px] font-light leading-[1.85] text-slate-600">{C.lead}</p>
            <p className="mt-3 max-w-sm text-sm font-light leading-relaxed text-slate-500">
              Not a player. A point of view. Tap the glass if you want sound.
            </p>
          </div>

          <div className="relative z-[1] mx-auto w-full max-w-[26rem] justify-self-center lg:-ml-16 lg:max-w-none lg:justify-self-end">
            <div
              className="pointer-events-none absolute -left-6 top-[18%] z-[3] hidden rotate-[-8deg] lg:block"
              aria-hidden
            >
              <span
                className="inline-block border border-blue-300 bg-white px-2.5 py-1 text-xs text-blue-700 shadow-sm"
                style={HAND}
              >
                hold the look
              </span>
            </div>
            <div
              className="pointer-events-none absolute -right-2 bottom-[22%] z-[3] hidden rotate-[8deg] xl:block"
              aria-hidden
            >
              <span
                className="inline-block border-2 border-blue-700 bg-blue-600 px-2.5 py-1 text-xs text-white shadow-sm"
                style={HAND}
              >
                not a filter
              </span>
            </div>

            <div className="flex items-stretch gap-2">
              <FilmSprockets className="hidden w-5 shrink-0 sm:flex" />
              <div className="group relative aspect-square w-full rotate-[-3deg] rounded-full border-[10px] border-white bg-slate-900 shadow-[0_40px_90px_-36px_rgba(37,99,235,0.55)] ring-1 ring-blue-200 transition hover:rotate-[-1.5deg] sm:border-[14px]">
                <span className="pointer-events-none absolute -inset-3 rounded-full border border-blue-200/80" aria-hidden />
                <span className="pointer-events-none absolute -inset-6 rounded-full border border-dashed border-blue-300/70" aria-hidden />
                <LensFocusRing />

                <div className="absolute inset-[7%] overflow-hidden rounded-full bg-black sm:inset-[8%]">
                  <video
                    ref={videoRef}
                    src="/videos/aiss.mp4"
                    poster="/videos/aiss-poster.jpg"
                    className="absolute inset-0 h-full w-full scale-110 object-cover"
                    autoPlay
                    playsInline
                    loop
                    muted={muted}
                    preload="auto"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <span
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_54%,rgba(15,23,42,0.28)_100%)]"
                    aria-hidden
                  />
                  <span className="pointer-events-none absolute left-1/2 top-[12%] h-[76%] w-px -translate-x-1/2 bg-white/25" aria-hidden />
                  <span className="pointer-events-none absolute left-[12%] top-1/2 h-px w-[76%] -translate-y-1/2 bg-white/25" aria-hidden />
                  <span className="pointer-events-none absolute left-[18%] top-[18%] h-4 w-4 border-l border-t border-white/70" aria-hidden />
                  <span className="pointer-events-none absolute right-[18%] top-[18%] h-4 w-4 border-r border-t border-white/70" aria-hidden />
                  <span className="pointer-events-none absolute bottom-[18%] left-[18%] h-4 w-4 border-b border-l border-white/70" aria-hidden />
                  <span className="pointer-events-none absolute bottom-[18%] right-[18%] h-4 w-4 border-b border-r border-white/70" aria-hidden />
                </div>

                <span
                  className={`pointer-events-none absolute bottom-[11%] left-1/2 z-[4] inline-flex -translate-x-1/2 items-center gap-2 rounded-full px-3.5 py-2 shadow-lg transition ${
                    muted ? "bg-blue-600/95 text-white group-hover:bg-blue-700" : "bg-white text-blue-700"
                  }`}
                >
                  <VolumeIcon muted={muted} />
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                    {muted ? "Tap for sound" : "Sound on"}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "Unmute video" : "Mute video"}
                  className="absolute inset-0 z-[5] rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                />
              </div>
              <FilmSprockets className="hidden w-5 shrink-0 sm:flex" />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-[1] border-t border-blue-100 bg-white/80">
        <div className="overflow-hidden py-3">
          <div
            className="flex w-max gap-8 pr-8 font-mono text-[10px] uppercase tracking-[0.32em] text-blue-600/80"
            style={{ animation: "woai-marquee 32s linear infinite" }}
          >
            {[...HERO_TICKER, ...HERO_TICKER].map((item, i) => (
              <span key={`${item}-${i}`} className="flex items-center gap-8">
                {item}
                <span className="h-1 w-1 rounded-full bg-blue-500" aria-hidden />
              </span>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}


export default function WorldOfAiExperience() {
  return (
    <div className="min-h-screen bg-white font-body text-slate-900">
      <Navbar />
      <WorldOfAiHero />
      <WorldOfAiBody />
    </div>
  );
}
