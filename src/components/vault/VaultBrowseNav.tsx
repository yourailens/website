"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import VaultPendingLink from "@/components/vault/VaultPendingLink";
import { YAIL_VAULT_CATEGORIES } from "@/data/yail-vault";
import {
  filmmakingHubHref,
  genreHref,
  type VaultGenreNavItem,
} from "@/lib/yail-vault/genres";
import type { VaultShellCounts, VaultView } from "@/components/vault/vault-nav-types";

const NAV_PILL = "group flex flex-col rounded-2xl px-3.5 py-2.5 transition";
const NAV_ON =
  "bg-gradient-to-br from-white/[0.14] to-white/[0.05] text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/20";
const NAV_OFF =
  "text-white/60 hover:bg-white/[0.06] hover:text-white hover:ring-1 hover:ring-white/10";

function viewHref(view: VaultView) {
  if (view === "all") return "/vault";
  if (view === "filmmaking") return filmmakingHubHref();
  return `/vault?view=${view}`;
}

type Props = {
  counts: VaultShellCounts;
  genres: VaultGenreNavItem[];
  activeView?: VaultView;
  activeGenreSlug?: string | null;
  onNavigate?: () => void;
};

export default function VaultBrowseNav({
  counts,
  genres,
  activeView = "all",
  activeGenreSlug = null,
  onNavigate,
}: Props) {
  const pathname = usePathname() ?? "";
  const onFilmmakingRoute =
    pathname === "/vault/filmmaking" || pathname.startsWith("/vault/filmmaking/");
  const filmmakingActive = activeView === "filmmaking" || onFilmmakingRoute;
  const [open, setOpen] = useState(filmmakingActive);

  useEffect(() => {
    if (filmmakingActive) setOpen(true);
  }, [filmmakingActive]);

  const topItems: { id: VaultView; label: string; hint: string; count: number }[] = [
    { id: "all", label: "All labs", hint: "Everything in the vault", count: counts.all },
    {
      id: "ads",
      label: YAIL_VAULT_CATEGORIES[1].label,
      hint: YAIL_VAULT_CATEGORIES[1].rail,
      count: counts.ads,
    },
    { id: "avatars", label: "AI Avatars", hint: "Directory & jumbotrons", count: counts.avatars },
  ];

  return (
    <nav className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-3 pb-6 pt-2">
      <div>
        <p className="mb-2.5 px-3 font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">
          Browse
        </p>
        <ul className="space-y-1.5">
          {/* All labs */}
          <li>
            <VaultPendingLink
              href={viewHref("all")}
              onClick={onNavigate}
              className={`${NAV_PILL} ${activeView === "all" && !onFilmmakingRoute ? NAV_ON : NAV_OFF}`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold tracking-tight">All labs</span>
                <span
                  className={`font-mono text-[10px] ${
                    activeView === "all" && !onFilmmakingRoute ? "text-white/45" : "text-white/25"
                  }`}
                >
                  {counts.all}
                </span>
              </span>
              <span className="mt-0.5 text-[11px] leading-snug text-white/30 group-hover:text-white/40">
                Everything in the vault
              </span>
            </VaultPendingLink>
          </li>

          {/* AI Filmmaking + genre dropdown */}
          <li>
            <div
              className={`${NAV_PILL} ${
                filmmakingActive && !activeGenreSlug ? NAV_ON : filmmakingActive ? "ring-1 ring-white/10" : NAV_OFF
              }`}
            >
              <div className="flex items-start gap-1">
                <VaultPendingLink
                  href={filmmakingHubHref()}
                  onClick={onNavigate}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-semibold tracking-tight text-inherit">
                      {YAIL_VAULT_CATEGORIES[0].label}
                    </span>
                    <span
                      className={`font-mono text-[10px] ${
                        filmmakingActive ? "text-white/45" : "text-white/25"
                      }`}
                    >
                      {counts.filmmaking}
                    </span>
                  </span>
                  <span
                    className={`mt-0.5 block text-[11px] leading-snug ${
                      filmmakingActive ? "text-white/45" : "text-white/30"
                    }`}
                  >
                    {YAIL_VAULT_CATEGORIES[0].rail}
                  </span>
                </VaultPendingLink>
                <button
                  type="button"
                  aria-label={open ? "Collapse genres" : "Expand genres"}
                  aria-expanded={open}
                  onClick={() => setOpen((v) => !v)}
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/[0.06] hover:text-white/80"
                >
                  <span
                    className={`block text-[10px] transition ${open ? "rotate-90" : ""}`}
                    aria-hidden
                  >
                    ›
                  </span>
                </button>
              </div>

              {open ? (
                <ul className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
                  <li>
                    <VaultPendingLink
                      href={filmmakingHubHref()}
                      onClick={onNavigate}
                      className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-[12px] transition ${
                        filmmakingActive && !activeGenreSlug
                          ? "bg-white/[0.08] font-medium text-white"
                          : "text-white/55 hover:bg-white/[0.05] hover:text-white/85"
                      }`}
                    >
                      <span>All filmmaking</span>
                      <span className="font-mono text-[10px] text-white/30">{counts.filmmaking}</span>
                    </VaultPendingLink>
                  </li>
                  {genres.map((g) => {
                    const on = activeGenreSlug === g.slug;
                    return (
                      <li key={g.slug}>
                        <VaultPendingLink
                          href={genreHref(g.slug)}
                          onClick={onNavigate}
                          className={`flex items-center justify-between gap-2 rounded-xl px-2.5 py-1.5 text-[12px] transition ${
                            on
                              ? "bg-white/[0.08] font-medium text-white"
                              : "text-white/55 hover:bg-white/[0.05] hover:text-white/85"
                          }`}
                        >
                          <span className="truncate">{g.name}</span>
                          <span className="shrink-0 font-mono text-[10px] text-white/30">{g.count}</span>
                        </VaultPendingLink>
                      </li>
                    );
                  })}
                  {!genres.length ? (
                    <li className="px-2.5 py-1.5 text-[11px] text-white/35">
                      Genres appear when cuts have a Genre tag.
                    </li>
                  ) : null}
                </ul>
              ) : null}
            </div>
          </li>

          {topItems
            .filter((item) => item.id !== "all")
            .map((item) => {
              const on = activeView === item.id && !onFilmmakingRoute;
              return (
                <li key={item.id}>
                  <VaultPendingLink
                    href={viewHref(item.id)}
                    onClick={onNavigate}
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
                  </VaultPendingLink>
                </li>
              );
            })}
        </ul>
      </div>
    </nav>
  );
}
