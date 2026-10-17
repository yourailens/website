"use client";

import { useRef, useState } from "react";
import type { YailiansVoice } from "@/data/yailians";

export default function VoiceInterviewCard({ voice }: { voice: YailiansVoice }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const thumb = voice.poster_url || voice.portrait_url;

  function toggle() {
    const el = videoRef.current;
    if (!el || !voice.video_url) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="relative aspect-video bg-zinc-950">
        {voice.video_url ? (
          <>
            <video
              ref={videoRef}
              src={voice.video_url}
              poster={thumb || undefined}
              className="h-full w-full object-cover"
              playsInline
              preload="metadata"
              controls={playing}
              onEnded={() => setPlaying(false)}
              onPause={() => setPlaying(false)}
              onPlay={() => setPlaying(true)}
            />
            {!playing ? (
              <button
                type="button"
                onClick={toggle}
                aria-label={`Play interview with ${voice.name}`}
                className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/35"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white shadow-lg backdrop-blur-[2px]">
                  <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 fill-current" aria-hidden>
                    <path d="M8 5.5v13l11-6.5-11-6.5z" />
                  </svg>
                </span>
              </button>
            ) : null}
          </>
        ) : thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/30">No video</div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          {voice.portrait_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={voice.portrait_url}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-white/15"
            />
          ) : null}
          <div className="min-w-0">
            <p className="font-semibold text-white">{voice.name}</p>
            {voice.role ? <p className="text-xs text-white/40">{voice.role}</p> : null}
          </div>
        </div>
        {voice.quote ? (
          <p className="mt-3 text-sm leading-relaxed text-white/65">“{voice.quote}”</p>
        ) : null}
      </div>
    </article>
  );
}
