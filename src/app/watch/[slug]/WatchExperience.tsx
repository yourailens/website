"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import { homeWatchReel, type HomeWatchTitle } from "@/data/home-watch";

type Props = { title: HomeWatchTitle };

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatTimecode(seconds: number) {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${pad(s / 60)}:${pad(s % 60)}`;
}

function youtubeEmbed(id: string, extra = "") {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  extra.split("&").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (k && v) params.set(k, v);
  });
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

export default function WatchExperience({ title }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [watching, setWatching] = useState(false);
  const [clock, setClock] = useState("00:00");
  const { index, reel } = homeWatchReel(title.slug);
  const poster = title.aspect === "poster";
  const scene = String(index + 1).padStart(2, "0");
  const nextCut = reel[(index + 1) % reel.length];
  const live = !watching && !fullscreen;

  useEffect(() => {
    const onFs = () => {
      const on = Boolean(document.fullscreenElement);
      setFullscreen(on);
      if (!on) setWatching(false);
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const t = videoRef.current?.currentTime ?? 0;
      setClock(formatTimecode(t));
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [title.slug]);

  const playFullscreen = useCallback(async () => {
    const video = videoRef.current;
    const stage = stageRef.current;
    setWatching(true);
    try {
      if (video) {
        video.muted = false;
        video.controls = true;
        video.loop = false;
        video.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
        video.disablePictureInPicture = true;
        await video.play().catch(() => {});
        const webkit = video as HTMLVideoElement & { webkitEnterFullscreen?: () => void };
        if (webkit.webkitEnterFullscreen) {
          webkit.webkitEnterFullscreen();
          return;
        }
        if (video.requestFullscreen) {
          await video.requestFullscreen();
          return;
        }
      }
      if (stage?.requestFullscreen) await stage.requestFullscreen();
    } catch {
      /* gesture / browser may block fullscreen */
    }
  }, []);

  async function sharePage() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${title.title} · YourAILens Studios`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {});
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="ott-home min-h-screen overflow-x-hidden bg-black font-body text-white">
      <Navbar />
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(37,99,235,0.32), transparent 55%), radial-gradient(ellipse 40% 30% at 90% 0%, rgba(29,78,216,0.2), transparent 50%)",
        }}
        aria-hidden
      />

      <main className="relative">
        <section className="px-4 pb-6 pt-4 sm:px-8 lg:px-12">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <Link href={title.railHref} className="text-sm font-semibold text-blue-200 hover:text-white">
              ← {title.railLabel}
            </Link>
            <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">
              SC. {scene} · {title.tag.toUpperCase()} · {clock}
            </p>
          </div>

          <div
            className={`grid items-stretch gap-6 ${
              poster ? "lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]" : "grid-cols-1"
            }`}
          >
            <div
              ref={stageRef}
              className={`group relative overflow-hidden bg-black ${
                poster ? "mx-auto aspect-[2/3] w-full max-w-sm lg:mx-0" : "aspect-video w-full lg:min-h-[68vh]"
              }`}
            >
              <span className="pointer-events-none absolute left-3 top-3 z-20 h-7 w-7 border-l border-t border-white/50 sm:left-4 sm:top-4" aria-hidden />
              <span className="pointer-events-none absolute right-3 top-3 z-20 h-7 w-7 border-r border-t border-white/50 sm:right-4 sm:top-4" aria-hidden />
              <span className="pointer-events-none absolute bottom-3 left-3 z-20 h-7 w-7 border-b border-l border-white/50 sm:bottom-4 sm:left-4" aria-hidden />
              <span className="pointer-events-none absolute bottom-3 right-3 z-20 h-7 w-7 border-b border-r border-white/50 sm:bottom-4 sm:right-4" aria-hidden />

              {title.youtubeId ? (
                <iframe
                  title={title.title}
                  src={youtubeEmbed(title.youtubeId, watching || fullscreen ? "autoplay=1" : "autoplay=1&mute=1")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              ) : title.video ? (
                <DeferredVideo
                  ref={videoRef}
                  src={title.video}
                  poster={title.poster}
                  eager
                  muted={!watching}
                  loop={!watching}
                  controls={watching}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : null}

              {live ? (
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/35" />
              ) : null}

              {live ? (
                <p className="pointer-events-none absolute left-5 top-5 z-20 font-mono text-[10px] tracking-[0.28em] text-blue-300 sm:left-7 sm:top-7">
                  <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  PREVIEW
                </p>
              ) : null}

              {live ? (
                <span
                  className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 font-heading text-[clamp(6rem,18vw,12rem)] leading-none text-white/[0.07] lg:block"
                  aria-hidden
                >
                  {scene}
                </span>
              ) : null}

              {live ? (
                <button
                  type="button"
                  onClick={() => void playFullscreen()}
                  className="absolute left-1/2 top-[46%] z-30 flex h-[5.25rem] w-[5.25rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white shadow-[0_0_40px_rgba(37,99,235,0.35)] backdrop-blur-md transition hover:scale-105 hover:border-white hover:bg-white/20"
                  aria-label="Play in fullscreen"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5.14v13.72L19 12 8 5.14Z" />
                  </svg>
                </button>
              ) : null}

              {live && !poster ? (
                <div className="absolute inset-x-0 bottom-0 z-20 px-5 pb-6 sm:px-8 sm:pb-8">
                  <p className="font-mono text-[10px] tracking-[0.32em] text-blue-300">{title.railLabel.toUpperCase()}</p>
                  <h1 className="mt-2 max-w-[12ch] font-heading text-[clamp(2.4rem,6.5vw,4.6rem)] leading-[0.86]">
                    {title.title}
                  </h1>
                  <p className="mt-3 max-w-lg text-sm text-white/85">{title.description}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void playFullscreen()}
                      className="bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100"
                    >
                      Play in fullscreen
                    </button>
                    <button
                      type="button"
                      onClick={() => void sharePage()}
                      className="border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:border-white"
                    >
                      {copied ? "Link copied" : "Share this cut"}
                    </button>
                    {title.watchUrl && title.watchLabel ? (
                      <a
                        href={title.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="self-center text-sm font-semibold text-blue-200 underline decoration-blue-400 underline-offset-4 hover:text-white"
                      >
                        {title.watchLabel}
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>

            {poster ? (
              <div className="relative flex flex-col justify-end lg:pb-4">
                {live ? (
                  <>
                    <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">{title.railLabel.toUpperCase()}</p>
                    <h1 className="mt-3 max-w-[12ch] font-heading text-[clamp(2.6rem,8vw,5.4rem)] leading-[0.84]">
                      {title.title}
                    </h1>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{title.description}</p>
                    <div className="mt-7 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => void playFullscreen()}
                        className="bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black hover:bg-blue-100"
                      >
                        Play in fullscreen
                      </button>
                      <button
                        type="button"
                        onClick={() => void sharePage()}
                        className="border border-white/35 px-5 py-2.5 text-sm font-semibold text-white hover:border-white"
                      >
                        {copied ? "Link copied" : "Share this cut"}
                      </button>
                      {title.watchUrl && title.watchLabel ? (
                        <a
                          href={title.watchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-blue-200 underline decoration-blue-400 underline-offset-4 hover:text-white"
                        >
                          {title.watchLabel}
                        </a>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-white/60">Playing. Press escape to leave fullscreen.</p>
                )}
              </div>
            ) : null}
          </div>
        </section>

        {reel.length > 1 ? (
          <section className="border-t border-white/10 px-4 py-10 sm:px-8 lg:px-12">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">ON THIS REEL</p>
                <h2 className="mt-2 font-heading text-3xl leading-none">Next cuts</h2>
              </div>
              {nextCut && nextCut.slug !== title.slug ? (
                <Link href={`/watch/${nextCut.slug}`} className="text-sm font-semibold text-blue-200 hover:text-white">
                  Up next · {nextCut.title} →
                </Link>
              ) : null}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {reel.map((cut, i) => {
                const on = cut.slug === title.slug;
                const n = String(i + 1).padStart(2, "0");
                return (
                  <Link
                    key={cut.slug}
                    href={`/watch/${cut.slug}`}
                    aria-current={on ? "page" : undefined}
                    className={`group relative shrink-0 overflow-hidden ${
                      cut.aspect === "poster" ? "aspect-[2/3] w-[42vw] sm:w-[9.5rem]" : "aspect-video w-[68vw] sm:w-[16.5rem]"
                    } ${on ? "ring-2 ring-blue-500" : "ring-1 ring-white/10 hover:ring-white/40"}`}
                  >
                    {cut.youtubeId ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-black" />
                    ) : cut.video ? (
                      <DeferredVideo
                        src={cut.video}
                        poster={cut.poster}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <span className="absolute left-2 top-2 font-heading text-lg leading-none text-white/80">{n}</span>
                    <span className="absolute inset-x-2 bottom-2 truncate text-xs font-medium text-white">{cut.title}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
