"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function clearNavPending() {
  if (typeof document === "undefined") return;
  document.querySelectorAll("a[data-nav-pending]").forEach((el) => {
    el.removeAttribute("data-nav-pending");
  });
  document.documentElement.removeAttribute("data-navigating");
}

function isInternalNavAnchor(a: HTMLAnchorElement, e: MouseEvent): boolean {
  if (e.defaultPrevented) return false;
  if (e.button !== 0) return false;
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
  if (a.target && a.target !== "_self") return false;
  if (a.hasAttribute("download")) return false;

  const href = a.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    // Same URL (including query) — nothing to navigate.
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      (!url.hash || url.hash === window.location.hash)
    ) {
      return false;
    }
    // In-page hash jump on the same path+query.
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search &&
      url.hash
    ) {
      return false;
    }
  } catch {
    return false;
  }

  return true;
}

function NavigationPendingGuardInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    clearNavPending();
  }, [pathname, searchParams]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const a = target.closest("a");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (!isInternalNavAnchor(a, e)) return;

      a.setAttribute("data-nav-pending", "");
      document.documentElement.setAttribute("data-navigating", "");

      // Safety: clear if navigation is cancelled / stuck.
      window.setTimeout(() => {
        if (a.hasAttribute("data-nav-pending")) clearNavPending();
      }, 12_000);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}

/** Site-wide: after an internal link click, dim & block re-clicks until the route settles. */
export default function NavigationPendingGuard() {
  return (
    <Suspense fallback={null}>
      <NavigationPendingGuardInner />
    </Suspense>
  );
}
