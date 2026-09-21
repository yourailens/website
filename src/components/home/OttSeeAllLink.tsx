"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { NavLinkPendingSpinner } from "@/components/NavLinkWithPending";

function SeeAllInner({ label }: { label: string }) {
  const { pending } = useLinkStatus();
  return (
    <>
      {pending ? <span className="absolute inset-0 z-[1] cursor-wait" aria-hidden /> : null}
      <span
        className={`relative z-[2] inline-flex items-center gap-2 ${
          pending ? "opacity-70" : ""
        }`}
      >
        <NavLinkPendingSpinner borderClassName="border-white" />
        <span>{pending ? "Loading" : label}</span>
        {!pending ? (
          <span aria-hidden className="text-[13px] leading-none opacity-60">
            →
          </span>
        ) : null}
      </span>
    </>
  );
}

export default function OttSeeAllLink({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`relative inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-white/20 bg-transparent px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md transition hover:border-white/40 hover:text-white hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] active:translate-y-px sm:px-3.5 sm:text-[11px] sm:tracking-[0.18em] ${className}`}
    >
      <SeeAllInner label={label} />
    </Link>
  );
}
