"use client";

import type { Ref } from "react";
import { DeferredVideo } from "@/components/media/DeferredVideo";

type HomeBelowHeroProps = {
  label: string;
  title: string;
  src?: string | null;
  poster?: string | null;
  youtubeId?: string | null;
  muted?: boolean;
  onSurfaceClick?: (event: React.MouseEvent) => void;
  videoRef?: Ref<HTMLVideoElement>;
  frameRef?: Ref<HTMLIFrameElement>;
};

export default function HomeBelowHero({
  label,
  title,
  src,
  poster,
  youtubeId,
  muted = true,
  onSurfaceClick,
  videoRef,
  frameRef,
}: HomeBelowHeroProps) {
  const youtubeSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&playsinline=1&rel=0`
    : null;

  return (
    <section
      aria-label={label}
      onClick={onSurfaceClick}
      className={`relative aspect-video w-full bg-black md:aspect-auto md:h-[100svh] md:min-h-[560px] ${onSurfaceClick ? "cursor-pointer" : ""}`}
    >
      <p
        className={`pointer-events-none absolute left-5 z-10 font-mono text-[10px] tracking-[0.32em] text-white/70 md:left-8 ${
          onSurfaceClick ? "top-[calc(var(--nav-h,4.5rem)+4.75rem)]" : "top-6 md:top-8"
        }`}
      >
        {label}
      </p>
      {youtubeSrc ? (
        <iframe
          ref={frameRef}
          src={youtubeSrc}
          title={title}
          allow="autoplay; encrypted-media; picture-in-picture"
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      ) : src ? (
        <DeferredVideo ref={videoRef} src={src} poster={poster} eager muted={muted} className="absolute inset-0 h-full w-full object-cover" />
      ) : poster ? (
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent md:h-36" />
    </section>
  );
}
