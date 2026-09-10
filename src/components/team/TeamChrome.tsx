import type { ReactNode } from "react";
import Link from "next/link";

export const TEAM_PAGE = "mx-auto max-w-7xl px-6 lg:px-10";

export function TeamEyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 flex items-center gap-2 ${className}`.trim()}>
      <span className="h-px w-6 bg-blue-400/80" aria-hidden />
      <p className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600/80">{children}</p>
    </div>
  );
}

export function TeamMasthead({
  kicker = "YourAILens Studios",
  title,
  accent,
}: {
  kicker?: string;
  title: ReactNode;
  accent?: ReactNode;
}) {
  return (
    <section className="border-b border-blue-100 bg-white">
      <div className="px-6 py-8 text-center sm:py-11">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 sm:gap-7">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-200" aria-hidden />
          <div>
            <p className="mb-2 text-[9px] font-light uppercase tracking-[0.38em] text-blue-500/90 sm:text-[10px]">
              {kicker}
            </p>
            <h1 className="text-[clamp(1.45rem,3.4vw,2.9rem)] font-light leading-none tracking-[-0.035em] text-slate-900">
              {title}
              {accent ? <> {accent}</> : null}
            </h1>
          </div>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-200" aria-hidden />
        </div>
      </div>
    </section>
  );
}

export function TeamMonogram({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const letter = (name.trim().charAt(0) || "U").toUpperCase();
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#f4f8ff] ${className}`.trim()}
      aria-hidden
    >
      <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(59,130,246,0.16),transparent_55%),radial-gradient(ellipse_at_80%_90%,rgba(37,99,235,0.08),transparent_50%)]" />
      <span className="relative font-heading leading-none text-blue-600/80" style={{ fontSize: "clamp(4.5rem,18vw,9rem)" }}>
        {letter}
      </span>
    </div>
  );
}

export function TeamProfileBar({ unit }: { unit?: string }) {
  return (
    <div className="border-b border-blue-100/80 bg-white">
      <div className={`${TEAM_PAGE} flex h-14 items-center justify-between sm:h-16`}>
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-[10px] font-light uppercase tracking-[0.22em] text-blue-600 transition hover:text-blue-800"
        >
          <span aria-hidden>←</span>
          All team
        </Link>
        {unit ? (
          <p className="text-[9px] font-light uppercase tracking-[0.32em] text-slate-400">{unit}</p>
        ) : null}
      </div>
    </div>
  );
}
