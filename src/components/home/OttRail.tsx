"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DeferredVideo } from "@/components/media/DeferredVideo";

/** Inner player stays 1080p for bitrate. Scale it to the card so mobile isn't a cropped zoom. */
const YT_PLAYER_W = 1920;
const YT_PLAYER_H = 1080;
const YT_COVER = 1.08;
const YT_HD = ["hd1080", "hd1440", "hd2160", "highres"] as const;

type YtPlayer = {
  destroy: () => void;
  mute: () => void;
  playVideo: () => void;
  setPlaybackQuality?: (quality: string) => void;
  setPlaybackQualityRange?: (min: string, max: string) => void;
  getPlaybackQuality?: () => string;
  getAvailableQualityLevels?: () => string[];
};

type YtNamespace = {
  Player: new (
    el: HTMLElement | string,
    opts: {
      width: number;
      height: number;
      videoId: string;
      playerVars?: Record<string, string | number>;
      events?: Record<string, (e: { data?: number; target: YtPlayer }) => void>;
    }
  ) => YtPlayer;
  PlayerState: { BUFFERING: number; PLAYING: number };
};

declare global {
  interface Window {
    YT?: YtNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApi: Promise<YtNamespace> | null = null;

function loadYouTubeApi(): Promise<YtNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApi) return youtubeApi;
  youtubeApi = new Promise((resolve) => {
    const done = () => {
      if (window.YT?.Player) resolve(window.YT);
    };
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      done();
    };
    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
    const poll = window.setInterval(() => {
      if (window.YT?.Player) {
        window.clearInterval(poll);
        done();
      }
    }, 40);
  });
  return youtubeApi;
}

function lockYouTubeHd(player: YtPlayer) {
  const levels = player.getAvailableQualityLevels?.() ?? [];
  const pick = YT_HD.find((q) => levels.includes(q)) ?? "hd1080";
  try {
    player.setPlaybackQualityRange?.(pick, "highres");
  } catch {
    /* YouTube may ignore range */
  }
  try {
    player.setPlaybackQuality?.(pick);
  } catch {
    /* deprecated no-op on some players */
  }
}

export type OttCard = {
  href: string;
  title: string;
  tag?: string;
  image?: string;
  video?: string;
  poster?: string;
  contain?: boolean;
  /** YouTube embed URL */
  embed?: string;
  /** Subtle external watch link (YouTube / Instagram) */
  watchUrl?: string;
  watchLabel?: string;
  featured?: boolean;
  aspect?: "wide" | "poster";
};

function youtubeId(embed: string) {
  return embed.match(/(?:embed\/|v=|youtu\.be\/)([^?/&]+)/)?.[1] ?? "";
}

function AutoYoutube({ title, embed }: { title: string; embed: string }) {
  const id = youtubeId(embed);
  const boxRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const [scale, setScale] = useState(0.2);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      setScale(Math.max((w * YT_COVER) / YT_PLAYER_W, (h * YT_COVER) / YT_PLAYER_H));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const mount = mountRef.current;
    if (!mount) return;

    loadYouTubeApi().then((YT) => {
      if (cancelled || !mountRef.current) return;
      const player = new YT.Player(mountRef.current, {
        width: YT_PLAYER_W,
        height: YT_PLAYER_H,
        videoId: id,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: id,
          cc_load_policy: 0,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady(e) {
            lockYouTubeHd(e.target);
            e.target.mute();
            e.target.playVideo();
          },
          onStateChange(e) {
            if (e.data === YT.PlayerState.BUFFERING || e.data === YT.PlayerState.PLAYING) {
              lockYouTubeHd(e.target);
            }
          },
          onPlaybackQualityChange(e) {
            const q = e.target.getPlaybackQuality?.();
            if (q && !(YT_HD as readonly string[]).includes(q)) lockYouTubeHd(e.target);
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [id]);

  return (
    <div ref={boxRef} className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="absolute left-1/2 top-1/2 origin-center"
        style={{
          width: YT_PLAYER_W,
          height: YT_PLAYER_H,
          transform: `translate(-50%, -50%) scale(${scale})`,
        }}
      >
        <div ref={mountRef} title={title} className="h-full w-full" />
      </div>
      <div className="absolute inset-0 z-[1]" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-14 bg-gradient-to-b from-black/70 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-gradient-to-t from-black to-transparent" aria-hidden />
    </div>
  );
}

export function RailCard({
  card,
  aspect,
  fill = false,
}: {
  card: OttCard;
  aspect: "wide" | "poster";
  fill?: boolean;
}) {
  const shape = card.aspect ?? aspect;
  const ytId = card.embed ? youtubeId(card.embed) : "";
  const watchLabel = card.watchLabel ?? (ytId ? "Watch on YouTube" : null);

  const frame = (
    <>
      {card.embed ? (
        <AutoYoutube title={card.title} embed={card.embed} />
      ) : card.video ? (
        <DeferredVideo
          src={card.video}
          poster={card.poster}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
        />
      ) : card.image ? (
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="(min-width: 1024px) 28vw, 70vw"
          className={`transition duration-500 group-hover:scale-[1.06] ${
            card.contain ? "object-contain object-bottom" : "object-cover"
          }`}
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-black" />
      )}
      {!card.embed ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent opacity-80 transition group-hover:opacity-95" />
      ) : null}
      <span className="pointer-events-none absolute left-2 top-2 z-[3] h-3 w-3 border-l border-t border-white/0 transition group-hover:border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute right-2 top-2 z-[3] h-3 w-3 border-r border-t border-white/0 transition group-hover:border-blue-400" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[3] flex items-end justify-between gap-3 p-3 sm:p-4">
        <div className="min-w-0">
          {card.tag ? (
            <p className="font-mono text-[8px] tracking-[0.2em] text-blue-300">{card.tag}</p>
          ) : null}
          <p className="mt-0.5 text-sm font-medium leading-tight text-white sm:text-base">{card.title}</p>
        </div>
        {watchLabel ? (
          <span className="shrink-0 pb-0.5 text-[9px] uppercase tracking-[0.18em] text-white/35">
            {watchLabel}
          </span>
        ) : null}
      </div>
    </>
  );

  const box = `group relative block overflow-hidden bg-zinc-950 ${fill ? "w-full" : "shrink-0"} ${
    fill
      ? "aspect-video"
      : card.featured
        ? "aspect-video w-[88vw] sm:w-[72vw] md:w-[56vw] lg:w-[48vw]"
        : shape === "poster"
          ? "aspect-[2/3] w-[46vw] sm:w-[30vw] md:w-[22vw] lg:w-[16.5vw]"
          : "aspect-video w-[78vw] sm:w-[48vw] md:w-[36vw] lg:w-[28vw]"
  }`;

  const external = card.href.startsWith("http");
  if (external) {
    return (
      <a href={card.href} target="_blank" rel="noopener noreferrer" className={box}>
        {frame}
      </a>
    );
  }

  return (
    <Link href={card.href} className={box}>
      {frame}
    </Link>
  );
}

export default function OttRail({
  title,
  scene,
  kicker,
  seeAllHref,
  seeAllLabel = "See all",
  cards,
  aspect = "wide",
  tone = "section",
  inset = false,
  className,
}: {
  title: string;
  scene: string;
  kicker?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  cards: OttCard[];
  aspect?: "wide" | "poster";
  tone?: "section" | "row";
  inset?: boolean;
  className?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const row = tone === "row";

  const scrollBy = (dir: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: dir * node.clientWidth * 0.82, behavior: "smooth" });
  };

  return (
    <div className={className}>
      <div className="flex items-end justify-between gap-4 px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
        <div>
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">{scene}</p>
          {row ? (
            <h3 className="mt-1.5 font-heading text-[clamp(1.2rem,2.6vw,1.75rem)] leading-none">{title}</h3>
          ) : (
            <h2 className="mt-2 font-heading text-[clamp(1.7rem,3.6vw,2.8rem)] leading-none">{title}</h2>
          )}
          {kicker ? <p className={`max-w-lg text-sm font-light text-white/50 ${row ? "mt-1.5" : "mt-2"}`}>{kicker}</p> : null}
        </div>
        <div className="mb-0.5 flex shrink-0 items-center gap-3">
          {seeAllHref ? (
            <Link href={seeAllHref} className="text-[11px] uppercase tracking-[0.2em] text-white/45 hover:text-white">
              {seeAllLabel}
            </Link>
          ) : null}
          <div className="hidden gap-1 md:flex">
            <button
              type="button"
              aria-label="Previous"
              onClick={() => scrollBy(-1)}
              className="flex h-8 w-8 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next"
              onClick={() => scrollBy(1)}
              className="flex h-8 w-8 items-center justify-center border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
            >
              ›
            </button>
          </div>
        </div>
      </div>
      <div
        ref={scroller}
        className={`ott-rail mt-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-2 ${
          inset
            ? "scroll-pl-5 pr-5 sm:scroll-pl-8 sm:pr-8 lg:scroll-pl-16 lg:pr-10 xl:scroll-pl-52"
            : "px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10"
        }`}
      >
        {inset ? <div className="w-5 shrink-0 snap-none sm:w-8 lg:w-16 xl:w-52" aria-hidden /> : null}
        {cards.map((card) => (
          <div key={`${card.href}-${card.title}`} className="snap-start">
            <RailCard card={card} aspect={aspect} />
          </div>
        ))}
        {inset ? <div className="w-5 shrink-0 snap-none sm:w-8 lg:w-10" aria-hidden /> : null}
      </div>
    </div>
  );
}
