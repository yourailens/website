"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import ScrubBar from "@/components/community/ScrubBar";
import type { CommunityPiece } from "@/data/community";

function clock(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function CommunityWatch({ piece }: { piece: CommunityPiece }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [ratio, setRatio] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const frames = piece.frame_stills ?? [];
  const poster = frames[0]?.url || piece.poster_url || undefined;

  const scrubTo = useCallback((seconds: number) => {
    const node = videoRef.current;
    if (!node) return;
    const limit = Number.isFinite(node.duration) ? node.duration : seconds;
    const next = Math.min(Math.max(0, seconds), limit);
    node.currentTime = next;
    setTime(next);
  }, []);

  const start = () => {
    const node = videoRef.current;
    if (!node) return;
    node.muted = false;
    node.volume = 1;
    void node.play().catch(() => {
      node.muted = true;
      void node.play().catch(() => {});
    });
    setPlaying(true);
  };

  const toggle = () => {
    const node = videoRef.current;
    if (!node) return;
    if (node.paused) start();
    else {
      node.pause();
      setPlaying(false);
    }
  };

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <div className="min-h-screen bg-black font-body text-white">
      <Navbar />
      <main className="relative mx-auto w-[min(1100px,92%)] pb-20 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/ai-verse"
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
          >
            ← Community
          </Link>
          <button
            type="button"
            onClick={() => void share()}
            className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold tracking-wide text-white/90 transition hover:border-white/35"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <h1 className="mt-6 max-w-4xl font-heading text-[clamp(2.4rem,5vw,4.4rem)] leading-none tracking-tight">
          {piece.title}
        </h1>
        {piece.description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">{piece.description}</p>
        ) : null}

        {piece.media_type === "video" ? (
          <>
            <div
              className="relative mt-8 overflow-hidden rounded-2xl bg-black ring-1 ring-white/15"
              style={{ aspectRatio: ratio ? String(ratio) : "16 / 9" }}
            >
              <video
                ref={videoRef}
                src={piece.media_url}
                poster={poster}
                playsInline
                preload="auto"
                controls={false}
                controlsList="nodownload noplaybackrate noremoteplayback"
                disablePictureInPicture
                disableRemotePlayback
                className="absolute inset-0 h-full w-full bg-black object-contain"
                onLoadedMetadata={(event) => {
                  const node = event.currentTarget;
                  if (Number.isFinite(node.duration)) setDuration(node.duration);
                  if (node.videoWidth > 0 && node.videoHeight > 0) setRatio(node.videoWidth / node.videoHeight);
                }}
                onTimeUpdate={(event) => setTime(event.currentTarget.currentTime)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onClick={toggle}
                onContextMenu={(event) => event.preventDefault()}
              />
              {!playing ? (
                <button
                  type="button"
                  aria-label={`Play ${piece.title}`}
                  onClick={start}
                  className="absolute inset-0 z-10 flex items-center justify-center"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/55 bg-white/10 text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur-[2px] sm:h-20 sm:w-20">
                    <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current drop-shadow-[0_2px_6px_rgba(0,0,0,0.85)] sm:h-8 sm:w-8" aria-hidden>
                      <path d="M8 5.5v13l11-6.5-11-6.5z" />
                    </svg>
                  </span>
                </button>
              ) : null}
              <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2 pt-10">
                <ScrubBar time={time} duration={duration} onScrub={scrubTo} />
              </div>
            </div>
            {frames.length > 1 ? (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                {frames.map((frame, index) => (
                  <button
                    key={`${frame.t}-${index}`}
                    type="button"
                    aria-label={`Go to ${clock(frame.t)}`}
                    onClick={() => scrubTo(frame.t)}
                    className="relative aspect-video w-36 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/20 sm:w-44"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={frame.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-white">
                      {clock(frame.t)}
                    </span>
                  </button>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="relative mt-8 overflow-hidden rounded-2xl bg-black ring-1 ring-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={piece.media_url} alt={piece.title} className="block max-h-[78vh] w-full object-contain" />
          </div>
        )}
      </main>
    </div>
  );
}
