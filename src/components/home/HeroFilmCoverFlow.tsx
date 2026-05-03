"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type FilmItem = {
  id: string;
  src: string;
  posterUrl: string | null;
  title: string;
  href: string;
};

function mime(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDownloadVideoProps = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

function visibleOffsets(n: number): readonly number[] {
  if (n <= 1) return [0];
  if (n === 2) return [-1, 0, 1];
  if (n === 3) return [-1, 0, 1];
  if (n === 4) return [-2, -1, 0, 1];
  return [-2, -1, 0, 1, 2];
}

function cardTransform(offset: number): {
  txPct: number;
  tz: number;
  ry: number;
  scale: number;
  opacity: number;
  z: number;
} {
  const a = Math.abs(offset);
  const scale = offset === 0 ? 1 : a === 1 ? 0.82 : 0.66;
  const tz = offset === 0 ? 0 : a === 1 ? -72 : -140;
  const ry = offset * -24;
  // Wider landscape cards: spread offsets a bit so stacks read clearly
  const txFrac =
    offset === 0 ? 0 : offset === -1 ? -0.48 : offset === 1 ? 0.48 : offset === -2 ? -0.88 : 0.88;
  const opacity = a === 2 ? 0.88 : 1;
  const z = offset === 0 ? 60 : 46 - a * 12;
  return { txPct: txFrac * 100, tz, ry, scale, opacity, z };
}

/** Repeats for infinite horizontal scrub (only when n > 1). */
const SCRUB_LOOP_COPIES = 3;

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" className="text-white" aria-hidden>
      <path
        d={dir === "left" ? "M15 6l-6 6 6 6" : "M9 6l6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroFilmCoverFlow() {
  const [items, setItems] = useState<FilmItem[]>([]);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const scrubRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startX: number; active: boolean }>({ startX: 0, active: false });
  const wheelAcc = useRef(0);
  const wheelIdle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelLockUntil = useRef(0);
  const scrubScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeFromScrubRef = useRef(false);
  const [highlightSlot, setHighlightSlot] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch("/api/gallery/films", { method: "GET" });
        const j = (await res.json().catch(() => ({}))) as { films?: FilmItem[] };
        if (!alive) return;
        setItems(Array.isArray(j.films) ? j.films : []);
      } catch {
        if (!alive) return;
        setItems([]);
      } finally {
        if (!alive) return;
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const n = items.length;
  const offsets = useMemo(() => visibleOffsets(n), [n]);

  const scrubLoopCopies = n <= 1 ? 1 : SCRUB_LOOP_COPIES;
  const scrubSlots = useMemo(() => {
    if (n === 0) return [];
    return Array.from({ length: scrubLoopCopies * n }, (_, slot) => ({
      slot,
      logical: slot % n,
      item: items[slot % n]!,
      key: `${items[slot % n]!.id}-scrub-${slot}`,
    }));
  }, [n, items, scrubLoopCopies]);

  const tightenScrubLoop = useCallback(() => {
    const el = scrubRef.current;
    if (!el || n <= 1) return;
    const oneSet = el.scrollWidth / scrubLoopCopies;
    if (oneSet <= 0) return;
    const edge = 12;
    const { scrollLeft, clientWidth, scrollWidth } = el;
    el.style.scrollBehavior = "auto";
    if (scrollLeft <= edge) {
      el.scrollLeft = scrollLeft + oneSet;
    } else if (scrollLeft + clientWidth >= scrollWidth - edge) {
      el.scrollLeft = scrollLeft - oneSet;
    }
    el.style.removeProperty("scroll-behavior");
  }, [n, scrubLoopCopies]);

  const go = useCallback(
    (dir: -1 | 1) => {
      if (n <= 0) return;
      setActive((i) => (i + dir + n) % n);
    },
    [n]
  );

  const onVideoEnded = useCallback(() => {
    if (n <= 1) {
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        void v.play().catch(() => {});
      }
      return;
    }
    go(1);
  }, [n, go]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || n === 0) return;
    v.muted = true;
    v.loop = false;
    void v.play().catch(() => {});
  }, [active, n, items]);

  /** Horizontal wheel / Shift+vertical wheel only — avoids hijacking normal page scroll. */
  useEffect(() => {
    const el = stageRef.current;
    if (!el || n <= 1) return;

    const TH = 140;
    const COOLDOWN_MS = 420;

    const onWheel = (e: WheelEvent) => {
      const now = performance.now();
      if (now < wheelLockUntil.current) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      // Vertical page scroll: never accumulate (trackpad often has tiny residual deltaX).
      if (!e.shiftKey && absY >= absX * 1.12 && absX < 28) {
        wheelAcc.current = 0;
        return;
      }

      // Require clear horizontal intent, or Shift+wheel (treat vertical delta as sideways).
      const raw = e.shiftKey ? e.deltaY : e.deltaX;
      if (!e.shiftKey && (absX < 16 || absX < absY * 0.95)) {
        wheelAcc.current = 0;
        return;
      }
      if (Math.abs(raw) < 1) return;

      wheelAcc.current += raw;

      if (wheelIdle.current) clearTimeout(wheelIdle.current);
      wheelIdle.current = setTimeout(() => {
        wheelAcc.current = 0;
      }, 220);

      if (wheelAcc.current > TH) {
        e.preventDefault();
        wheelAcc.current = 0;
        wheelLockUntil.current = now + COOLDOWN_MS;
        go(1);
      } else if (wheelAcc.current < -TH) {
        e.preventDefault();
        wheelAcc.current = 0;
        wheelLockUntil.current = now + COOLDOWN_MS;
        go(-1);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      if (wheelIdle.current) clearTimeout(wheelIdle.current);
      wheelIdle.current = null;
    };
  }, [n, go]);

  /** Middle copy starts at slot `n`; align strip when active changes from arrows / video / wheel. */
  useEffect(() => {
    if (n <= 1) return;
    if (activeFromScrubRef.current) {
      activeFromScrubRef.current = false;
      return;
    }
    const root = scrubRef.current;
    if (!root) return;
    const midSlot = n + active;
    const thumb = root.querySelector(`[data-slot="${midSlot}"]`) as HTMLElement | null;
    if (!thumb) return;
    setHighlightSlot(midSlot);
    const left = thumb.offsetLeft - root.clientWidth / 2 + thumb.offsetWidth / 2;
    root.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  }, [active, n]);

  /** First paint after load: land on middle loop (instant). */
  useLayoutEffect(() => {
    if (!ready || n <= 1) return;
    const root = scrubRef.current;
    if (!root) return;
    const midSlot = n + active;
    const thumb = root.querySelector(`[data-slot="${midSlot}"]`) as HTMLElement | null;
    if (!thumb) return;
    setHighlightSlot(midSlot);
    root.style.scrollBehavior = "auto";
    root.scrollLeft = thumb.offsetLeft - root.clientWidth / 2 + thumb.offsetWidth / 2;
    root.style.removeProperty("scroll-behavior");
  }, [ready, n, items]);

  useEffect(() => {
    return () => {
      if (scrubScrollTimer.current) clearTimeout(scrubScrollTimer.current);
    };
  }, []);

  if (!ready || n === 0) return null;

  return (
    <section className="relative z-0 isolate overflow-hidden bg-[#0a0a0c] pb-10 pt-6 sm:pb-14 sm:pt-8">
      {/* Soft top glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[min(98vw,1200px)] -translate-x-1/2 rounded-full bg-violet-500/15 blur-[110px]"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-[min(100%,1820px)] px-3 sm:px-5 lg:px-10 xl:px-14">
        <p className="mb-6 text-center text-[10px] font-semibold uppercase tracking-[0.35em] text-white/45">
          Featured films
        </p>

        <div className="relative z-0 mx-auto flex w-full min-h-[min(58vh,620px)] max-w-none items-center justify-center lg:min-h-[min(52vh,600px)]">
          {/* Prev — z within this block only; section isolate keeps nav/banner above */}
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-0 z-40 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal-600/50 bg-teal-950/90 text-white shadow-[0_0_28px_rgba(192,132,252,0.35)] backdrop-blur-sm transition hover:bg-teal-900/95 hover:shadow-[0_0_36px_rgba(244,114,182,0.28)] sm:left-0 sm:h-12 sm:w-12 md:left-1 lg:left-2"
            aria-label="Previous film"
          >
            <Chevron dir="left" />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-0 z-40 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-teal-600/50 bg-teal-950/90 text-white shadow-[0_0_28px_rgba(192,132,252,0.35)] backdrop-blur-sm transition hover:bg-teal-900/95 hover:shadow-[0_0_36px_rgba(244,114,182,0.28)] sm:right-0 sm:h-12 sm:w-12 md:right-1 lg:right-2"
            aria-label="Next film"
          >
            <Chevron dir="right" />
          </button>

          <div
            ref={stageRef}
            className="relative h-[min(68vh,680px)] w-full max-w-[min(100%,1580px)] touch-pan-x touch-pan-y select-none sm:h-[min(66vh,640px)] lg:h-[min(52vh,580px)]"
            style={{ perspective: "min(2000px, 165vw)" }}
            onPointerDown={(e) => {
              if (e.button !== 0 && e.pointerType === "mouse") return;
              drag.current = { startX: e.clientX, active: true };
            }}
            onPointerUp={(e) => {
              if (!drag.current.active) return;
              drag.current.active = false;
              const dx = e.clientX - drag.current.startX;
              if (dx > 56) go(-1);
              else if (dx < -56) go(1);
            }}
            onPointerLeave={() => {
              drag.current.active = false;
            }}
            onPointerCancel={() => {
              drag.current.active = false;
            }}
          >
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
            >
              {offsets.map((offset) => {
                const idx = (active + offset + n * 10) % n;
                const item = items[idx]!;
                const isCenter = offset === 0;
                const t = cardTransform(offset);
                return (
                  <div
                    key={`${item.id}-${offset}-${active}`}
                    className="absolute aspect-[9/16] w-[min(72vw,300px)] will-change-transform lg:aspect-video lg:w-[min(900px,94vw)]"
                    style={{
                      transform: `translateX(-50%) translateY(-50%) translateX(${t.txPct}%) translateZ(${t.tz}px) rotateY(${t.ry}deg) scale(${t.scale})`,
                      left: "50%",
                      top: "50%",
                      transformStyle: "preserve-3d",
                      zIndex: t.z,
                      opacity: t.opacity,
                      transition:
                        "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.45s ease, filter 0.45s ease",
                      pointerEvents: isCenter ? "auto" : "none",
                    }}
                  >
                    <Link
                      href={item.href}
                      className="group relative block h-full w-full overflow-hidden rounded-[22px] border border-white/12 bg-black shadow-[0_28px_80px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
                      aria-label={item.title}
                    >
                      {isCenter ? (
                        <video
                          ref={videoRef}
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          muted
                          playsInline
                          preload="auto"
                          poster={item.posterUrl || undefined}
                          onEnded={onVideoEnded}
                          {...noDownloadVideoProps}
                        >
                          <source src={item.src} type={mime(item.src)} />
                        </video>
                      ) : item.posterUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote S3 posters; sizes vary
                        <img
                          src={item.posterUrl}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover object-center"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <video
                          className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
                          muted
                          playsInline
                          preload="none"
                          {...noDownloadVideoProps}
                        >
                          <source src={item.src} type={mime(item.src)} />
                        </video>
                      )}
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 pb-3.5 text-center sm:p-4 sm:pb-4">
                        <p className="font-heading text-[12px] font-black uppercase tracking-[0.12em] text-white drop-shadow-md sm:text-[14px] lg:text-[15px]">
                          {item.title}
                        </p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Horizontally scrollable film strip — tripled for infinite loop when there are multiple films */}
        <div
          ref={scrubRef}
          className="scrollbar-hide mt-6 flex w-full gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain scroll-smooth px-1 pb-1 snap-x snap-mandatory sm:mt-8 sm:gap-4 sm:px-2"
          onScroll={() => {
            tightenScrubLoop();
            if (scrubScrollTimer.current) clearTimeout(scrubScrollTimer.current);
            scrubScrollTimer.current = setTimeout(() => {
              scrubScrollTimer.current = null;
              tightenScrubLoop();
              const root = scrubRef.current;
              if (!root || n === 0) return;
              const mid = root.scrollLeft + root.clientWidth / 2;
              let bestSlot = 0;
              let bestD = Infinity;
              root.querySelectorAll<HTMLElement>("[data-slot]").forEach((node) => {
                const slot = Number(node.dataset.slot);
                if (Number.isNaN(slot)) return;
                const cx = node.offsetLeft + node.offsetWidth / 2;
                const d = Math.abs(cx - mid);
                if (d < bestD) {
                  bestD = d;
                  bestSlot = slot;
                }
              });
              const logical = bestSlot % n;
              setHighlightSlot(bestSlot);
              setActive((prev) => {
                if (prev === logical) {
                  activeFromScrubRef.current = false;
                  return prev;
                }
                activeFromScrubRef.current = true;
                return logical;
              });
            }, 45);
          }}
        >
          {scrubSlots.map(({ slot, logical, item, key }) => (
            <button
              key={key}
              type="button"
              data-slot={slot}
              data-logical={logical}
              onClick={() => {
                activeFromScrubRef.current = true;
                setActive(logical);
                setHighlightSlot(slot);
                requestAnimationFrame(() => {
                  const node = scrubRef.current?.querySelector(
                    `[data-slot="${slot}"]`
                  ) as HTMLElement | null;
                  node?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                });
              }}
              className={`snap-center shrink-0 overflow-hidden rounded-xl border bg-black/50 text-left shadow-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/80 w-[min(188px,32vw)] sm:w-[min(204px,28vw)] ${
                slot === highlightSlot
                  ? "scale-100 border-white/40 ring-2 ring-white/25 opacity-100"
                  : "border-white/10 opacity-80 hover:border-white/25 hover:opacity-100"
              }`}
              aria-label={`Show film ${logical + 1}: ${item.title}`}
              aria-current={slot === highlightSlot ? "true" : undefined}
            >
              <div className="relative aspect-video w-full">
                {item.posterUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote S3 posters
                  <img
                    src={item.posterUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <p className="pointer-events-none absolute inset-x-0 bottom-0 truncate px-2 pb-1.5 pt-6 text-center font-heading text-[9px] font-bold uppercase tracking-wider text-white/95 sm:text-[10px]">
                  {item.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
