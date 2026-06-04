"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Only attaches `src` and plays when near the viewport — avoids downloading
 * every MP4 on pages with many preview tiles (industry / playbook grids).
 */
export function DeferredVideo({
  src,
  poster,
  className,
  /** Hero / above-the-fold: load soon, still avoids blocking other videos */
  eager = false,
  loop = true,
}: {
  src: string;
  poster?: string | null;
  className?: string;
  eager?: boolean;
  loop?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shouldLoad, setShouldLoad] = useState(eager);

  useEffect(() => {
    if (eager) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShouldLoad(true);
      },
      { rootMargin: "120px", threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!shouldLoad) return;
    const el = ref.current;
    if (!el) return;
    const play = () => {
      void el.play().catch(() => {});
    };
    if (el.readyState >= 2) play();
    else el.addEventListener("loadeddata", play, { once: true });
    return () => el.removeEventListener("loadeddata", play);
  }, [shouldLoad, src]);

  return (
    <video
      ref={ref}
      src={shouldLoad ? src : undefined}
      poster={poster ?? undefined}
      className={className}
      muted
      loop={loop}
      playsInline
      preload={shouldLoad ? "metadata" : "none"}
    />
  );
}
