import Link from "next/link";
import type { ReactNode } from "react";

const NAV = [
  { href: "/yailians", label: "Film", exact: true },
  { href: "/yailians/voices", label: "Voices" },
  { href: "/yailians/screenings", label: "Screenings" },
  { href: "/yailians/world", label: "World" },
] as const;

export default function YailiansShell({
  children,
  activeHref,
  overHero = false,
}: {
  children: ReactNode;
  activeHref: string;
  /** Float a transparent nav over the hub hero. */
  overHero?: boolean;
}) {
  return (
    <div className="min-h-screen bg-black font-body text-white">
      <header
        className={
          overHero
            ? "absolute inset-x-0 top-0 z-40 bg-transparent"
            : "sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-md"
        }
      >
        <div className="mx-auto flex max-w-none flex-wrap items-center gap-3 px-5 py-4 sm:gap-5 sm:px-8 lg:px-12">
          <div className="flex min-w-0 shrink-0 items-center gap-3 sm:gap-4">
            <Link
              href="/"
              aria-label="YOURAILens Studios home"
              className="group relative flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.04]"
            >
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 transition group-hover:bg-blue-500"
              >
                <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
                  <path
                    d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
                    fill="white"
                    fillOpacity="0.15"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <circle cx="9" cy="9" r="3" fill="white" />
                </svg>
              </span>
              <span className="flex min-w-0 flex-col justify-center leading-none">
                <span className="font-heading text-[1.05rem] tracking-[0.04em] text-white">
                  YOUR<span className="text-blue-400">AI</span>LENS
                </span>
                <span className="mt-0.5 font-heading text-[0.52rem] uppercase tracking-[0.42em] text-white/55 transition group-hover:text-white/70">
                  Studios
                </span>
              </span>
            </Link>

            <span className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />

            <Link href="/yailians" className="shrink-0">
              <p className="font-mono text-[9px] tracking-[0.36em] text-white/55">YAIL</p>
              <p className="mt-0.5 font-heading text-xl leading-none tracking-[0.18em]">YAILIANS</p>
            </Link>
          </div>

          <nav className="order-3 flex w-full min-w-0 flex-wrap items-center gap-1 sm:order-none sm:ml-auto sm:w-auto sm:justify-end">
            {NAV.map((item) => {
              const on =
                "exact" in item && item.exact
                  ? activeHref === item.href
                  : activeHref === item.href || activeHref.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition ${
                    on ? "text-white" : "text-white/45 hover:text-white/85"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
