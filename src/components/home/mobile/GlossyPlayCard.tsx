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
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  /** Warm-load media while the card is on screen so tap can play immediately. */
  const [warm, setWarm] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  /** Keep poster until the first frame actually paints. */
  const [hasFrame, setHasFrame] = useState(false);
  const canPlay = Boolean(clip.video || clip.youtubeId);
  const mediaMounted = warm || isPlaying || hasFrame;

  useEffect(() => {
    if (large && canPlay) setWarm(true);
  }, [large, canPlay]);

  useEffect(() => {
    const node = cardRef.current;
    if (!node || !canPlay || large) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setWarm(true);
      },
      { rootMargin: "320px 0px", threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [canPlay, large]);

  useEffect(() => {
    const syncFullscreen = () => {
      const card = cardRef.current;
      const active =
        document.fullscreenElement === card ||
        (document as Document & { webkitFullscreenElement?: Element | null })
          .webkitFullscreenElement === card;
      setIsFullscreen(Boolean(active));
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  // Another card took over — pause, keep buffer if still warm
  useEffect(() => {
    if (playingId === null || playingId === clip.id) return;
    const node = videoRef.current;
    if (node) node.pause();
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
        "*"
      );
    }
  }, [playingId, clip.id]);

  useEffect(() => {
    if (!isPlaying) return;
    const node = videoRef.current;
    if (node && node.paused) void node.play().catch(() => {});
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) return;
    const node = videoRef.current;
    if (node && !node.paused) node.pause();
  }, [isPlaying]);

  const start = () => {
    if (!canPlay) return;
    setWarm(true);
    onPlay(clip.id);
    // Must call play() inside the tap gesture — not a later effect —
    // or mobile browsers delay / block playback.
    const node = videoRef.current;
    if (node) {
      node.muted = true;
      const attempt = node.play();
      if (attempt) {
        void attempt
          .then(() => setHasFrame(true))
          .catch(() => {
            const onReady = () => {
              node.removeEventListener("canplay", onReady);
              void node.play().then(() => setHasFrame(true)).catch(() => {});
            };
            node.addEventListener("canplay", onReady);
            try {
              node.load();
            } catch {
              /* ignore */
            }
          });
      }
    }
    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "playVideo", args: [] }),
        "*"
      );
      setHasFrame(true);
    }
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

  const exitFullscreen = () => {
    const doc = document as Document & {
      webkitExitFullscreen?: () => void;
      webkitFullscreenElement?: Element | null;
    };
    if (document.fullscreenElement || doc.webkitFullscreenElement) {
      if (typeof document.exitFullscreen === "function") {
        void document.exitFullscreen().catch(() => {});
        return;
      }
      if (typeof doc.webkitExitFullscreen === "function") {
        doc.webkitExitFullscreen();
        return;
      }
    }
    const video = videoRef.current as (HTMLVideoElement & {
      webkitExitFullscreen?: () => void;
      webkitDisplayingFullscreen?: boolean;
    }) | null;
    if (video?.webkitDisplayingFullscreen && typeof video.webkitExitFullscreen === "function") {
      video.webkitExitFullscreen();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen) {
      exitFullscreen();
      return;
    }
    const card = cardRef.current as (HTMLElement & {
      webkitRequestFullscreen?: () => void;
    }) | null;
    if (card) {
      if (typeof card.requestFullscreen === "function") {
        void card.requestFullscreen().catch(() => {});
        return;
      }
      if (typeof card.webkitRequestFullscreen === "function") {
        card.webkitRequestFullscreen();
        return;
      }
    }
    const video = videoRef.current as (HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitRequestFullscreen?: () => void;
    }) | null;
    if (video) {
      if (typeof video.webkitEnterFullscreen === "function") {
        video.webkitEnterFullscreen();
        return;
      }
      if (typeof video.webkitRequestFullscreen === "function") {
        video.webkitRequestFullscreen();
        return;
      }
    }
    const iframe = iframeRef.current;
    if (iframe && typeof iframe.requestFullscreen === "function") {
      void iframe.requestFullscreen().catch(() => {});
    }
  };

  const showPoster = !isPlaying || !hasFrame;
  const controlBtn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/45 shadow-[0_6px_20px_rgba(0,0,0,0.4)] backdrop-blur-md transition active:scale-95";

  const aspectClass = large
    ? "aspect-[16/10]"
    : clip.portrait
      ? "aspect-[3/4]"
      : "aspect-video";
  const fitClass = isFullscreen ? "object-contain" : "object-cover";

  return (
    <article
      ref={cardRef}
      className={`relative overflow-hidden ${
        isFullscreen
          ? "flex h-full w-full items-center justify-center bg-black"
          : `rounded-[1.75rem] border border-white/18 bg-white/[0.07] shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl ${aspectClass}`
      }`}
    >
      {!isFullscreen ? (
        <>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/18 via-transparent to-black/30" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/15 to-transparent" />
        </>
      ) : null}

      {mediaMounted && clip.youtubeId ? (
        <iframe
          ref={iframeRef}
          title={clip.title}
          src={`https://www.youtube.com/embed/${clip.youtubeId}?enablejsapi=1&autoplay=0&mute=1&playsinline=1&rel=0&modestbranding=1`}
          className={
            isFullscreen
              ? `h-full w-full max-h-full max-w-full border-0 ${clip.portrait ? "aspect-[3/4]" : "aspect-video"}`
              : "absolute inset-0 h-full w-full border-0"
          }
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          onLoad={() => {
            if (!isPlaying) return;
            const iframe = iframeRef.current;
            if (iframe?.contentWindow) {
              iframe.contentWindow.postMessage(
                JSON.stringify({ event: "command", func: "playVideo", args: [] }),
                "*"
              );
            }
            setHasFrame(true);
          }}
        />
      ) : null}

      {mediaMounted && clip.video && !clip.youtubeId ? (
        <video
          ref={videoRef}
          src={clip.video}
          className={`${
            isFullscreen ? "relative h-full w-full" : "absolute inset-0 h-full w-full"
          } ${fitClass} [&::-webkit-media-controls-download-button]:hidden [&::-internal-media-controls-download-button]:hidden`}
          muted
          playsInline
          loop
          controls={false}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          preload="auto"
          onLoadedData={() => {
            // Keep a bit of buffer warm before tap
            const node = videoRef.current;
            if (node && node.readyState >= 2 && !isPlaying) {
              try {
                node.currentTime = 0;
              } catch {
                /* ignore */
              }
            }
          }}
          onPlaying={() => setHasFrame(true)}
          onWaiting={() => {
            /* keep last frame; poster only before first play */
          }}
        />
      ) : null}

      {showPoster && !isFullscreen ? (
        <>
          {clip.poster && !posterFailed ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={clip.poster}
              alt=""
              className="absolute inset-0 z-[1] h-full w-full object-cover"
              loading={large ? "eager" : "lazy"}
              decoding="async"
              onError={() => setPosterFailed(true)}
            />
          ) : (
            <div className="absolute inset-0 z-[1] bg-gradient-to-br from-zinc-700 via-zinc-900 to-black" />
          )}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        </>
      ) : null}

      {!isPlaying && hasFrame && !isFullscreen ? (
        <div className="pointer-events-none absolute inset-0 z-[1] bg-black/25" />
      ) : null}

      {!isFullscreen ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 p-4 pr-24">
          {clip.tag ? (
            <p className="font-mono text-[9px] tracking-[0.22em] text-blue-200/90">{clip.tag}</p>
          ) : null}
          <p className={`mt-1 font-semibold leading-tight tracking-tight text-white drop-shadow ${large ? "text-lg" : "text-sm"}`}>
            {clip.title}
          </p>
          <p className="mt-1 text-[11px] text-white/50">{clip.section}</p>
        </div>
      ) : null}

      {!isPlaying && canPlay && !isFullscreen ? (
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

      {isPlaying || isFullscreen ? (
        <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2">
          {isPlaying ? (
            <button type="button" onClick={pause} aria-label={`Pause ${clip.title}`} className={controlBtn}>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-white" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            </button>
          ) : (
            <button type="button" onClick={start} aria-label={`Play ${clip.title}`} className={controlBtn}>
              <svg viewBox="0 0 24 24" className="ml-0.5 h-3.5 w-3.5 fill-white" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? `Exit fullscreen ${clip.title}` : `Fullscreen ${clip.title}`}
            className={controlBtn}
          >
            {isFullscreen ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-white" strokeWidth="2" aria-hidden>
                <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-white" strokeWidth="2" aria-hidden>
                <path d="M8 3H4v4M16 3h4v4M8 21H4v-4M16 21h4v-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      ) : null}

      {!canPlay ? (
        <a href={clip.href} className="absolute inset-0 z-20" aria-label={clip.title} />
      ) : null}
    </article>
  );
}
