"use client";

import { useState } from "react";

function frameTime(duration: number) {
  if (!Number.isFinite(duration) || duration <= 0.8) return 0.4;
  return Math.min(4.5, Math.max(1.2, duration * 0.3));
}

/** Paused video frame with a clear play mark. Images stay images. */
export default function CommunityStill({
  src,
  poster,
  video = false,
  alt,
  play = true,
  grade = false,
}: {
  src: string;
  poster?: string | null;
  video?: boolean;
  alt: string;
  play?: boolean;
  /** Pull highlights down so a bright clip sits on the dark page. */
  grade?: boolean;
}) {
  const [ratio, setRatio] = useState<number | null>(null);

  function prime(node: HTMLVideoElement | null) {
    if (!node || node.dataset.primed === "1") return;
    node.dataset.primed = "1";
    const go = () => {
      if (node.videoWidth > 0 && node.videoHeight > 0) {
        setRatio(node.videoWidth / node.videoHeight);
      }
      const target = frameTime(node.duration);
      const paint = () => {
        if (node.dataset.painted === "1") return;
        node.dataset.painted = "1";
        node.muted = true;
        void node.play()
          .then(() => {
            const stop = () => node.pause();
            if (typeof node.requestVideoFrameCallback === "function") {
              node.requestVideoFrameCallback(() => stop());
            } else {
              window.setTimeout(stop, 180);
            }
          })
          .catch(() => {});
      };
      node.addEventListener("seeked", paint, { once: true });
      if (Math.abs(node.currentTime - target) > 0.08) node.currentTime = target;
      else paint();
    };
    if (node.readyState >= 1) go();
    else node.addEventListener("loadedmetadata", go, { once: true });
  }

  if (!video) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={poster?.trim() || src} alt={alt} className="block h-full w-full bg-black object-cover" />
    );
  }

  return (
    <span className="relative block h-full w-full bg-black">
      <video
        src={src}
        muted
        playsInline
        preload="auto"
        controls={false}
        controlsList="nodownload noplaybackrate noremoteplayback"
        disablePictureInPicture
        disableRemotePlayback
        draggable={false}
        aria-label={alt}
        ref={prime}
        className={`pointer-events-none block h-full w-full bg-black object-cover ${grade ? "brightness-[0.78] contrast-110 saturate-90" : ""}`}
        style={{ aspectRatio: ratio ? String(ratio) : "16 / 9" }}
        onContextMenu={(event) => event.preventDefault()}
      />
      {grade ? (
        <span className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/55 via-black/20 to-black/30" />
      ) : null}
      {play ? (
        <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/55 bg-white/10 text-white shadow-[0_10px_30px_-16px_rgba(0,0,0,0.9)] backdrop-blur-[2px]">
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5 fill-current" aria-hidden>
              <path d="M8 5.5v13l11-6.5-11-6.5z" />
            </svg>
          </span>
        </span>
      ) : null}
    </span>
  );
}
