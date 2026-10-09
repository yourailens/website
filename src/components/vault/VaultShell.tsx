"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import VaultBrowseNav from "@/components/vault/VaultBrowseNav";
import VaultPendingLink from "@/components/vault/VaultPendingLink";
import type { VaultGenreNavItem } from "@/lib/yail-vault/genres";
import type { VaultShellCounts, VaultView } from "@/components/vault/vault-nav-types";

export type { VaultShellCounts, VaultView } from "@/components/vault/vault-nav-types";

type Props = {
  children: ReactNode;
  counts: VaultShellCounts;
  genres?: VaultGenreNavItem[];
  /** Which browse item is active in the sidebar */
  activeView?: VaultView;
  activeGenreSlug?: string | null;
  /** Main panel title strip (optional — detail pages pass cut title) */
  headerKicker?: string;
  headerTitle?: string;
  headerMeta?: string;
  /** Overlay header on hero (home) vs solid bar (detail) */
  headerMode?: "overlay" | "bar";
};

export default function VaultShell({
  children,
  counts,
  genres = [],
  activeView = "all",
  activeGenreSlug = null,
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

  const nav = (
    <VaultBrowseNav
      counts={counts}
      genres={genres}
      activeView={activeView}
      activeGenreSlug={activeGenreSlug}
      onNavigate={() => setMenuOpen(false)}
    />
  );

  const brand = (
    <div className="select-none">
      <div className="flex items-center gap-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo_yail.png" alt="" className="h-7 w-auto" />
        <div>
          <p className="font-mono text-[9px] tracking-[0.32em] text-emerald-400">YAIL</p>
          <p className="mt-0.5 font-heading text-xl leading-none tracking-tight">Vault</p>
        </div>
      </div>
    </div>
  );

  const sidebarHeader = (closeBtn?: ReactNode) => (
    <div className="shrink-0 border-b border-white/10">
      <div className="relative flex items-center gap-1 overflow-hidden px-3 py-2.5">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-sky-500/[0.14] via-sky-400/[0.05] to-transparent"
        />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-sky-400/40 via-sky-400/10 to-transparent" />
        <VaultPendingLink
          href="/"
          className="group relative z-[1] flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-white/[0.04]"
        >
          <span
            aria-hidden
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-300/25 bg-sky-400/10 font-mono text-[11px] text-sky-200/90 transition group-hover:border-sky-300/45 group-hover:bg-sky-400/16 group-hover:text-sky-100"
          >
            ←
          </span>
          <span className="min-w-0">
            <span className="block text-[12px] font-medium tracking-tight text-sky-100/90 transition group-hover:text-white">
              Back to Studios
            </span>
            <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-sky-200/40 transition group-hover:text-sky-200/65">
              Studio home
            </span>
          </span>
        </VaultPendingLink>
        {closeBtn ? <div className="relative z-[1] shrink-0">{closeBtn}</div> : null}
      </div>
      <div className="px-5 py-4">{brand}</div>
    </div>
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
      <VaultPendingLink
        href="/"
        className="hidden rounded-md border border-white/20 bg-black/35 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm transition hover:border-white/40 hover:text-white sm:inline-flex"
      >
        Studio
      </VaultPendingLink>
    </div>
  );

  return (
    <div className="vault-shell flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-black font-body text-white">
      <aside className="hidden h-full w-[15.5rem] shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b] lg:flex">
        {sidebarHeader()}
        {nav}
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
          {sidebarHeader(
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/12 text-white/50 transition hover:border-white/25 hover:text-white/80"
              aria-label="Close"
            >
              ×
            </button>
          )}
          {nav}
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
