"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import HomeBlueTint from "@/components/home/HomeBlueTint";

export const INDUSTRY_PAGE = "mx-auto max-w-7xl px-6 lg:px-10";

export function IndustryShell({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-white font-body text-slate-900">{children}</div>;
}

export function IndustryEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <div className="h-px w-6 bg-blue-400/80" aria-hidden />
      <span className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600/80">{children}</span>
    </div>
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
    <h2
      className="max-w-3xl text-[clamp(1.65rem,4vw,2.5rem)] font-light leading-[1.2] text-slate-900"
      style={{ letterSpacing: "-0.02em" }}
    >
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
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-light text-slate-500"
      aria-label="Breadcrumb"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="inline-flex items-center gap-2">
          {i > 0 ? <span className="text-slate-300" aria-hidden>/</span> : null}
          {item.href && !item.current ? (
            <Link href={item.href} className="transition hover:text-blue-600">
              {item.label}
            </Link>
          ) : (
            <span className={item.current ? "font-medium text-slate-800" : undefined}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function IndustryTopBar({ children }: { children: ReactNode }) {
  return (
    <div className="border-b border-blue-100/80 bg-white/90 backdrop-blur-sm">
      <div className={`${INDUSTRY_PAGE} py-4`}>{children}</div>
    </div>
  );
}

/** Soft hero band — matches homepage hero atmosphere */
export function IndustryHeroBand({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-blue-100/80 bg-gradient-to-br from-sky-50 via-blue-50/40 to-white py-12 lg:py-16">
      <div
        className="pointer-events-none absolute -top-20 -left-16 h-[min(360px,50vw)] w-[min(360px,50vw)] rounded-full bg-blue-400/20 blur-[80px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-1/4 -right-12 h-[min(300px,40vw)] w-[min(300px,40vw)] rounded-full bg-cyan-400/15 blur-[90px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(59,130,246,0.1),transparent_55%)]"
        aria-hidden
      />
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
    <HomeBlueTint className={`${borderTop ? "border-t border-blue-100/60" : ""} py-12 lg:py-16 ${className}`.trim()}>
      <div className={INDUSTRY_PAGE}>{children}</div>
    </HomeBlueTint>
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
    <div
      className={`overflow-hidden rounded-2xl border border-blue-100/80 bg-white/90 shadow-sm shadow-blue-100/20 backdrop-blur-sm ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function IndustryPrimaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
    >
      {children}
      <span className="text-blue-200" aria-hidden>
        →
      </span>
    </Link>
  );
}

export function IndustryTextLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-light italic text-slate-600 underline decoration-blue-300/80 decoration-2 underline-offset-[6px] transition hover:text-blue-700"
    >
      {children}
    </Link>
  );
}

export function IndustryBadge({ children }: { children: ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/70 px-3 py-1.5 shadow-sm shadow-blue-100/40 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-blue-500" aria-hidden />
      <span className="text-[11px] font-light italic tracking-[0.22em] text-blue-600 uppercase">{children}</span>
    </div>
  );
}
