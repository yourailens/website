"use client";

import { useRef, useState } from "react";
import { DeferredVideo } from "@/components/media/DeferredVideo";

function VolumeIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M11 5 6.5 9H3v6h3.5L11 19V5Z" strokeLinejoin="round" />
      {muted ? (
        <>
          <path d="m16 9 5 6M21 9l-5 6" strokeLinecap="round" />
        </>
      ) : (
        <>
          <path d="M15 9.5a4 4 0 0 1 0 5" strokeLinecap="round" />
          <path d="M18 7a7.5 7.5 0 0 1 0 10" strokeLinecap="round" />
        </>
      )}
    </svg>
  );
}

export default function BrandedIntroVideo({
  src = "/videos/yailintro.mp4",
  muteButtonPosition = "right",
  rounded = true,
}: {
  src?: string;
  muteButtonPosition?: "left" | "right";
  rounded?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleAudio = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    video.volume = 1;
    setMuted(video.muted);
    if (video.paused) void video.play().catch(() => {});
  };

  return (
    <div
      className={`relative aspect-video overflow-hidden bg-slate-950 ring-1 ring-slate-900/10 ${
        rounded ? "rounded-[1.2rem]" : ""
      }`}
    >
      <DeferredVideo
        ref={videoRef}
        src={src}
        muted={muted}
        rootMargin="900px"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <button
        type="button"
        onClick={toggleAudio}
        className={`absolute top-3 z-10 inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[9px] font-semibold uppercase tracking-[0.16em] shadow-lg backdrop-blur-md transition sm:top-5 sm:px-4 ${
          muteButtonPosition === "left" ? "left-3 sm:left-5" : "right-3 sm:right-5"
        } ${
          muted
            ? "border-white/30 bg-white/90 text-slate-700 hover:bg-white"
            : "border-blue-300/60 bg-blue-600/90 text-white"
        }`}
        aria-label={muted ? "Turn audio on" : "Mute audio"}
      >
        <VolumeIcon muted={muted} />
        <span>{muted ? "Unmute" : "Mute"}</span>
      </button>
    </div>
  );
}
