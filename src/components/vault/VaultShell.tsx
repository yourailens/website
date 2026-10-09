"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { YAIL_VAULT_CATEGORIES } from "@/data/yail-vault";

const NAV_PILL = "group flex flex-col rounded-2xl px-3.5 py-2.5 transition";
const NAV_ON =
  "bg-gradient-to-br from-white/[0.14] to-white/[0.05] text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/20";
const NAV_OFF =
  "text-white/60 hover:bg-white/[0.06] hover:text-white hover:ring-1 hover:ring-white/10";

export type VaultView = "all" | "filmmaking" | "ads" | "avatars";

export type VaultShellCounts = {
  all: number;
  filmmaking: number;
  ads: number;
  avatars: number;
};

type Props = {
  children: ReactNode;
  counts: VaultShellCounts;
  /** Which browse item is active in the sidebar */
  activeView?: VaultView;
  /** Main panel title strip (optional — detail pages pass cut title) */
  headerKicker?: string;
  headerTitle?: string;
  headerMeta?: string;
  /** Overlay header on hero (home) vs solid bar (detail) */
  headerMode?: "overlay" | "bar";
};

function viewHref(view: VaultView) {
  if (view === "all") return "/vault";
  return `/vault?view=${view}`;
}

export default function VaultShell({
  children,
  counts,
  activeView = "all",
  headerKicker = "GenAI labs",
  headerTitle,
  headerMeta,
  headerMode = "bar",
}: Props) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const navItems: { id: VaultView; label: string; hint: string; count: number }[] = [
    { id: "all", label: "All labs", hint: "Everything in the vault", count: counts.all },
    {
      id: "filmmaking",
      label: YAIL_VAULT_CATEGORIES[0].label,
      hint: YAIL_VAULT_CATEGORIES[0].rail,
      count: counts.filmmaking,
    },
    {
      id: "ads",
      label: YAIL_VAULT_CATEGORIES[1].label,
      hint: YAIL_VAULT_CATEGORIES[1].rail,
      count: counts.ads,
    },
    { id: "avatars", label: "AI Avatars", hint: "Directory & jumbotrons", count: counts.avatars },
  ];

  const nav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-3 pb-6 pt-2">
      <div>
        <p className="mb-2.5 px-3 font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">Browse</p>
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const on = activeView === item.id;
            return (
              <li key={item.id}>
                <Link
                  href={viewHref(item.id)}
                  onClick={() => setMenuOpen(false)}
                  className={`${NAV_PILL} ${on ? NAV_ON : NAV_OFF}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold tracking-tight">{item.label}</span>
                    <span className={`font-mono text-[10px] ${on ? "text-white/45" : "text-white/25"}`}>
                      {item.count}
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 text-[11px] leading-snug ${
                      on ? "text-white/45" : "text-white/30 group-hover:text-white/40"
                    }`}
                  >
                    {item.hint}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );

  const foot = (
    <div className="shrink-0 space-y-2 border-t border-white/10 p-3">
      <Link
        href="/"
        className="flex w-full items-center justify-center rounded-2xl border border-white/15 bg-white/[0.03] px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/40 hover:text-white"
      >
        Studio home
      </Link>
    </div>
  );

  const brand = (
    <Link href="/vault" className="block rounded-2xl px-1 py-1 transition hover:bg-white/[0.03]">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_yail.png" alt="" className="h-7 w-auto" />
        <div>
          <p className="font-mono text-[9px] tracking-[0.32em] text-emerald-400">YAIL</p>
          <p className="mt-0.5 font-heading text-xl leading-none tracking-tight">Vault</p>
        </div>
      </div>
    </Link>
  );

  const headerInner = (
    <div className="pointer-events-auto flex w-full items-center gap-3">
      <button
        type="button"
        onClick={() => setMenuOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-black/40 text-white/80 backdrop-blur-sm lg:hidden"
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-1" aria-hidden>
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
          <span className="block h-px w-4 bg-current" />
        </span>
      </button>
      <div className="min-w-0 flex-1 lg:pl-1">
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-sky-300/80">{headerKicker}</p>
        {headerTitle ? (
          <p className="mt-0.5 truncate text-sm font-medium text-white/85">
            {headerTitle}
            {headerMeta ? (
              <span className="ml-2 text-xs font-normal text-white/40">{headerMeta}</span>
            ) : null}
          </p>
        ) : null}
      </div>
      <Link
        href="/"
        className="hidden rounded-md border border-white/20 bg-black/35 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm transition hover:border-white/40 hover:text-white sm:inline-flex"
      >
        Studio
      </Link>
    </div>
  );

  return (
    <div className="vault-shell flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-black font-body text-white">
      <aside className="hidden h-full w-[15.5rem] shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b] lg:flex">
        <div className="shrink-0 px-5 pb-3 pt-6">{brand}</div>
        {nav}
        {foot}
      </aside>

      <div
        className={`fixed inset-0 z-[80] lg:hidden ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 bg-black/70 transition ${menuOpen ? "opacity-100" : "opacity-0"}`}
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex h-full w-[min(18rem,88vw)] flex-col border-r border-white/10 bg-[#0b0b0b] transition ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-5">
            {brand}
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/20 text-white/70"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {nav}
          {foot}
        </aside>
      </div>

      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {headerMode === "overlay" ? (
          <header className="pointer-events-none absolute left-0 right-0 top-0 z-40 bg-gradient-to-b from-black/45 to-transparent px-4 py-3.5 sm:px-6 lg:px-8">
            {headerInner}
          </header>
        ) : (
          <header className="z-40 flex shrink-0 items-center border-b border-white/10 bg-[#070707]/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
            {headerInner}
          </header>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
