"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps, ReactNode } from "react";

/**
 * Must sit inside a `next/link`. While the navigation is pending, dims the
 * control and blocks further clicks (no spinner).
 */
export function VaultLinkPendingOverlay() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span
      className="absolute inset-0 z-[5] cursor-wait rounded-[inherit] bg-black/40"
      aria-hidden
    />
  );
}

type Props = Omit<ComponentProps<typeof Link>, "children"> & {
  children: ReactNode;
};

/** Vault navigation link that disables itself after click until the route settles. */
export default function VaultPendingLink({ className = "", children, ...props }: Props) {
  return (
    <Link {...props} className={`relative ${className}`.trim()}>
      <VaultLinkPendingOverlay />
      {children}
    </Link>
  );
}
