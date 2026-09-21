"use client";

import { forwardRef, useEffect, useRef, useState } from "react";

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

export const DeferredVideo = forwardRef<HTMLVideoElement, DeferredVideoProps>(
  function DeferredVideo(
    {
      src,
      poster,
      className,
      eager = false,
      loop = true,
      controls = false,
      muted = true,
      rootMargin = "800px",
    },
    forwardedRef
  ) {
    const nodeRef = useRef<HTMLVideoElement>(null);
    const inViewRef = useRef(eager);
    const [shouldLoad, setShouldLoad] = useState(eager);

    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;

      const playIfReady = () => {
        if (!inViewRef.current) return;
        void node.play().catch(() => {});
      };

      const loadObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) setShouldLoad(true);
        },
        { rootMargin, threshold: 0 }
      );

      const playObserver = new IntersectionObserver(
        ([entry]) => {
          const visible = Boolean(entry?.isIntersecting);
          inViewRef.current = visible;
          if (visible) {
            setShouldLoad(true);
            playIfReady();
            return;
          }

          // While the tab/window is hidden, IntersectionObserver often falsely
          // reports out-of-view. Pausing then clears the decoded frame and
          // shows a grey/blue flash when you come back. Only pause on real scroll-away.
          if (document.visibilityState === "visible") {
            node.pause();
          }
        },
        { rootMargin: "120px", threshold: 0 }
      );

      const onVisibility = () => {
        if (document.visibilityState === "visible") {
          playIfReady();
        }
      };

      // Some window switches pause media without flipping visibility, or pause
      // before visibilitychange fires. If we still want playback, resume immediately
      // so the cleared frame never sits on screen.
      const onPause = () => {
        if (document.visibilityState !== "visible") return;
        if (!inViewRef.current) return;
        void node.play().catch(() => {});
      };

      loadObserver.observe(node);
      playObserver.observe(node);
      node.addEventListener("canplay", playIfReady);
      node.addEventListener("pause", onPause);
      document.addEventListener("visibilitychange", onVisibility);
      if (eager) playIfReady();

      return () => {
        loadObserver.disconnect();
        playObserver.disconnect();
        node.removeEventListener("canplay", playIfReady);
        node.removeEventListener("pause", onPause);
        document.removeEventListener("visibilitychange", onVisibility);
        if (typeof forwardedRef === "function") forwardedRef(null);
        else if (forwardedRef) forwardedRef.current = null;
      };
    }, [forwardedRef, rootMargin, eager]);

    return (
      <video
        ref={nodeRef}
        src={shouldLoad ? src : undefined}
        poster={poster ?? undefined}
        className={className}
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
    );
  }
);
