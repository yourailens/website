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
        <div className="mx-auto flex max-w-none items-center gap-2 px-4 py-3 sm:gap-5 sm:px-8 sm:py-4 lg:px-12">
          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-4">
            <Link
              href="/"
              aria-label="YOURAILens Studios home"
              className="group relative flex items-center gap-2 rounded-xl px-1.5 py-1 transition hover:bg-white/[0.04] sm:gap-2.5 sm:px-2 sm:py-1.5"
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
              <span className="hidden min-w-0 flex-col justify-center leading-none sm:flex">
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
              <p className="hidden font-mono text-[9px] tracking-[0.36em] text-white/55 sm:block">YAIL</p>
              <p className="font-heading text-lg leading-none tracking-[0.14em] sm:mt-0.5 sm:text-xl sm:tracking-[0.18em]">
                YAILIANS
              </p>
            </Link>
          </div>

          <nav className="ml-auto flex min-w-0 items-center gap-0.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1 [&::-webkit-scrollbar]:hidden">
            {NAV.map((item) => {
              const on =
                "exact" in item && item.exact
                  ? activeHref === item.href
                  : activeHref === item.href || activeHref.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-2.5 py-2 font-mono text-[9px] uppercase tracking-[0.18em] transition sm:px-3 sm:text-[10px] sm:tracking-[0.22em] ${
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
