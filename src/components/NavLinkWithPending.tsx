"use client";

import { useLinkStatus } from "next/link";

/** Must be rendered as a direct child of `next/link` (uses link status context). */
export function NavLinkPendingSpinner({
  borderClassName = "border-blue-600",
}: {
  /** Tailwind classes for the visible border segments (e.g. `border-white` on dark buttons). */
  borderClassName?: string;
}) {
  const { pending } = useLinkStatus();
  if (!pending) {
    return <span className="inline-block w-3.5 shrink-0" aria-hidden />;
  }
  return (
    <span
      className={`inline-block h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-t-transparent opacity-90 ${borderClassName}`}
      aria-hidden
    />
  );
}
