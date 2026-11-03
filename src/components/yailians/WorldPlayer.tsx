"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatTime(seconds: number) {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${pad(s / 60)}:${pad(s % 60)}`;
}

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

export default function WorldPlayer({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string | null;
  title: string;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [hovering, setHovering] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [ratio, setRatio] = useState<number | null>(null);

  const showChrome = playing && (hovering || dragging || coarse);
  const progress = duration > 0 ? (time / duration) * 100 : 0;
  const aspect = ratio ? String(ratio) : "16 / 9";

  const bumpChrome = useCallback(() => {
    setHovering(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (!dragging) setHovering(false);
    }, 2400);
  }, [dragging]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.muted = muted;
  }, [muted]);

  useEffect(() => {
    setCoarse(window.matchMedia("(hover: none), (pointer: coarse)").matches);
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    const sync = () => setIsFullscreen(isOurFullscreen(shellRef.current));
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.paused) {
      video.pause();
      bumpChrome();
      return;
    }
    video.playsInline = true;
    setBuffering(video.readyState < 2);
    void video.play().catch(() => setBuffering(false));
    bumpChrome();
  }, [bumpChrome]);

  const seekFromEvent = useCallback((clientX: number) => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track || !video.duration) return;
    const rect = track.getBoundingClientRect();
    const next = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    video.currentTime = next * video.duration;
    setTime(video.currentTime);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => seekFromEvent(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [dragging, seekFromEvent]);

  const toggleFullscreen = useCallback(async () => {
    const shell = shellRef.current as FsEl | null;
    const video = videoRef.current as FsEl | null;
    const doc = document as FsDoc;
    if (!shell) return;
    try {
      if (isOurFullscreen(shell) || document.fullscreenElement || doc.webkitFullscreenElement) {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (doc.webkitExitFullscreen) await doc.webkitExitFullscreen();
      } else if (shell.requestFullscreen) {
        await shell.requestFullscreen();
      } else if (shell.webkitRequestFullscreen) {
        await shell.webkitRequestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch {
      /* gesture or browser may block fullscreen */
    }
    bumpChrome();
  }, [bumpChrome]);

  return (
    <div
      ref={shellRef}
      className={`relative select-none overflow-hidden bg-black outline-none ${
        isFullscreen ? "flex h-full w-full items-center justify-center bg-black" : "w-full"
      }`}
      style={isFullscreen ? undefined : { aspectRatio: aspect }}
      onMouseMove={bumpChrome}
      onMouseLeave={() => {
        if (playing && !dragging) setHovering(false);
      }}
      onContextMenu={(event) => event.preventDefault()}
      onDoubleClick={(event) => {
        event.preventDefault();
        void toggleFullscreen();
      }}
    >
      <div
        className={isFullscreen ? "relative h-full max-h-full w-auto max-w-full" : "absolute inset-0"}
        style={isFullscreen ? { aspectRatio: aspect } : undefined}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster || undefined}
          className="absolute inset-0 h-full w-full bg-black object-contain"
          playsInline
          preload="metadata"
          controls={false}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          draggable={false}
          onLoadedMetadata={(event) => {
            const node = event.currentTarget;
            if (node.videoWidth > 0 && node.videoHeight > 0) {
              setRatio(node.videoWidth / node.videoHeight);
            }
            setDuration(Number.isFinite(node.duration) ? node.duration : 0);
          }}
          onTimeUpdate={(event) => {
            if (!dragging) setTime(event.currentTarget.currentTime);
          }}
          onPlay={() => {
            setPlaying(true);
            setBuffering(false);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onWaiting={() => setBuffering(true)}
          onPlaying={() => setBuffering(false)}
          onClick={() => {
            if (coarse) return;
            togglePlay();
          }}
          onDragStart={(event) => event.preventDefault()}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo_yail.png"
          alt=""
          draggable={false}
          className="pointer-events-none absolute right-4 top-4 z-20 h-7 w-auto opacity-40 drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)] sm:right-5 sm:top-5 sm:h-8"
        />

        {buffering && playing ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <span className="h-9 w-9 animate-spin rounded-full border border-white/25 border-t-white" />
          </div>
        ) : null}

        {!playing && !buffering ? (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`Play ${title}`}
            className="absolute inset-0 z-20"
          >
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/55 bg-white/10 text-white shadow-[0_16px_40px_-18px_rgba(0,0,0,0.9)] backdrop-blur-[2px]">
              <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-current" aria-hidden>
                <path d="M8 5.5v13l11-6.5-11-6.5z" />
              </svg>
            </span>
          </button>
        ) : null}

        {playing && coarse ? (
          <button type="button" aria-label="Pause" className="absolute inset-0 z-[5]" onClick={togglePlay} />
        ) : null}

        <div
          className={`absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-10 transition duration-300 ${
            showChrome ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <div
            ref={trackRef}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(time)}
            tabIndex={0}
            className="relative mb-2 h-3 cursor-pointer"
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setDragging(true);
              seekFromEvent(event.clientX);
              bumpChrome();
            }}
            onKeyDown={(event) => {
              const video = videoRef.current;
              if (!video || !video.duration) return;
              if (event.key === "ArrowRight") video.currentTime = Math.min(video.duration, video.currentTime + 5);
              if (event.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5);
            }}
          >
            <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/30" />
            <div className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-white" style={{ width: `${progress}%` }} />
            <div
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-white"
              style={{ left: `calc(${progress}% - 4px)` }}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <PlayerButton label={playing ? "Pause" : "Play"} onClick={togglePlay}>
              {playing ? (
                <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M3 2h3v10H3V2zm5 0h3v10H8V2z" />
                </svg>
              ) : (
                <svg viewBox="0 0 14 14" className="ml-0.5 h-3.5 w-3.5 fill-current" aria-hidden>
                  <path d="M3 1.5v11l9-5.5L3 1.5z" />
                </svg>
              )}
            </PlayerButton>
            <PlayerButton label={muted ? "Unmute" : "Mute"} onClick={() => setMuted((value) => !value)}>
              {muted ? (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M22 9l-6 6M16 9l6 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                </svg>
              )}
            </PlayerButton>
            <p className="ml-1 font-mono text-[10px] tabular-nums tracking-wide text-white/75">
              {formatTime(time)}
              <span className="text-white/35"> / </span>
              {formatTime(duration)}
            </p>
            <PlayerButton
              className="ml-auto"
              label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={() => void toggleFullscreen()}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {isFullscreen ? (
                  <>
                    <path d="M8 9H4V5" />
                    <path d="M16 9h4V5" />
                    <path d="M8 15H4v4" />
                    <path d="M16 15h4v4" />
                  </>
                ) : (
                  <>
                    <path d="M9 4H4v5" />
                    <path d="M15 4h5v5" />
                    <path d="M9 20H4v-5" />
                    <path d="M15 20h5v-5" />
                  </>
                )}
              </svg>
            </PlayerButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerButton({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`flex h-8 w-8 items-center justify-center text-white/80 transition hover:text-white ${className}`}
    >
      {children}
    </button>
  );
}
