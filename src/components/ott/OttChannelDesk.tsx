"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SpotPlayer from "@/components/ads/SpotPlayer";
import {
  ottCutAspectLabel,
  ottCutFrameClass,
  ottCutYoutubeId,
  type OttCut,
  type OttCutAspect,
} from "@/data/ott-cuts";

type Filter =
  | { id: "all"; label: string }
  | { id: "spots"; label: string }
  | { id: "stills"; label: string }
  | { id: OttCutAspect; label: string };

const CHANNELS = [
  { href: "/ai-ads", label: "AI ads" },
  { href: "/ai-filmmaking", label: "AI films" },
  { href: "/ai-verse", label: "AI community" },
] as const;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function matches(cut: OttCut, filter: Filter) {
  if (filter.id === "all") return true;
  if (filter.id === "spots") return cut.media_type === "video";
  if (filter.id === "stills") return cut.media_type === "image";
  return cut.aspect_ratio === filter.id;
}

function CutThumb({ cut, className }: { cut: OttCut; className?: string }) {
  const yt = ottCutYoutubeId(cut.media_url);
  if (yt) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" className={className} />;
  }
  if (cut.media_type === "video") {
    return (
      <video
        src={cut.media_url}
        poster={cut.poster_url ?? undefined}
        className={className}
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cut.media_url} alt="" className={className} />;
}

export type OttChannelDeskProps = {
  cuts: OttCut[];
  path: string;
  scene: string;
  title: string;
  blurb: string;
  videoLabel: string;
  videoFilter: string;
  emptyNone: string;
  emptyHint: string;
};

export default function OttChannelDesk({
  cuts,
  path,
  scene,
  title,
  blurb,
  videoLabel,
  videoFilter,
  emptyNone,
  emptyHint,
}: OttChannelDeskProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [filterId, setFilterId] = useState<Filter["id"]>("all");
  const [activeId, setActiveId] = useState<string | null>(cuts[0]?.id ?? null);
  const [mode, setMode] = useState<"preview" | "playing" | "paused">("preview");
  const [copied, setCopied] = useState(false);

  const filters = useMemo<Filter[]>(() => {
    const aspects = Array.from(new Set(cuts.map((c) => c.aspect_ratio)));
    const next: Filter[] = [
      { id: "all", label: "All" },
      { id: "spots", label: videoFilter },
      { id: "stills", label: "Stills" },
    ];
    for (const aspect of aspects) {
      next.push({ id: aspect, label: ottCutAspectLabel(aspect) });
    }
    return next;
  }, [cuts, videoFilter]);

  const filter = filters.find((f) => f.id === filterId) ?? filters[0];
  const visible = useMemo(() => cuts.filter((c) => matches(c, filter)), [cuts, filter]);
  const active = visible.find((c) => c.id === activeId) ?? visible[0] ?? null;
  const takeNo = active ? pad(cuts.findIndex((c) => c.id === active.id) + 1) : "00";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const slug = window.location.hash.replace(/^#/, "");
    if (!slug) return;
    const found = cuts.find((c) => c.slug === slug);
    if (found) setActiveId(found.id);
  }, [cuts]);

  useEffect(() => {
    if (active && !visible.some((c) => c.id === active.id)) {
      setActiveId(visible[0]?.id ?? null);
    }
  }, [visible, active]);

  useEffect(() => {
    setMode("preview");
  }, [active?.id]);

  const select = useCallback((cut: OttCut) => {
    setActiveId(cut.id);
    setMode("preview");
    window.history.replaceState(null, "", `#${cut.slug}`);
    stageRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, []);

  async function shareCut() {
    if (!active) return;
    const url = `${window.location.origin}${path}#${active.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: active.caption, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      <Navbar />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 8% 0%, rgba(37,99,235,0.28), transparent 55%), radial-gradient(ellipse 40% 30% at 92% 8%, rgba(29,78,216,0.16), transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[90rem] lg:grid lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:items-start">
        <aside className="border-b border-white/10 px-5 py-5 lg:sticky lg:top-16 lg:h-[calc(100svh-4rem)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:border-white/10 lg:px-5 lg:py-8">
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CHANNEL {scene}</p>
          <h1 className="mt-2 font-heading text-[clamp(2.2rem,5vw,3.1rem)] leading-none">{title}</h1>
          <p className="mt-3 hidden max-w-xs text-sm text-white/65 lg:block">{blurb}</p>

          <nav className="mt-6 hidden lg:block" aria-label="Take filters">
            <p className="font-mono text-[10px] tracking-[0.22em] text-white/35">TAKES</p>
            <ul className="mt-2 space-y-0.5">
              {filters.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setFilterId(f.id)}
                    className={`w-full px-2 py-1.5 text-left text-sm ${
                      filter.id === f.id ? "bg-[#fafafa] font-semibold text-black" : "text-white/75 hover:text-white"
                    }`}
                  >
                    {f.label}
                    <span className="ml-2 font-mono text-[10px] opacity-50">
                      {cuts.filter((c) => matches(c, f)).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-6 hidden lg:block">
            <p className="font-mono text-[10px] tracking-[0.22em] text-white/35">CHANNELS</p>
            <ul className="mt-2 space-y-1">
              {CHANNELS.map((ch) => {
                const live = ch.href === path;
                return (
                  <li key={ch.href}>
                    <Link href={ch.href} className={`text-sm ${live ? "text-white" : "text-white/55 hover:text-white"}`}>
                      {live ? "● " : ""}
                      {ch.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link href="/contact" className="mt-6 inline-flex bg-[#fafafa] px-4 py-2 text-sm font-semibold text-black hover:bg-blue-100">
              Book a call
            </Link>
          </div>
        </aside>

        <div className="min-w-0 px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pt-8">
          <div
            className="sticky top-16 z-20 -mx-4 mb-4 flex gap-2 overflow-x-auto border-b border-white/10 bg-black/80 px-4 py-2 backdrop-blur-md lg:hidden"
            style={{ scrollbarWidth: "none" }}
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterId(f.id)}
                className={`shrink-0 px-3 py-1.5 text-xs font-semibold ${
                  filter.id === f.id ? "bg-[#fafafa] text-black" : "border border-white/25 text-white/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {active ? (
            <section ref={stageRef} className="relative">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">
                    TAKE {takeNo} · {active.media_type === "video" ? videoLabel : "STILL"} · {ottCutAspectLabel(active.aspect_ratio)}
                  </p>
                  <h2 className="mt-1 font-heading text-[clamp(1.8rem,4vw,2.8rem)] leading-none">{active.caption}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {active.media_type === "video" ? (
                    <button
                      type="button"
                      onClick={() => setMode(mode === "playing" ? "paused" : "playing")}
                      className="bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
                    >
                      {mode === "playing" ? "Pause" : "Play"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => void shareCut()}
                    className="border border-white/30 px-4 py-2 text-sm font-semibold text-white hover:border-white"
                  >
                    {copied ? "Copied" : "Share"}
                  </button>
                </div>
              </div>

              <div
                className={`relative mx-auto overflow-hidden bg-black ${
                  active.aspect_ratio === "story" || active.aspect_ratio === "portrait"
                    ? `w-full max-w-sm ${ottCutFrameClass(active.aspect_ratio)}`
                    : `w-full max-w-5xl ${ottCutFrameClass(active.aspect_ratio)}`
                }`}
              >
                {mode === "preview" ? (
                  <>
                    <span className="pointer-events-none absolute left-3 top-3 z-20 h-6 w-6 border-l border-t border-white/50" aria-hidden />
                    <span className="pointer-events-none absolute right-3 top-3 z-20 h-6 w-6 border-r border-t border-white/50" aria-hidden />
                    <span className="pointer-events-none absolute bottom-3 left-3 z-20 h-6 w-6 border-b border-l border-white/50" aria-hidden />
                    <span className="pointer-events-none absolute bottom-3 right-3 z-20 h-6 w-6 border-b border-r border-white/50" aria-hidden />
                    <span className="pointer-events-none absolute -right-1 top-1/2 z-10 hidden -translate-y-1/2 font-heading text-[clamp(5rem,14vw,9rem)] leading-none text-white/[0.07] sm:block" aria-hidden>
                      {takeNo}
                    </span>
                  </>
                ) : null}

                {active.media_type === "video" ? (
                  ottCutYoutubeId(active.media_url) ? (
                    mode === "playing" ? (
                      <iframe
                        key={`${active.id}-yt`}
                        src={`https://www.youtube.com/embed/${ottCutYoutubeId(active.media_url)}?rel=0&modestbranding=1&playsinline=1&autoplay=1`}
                        title={active.caption}
                        className="absolute inset-0 h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${ottCutYoutubeId(active.media_url)}/hqdefault.jpg`}
                          alt={active.caption}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setMode("playing")}
                          className="absolute inset-0 z-20 flex items-center justify-center"
                          aria-label={`Play ${active.caption}`}
                        >
                          <span className="flex h-16 w-16 items-center justify-center border border-blue-300/50 bg-blue-600/80 shadow-[0_0_32px_rgba(37,99,235,0.55)] backdrop-blur-sm">
                            <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                          </span>
                        </button>
                      </>
                    )
                  ) : (
                    <SpotPlayer
                      key={active.id}
                      src={active.media_url}
                      poster={active.poster_url}
                      caption={active.caption}
                      mode={mode}
                      onMode={setMode}
                    />
                  )
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={active.id} src={active.media_url} alt={active.caption} className="absolute inset-0 h-full w-full object-cover" />
                )}
              </div>

              {active.description ? (
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">{active.description}</p>
              ) : null}
            </section>
          ) : (
            <section className="border border-white/15 bg-black/40 px-5 py-16 text-center">
              <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">NO SIGNAL</p>
              <h2 className="mt-3 font-heading text-3xl leading-none">
                {cuts.length === 0 ? emptyNone : `No ${filter.label.toLowerCase()} in the sheet`}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/65">
                {cuts.length === 0 ? emptyHint : "Try another take filter, or book a call for a new cut."}
              </p>
              <Link href="/contact" className="mt-6 inline-flex bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100">
                Book a call
              </Link>
            </section>
          )}

          {visible.length > 0 ? (
            <section className="mt-10">
              <div className="mb-4 flex items-end justify-between gap-3">
                <h3 className="font-heading text-2xl leading-none">{filter.label}</h3>
                <Link href="/contact" className="text-sm font-semibold text-white/70 hover:text-white lg:hidden">
                  Book a call
                </Link>
              </div>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {visible.map((cut) => {
                  const n = pad(cuts.findIndex((c) => c.id === cut.id) + 1);
                  const on = active?.id === cut.id;
                  return (
                    <li key={cut.id}>
                      <button
                        type="button"
                        onClick={() => select(cut)}
                        className={`group w-full text-left ${on ? "ring-1 ring-white" : ""}`}
                      >
                        <span className="relative block aspect-video overflow-hidden bg-black">
                          <CutThumb cut={cut} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                          <span className="pointer-events-none absolute left-2 top-2 font-heading text-lg leading-none text-white/90">{n}</span>
                          {on ? (
                            <span className="pointer-events-none absolute right-2 top-2 font-mono text-[10px] tracking-[0.2em] text-blue-300">NOW</span>
                          ) : null}
                          {cut.media_type === "video" ? (
                            <span className="pointer-events-none absolute bottom-2 right-2 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white/90" />
                          ) : null}
                        </span>
                        <span className="mt-2 block truncate font-heading text-base leading-none sm:text-lg">{cut.caption}</span>
                        <span className="mt-1 block font-mono text-[10px] tracking-[0.18em] text-white/40">
                          {cut.media_type === "video" ? videoLabel : "STILL"} · {ottCutAspectLabel(cut.aspect_ratio)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-4 border-t border-white/10 pt-6 text-sm text-white/55 lg:hidden">
            {CHANNELS.filter((c) => c.href !== path).map((ch) => (
              <Link key={ch.href} href={ch.href} className="hover:text-white">
                {ch.label} →
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
