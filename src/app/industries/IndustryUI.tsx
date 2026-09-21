"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export const INDUSTRY_PAGE = "mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-16";

export function IndustryShell({ children }: { children: ReactNode }) {
  return (
    <div className="ott-home relative min-h-screen overflow-x-hidden bg-black font-body text-white">
      {children}
    </div>
  );
}

export function IndustryGlow({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 h-[32rem] opacity-50 ${className}`.trim()}
      style={{
        background:
          "radial-gradient(ellipse 55% 50% at 18% 0%, rgba(37,99,235,0.32), transparent 55%), radial-gradient(ellipse 40% 35% at 90% 8%, rgba(29,78,216,0.16), transparent 50%)",
      }}
      aria-hidden
    />
  );
}

export function IndustryEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">{children}</p>
  );
}

export function IndustrySectionTitle({
  children,
  accent,
}: {
  children: ReactNode;
  accent?: ReactNode;
}) {
  return (
    <h2 className="mt-3 max-w-3xl font-body text-[clamp(1.65rem,4vw,2.6rem)] font-semibold leading-[1.12] tracking-tight text-white">
      {children}
      {accent ? <> {accent}</> : null}
    </h2>
  );
}

export function IndustryBreadcrumb({
  items,
}: {
  items: { label: string; href?: string; current?: boolean }[];
}) {
  return (
    <nav
      className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-[0.18em] text-white/40"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
          {i > 0 ? <span className="text-white/20" aria-hidden>/</span> : null}
          {item.href && !item.current ? (
            <Link href={item.href} className="transition hover:text-blue-300">
              {item.label}
            </Link>
          ) : (
            <span className={item.current ? "text-white/75" : undefined}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function IndustryTopBar({ children }: { children: ReactNode }) {
  return (
    <div className="relative border-b border-white/10">
      <div className={`${INDUSTRY_PAGE} py-4`}>{children}</div>
    </div>
  );
}

/** OTT channel hero band */
export function IndustryHeroBand({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 py-12 lg:py-16">
      <IndustryGlow />
      <div className={`${INDUSTRY_PAGE} relative`}>{children}</div>
    </section>
  );
}

export function IndustryTintSection({
  children,
  className = "",
  borderTop = true,
}: {
  children: ReactNode;
  className?: string;
  borderTop?: boolean;
}) {
  return (
    <section
      className={`relative ${borderTop ? "border-t border-white/10" : ""} py-12 lg:py-16 ${className}`.trim()}
    >
      <div className={INDUSTRY_PAGE}>{children}</div>
    </section>
  );
}

export function IndustryCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden border border-white/12 bg-white/[0.03] ${className}`.trim()}>
      {children}
    </div>
  );
}

export function IndustryPrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="relative inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-blue-400/55 bg-transparent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 shadow-[inset_0_1px_0_rgba(96,165,250,0.25)] backdrop-blur-md transition hover:border-blue-300 hover:text-blue-200"
    >
      {children}
    </Link>
  );
}

export function IndustryTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-blue-300"
    >
      {children}
    </Link>
  );
}

export function IndustryBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.32em] text-blue-400">
      <span className="h-1 w-1 rounded-full bg-blue-400" aria-hidden />
      {children}
    </span>
  );
}

/** YAIL + channel title used on hub heroes */
export function IndustryChannelTitle({
  channel,
  title,
}: {
  channel: string;
  title: string;
}) {
  return (
    <>
      <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">{channel}</p>
      <h1 className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:gap-x-4">
        <span className="sr-only">{title}</span>
        <Image
          src="/images/logo_yail.png"
          alt=""
          width={640}
          height={180}
          priority
          className="h-[clamp(2.4rem,8vw,4.5rem)] w-auto select-none drop-shadow-[0_0_28px_rgba(59,130,246,0.45)]"
          aria-hidden
        />
        <span className="font-body text-[clamp(2.4rem,8vw,5rem)] font-semibold leading-none tracking-tight">
          {title}
        </span>
      </h1>
    </>
  );
}
