"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { attachProgressivePlayback } from "@/components/media/progressive-playback";
import { vaultStageShellStyle } from "@/components/vault/vault-media-frame";

function pad(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function formatTime(seconds: number) {
  const s = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  return `${pad(s / 60)}:${pad(s % 60)}`;
}

type Props = {
  src: string;
  poster?: string | null;
  title: string;
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

/**
 * Custom YAIL Vault player — no native download chrome, logo watermark while playing.
 * Note: watermark/controlsList deter casual saving; they do not stop determined ripping.
 */
export default function VaultPlayer({ src, poster, title }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [hovering, setHovering] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [hasFrame, setHasFrame] = useState(false);
  const [mediaSize, setMediaSize] = useState<{ w: number; h: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const wantPlayRef = useRef(false);

  const showChrome = hovering || !playing || dragging;

  const bumpChrome = useCallback(() => {
    setHovering(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (playing && !dragging) setHovering(false);
    }, 2400);
  }, [playing, dragging]);

  useEffect(() => {
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, []);

  useEffect(() => {
    setHasFrame(false);
    setBuffering(false);
    wantPlayRef.current = false;
    setPlaying(false);
    setTime(0);
    setDuration(0);
    setMediaSize(null);
  }, [src]);

  // Warm the stage shape from the poster so portrait/square cuts don't flash as 16:9.
  useEffect(() => {
    if (!poster) return;
    const img = new window.Image();
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        setMediaSize((prev) => prev ?? { w: img.naturalWidth, h: img.naturalHeight });
      }
    };
    img.src = poster;
  }, [poster, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => {
      if (!dragging) setTime(video.currentTime);
    };
    const onMeta = () => {
      setDuration(video.duration || 0);
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setMediaSize({ w: video.videoWidth, h: video.videoHeight });
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      wantPlayRef.current = false;
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onMeta);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);
    onMeta();

    // Harden against casual download / remote playback UI
    video.setAttribute("controlsList", "nodownload noplaybackrate noremoteplayback");
    video.setAttribute("disablePictureInPicture", "true");

    const release = attachProgressivePlayback(video, {
      onReadyToPlay: () => {
        if (wantPlayRef.current) void video.play().catch(() => {});
      },
      onBuffering: (busy) => {
        // Only show the spinner after the user asked to play.
        setBuffering(busy && wantPlayRef.current);
      },
      onFirstFrame: () => setHasFrame(true),
    });

    return () => {
      release();
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onMeta);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
    };
  }, [dragging, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      wantPlayRef.current = true;
      setBuffering(video.readyState < 2);
      void video.play().catch(() => {});
    } else {
      wantPlayRef.current = false;
      video.pause();
    }
    bumpChrome();
  }, [bumpChrome]);

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
    const onMove = (e: PointerEvent) => seekFromEvent(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
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
      /* gesture / browser may block fullscreen */
    }
    bumpChrome();
  }, [bumpChrome]);

  const progress = duration > 0 ? (time / duration) * 100 : 0;
  const shellStyle = isFullscreen
    ? { width: "100%", height: "100%", maxWidth: "100%", maxHeight: "100%" }
    : vaultStageShellStyle(mediaSize?.w, mediaSize?.h);

  return (
    <div
      ref={shellRef}
      className={`group relative overflow-hidden bg-black select-none ${
        isFullscreen ? "flex h-full w-full items-center justify-center" : ""
      }`}
      style={shellStyle}
      onMouseMove={bumpChrome}
      onMouseLeave={() => {
        if (playing && !dragging) setHovering(false);
      }}
      onContextMenu={(e) => e.preventDefault()}
      onDoubleClick={(e) => {
        e.preventDefault();
        void toggleFullscreen();
      }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster ?? undefined}
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        className="absolute inset-0 h-full w-full object-contain"
        onClick={togglePlay}
        onDragStart={(e) => e.preventDefault()}
      />

      {poster && !hasFrame ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={poster}
          alt=""
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-contain"
        />
      ) : null}

      {/* YAIL watermark — 30% opacity while media is on screen */}
      <div
        className="pointer-events-none absolute right-4 top-4 z-20 sm:right-5 sm:top-5"
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo_yail.png"
          alt=""
          className="h-7 w-auto opacity-30 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] sm:h-8"
          draggable={false}
        />
      </div>

      {buffering ? (
        <div className="pointer-events-none absolute inset-0 z-[12] flex items-center justify-center">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-white/25 border-t-sky-400" aria-hidden />
          <span className="sr-only">Loading</span>
        </div>
      ) : null}

      {/* Center play affordance when paused */}
      {!playing && !buffering ? (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/25"
          aria-label={`Play ${title}`}
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fafafa] text-black shadow-[0_16px_40px_-12px_rgba(0,0,0,0.8)] transition hover:scale-105 sm:h-[4.5rem] sm:w-[4.5rem]">
            <svg width="22" height="22" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <path d="M3 1.5v11l9-5.5L3 1.5z" />
            </svg>
          </span>
        </button>
      ) : null}

      {/* Custom chrome */}
      <div
        className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-3 pb-3 pt-14 transition duration-300 sm:px-4 sm:pb-4 ${
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
          className="group/track relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/20"
          onPointerDown={(e) => {
            e.preventDefault();
            setDragging(true);
            seekFromEvent(e.clientX);
            bumpChrome();
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-sky-400"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-[#fafafa] opacity-0 shadow transition group-hover/track:opacity-100"
            style={{ left: `calc(${progress}% - 7px)` }}
          />
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <path d="M3 2h3v10H3V2zm5 0h3v10H8V2z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <path d="M3 1.5v11l9-5.5L3 1.5z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setMuted((m) => !m);
              bumpChrome();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M23 9l-6 6M17 9l6 6" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              </svg>
            )}
          </button>

          <p className="ml-1 font-mono text-[11px] tabular-nums text-white/70">
            {formatTime(time)}
            <span className="text-white/35"> / </span>
            {formatTime(duration)}
          </p>

          <p className="ml-auto hidden truncate font-mono text-[10px] uppercase tracking-[0.18em] text-white/40 sm:block">
            YAIL Vault
          </p>

          <button
            type="button"
            onClick={() => void toggleFullscreen()}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition hover:bg-white/20 sm:ml-2"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
                <path d="M8 9H4V5" />
                <path d="M16 9h4V5" />
                <path d="M8 15H4v4" />
                <path d="M16 15h4v4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" aria-hidden>
                <path d="M9 4H4v5" />
                <path d="M15 4h5v5" />
                <path d="M9 20H4v-5" />
                <path d="M15 20h5v-5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
