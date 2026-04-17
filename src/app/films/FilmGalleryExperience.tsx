"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { categoryLabel, GALLERY_CATEGORY_TABS, type FilmCategory, type GalleryFilm } from "@/data/gallery";
import { galleryRouteId } from "@/lib/gallery/route-id";

function isPortraitFilm(film: GalleryFilm) {
  return film.orientation === "portrait";
}

function videoType(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const previewPlayPromises = new WeakMap<HTMLVideoElement, Promise<void>>();

function safePlay(video: HTMLVideoElement | null | undefined) {
  if (!video) return;
  const p = video.play();
  if (p !== undefined) {
    previewPlayPromises.set(video, p);
    void p.catch(() => {});
  }
}

function safePausePreview(video: HTMLVideoElement | null | undefined) {
  if (!video) return;
  const p = previewPlayPromises.get(video);
  if (p) {
    void p
      .then(() => {
        video.pause();
        video.currentTime = 0;
      })
      .catch(() => {})
      .finally(() => previewPlayPromises.delete(video));
  } else {
    video.pause();
    video.currentTime = 0;
  }
}

const noDownloadVideoProps = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

function useTheaterAmbientMirror(
  open: number | null,
  theaterRef: RefObject<HTMLVideoElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>
) {
  useEffect(() => {
    if (open === null) return;
    const video = theaterRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const DPR = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const bw = Math.max(320, Math.floor(w * 0.42 * DPR));
      const bh = Math.max(180, Math.floor(h * 0.42 * DPR));
      canvas.width = bw;
      canvas.height = bh;
    };

    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let alive = true;
    const tick = () => {
      if (!alive) return;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && vw > 0 && vh > 0 && canvas.width > 0) {
        try {
          ctx.drawImage(video, 0, 0, vw, vh, 0, 0, canvas.width, canvas.height);
        } catch {
          /* ignore */
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [open, theaterRef, canvasRef]);
}

export default function FilmGalleryExperience({ films }: { films: GalleryFilm[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<FilmCategory | null>(null);
  const theaterRef = useRef<HTMLVideoElement>(null);
  const ambientCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useTheaterAmbientMirror(open, theaterRef, ambientCanvasRef);

  const heroLoopSrc = useMemo(() => {
    const mp4 = films.find((f) => /\.mp4$/i.test(f.src));
    return mp4?.src ?? "/videos/v5.mp4";
  }, [films]);

  const visibleFilms = useMemo(() => {
    return films.map((f, i) => ({ f, i })).filter(
      ({ f }) => categoryFilter === null || f.category === categoryFilter
    );
  }, [films, categoryFilter]);

  const close = useCallback(() => {
    const v = theaterRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setOpen(null);
  }, []);

  const go = useCallback((dir: -1 | 1) => {
    setOpen((i) => {
      if (i === null) return null;
      const n = films.length;
      return (i + dir + n) % n;
    });
  }, [films.length]);

  useEffect(() => {
    if (open === null) {
      document.body.style.overflow = "";
      return;
    }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close, go]);

  useLayoutEffect(() => {
    if (open === null) return;
    const main = theaterRef.current;
    if (!main) return;
    main.load();
    const p = main.play();
    void p?.catch(() => {});
  }, [open]);

  const requestFullscreen = () => {
    const v = theaterRef.current;
    if (!v) return;
    if (v.requestFullscreen) void v.requestFullscreen();
    else if ((v as unknown as { webkitRequestFullscreen?: () => void }).webkitRequestFullscreen) {
      (v as unknown as { webkitRequestFullscreen: () => void }).webkitRequestFullscreen();
    }
  };

  const total = films.length;

  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.load();
    const kick = () => void v.play().catch(() => {});
    kick();
    v.addEventListener("loadeddata", kick);
    v.addEventListener("canplay", kick);
    const onVis = () => {
      if (document.visibilityState === "visible") kick();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", kick);
    return () => {
      v.removeEventListener("loadeddata", kick);
      v.removeEventListener("canplay", kick);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("focus", kick);
    };
  }, [heroLoopSrc]);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-50/90 via-white to-sky-50/40 text-slate-900 antialiased">
      {/* Blue-forward atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(1400px_720px_at_100%_0%,rgb(59_130_246/0.18),transparent_55%),radial-gradient(1000px_560px_at_0%_30%,rgb(37_99_235/0.12),transparent_50%),radial-gradient(800px_480px_at_80%_100%,rgb(14_165_233/0.14),transparent_45%)]"
        aria-hidden
      />

      <div className="relative">
        <Navbar />

        <main className="w-full pb-24 pt-6 sm:pt-8 lg:pt-10">
          {/* Hero — visible MP4 background; light scrim so video reads; minimal copy */}
          <section
            className="relative mx-4 mb-12 min-h-[min(58vh,640px)] overflow-hidden rounded-3xl bg-slate-900 shadow-2xl shadow-blue-900/25 ring-1 ring-blue-300/40 sm:mx-6 lg:mx-10 lg:mb-16 lg:min-h-[min(62vh,720px)] xl:mx-14 2xl:mx-20"
            aria-labelledby="films-hero-heading"
          >
            <video
              ref={heroVideoRef}
              src={heroLoopSrc}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="absolute inset-0 z-0 h-full min-h-full w-full object-cover"
              aria-hidden
              {...noDownloadVideoProps}
            />
            {/* Keep most of the frame clear so you actually see motion */}
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-slate-950/35 via-transparent to-slate-950/75"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[45%] bg-gradient-to-t from-blue-950/85 via-blue-950/40 to-transparent"
              aria-hidden
            />

            <div className="relative z-10 flex min-h-[min(58vh,640px)] flex-col justify-between gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:min-h-[min(62vh,720px)] lg:px-12 lg:py-12">
              <div className="flex items-center justify-between gap-4">
                <Link
                  href="/"
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 transition-colors hover:text-white"
                >
                  ← Home
                </Link>
                <span className="rounded-full bg-black/35 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80 ring-1 ring-white/15 backdrop-blur-sm">
                  {total} films · muted loop
                </span>
              </div>

              <div className="max-w-xl">
                <h1
                  id="films-hero-heading"
                  className="font-heading text-5xl font-black leading-none tracking-tight text-white sm:text-6xl lg:text-7xl"
                >
                  Films
                </h1>
                <p className="mt-3 text-base text-white/75 sm:text-lg">Hover to preview · Tap to open</p>
              </div>
            </div>
          </section>

          {/* Filters + grid — max width matches homepage work sections */}
          <div className="w-full border-t border-blue-100/80 bg-gradient-to-b from-blue-50/50 to-transparent px-4 pb-4 pt-10 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
            <div className="mx-auto w-full max-w-[min(100%,96rem)]">
              <div className="mb-8 lg:mb-10">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-800/60">Category</p>
                <div
                  className="inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-blue-200/70 bg-blue-100/40 p-1.5 shadow-inner shadow-blue-200/30"
                  role="tablist"
                  aria-label="Filter by category"
                >
                  {GALLERY_CATEGORY_TABS.map((tab) => (
                    <button
                      key={tab.label}
                      type="button"
                      role="tab"
                      aria-selected={categoryFilter === tab.id}
                      onClick={() => setCategoryFilter(tab.id)}
                      className={`rounded-xl px-5 py-3 text-xs font-bold uppercase tracking-wide transition ${
                        categoryFilter === tab.id
                          ? "bg-blue-600 text-white shadow-md shadow-blue-400/30"
                          : "text-blue-900/70 hover:bg-white/60 hover:text-blue-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">Library</span>
                <h2 className="font-heading text-[clamp(1.5rem,3vw,2.25rem)] font-black tracking-tight text-slate-900" style={{ letterSpacing: "-0.03em" }}>
                  Featured cuts
                </h2>
              </div>

            <ul className="grid list-none grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {visibleFilms.map(({ f: film, i }, rowPos) => {
                const portrait = isPortraitFilm(film);
                return (
                  <li key={film.id ?? `${film.src}-${i}`} className="min-h-0">
                    <Link
                      href={`/films/${encodeURIComponent(galleryRouteId(film, i))}`}
                      className="gallery-card-enter group relative block w-full overflow-hidden rounded-2xl bg-white text-left shadow-lg transition-shadow duration-300 hover:shadow-xl hover:shadow-slate-300/95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                      style={{ animationDelay: `${Math.min(rowPos, 12) * 30}ms` }}
                      onMouseEnter={(e) => {
                        const v = e.currentTarget.querySelector("video");
                        if (v instanceof HTMLVideoElement) safePlay(v);
                      }}
                      onMouseLeave={(e) => {
                        const v = e.currentTarget.querySelector("video");
                        if (v instanceof HTMLVideoElement) safePausePreview(v);
                      }}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                        <video
                          className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 ease-out will-change-transform group-hover:scale-[1.03]"
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          {...noDownloadVideoProps}
                        >
                          <source src={film.src} type={videoType(film.src)} />
                        </video>
                        <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        {portrait ? (
                          <span className="absolute left-3 top-3 z-[2] rounded border border-white/25 bg-black/55 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95 backdrop-blur-sm">
                            Vertical
                          </span>
                        ) : null}
                        <div className="absolute right-3 top-3 z-[2] flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-blue-600 shadow-md ring-1 ring-slate-200/80 transition duration-300 group-hover:scale-105 sm:h-12 sm:w-12">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 sm:ml-1" aria-hidden>
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <div className="absolute inset-x-0 bottom-0 z-[2] p-4 pt-12 sm:p-5 sm:pt-14">
                          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200 sm:text-[11px]">
                            {categoryLabel(film.category)}
                          </span>
                          <p className="font-heading text-xl font-bold leading-tight text-white sm:text-2xl lg:text-[1.65rem]">{film.title}</p>
                          {film.peopleTags?.length ? (
                            <p className="mt-1 text-[11px] text-blue-100/85">{film.peopleTags.join(" · ")}</p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {visibleFilms.length === 0 && (
              <p className="py-16 text-center text-sm text-blue-900/50">No films in this category yet.</p>
            )}

            </div>
          </div>
        </main>
      </div>

      {open !== null && (
        <div
          className="fixed inset-0 z-[200] flex flex-col bg-gradient-to-b from-blue-50/95 via-white/95 to-sky-50/90 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-label="Film viewer"
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <canvas
              ref={ambientCanvasRef}
              className="h-full w-full scale-[1.12] object-cover opacity-90"
              style={{
                filter: "blur(44px) brightness(1.06) saturate(1.12)",
                transformOrigin: "50% 50%",
                WebkitBackfaceVisibility: "hidden",
                backfaceVisibility: "hidden",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-100/50 via-white/55 to-cyan-50/45" />
          </div>

          <header className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-blue-200/60 bg-white/85 px-4 py-4 shadow-sm shadow-blue-100/50 sm:px-8 lg:px-12">
            <div className="min-w-0 pl-1">
              <p className="truncate font-heading text-lg font-bold text-blue-950 sm:text-xl">{films[open].title}</p>
              <p className="mt-0.5 text-[11px] font-medium text-blue-700/70">
                Clip {open + 1} of {total}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                aria-label="Previous film"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-900 transition hover:bg-blue-50"
                aria-label="Next film"
              >
                →
              </button>
              <button
                type="button"
                onClick={requestFullscreen}
                className="rounded-xl border border-blue-800 bg-blue-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-blue-800"
              >
                Full screen
              </button>
              <button
                type="button"
                onClick={close}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </header>

          <div
            className="relative z-10 flex min-h-0 flex-1 flex-col px-4 pb-8 pt-6 sm:px-8 lg:px-12 xl:px-16"
            onClick={close}
          >
            <div
              className="mx-auto flex w-full max-w-[min(100%,1600px)] flex-1 flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* max-h + max-w + w-auto: element tracks clip aspect — no letterboxing inside an oversized box */}
              <div className="flex min-h-0 flex-1 items-center justify-center">
                <video
                  ref={theaterRef}
                  key={films[open].src}
                  className="block max-h-[min(78dvh,calc(100dvh-10rem))] max-w-full w-auto rounded-2xl bg-slate-950 object-contain shadow-2xl shadow-blue-200/40 ring-2 ring-blue-200/60"
                  controls
                  playsInline
                  preload="auto"
                  {...noDownloadVideoProps}
                >
                    <source src={films[open].src} type={videoType(films[open].src)} />
                </video>
              </div>
              <p className="mt-4 text-center text-[11px] text-blue-800/50">Click outside the player to close</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
