"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/** Next.js keeps scroll position when switching sibling routes under the same layout. */
export default function ScrollToTopOnRoute() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const hasHash = window.location.hash.replace(/^#/, "").length > 0;
    if (hasHash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
