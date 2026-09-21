"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatTime(seconds: number) {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${pad(s / 60)}:${pad(s % 60)}`;
}

type Mode = "preview" | "playing" | "paused";

type Props = {
  src: string;
  poster?: string | null;
  caption: string;
  mode: Mode;
  onMode: (mode: Mode) => void;
};

type FsEl = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  webkitEnterFullscreen?: () => void;
};

type FsDoc = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

function isOurFullscreen(node: HTMLElement | null) {
  if (!node || typeof document === "undefined") return false;
  const doc = document as FsDoc;
  return document.fullscreenElement === node || doc.webkitFullscreenElement === node;
}

export default function SpotPlayer({ src, poster, caption, mode, onMode }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const live = mode === "preview";
  const active = mode !== "preview";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      if (!dragging) setTime(video.currentTime);
    };
    const onMeta = () => setDuration(video.duration || 0);
    const onEnded = () => onMode("paused");

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("ended", onEnded);
    onMeta();
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("ended", onEnded);
    };
  }, [dragging, onMode, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = live || muted;
    video.loop = live;
    if (mode === "playing") {
      void video.play().catch(() => {});
    } else if (mode === "paused") {
      video.pause();
    } else {
      video.muted = true;
      void video.play().catch(() => {});
    }
  }, [live, mode, muted, volume]);

  const seekFromEvent = useCallback((clientX: number) => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track || !video.duration) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setTime(video.currentTime);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => seekFromEvent(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [dragging, seekFromEvent]);

  useEffect(() => {
    const sync = () => setIsFullscreen(isOurFullscreen(shellRef.current));
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  async function toggleFullscreen() {
    const shell = shellRef.current as FsEl | null;
    const video = videoRef.current as FsEl | null;
    const doc = document as FsDoc;
    if (!shell) return;

    try {
      if (isOurFullscreen(shell) || document.fullscreenElement || doc.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
        return;
      }

      if (mode === "preview") onMode("playing");

      if (shell.requestFullscreen) await shell.requestFullscreen();
      else if (shell.webkitRequestFullscreen) await shell.webkitRequestFullscreen();
      else if (video?.webkitEnterFullscreen) video.webkitEnterFullscreen();
    } catch {
      /* gesture / browser may block fullscreen */
    }
  }

  function togglePlay() {
    onMode(mode === "playing" ? "paused" : "playing");
  }

  const progress = duration > 0 ? time / duration : 0;

  return (
    <div ref={shellRef} className="absolute inset-0 bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        className={`absolute inset-0 h-full w-full ${isFullscreen ? "object-contain" : "object-cover"}`}
        playsInline
        preload="auto"
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onDoubleClick={(e) => {
          e.preventDefault();
          void toggleFullscreen();
        }}
        onClick={togglePlay}
      />

      {mode !== "playing" ? (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-20 flex items-center justify-center"
          aria-label={`Play ${caption}`}
        >
          <span className="flex h-16 w-16 items-center justify-center border border-blue-300/50 bg-blue-600/80 shadow-[0_0_32px_rgba(37,99,235,0.55)] backdrop-blur-sm">
            <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
          </span>
        </button>
      ) : null}

      {active ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black via-black/55 to-transparent px-3 pb-3 pt-12">
          <div className="pointer-events-auto flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-9 w-9 shrink-0 items-center justify-center bg-blue-600 text-white hover:bg-blue-500"
              aria-label={mode === "playing" ? "Pause" : "Play"}
            >
              {mode === "playing" ? (
                <span className="flex gap-[3px]">
                  <span className="h-3.5 w-[3px] bg-white" />
                  <span className="h-3.5 w-[3px] bg-white" />
                </span>
              ) : (
                <span className="ml-0.5 h-0 w-0 border-y-[7px] border-l-[11px] border-y-transparent border-l-white" />
              )}
            </button>

            <span className="w-10 shrink-0 font-mono text-[11px] tabular-nums text-blue-200">{formatTime(time)}</span>

            <div
              ref={trackRef}
              role="slider"
              aria-label="Playback"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(time)}
              tabIndex={0}
              onPointerDown={(e) => {
                e.preventDefault();
                setDragging(true);
                seekFromEvent(e.clientX);
              }}
              onKeyDown={(e) => {
                const video = videoRef.current;
                if (!video) return;
                if (e.key === "ArrowRight") video.currentTime = Math.min(duration, video.currentTime + 5);
                if (e.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5);
              }}
              className="relative h-6 flex-1 cursor-pointer"
            >
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-white/20" />
              <span
                className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-blue-500"
                style={{ width: `${progress * 100}%` }}
              />
              <span
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-300 shadow-[0_0_10px_rgba(96,165,250,0.9)]"
                style={{ left: `${progress * 100}%` }}
              />
            </div>

            <span className="w-10 shrink-0 text-right font-mono text-[11px] tabular-nums text-white/55">{formatTime(duration)}</span>

            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-blue-200 hover:text-white"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 10v4h3l4 3V7L7 10H4z" />
                  <path d="M16 9l5 6M21 9l-5 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 10v4h3l4 3V7L7 10H4z" />
                  <path d="M16 9.5a4 4 0 010 5M18.5 7a7 7 0 010 10" />
                </svg>
              )}
            </button>

            <div className="relative hidden h-6 w-16 cursor-pointer sm:block">
              <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-white/20" />
              <span
                className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-blue-400"
                style={{ width: `${(muted ? 0 : volume) * 100}%` }}
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                aria-label="Volume"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setVolume(next);
                  setMuted(next === 0);
                }}
                className="absolute inset-0 w-full cursor-pointer opacity-0"
              />
            </div>

            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="flex h-9 w-9 shrink-0 items-center justify-center text-blue-200 hover:text-white"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                  <path d="M8 9H4V5" />
                  <path d="M16 9h4V5" />
                  <path d="M8 15H4v4" />
                  <path d="M16 15h4v4" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
                  <path d="M9 4H4v5" />
                  <path d="M15 4h5v5" />
                  <path d="M9 20H4v-5" />
                  <path d="M15 20h5v-5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
