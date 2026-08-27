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
          } else {
            node.pause();
          }
        },
        { rootMargin: "120px", threshold: 0 }
      );

      loadObserver.observe(node);
      playObserver.observe(node);
      node.addEventListener("canplay", playIfReady);
      if (eager) playIfReady();

      return () => {
        loadObserver.disconnect();
        playObserver.disconnect();
        node.removeEventListener("canplay", playIfReady);
        if (typeof forwardedRef === "function") forwardedRef(null);
        else if (forwardedRef) forwardedRef.current = null;
      };
    }, [forwardedRef, rootMargin]);

    return (
      <video
        ref={nodeRef}
        src={shouldLoad ? src : undefined}
        poster={poster ?? undefined}
        className={className}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
        preload={shouldLoad ? "auto" : "none"}
        onContextMenu={(event) => event.preventDefault()}
      />
    );
  }
);
