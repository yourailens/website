"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import VaultBrowseNav from "@/components/vault/VaultBrowseNav";
import VaultPendingLink from "@/components/vault/VaultPendingLink";
import { EmptyVault, VaultOttHero, VaultRail } from "@/components/vault/vault-browse-ui";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";
import {
  YAIL_VAULT_CATEGORIES,
  pickVaultHero,
  type YailVaultCategory,
  type YailVaultEntry,
} from "@/data/yail-vault";
import { collectFilmmakingGenres } from "@/lib/yail-vault/genres";

type Filter = "all" | "ads" | "avatars";

const FILTERS: Filter[] = ["all", "ads", "avatars"];

function isVaultFilter(value: string | null | undefined): value is Filter {
  return Boolean(value && (FILTERS as string[]).includes(value));
}

function readFilterFromUrl(): Filter {
  if (typeof window === "undefined") return "all";
  const view = new URLSearchParams(window.location.search).get("view");
  return isVaultFilter(view) ? view : "all";
}

/** Portrait-first jumbotron — atmospheric, alternating, type-forward. */
function AvatarJumbotron({
  avatar,
  cuts,
  index = 0,
}: {
  avatar: YailVaultAvatar;
  cuts: YailVaultEntry[];
  index?: number;
}) {
  const flip = index % 2 === 1;
  const scene = String(index + 1).padStart(2, "0");

  return (
    <section className="relative isolate w-full overflow-hidden border-b border-white/10 bg-[#050505]">
      {/* Soft portrait wash — atmosphere, not the hero crop */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar.portrait_url}
          alt=""
          className={`absolute inset-0 h-full w-full scale-110 object-cover opacity-[0.18] blur-3xl ${
            flip ? "origin-right" : "origin-left"
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />
        <div
          className={`absolute inset-y-0 w-[55%] ${
            flip
              ? "right-0 bg-gradient-to-l from-black via-black/70 to-transparent"
              : "left-0 bg-gradient-to-r from-black via-black/70 to-transparent"
          }`}
        />
      </div>

      {/* Giant ghost name */}
      <p
        aria-hidden
        className={`pointer-events-none absolute top-[8%] font-body text-[clamp(4.5rem,18vw,12rem)] font-semibold leading-none tracking-tight text-white/[0.04] ${
          flip ? "right-[-2%] text-right" : "left-[-2%]"
        }`}
      >
        {avatar.name}
      </p>

      <div
        className={`relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-10 px-5 py-14 sm:gap-12 sm:px-8 sm:py-20 lg:flex-row lg:items-end lg:gap-0 lg:px-10 lg:py-24 ${
          flip ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Portrait stage — single frame, no overlapping deco cards */}
        <div className={`relative shrink-0 ${flip ? "lg:pl-10" : "lg:pr-10"}`}>
          <VaultPendingLink
            href={`/vault/avatars/${avatar.slug}`}
            className="group relative block overflow-hidden rounded-[1.15rem] bg-zinc-900 ring-1 ring-white/10 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.95)] transition hover:ring-white/25"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar.portrait_url}
              alt={avatar.name}
              className="aspect-[3/4] w-[min(100%,19rem)] object-cover object-top transition duration-500 group-hover:scale-[1.02] sm:w-[22rem] lg:w-[25rem]"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
              <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/70">
                {scene} · Avatar
              </span>
              {cuts.length ? (
                <span className="rounded-md bg-black/55 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-sky-200/90 backdrop-blur-sm">
                  {cuts.length} cut{cuts.length === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
          </VaultPendingLink>
        </div>

        {/* Copy */}
        <div
          className={`min-w-0 flex-1 pb-2 text-center lg:pb-6 ${
            flip ? "lg:pr-6 lg:text-right" : "lg:pl-6 lg:text-left"
          }`}
        >
          <div
            className={`mb-5 inline-flex items-center gap-2 ${flip ? "lg:flex-row-reverse" : ""}`}
          >
            <span className="h-px w-8 bg-sky-400/70" aria-hidden />
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-sky-300/90">
              Character file
            </p>
          </div>

          <h2 className="font-body text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[0.92] tracking-tight text-white">
            <VaultPendingLink
              href={`/vault/avatars/${avatar.slug}`}
              className="inline-block transition hover:text-sky-100"
            >
              {avatar.name}
            </VaultPendingLink>
          </h2>

          {avatar.tagline ? (
            <p
              className={`mt-5 max-w-md text-lg font-light leading-snug text-white/80 sm:text-xl ${
                flip ? "ml-auto lg:ml-auto" : "mx-auto lg:mx-0"
              }`}
            >
              {avatar.tagline}
            </p>
          ) : null}

          {avatar.bio ? (
            <p
              className={`mt-5 max-w-md text-sm leading-relaxed text-white/50 sm:text-[15px] ${
                flip ? "ml-auto" : "mx-auto lg:mx-0"
              }`}
            >
              {avatar.bio}
            </p>
          ) : null}

          <div className={`mt-8 ${flip ? "lg:flex lg:justify-end" : ""}`}>
            <VaultPendingLink
              href={`/vault/avatars/${avatar.slug}`}
              className="inline-flex items-center gap-2 rounded-md bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_8px_24px_-8px_rgba(0,0,0,0.65)] transition hover:bg-sky-100"
            >
              Open profile
            </VaultPendingLink>
          </div>
        </div>
      </div>

      {cuts.length ? (
        <div className="relative z-10 border-t border-white/10 bg-black/60 py-6 backdrop-blur-sm">
          <VaultRail title={`Labs with ${avatar.name}`} scene={scene} entries={cuts} />
        </div>
      ) : null}
    </section>
  );
}

function EmptyAvatars() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-sky-300/80">AI Avatars</p>
      <h1 className="mt-3 font-body text-3xl font-semibold tracking-tight text-white sm:text-4xl">
        Directory coming soon
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
        Publish avatars from the vault admin desk — each one gets a jumbotron here and can be tagged on multiple cuts.
      </p>
    </section>
  );
}


export default function VaultExperience({
  featured,
  filmmaking,
  ads,
  avatars: avatarsProp = [],
  initialView = "all",
}: {
  featured: YailVaultEntry | null;
  filmmaking: YailVaultEntry[];
  ads: YailVaultEntry[];
  avatars?: YailVaultAvatar[];
  initialView?: Filter | "filmmaking" | YailVaultCategory;
}) {
  const avatars = avatarsProp ?? [];
  const genres = useMemo(() => collectFilmmakingGenres(filmmaking), [filmmaking]);
  const [filter, setFilter] = useState<Filter>(() =>
    isVaultFilter(initialView) ? initialView : "all"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setFilter(isVaultFilter(initialView) ? initialView : "all");
  }, [initialView]);

  useEffect(() => {
    const onPop = () => setFilter(readFilterFromUrl());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const all = useMemo(() => {
    const seen = new Set<string>();
    const list: YailVaultEntry[] = [];
    for (const e of [...filmmaking, ...ads]) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      list.push(e);
    }
    return list;
  }, [filmmaking, ads]);

  const hero = useMemo(() => {
    if (filter === "avatars") return null;
    if (filter === "ads") return pickVaultHero(ads, "category");
    return featured ?? pickVaultHero(all, "featured");
  }, [filter, featured, ads, all]);

  const filmmakingRail = useMemo(() => {
    if (filter === "ads" || filter === "avatars") return [];
    return filmmaking.filter((e) => e.id !== hero?.id);
  }, [filter, filmmaking, hero?.id]);

  const adsRail = useMemo(() => {
    if (filter === "avatars") return [];
    if (filter === "ads") return ads.filter((e) => e.id !== hero?.id);
    return ads.filter((e) => e.id !== hero?.id);
  }, [filter, ads, hero?.id]);

  const cutsByAvatar = useMemo(() => {
    const map = new Map<string, YailVaultEntry[]>();
    for (const e of all) {
      for (const avatarId of e.avatar_ids ?? []) {
        const list = map.get(avatarId) ?? [];
        list.push(e);
        map.set(avatarId, list);
      }
    }
    return map;
  }, [all]);

  const meta = useMemo(() => {
    if (filter === "avatars") {
      return { title: "AI Avatars", hint: "Directory", count: avatars.length };
    }
    if (filter === "ads") {
      return { title: YAIL_VAULT_CATEGORIES[1].label, hint: "Ads labs", count: ads.length };
    }
    return { title: "All labs", hint: "Filmmaking & ads", count: all.length };
  }, [filter, ads.length, all.length, avatars.length]);

  const counts = {
    all: all.length,
    filmmaking: filmmaking.length,
    ads: ads.length,
    avatars: avatars.length,
  };

  const nav = (
    <VaultBrowseNav
      counts={counts}
      genres={genres}
      activeView={filter === "all" ? "all" : filter}
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
        <header className="pointer-events-none absolute left-0 right-0 top-0 z-40 flex items-center gap-3 bg-gradient-to-b from-black/45 to-transparent px-4 py-3.5 sm:px-6 lg:px-8">
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
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-sky-300/80">GenAI labs</p>
              <p className="mt-0.5 truncate text-sm font-medium text-white/85">
                {meta.title}
                <span className="ml-2 text-xs font-normal text-white/40">
                  {meta.count} {filter === "avatars" ? "avatars" : "cuts"}
                </span>
              </p>
            </div>
            <VaultPendingLink
              href="/"
              className="hidden rounded-md border border-white/20 bg-black/35 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm transition hover:border-white/40 hover:text-white sm:inline-flex"
            >
              Studio
            </VaultPendingLink>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {filter === "avatars" ? (
            !avatars.length ? (
              <EmptyAvatars />
            ) : (
              <div className="pb-10">
                {avatars.map((avatar, index) => (
                  <AvatarJumbotron
                    key={avatar.id}
                    avatar={avatar}
                    index={index}
                    cuts={cutsByAvatar.get(avatar.id) ?? []}
                  />
                ))}
              </div>
            )
          ) : !all.length ? (
            <EmptyVault />
          ) : (
            <div className="pb-14">
              {hero ? <VaultOttHero entry={hero} /> : null}
              <div className="relative z-10 -mt-6 space-y-8 sm:-mt-8 sm:space-y-10">
                <VaultRail
                  title={YAIL_VAULT_CATEGORIES[0].label}
                  scene="01"
                  entries={filmmakingRail}
                  titleHref="/vault/filmmaking"
                />
                <VaultRail title={YAIL_VAULT_CATEGORIES[1].label} scene="02" entries={adsRail} />
                {!filmmakingRail.length && !adsRail.length ? (
                  <p className="px-5 text-sm text-white/40 sm:px-8 lg:px-10">
                    More cuts will show in the rails once you publish additional labs.
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
