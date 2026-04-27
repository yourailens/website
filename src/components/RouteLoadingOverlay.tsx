"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type Variant = "home" | "images" | "films" | "events" | "avatars" | "pricing" | "contact" | "other";

function getVariant(pathname: string): Variant {
  if (pathname === "/") return "home";
  if (pathname.startsWith("/images")) return "images";
  if (pathname.startsWith("/films")) return "films";
  if (pathname.startsWith("/events")) return "events";
  if (pathname.startsWith("/avatars")) return "avatars";
  if (pathname.startsWith("/pricing")) return "pricing";
  if (pathname.startsWith("/contact")) return "contact";
  return "other";
}

function BannerMark({ sizeCss }: { sizeCss: string }) {
  // Floating logo mark only (no box, no rings).
  return (
    <div className="relative flex items-center justify-center" aria-hidden>
      <span
        className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.22),transparent_60%)] blur-2xl"
        aria-hidden
      />
      <svg style={{ width: sizeCss, height: sizeCss }} viewBox="0 0 18 18" fill="none" className="text-white drop-shadow-[0_20px_70px_rgba(0,0,0,0.55)]">
        <path
          d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
          fill="white"
          fillOpacity="0.15"
          stroke="white"
          strokeWidth="1.5"
          style={{ transformOrigin: "9px 9px", animation: "hexSpin 2s linear infinite" }}
        />
        <circle cx="9" cy="9" r="3" fill="white" />
      </svg>
    </div>
  );
}

export default function RouteLoadingOverlay() {
  const pathname = usePathname() || "/";
  const variant = useMemo(() => getVariant(pathname), [pathname]);

  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<string | null>(null);

  const openAtRef = useRef<number>(0);
  const closeTimerRef = useRef<number | null>(null);
  const pollTimerRef = useRef<number | null>(null);
  const activeRef = useRef(false);
  const mountedRef = useRef(false);

  const motionClass = useMemo(() => {
    switch (variant) {
      case "films":
        return "animate-[spin_4.0s_linear_infinite]";
      case "avatars":
        return "animate-[spin_4.4s_ease-in-out_infinite]";
      case "events":
        return "animate-[spin_4.1s_linear_infinite]";
      case "images":
        return "animate-[spin_4.6s_linear_infinite]";
      default:
        return "animate-[spin_4.8s_linear_infinite]";
    }
  }, [variant]);

  function stopCloseTimer() {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function stopPollTimer() {
    if (pollTimerRef.current) window.clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }

  function openOverlay(nextLabel?: string) {
    stopCloseTimer();
    stopPollTimer();
    setLabel(nextLabel ?? null);
    setOpen(true);
    openAtRef.current = performance.now();
    activeRef.current = true;
  }

  function closeOverlayNow() {
    activeRef.current = false;

    stopCloseTimer();
    stopPollTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      setLabel(null);
    }, 160);
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
    // Show once on first mount, and on every route change.
    // Close when visible media is ready.
    if (!mountedRef.current) {
      mountedRef.current = true;
      if (!pathname.startsWith("/admin")) {
        openOverlay(getVariant(pathname) === "home" ? "Home" : "Getting ready");
        closeWhenMediaReady();
      }
      return;
    }

    if (pathname.startsWith("/admin")) return;
    openOverlay(getVariant(pathname) === "home" ? "Home" : "Getting ready");
    closeWhenMediaReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    // Ignore admin.
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
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      const nextVar = getVariant(url.pathname);
      const nextLabel =
        nextVar === "home"
          ? "Home"
          : nextVar === "images"
            ? "Images"
            : nextVar === "films"
              ? "Films"
              : nextVar === "events"
                ? "Events"
                : nextVar === "avatars"
                  ? "Avatars"
                  : nextVar === "pricing"
                    ? "Pricing"
                    : nextVar === "contact"
                      ? "Contact"
                      : "Getting ready";

      openOverlay(nextLabel);
    };

    const onPop = () => {
      openOverlay("Loading");
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
        background: "rgba(2,6,23,0.10)",
        WebkitBackdropFilter: "blur(22px)",
        backdropFilter: "blur(22px)",
      }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div data-route-loader className="flex w-full flex-col items-center justify-center px-6 py-10">
        <BannerMark sizeCss="min(30vmin, 220px)" />
      </div>
    </div>
  );
}

