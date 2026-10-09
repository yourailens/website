"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import OttSeeAllLink from "@/components/home/OttSeeAllLink";

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

function youtubeThumb(id: string) {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
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
  const thumb = card.poster || card.image || (ytId ? youtubeThumb(ytId) : "");
  const watchLabel = card.watchLabel ?? (ytId ? "Watch on YouTube" : null);

  const frame = (
    <>
      {thumb ? (
        <Image
          src={thumb}
          alt={card.title}
          fill
          sizes={fill ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 28vw, 70vw"}
          className={card.contain ? "object-contain object-bottom" : "object-cover"}
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent opacity-80" />
      <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-[2px]">
          <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden>
            <path d="M8 5.5v13l11-6.5-11-6.5z" />
          </svg>
        </span>
      </div>
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

  const box = `relative block overflow-hidden bg-zinc-950 ${fill ? "w-full" : "shrink-0"} ${
    fill
      ? "aspect-video"
      : card.featured
        ? "aspect-video w-[88vw] sm:w-[72vw] md:w-[56vw] lg:w-[48vw]"
        : shape === "poster"
          ? "aspect-[2/3] w-[46vw] sm:w-[30vw] md:w-[22vw] lg:w-[16.5vw]"
          : "aspect-video w-[78vw] sm:w-[48vw] md:w-[36vw] lg:w-[28vw]"
  }`;

  if (card.href.startsWith("http")) {
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
            <h3 className="mt-1.5 font-body text-[clamp(1.2rem,2.6vw,1.75rem)] font-semibold leading-none tracking-tight">{title}</h3>
          ) : (
            <h2 className="mt-2 font-body text-[clamp(1.7rem,3.6vw,2.8rem)] font-semibold leading-none tracking-tight">{title}</h2>
          )}
          {kicker ? <p className={`max-w-lg text-sm font-light text-white/50 ${row ? "mt-1.5" : "mt-2"}`}>{kicker}</p> : null}
        </div>
        <div className="mb-0.5 flex shrink-0 items-center gap-3">
          {seeAllHref ? <OttSeeAllLink href={seeAllHref} label={seeAllLabel} /> : null}
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
