"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Compact app icon tile with rotating hex + pulsing core. */
function LoaderMark() {
  return (
    <div
      className="loader-app-tile relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-[26px] bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 shadow-[0_16px_48px_rgba(37,99,235,0.5)] ring-1 ring-white/25"
      aria-hidden
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-b from-white/25 via-white/5 to-transparent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -inset-px rounded-[27px] opacity-60"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, transparent 42%, transparent 58%, rgba(255,255,255,0.12) 100%)",
        }}
        aria-hidden
      />
      <svg width="40" height="40" viewBox="0 0 18 18" fill="none" className="relative z-[1]">
        <path
          d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
          fill="white"
          fillOpacity="0.14"
          stroke="white"
          strokeWidth="1.35"
          style={{
            transformOrigin: "9px 9px",
            animation: "hexSpin 2.4s linear infinite",
          }}
        />
        <circle
          cx="9"
          cy="9"
          r="2.35"
          fill="white"
          style={{
            transformOrigin: "9px 9px",
            animation: "corePulse 2.2s ease-in-out infinite",
          }}
        />
      </svg>
    </div>
  );
}

export default function RouteLoadingOverlay() {
  const pathname = usePathname() || "/";

  const [open, setOpen] = useState(false);

  const openAtRef = useRef<number>(0);
  const closeTimerRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const mountedRef = useRef(false);

  function stopCloseTimer() {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function stopPollTimer() {
    if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }

  function openOverlay() {
    stopCloseTimer();
    stopPollTimer();
    setOpen(true);
    openAtRef.current = performance.now();
    activeRef.current = true;
  }

  function closeOverlayNow() {
    activeRef.current = false;
    stopCloseTimer();
    stopPollTimer();
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 160);
  }

  function isInLoadWindow(el: Element): boolean {
    const r = (el as HTMLElement).getBoundingClientRect?.();
    if (!r) return true;
    const vh = window.innerHeight || 800;
    const vw = window.innerWidth || 800;
    const padY = vh * 0.25;
    const padX = vw * 0.25;
    return r.bottom >= -padY && r.top <= vh + padY && r.right >= -padX && r.left <= vw + padX;
  }

  function countPendingMedia(): number {
    let pending = 0;
    const skipSelector = "[data-route-loader]";

    for (const img of Array.from(document.images || [])) {
      if (img.closest(skipSelector)) continue;
      if (!isInLoadWindow(img)) continue;
      if (!img.complete || img.naturalWidth === 0) pending += 1;
    }

    for (const v of Array.from(document.querySelectorAll("video"))) {
      if (v.closest(skipSelector)) continue;
      if (!isInLoadWindow(v)) continue;
      if (v.readyState < 2) pending += 1;
    }

    return pending;
  }

  function closeWhenMediaReady() {
    const minHoldMs = 350;
    const maxHoldMs = 6500;

    const tick = () => {
      if (!activeRef.current) return;
      const elapsed = performance.now() - openAtRef.current;
      const pending = countPendingMedia();

      if (elapsed >= maxHoldMs) {
        closeOverlayNow();
        return;
      }
      if (elapsed >= minHoldMs && pending === 0) {
        closeOverlayNow();
        return;
      }
      pollTimerRef.current = window.setTimeout(tick, 140);
    };

    pollTimerRef.current = window.setTimeout(tick, 140);
  }

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (!pathname.startsWith("/admin") && pathname !== "/") {
        openOverlay();
        closeWhenMediaReady();
      }
      return;
    }
    if (pathname.startsWith("/admin")) return;
    if (pathname === "/") {
      // arrived at homepage — dismiss any overlay that was triggered by back-nav
      closeOverlayNow();
      return;
    }
    openOverlay();
    closeWhenMediaReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const a = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!a) return;
      if (a.target && a.target !== "_self") return;
      if (a.hasAttribute("download")) return;

      const href = a.getAttribute("href") || "";
      if (!href) return;
      if (href.startsWith("#")) return;
      if (href.startsWith("mailto:") || href.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname.startsWith("/admin")) return;
      if (url.pathname === "/") return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      openOverlay();
    };

    const onPop = () => {
      // Don't open overlay when popping back to the homepage
      const dest = window.location.pathname;
      if (dest === "/" || dest.startsWith("/admin")) return;
      openOverlay();
    };

    window.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden"
      style={{
        background: "rgba(2,6,23,0.07)",
        WebkitBackdropFilter: "blur(16px)",
        backdropFilter: "blur(16px)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div data-route-loader className="flex items-center justify-center">
        <LoaderMark />
      </div>
    </div>
  );
}
