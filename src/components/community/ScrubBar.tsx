"use client";

import { useEffect, useRef, useState } from "react";

function clock(seconds: number) {
  const total = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, "0")}`;
}

export default function ScrubBar({
  time,
  duration,
  onScrub,
}: {
  time: number;
  duration: number;
  onScrub: (seconds: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef(onScrub);
  const [dragging, setDragging] = useState(false);
  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0;

  scrubRef.current = onScrub;

  const secondsFrom = (clientX: number) => {
    const track = trackRef.current;
    if (!track || duration <= 0) return null;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / Math.max(rect.width, 1)));
    return ratio * duration;
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (event: PointerEvent) => {
      const seconds = secondsFrom(event.clientX);
      if (seconds != null) scrubRef.current(seconds);
    };
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, duration]);

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(time)}
      tabIndex={0}
      className="relative h-8 cursor-pointer touch-none"
      onPointerDown={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const seconds = secondsFrom(event.clientX);
        if (seconds == null) return;
        setDragging(true);
        scrubRef.current(seconds);
      }}
      onKeyDown={(event) => {
        if (duration <= 0) return;
        if (event.key === "ArrowRight") scrubRef.current(Math.min(duration, time + 5));
        if (event.key === "ArrowLeft") scrubRef.current(Math.max(0, time - 5));
      }}
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/30" />
      <div
        className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white"
        style={{ width: `${progress}%` }}
      />
      <div
        className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
        style={{ left: `${progress}%` }}
      />
      <span className="pointer-events-none absolute bottom-full right-0 mb-1 font-mono text-[10px] tabular-nums text-white/80">
        {clock(time)} / {clock(duration)}
      </span>
    </div>
  );
}
