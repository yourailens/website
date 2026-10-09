"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import { attachPlaybackHold } from "@/components/media/playback-hold";

type DeferredVideoProps = {
  src: string;
  poster?: string | null;
  className?: string;
  /** Hero / above-the-fold: attach src immediately */
  eager?: boolean;
  loop?: boolean;
  controls?: boolean;
  muted?: boolean;
  /** How far before the viewport to start fetching. Pause still happens as soon as it leaves. */
  rootMargin?: string;
};

function shellClass(className: string) {
  const positioned = /(^|\s)(absolute|relative|fixed|sticky)(\s|$)/.test(className);
  const hasZ = /(^|\s)z-/.test(className);
  const base = positioned ? className : `relative block ${className}`.trim();
  return hasZ ? base : `${base} z-0`;
}

function mediaClass(className: string) {
  const fit = className.includes("object-contain")
    ? "object-contain"
    : className.includes("object-cover") || className.includes("h-full")
      ? "object-cover"
      : "";
  if (className.includes("h-auto")) return `block h-auto w-full bg-black ${fit}`.trim();
  return `h-full w-full bg-black ${fit}`.trim();
}

export const DeferredVideo = forwardRef<HTMLVideoElement, DeferredVideoProps>(
  function DeferredVideo(
    {
      src,
      poster,
      className = "",
      eager = false,
      loop = true,
      controls = false,
      muted = true,
      rootMargin = "800px",
    },
    forwardedRef
  ) {
    const nodeRef = useRef<HTMLVideoElement>(null);
    const stillRef = useRef<HTMLCanvasElement>(null);
    const inViewRef = useRef(eager);
    const [shouldLoad, setShouldLoad] = useState(eager);
    const [dropPoster, setDropPoster] = useState(false);

    useEffect(() => {
      setDropPoster(false);
    }, [src]);

    useEffect(() => {
      const node = nodeRef.current;
      const still = stillRef.current;
      if (!node || !still) return;

      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;

      const onScreen = () => {
        const box = node.getBoundingClientRect();
        return box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
      };

      const playIfReady = () => {
        if (!inViewRef.current && !onScreen()) return;
        if (onScreen()) inViewRef.current = true;
        if (!inViewRef.current) return;
        void node.play().catch(() => {});
      };

      const releaseHold = attachPlaybackHold(node, still, {
        controls,
        onPainted: () => {
          if (!node.getAttribute("poster")) return;
          node.removeAttribute("poster");
          setDropPoster(true);
        },
      });

      const loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setShouldLoad(true);
        },
        { rootMargin, threshold: 0 }
      );

      const playObserver = new IntersectionObserver(
        ([entry]) => {
          const visible = Boolean(entry?.isIntersecting);
          if (visible) {
            inViewRef.current = true;
            setShouldLoad(true);
            playIfReady();
            return;
          }

          // A window swipe makes IntersectionObserver report the hero as
          // off-screen, and pausing then is what clears the picture.
          const windowGone = document.visibilityState !== "visible" || !document.hasFocus();
          if (windowGone || onScreen()) return;

          inViewRef.current = false;
          node.pause();
        },
        { rootMargin: "120px", threshold: 0 }
      );

      loadObserver.observe(node);
      playObserver.observe(node);
      node.addEventListener("canplay", playIfReady);
      if (eager) playIfReady();

      return () => {
        releaseHold();
        loadObserver.disconnect();
        playObserver.disconnect();
        node.removeEventListener("canplay", playIfReady);
        if (typeof forwardedRef === "function") forwardedRef(null);
        else if (forwardedRef) forwardedRef.current = null;
      };
    }, [forwardedRef, rootMargin, eager, controls]);

    const fit = mediaClass(className);

    return (
      <span className={shellClass(className)}>
        <video
          ref={nodeRef}
          src={shouldLoad ? src : undefined}
          poster={dropPoster ? undefined : poster ?? undefined}
          className={fit}
          muted={muted}
          loop={loop}
          controls={controls}
          autoPlay={eager}
          playsInline
          preload={shouldLoad ? "auto" : "none"}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          onContextMenu={(event) => event.preventDefault()}
        />
        <canvas
          ref={stillRef}
          aria-hidden
          className={`pointer-events-none absolute inset-0 h-full w-full ${fit.includes("object-contain") ? "object-contain" : "object-cover"}`}
          style={{ opacity: 0 }}
        />
      </span>
    );
  }
);
