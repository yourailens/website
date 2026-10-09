"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_NAV, adminNavActive, adminPageMeta } from "@/data/admin-nav";

const NAV_PILL =
  "group flex flex-col rounded-2xl px-3.5 py-2.5 transition";
const NAV_PILL_ON =
  "bg-gradient-to-br from-white/[0.14] to-white/[0.05] text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/20";
const NAV_PILL_OFF =
  "text-white/60 hover:bg-white/[0.06] hover:text-white hover:ring-1 hover:ring-white/10";
const FOOT_BTN =
  "flex w-full items-center justify-center rounded-2xl px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const meta = adminPageMeta(pathname ?? "");

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

  if (pathname?.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const nav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-3 pb-6 pt-2">
      {ADMIN_NAV.map((group) => (
        <div key={group.id}>
          <p className="mb-2.5 px-3 font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">
            {group.label}
          </p>
          <ul className="space-y-1.5">
            {group.items.map((item) => {
              const on = adminNavActive(pathname ?? "", item);
              return (
                <li key={item.href}>
                  <Link href={item.href} className={`${NAV_PILL} ${on ? NAV_PILL_ON : NAV_PILL_OFF}`}>
                    <span className="text-[13px] font-semibold tracking-tight">{item.label}</span>
                    {item.hint ? (
                      <span
                        className={`mt-0.5 text-[11px] leading-snug ${
                          on ? "text-white/45" : "text-white/30 group-hover:text-white/40"
                        }`}
                      >
                        {item.hint}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const foot = (
    <div className="shrink-0 space-y-2 border-t border-white/10 p-3">
      <Link
        href="/"
        className={`${FOOT_BTN} border border-white/15 bg-white/[0.03] text-white/70 hover:border-white/40 hover:text-white`}
      >
        View site
      </Link>
      <button
        type="button"
        onClick={signOut}
        className={`${FOOT_BTN} bg-[#f4f4f5] text-black hover:bg-blue-100`}
      >
        Sign out
      </button>
    </div>
  );

  return (
    <div className="admin-shell flex h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#070707] font-body text-white">
      {/* Desktop rail — fixed height, never scrolls with the page */}
      <aside className="hidden h-full w-[15.5rem] shrink-0 flex-col border-r border-white/10 bg-[#0b0b0b] lg:flex">
        <div className="shrink-0 px-5 pb-3 pt-6">
          <Link href="/admin" className="block rounded-2xl px-1 py-1 transition hover:bg-white/[0.03]">
            <p className="font-mono text-[9px] tracking-[0.32em] text-blue-400">CONTROL ROOM</p>
            <p className="mt-1.5 font-heading text-xl leading-none tracking-tight">Studio desk</p>
          </Link>
        </div>
        {nav}
        {foot}
      </aside>

      {/* Mobile drawer */}
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
            <div>
              <p className="font-mono text-[9px] tracking-[0.32em] text-blue-400">CONTROL ROOM</p>
              <p className="mt-1 font-heading text-lg leading-none">Studio desk</p>
            </div>
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-40 flex shrink-0 items-center gap-3 border-b border-white/10 bg-[#070707]/95 px-4 py-3.5 backdrop-blur-md sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 text-white/80 lg:hidden"
            aria-label="Open menu"
          >
            <span className="flex flex-col gap-1" aria-hidden>
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
            </span>
          </button>
          <div className="min-w-0 flex-1">
            {meta.group ? (
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-blue-400/80">{meta.group}</p>
            ) : null}
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="truncate font-heading text-lg leading-none tracking-tight sm:text-xl">
                {meta.title || "Desk"}
              </h1>
              {meta.hint ? <p className="truncate text-xs text-white/40">{meta.hint}</p> : null}
            </div>
          </div>
          <Link
            href="/"
            className="hidden rounded-2xl border border-white/15 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 transition hover:border-white/35 hover:text-white sm:inline-flex"
          >
            Site
          </Link>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
