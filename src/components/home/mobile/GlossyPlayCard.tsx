"use client";

import { useEffect, useRef, useState } from "react";
import type { MobileClip } from "./types";

type GlossyPlayCardProps = {
  clip: MobileClip;
  playingId: string | null;
  onPlay: (id: string) => void;
  onPause: () => void;
  large?: boolean;
};

export default function GlossyPlayCard({
  clip,
  playingId,
  onPlay,
  onPause,
  large = false,
}: GlossyPlayCardProps) {
  const isPlaying = playingId === clip.id;
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** Keep media mounted after first play so pause/resume keeps currentTime. */
  const [held, setHeld] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const canPlay = Boolean(clip.video || clip.youtubeId);

  // Another card took over — unload this one
  useEffect(() => {
    if (playingId !== null && playingId !== clip.id) {
      setHeld(false);
    }
  }, [playingId, clip.id]);

  useEffect(() => {
    if (!held || !isPlaying) return;
    const node = videoRef.current;
    if (node) void node.play().catch(() => {});
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
    }
  }, [held, isPlaying]);

  useEffect(() => {
    if (!held || isPlaying) return;
    const node = videoRef.current;
    if (node) node.pause();
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "*"
      );
    }
  }, [held, isPlaying]);

  const start = () => {
    if (!canPlay) return;
    setHeld(true);
    onPlay(clip.id);
  };

  const pause = () => {
    videoRef.current?.pause();
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "*"
      );
    }
    onPause();
  };

  const showPoster = !held;

  return (
    <article
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/18 bg-white/[0.07] shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl ${
        large ? "aspect-[16/10]" : clip.portrait ? "aspect-[3/4]" : "aspect-video"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-black/30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />

      {held && clip.youtubeId ? (
        <iframe
          ref={iframeRef}
          title={clip.title}
          src={`https://www.youtube.com/embed/${clip.youtubeId}?enablejsapi=1&autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1`}
          className="absolute inset-0 h-full w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : null}

      {held && clip.video && !clip.youtubeId ? (
        <video
          ref={videoRef}
          src={clip.video}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          loop
          controls={false}
          preload="auto"
        />
      ) : null}

      {showPoster ? (
        <>
          {clip.poster && !posterFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clip.poster}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        </>
      ) : null}

      {!isPlaying && held ? (
        <div className="pointer-events-none absolute inset-0 bg-black/25" />
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 pr-14">
        {clip.tag ? (
          <p className="font-mono text-[9px] tracking-[0.22em] text-blue-200/90">{clip.tag}</p>
        ) : null}
        <p className={`mt-1 font-semibold leading-tight tracking-tight text-white drop-shadow ${large ? "text-lg" : "text-sm"}`}>
          {clip.title}
        </p>
        <p className="mt-1 text-[11px] text-white/50">{clip.section}</p>
      </div>

      {!isPlaying && canPlay ? (
        <button
          type="button"
          onClick={start}
          aria-label={`Play ${clip.title}`}
          className="absolute inset-0 z-20 flex items-center justify-center"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md transition active:scale-95">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-6 w-6 fill-white" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </button>
      ) : null}

      {isPlaying ? (
        <button
          type="button"
          onClick={pause}
          aria-label={`Pause ${clip.title}`}
          className="absolute bottom-3 right-3 z-30 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/45 shadow-[0_6px_20px_rgba(0,0,0,0.4)] backdrop-blur-md transition active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        </button>
      ) : null}

      {!canPlay ? (
        <a href={clip.href} className="absolute inset-0 z-20" aria-label={clip.title} />
      ) : null}
    </article>
  );
}
