"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";

export default function YailiansTrailer({
  title,
  tag,
  poster,
  youtubeId,
  video,
  children,
  bare = false,
}: {
  title: string;
  tag?: string;
  poster?: string;
  youtubeId?: string;
  video?: string;
  children?: ReactNode;
  /** Poster and play control only — the surrounding frame owns the labels. */
  bare?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = poster || (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "");
  const canPlay = Boolean(youtubeId || video);

  return (
    <div className="absolute inset-0 bg-black">
      {playing && youtubeId ? (
        <iframe
          title={`${title} trailer`}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          className="absolute inset-0 z-30 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : null}

      {playing && !youtubeId && video ? (
        <video
          src={video}
          poster={thumb || undefined}
          className="absolute inset-0 z-30 h-full w-full bg-black object-contain"
          autoPlay
          controls
          playsInline
        />
      ) : null}

      {!playing ? (
        <button
          type="button"
          onClick={() => canPlay && setPlaying(true)}
          className="absolute inset-0 z-10 block h-full w-full cursor-pointer text-left"
          aria-label={`Play ${title} trailer`}
        >
          {thumb ? (
            <Image
              src={thumb}
              alt=""
              fill
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-zinc-950 to-black" />
          )}
          <span
            className={`absolute inset-0 ${
              bare
                ? "bg-gradient-to-t from-black/50 via-transparent to-black/15"
                : "bg-gradient-to-t from-black via-black/20 to-transparent"
            }`}
          />
          {bare ? null : (
            <span className="absolute right-4 top-4 font-mono text-[9px] uppercase tracking-[0.22em] text-white/70">
              Play trailer
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white backdrop-blur-sm">
              <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
            </span>
          </span>
          <span className={`absolute inset-x-0 bottom-0 hidden items-end gap-3 p-4 sm:p-5 ${bare ? "" : "lg:flex"}`}>
            <span className="min-w-0">
              {tag ? <span className="block font-mono text-[8px] tracking-[0.2em] text-emerald-300">{tag}</span> : null}
              <span className="mt-0.5 block text-sm font-medium leading-tight text-white sm:text-base">{title}</span>
            </span>
          </span>
        </button>
      ) : null}

      {!playing && children ? (
        <div className="pointer-events-none absolute inset-0 z-20">{children}</div>
      ) : null}
    </div>
  );
}
