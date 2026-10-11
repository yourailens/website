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

function viewHref(view: VaultView) {
  if (view === "all") return "/vault";
  if (view === "filmmaking") return filmmakingHubHref();
  return `/vault?view=${view}`;
}

function NavRow({
  href,
  label,
  count,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <VaultPendingLink
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group relative flex min-h-11 w-full items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
        active ? "text-white" : "text-white/55 hover:text-white"
      }`}
    >
      <span
        aria-hidden
        className={`absolute inset-y-1.5 left-0 w-[2px] rounded-full transition ${
          active
            ? "bg-sky-400"
            : "bg-transparent group-hover:bg-sky-400/35"
        }`}
      />
      <span className="truncate text-[13px] font-medium tracking-tight">{label}</span>
      <span
        className={`shrink-0 font-mono text-[10px] tabular-nums tracking-wide ${
          active ? "text-white/45" : "text-white/25 group-hover:text-white/40"
        }`}
      >
        {count}
      </span>
    </VaultPendingLink>
  );
}

function SubNavRow({
  href,
  label,
  count,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  count: number;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <VaultPendingLink
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group flex min-h-10 w-full items-center justify-between gap-2 px-3 py-2 transition-colors ${
        active ? "text-white" : "text-white/45 hover:text-white/85"
      }`}
    >
      <span className="truncate text-[12px] font-medium tracking-tight">{label}</span>
      <span
        className={`shrink-0 font-mono text-[10px] tabular-nums ${
          active ? "text-white/40" : "text-white/20 group-hover:text-white/35"
        }`}
      >
        {count}
      </span>
    </VaultPendingLink>
  );
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
  const filmmakingHubActive = filmmakingActive && !activeGenreSlug;
  const [open, setOpen] = useState(filmmakingActive);

  useEffect(() => {
    if (filmmakingActive) setOpen(true);
  }, [filmmakingActive]);

  return (
    <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-2 pb-6 pt-3">
      <p className="mb-1 px-3 font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">
        Browse
      </p>

      <ul className="flex flex-col">
        <li>
          <NavRow
            href={viewHref("all")}
            label="All labs"
            count={counts.all}
            active={activeView === "all" && !onFilmmakingRoute}
            onNavigate={onNavigate}
          />
        </li>

        <li>
          <div className="flex items-stretch">
            <VaultPendingLink
              href={filmmakingHubHref()}
              onClick={onNavigate}
              aria-current={filmmakingHubActive ? "page" : undefined}
              className={`group relative flex min-h-11 min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2.5 transition-colors ${
                filmmakingActive ? "text-white" : "text-white/55 hover:text-white"
              }`}
            >
              <span
                aria-hidden
                className={`absolute inset-y-1.5 left-0 w-[2px] rounded-full transition ${
                  filmmakingHubActive
                    ? "bg-sky-400"
                    : filmmakingActive
                      ? "bg-sky-400/45"
                      : "bg-transparent group-hover:bg-sky-400/35"
                }`}
              />
              <span className="truncate text-[13px] font-medium tracking-tight">
                {YAIL_VAULT_CATEGORIES[0].label}
              </span>
              <span
                className={`shrink-0 font-mono text-[10px] tabular-nums tracking-wide ${
                  filmmakingActive ? "text-white/45" : "text-white/25 group-hover:text-white/40"
                }`}
              >
                {counts.filmmaking}
              </span>
            </VaultPendingLink>

            <button
              type="button"
              aria-label={open ? "Collapse genres" : "Expand genres"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="flex w-11 shrink-0 items-center justify-center text-white/40 transition-colors hover:text-white"
            >
              <span
                className={`block text-[11px] leading-none transition-transform duration-200 ${
                  open ? "rotate-90" : ""
                }`}
                aria-hidden
              >
                ›
              </span>
            </button>
          </div>

          {open ? (
            <ul className="mb-1 ml-3 border-l border-white/[0.08] pl-1">
              <li>
                <SubNavRow
                  href={filmmakingHubHref()}
                  label="All filmmaking"
                  count={counts.filmmaking}
                  active={filmmakingHubActive}
                  onNavigate={onNavigate}
                />
              </li>
              {genres.map((g) => (
                <li key={g.slug}>
                  <SubNavRow
                    href={genreHref(g.slug)}
                    label={g.name}
                    count={g.count}
                    active={activeGenreSlug === g.slug}
                    onNavigate={onNavigate}
                  />
                </li>
              ))}
              {!genres.length ? (
                <li className="px-3 py-2 text-[11px] leading-snug text-white/30">
                  Genres appear when cuts have a Genre tag.
                </li>
              ) : null}
            </ul>
          ) : null}
        </li>

        <li>
          <NavRow
            href={viewHref("ads")}
            label={YAIL_VAULT_CATEGORIES[1].label}
            count={counts.ads}
            active={activeView === "ads" && !onFilmmakingRoute}
            onNavigate={onNavigate}
          />
        </li>

        <li>
          <NavRow
            href={viewHref("avatars")}
            label="AI Avatars"
            count={counts.avatars}
            active={activeView === "avatars" && !onFilmmakingRoute}
            onNavigate={onNavigate}
          />
        </li>
      </ul>
    </nav>
  );
}
