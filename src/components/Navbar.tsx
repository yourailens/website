"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { label: "Images", href: "/images" },
  { label: "Films", href: "/films" },
  { label: "Instagram", href: "/instagram" },
  { label: "Youtube", href: "/youtube" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* Announcement bar */}
      <div className="relative z-50 bg-blue-600 py-2.5 text-center text-xs font-semibold text-white">
        ✦ &nbsp;AI video campaigns delivered in 48 hours. &nbsp;
        <Link href="/contact" className="underline underline-offset-2 hover:text-blue-100 transition-colors">
          Book a free call →
        </Link>
      </div>

      {/* Main navbar */}
      <nav className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "shadow-sm"}`}>
        <div className="h-[3px] w-full bg-gradient-to-r from-blue-700 via-blue-500 to-cyan-400" />

        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex h-20 items-center justify-between gap-8">

            <Link href="/" className="flex shrink-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5"/>
                  <circle cx="9" cy="9" r="3" fill="white"/>
                </svg>
              </div>
              <div>
                <span className="font-heading text-xl font-bold tracking-[-0.02em] text-slate-900">
                  YourAI<span className="text-blue-600">Lens</span>
                </span>
                <span className="ml-2 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                  Studios
                </span>
              </div>
            </Link>

            <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group relative rounded-lg px-5 py-2 text-sm font-semibold text-slate-800 transition-colors hover:text-blue-600"
                >
                  {link.label}
                  <span className="absolute inset-x-4 bottom-1 h-[2px] origin-left scale-x-0 rounded-full bg-blue-500 transition-transform duration-200 group-hover:scale-x-100" />
                </Link>
              ))}
            </div>

            <div className="hidden shrink-0 items-center gap-3 lg:flex">
              <Link
                href="/contact"
                className="relative rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-blue-300 active:scale-95"
              >
                Book a free call
                <span className="ml-2">→</span>
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-xl border border-slate-200 lg:hidden"
              aria-label="Toggle menu"
            >
              <span className={`h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
              <span className={`h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <span className={`h-[2px] w-5 rounded-full bg-slate-700 transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu — above nav (z-50) so nothing stacks on top */}
      <div
        className={`fixed inset-0 z-[100] flex min-h-[100dvh] flex-col bg-[#1e3a8a] transition-opacity duration-300 lg:hidden ${menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
      >
        {/* Solid base + static gradient only — no background-position animation (avoids “shimmer line”) */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#172554] via-[#1d4ed8] to-[#1e3a8a]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30" aria-hidden />

        <div className="relative flex min-h-0 flex-1 flex-col px-6 pb-10 pt-[max(1rem,env(safe-area-inset-top))]">
          <div className="mb-8 flex items-center justify-between gap-4">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur-sm">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5"/>
                  <circle cx="9" cy="9" r="3" fill="white"/>
                </svg>
              </div>
              <div>
                <p className="font-heading text-base font-black tracking-tight text-white">YourAILens</p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">Studios</p>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
              aria-label="Close menu"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 4l10 10M14 4L4 14" />
              </svg>
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-4 text-2xl font-black tracking-tight text-white backdrop-blur-sm transition-colors hover:bg-white/[0.12]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-4 pt-10">
            <Link
              href="/contact"
              onClick={() => setMenuOpen(false)}
              className="block w-full rounded-full bg-white py-4 text-center text-base font-bold text-blue-700 shadow-xl shadow-black/20 transition-transform active:scale-[0.98]"
            >
              Book a free call →
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMenuOpen(false)}
              className="text-center text-sm font-semibold text-white/50 underline underline-offset-4 transition-colors hover:text-white/80"
            >
              Pricing
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
