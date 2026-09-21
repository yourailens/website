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
        className={`relative z-[2] inline-flex items-center gap-2 transition ${
          pending ? "text-white/70" : ""
        }`}
      >
        <NavLinkPendingSpinner borderClassName="border-white" />
        <span>{pending ? "Loading" : label}</span>
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
      className={`relative inline-flex items-center text-[11px] uppercase tracking-[0.2em] text-white/45 hover:text-white ${className}`}
    >
      <SeeAllInner label={label} />
    </Link>
  );
}
