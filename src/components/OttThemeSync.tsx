"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isOttPath } from "@/lib/ott-theme";

/** Syncs `ott-theme` on <html> so globals.css can paint public pages dark. */
export default function OttThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (isOttPath(pathname)) root.classList.add("ott-theme");
    else root.classList.remove("ott-theme");
    return () => root.classList.remove("ott-theme");
  }, [pathname]);

  return null;
}
