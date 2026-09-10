import Link from "next/link";
import HomeBlueTint from "@/components/home/HomeBlueTint";

export const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";

export const HAND = {
  fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive",
} as const;

export const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

export function StickyLabel({
  children,
  className = "",
  tone = "white",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "white" | "blue";
}) {
  return (
    <p
      className={`inline-block border px-3 py-1.5 text-lg shadow-sm ${
        tone === "blue"
          ? "border-2 border-blue-700 bg-blue-600 text-white"
          : "border border-blue-600 bg-white text-slate-900"
      } ${className}`}
      style={HAND}
    >
      {children}
    </p>
  );
}

export function SectionShell({
  children,
  className = "",
  id,
  tint = false,
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
  tint?: boolean;
  dark?: boolean;
}) {
  const inner = (
    <div id={id} className={`${PAGE} py-14 lg:py-20 ${className}`}>
      {children}
    </div>
  );
  if (dark) {
    return <section className="border-t border-white/10 bg-slate-950 text-white">{inner}</section>;
  }
  if (tint) {
    return <HomeBlueTint className="border-t border-blue-100/60">{inner}</HomeBlueTint>;
  }
  return <section className="border-t border-blue-100/60 bg-white">{inner}</section>;
}

export function SectionHead({
  eyebrow,
  title,
  accent,
  body,
  note,
  light = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  body?: string;
  note?: string;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center gap-3">
        <span className={`h-px w-8 ${light ? "bg-blue-400/70" : "bg-blue-400/80"}`} aria-hidden />
        <p
          className={`text-[10px] font-light uppercase tracking-[0.3em] ${
            light ? "text-blue-300/80" : "text-blue-600/80"
          }`}
        >
          {eyebrow}
        </p>
      </div>
      <h2
        className={`text-[clamp(2rem,5vw,3.6rem)] font-light leading-[1.08] ${
          light ? "text-white" : "text-slate-900"
        }`}
        style={{ letterSpacing: "-0.04em" }}
      >
        {title}
        {accent ? (
          <>
            {" "}
            <span className={`font-semibold ${light ? "text-blue-300" : "text-blue-700"}`}>{accent}</span>
          </>
        ) : null}
      </h2>
      {body ? (
        <p
          className={`mt-4 max-w-2xl text-[15px] font-light leading-relaxed ${
            light ? "text-white/65" : "text-slate-600"
          }`}
        >
          {body}
        </p>
      ) : null}
      {note ? (
        <p
          className={`mt-3 inline-block rotate-[6deg] text-sm font-light ${
            light ? "text-blue-300" : "text-blue-600"
          }`}
          style={HAND}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
}

export function SketchCard({
  children,
  className = "",
  rotate = "",
}: {
  children: React.ReactNode;
  className?: string;
  rotate?: string;
}) {
  return (
    <div className={`relative border border-blue-200 bg-white p-5 shadow-sm ${rotate} ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
      <div className="relative">{children}</div>
    </div>
  );
}

export function CropMarks() {
  return (
    <>
      <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-blue-400" aria-hidden />
    </>
  );
}

export function OfferingCta({
  eyebrow,
  title,
  accent,
  href = "/contact",
  cta = "Start a project →",
}: {
  eyebrow: string;
  title: string;
  accent: string;
  href?: string;
  cta?: string;
}) {
  return (
    <section className="border-t border-blue-100 bg-white py-20 lg:py-28">
      <div className={`${PAGE} text-center`}>
        <div className="mx-auto flex max-w-2xl items-center justify-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-300" aria-hidden />
          <p className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600">{eyebrow}</p>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-300" aria-hidden />
        </div>
        <h2 className="mx-auto mt-6 max-w-3xl text-[clamp(2rem,4.8vw,3.6rem)] font-light leading-[1.18] text-slate-900">
          {title} <span className="font-semibold text-blue-700">{accent}</span>
        </h2>
        <Link
          href={href}
          className="mt-9 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
        >
          {cta}
        </Link>
      </div>
    </section>
  );
}
