"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AiModelBadge from "@/components/vault/AiModelBadge";
import type { YailVaultAvatar } from "@/data/yail-vault-avatars";
import {
  YAIL_VAULT_CATEGORIES,
  tagsOfKind,
  yailVaultCategoryLabel,
  type YailVaultCategory,
  type YailVaultEntry,
} from "@/data/yail-vault";

const NAV_PILL = "group flex flex-col rounded-2xl px-3.5 py-2.5 transition";
const NAV_ON =
  "bg-gradient-to-br from-white/[0.14] to-white/[0.05] text-white shadow-[0_12px_28px_-18px_rgba(0,0,0,0.9)] ring-1 ring-white/20";
const NAV_OFF =
  "text-white/60 hover:bg-white/[0.06] hover:text-white hover:ring-1 hover:ring-white/10";

type Filter = "all" | YailVaultCategory | "avatars";

const FILTERS: Filter[] = ["all", "filmmaking", "ads", "avatars"];

function isVaultFilter(value: string | null | undefined): value is Filter {
  return Boolean(value && (FILTERS as string[]).includes(value));
}

function readFilterFromUrl(): Filter {
  if (typeof window === "undefined") return "all";
  const view = new URLSearchParams(window.location.search).get("view");
  return isVaultFilter(view) ? view : "all";
}

function writeFilterToUrl(next: Filter) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (next === "all") url.searchParams.delete("view");
  else url.searchParams.set("view", next);
  const qs = url.searchParams.toString();
  window.history.replaceState(null, "", qs ? `${url.pathname}?${qs}` : url.pathname);
}

function entryThumb(entry: YailVaultEntry) {
  return entry.poster_url || (entry.media_type === "image" ? entry.media_url : null);
}

function PlayGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M3 1.5v11l9-5.5L3 1.5z" />
    </svg>
  );
}

/** OTT hero: full-bleed media + bottom-left overlay copy. */
function VaultOttHero({ entry }: { entry: YailVaultEntry }) {
  const poster = entryThumb(entry);
  const genre = tagsOfKind(entry, "genre")[0]?.name;
  const avatar = tagsOfKind(entry, "avatar")[0]?.name;

  return (
    <section className="relative isolate min-h-[min(72vh,42rem)] w-full overflow-hidden bg-zinc-950">
      {entry.media_type === "video" ? (
        <video
          key={entry.id}
          src={entry.media_url}
          poster={poster ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-black to-black" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      <div className="relative z-10 flex min-h-[min(72vh,42rem)] flex-col justify-end px-5 pb-10 pt-24 sm:px-8 sm:pb-12 lg:px-10 lg:pb-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/90">
          {yailVaultCategoryLabel(entry.category)}
          {genre ? ` · ${genre}` : ""}
          {avatar ? ` · ${avatar}` : ""}
        </p>
        <h1 className="mt-3 max-w-2xl font-body text-[clamp(2.1rem,5vw,4rem)] font-semibold leading-[0.95] tracking-tight text-white">
          {entry.title}
        </h1>
        {entry.caption ? (
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/70 sm:text-base">
            {entry.caption}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={`/vault/${entry.slug}`}
            className="inline-flex items-center gap-2 rounded-md bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_8px_24px_-8px_rgba(0,0,0,0.65)] transition hover:bg-sky-100"
          >
            <PlayGlyph size={12} />
            Open
          </Link>
          <AiModelBadge modelId={entry.ai_model} size="md" />
        </div>
      </div>
    </section>
  );
}

/** Rail tile: poster/thumb only — no empty black cards. */
function VaultRailCard({ entry }: { entry: YailVaultEntry }) {
  const genre = tagsOfKind(entry, "genre")[0]?.name;
  const tag = genre ?? yailVaultCategoryLabel(entry.category);
  const thumb = entryThumb(entry);
  const isVideo = entry.media_type === "video";

  return (
    <Link
      href={`/vault/${entry.slug}`}
      className="group relative block h-[9.5rem] w-[16.5rem] shrink-0 overflow-hidden rounded-md bg-zinc-900 sm:h-[11rem] sm:w-[19.5rem] lg:h-[12rem] lg:w-[21.5rem]"
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={entry.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : isVideo ? (
        <video
          src={entry.media_url}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-950 to-black">
          <PlayGlyph size={20} />
        </div>
      )}

      {isVideo ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fafafa] text-black shadow-lg">
            <PlayGlyph size={14} />
          </span>
        </span>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-2.5 pb-2 pt-10">
        {tag ? (
          <p className="font-mono text-[7px] tracking-[0.18em] text-sky-300/90">{tag}</p>
        ) : null}
        <p className="mt-0.5 truncate text-[12px] font-medium leading-tight text-white sm:text-[13px]">
          {entry.title}
        </p>
        {entry.ai_model ? (
          <div className="mt-1.5">
            <AiModelBadge modelId={entry.ai_model} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function VaultRail({
  title,
  scene,
  entries,
}: {
  title: string;
  scene: string;
  entries: YailVaultEntry[];
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: dir * node.clientWidth * 0.72, behavior: "smooth" });
  };

  if (!entries.length) return null;

  return (
    <section className="w-full">
      <div className="flex items-end justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[0.28em] text-sky-400/90">{scene}</p>
          <h2 className="mt-1 font-body text-[clamp(1.05rem,2.2vw,1.45rem)] font-semibold leading-none tracking-tight">
            {title}
          </h2>
        </div>
        <div className="mb-0.5 hidden shrink-0 gap-1 md:flex">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="ott-rail mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 sm:gap-2.5 sm:px-8 lg:px-10"
      >
        {entries.map((entry) => (
          <div key={entry.id} className="snap-start">
            <VaultRailCard entry={entry} />
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyVault() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo_yail.png" alt="" className="h-10 w-auto opacity-90" />
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-sky-300/80">Vault</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight text-white sm:text-5xl">Enter the labs</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
        GenAI experiments in filmmaking and ads will land here. Check back once the first cut is published.
      </p>
    </section>
  );
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
          <div className="relative overflow-hidden rounded-[1.15rem] bg-zinc-900 ring-1 ring-white/10 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.95)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatar.portrait_url}
              alt={avatar.name}
              className="aspect-[3/4] w-[min(100%,19rem)] object-cover object-top sm:w-[22rem] lg:w-[25rem]"
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
          </div>
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
            {avatar.name}
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
  initialView?: Filter;
}) {
  const avatars = avatarsProp ?? [];
  const [filter, setFilter] = useState<Filter>(() =>
    isVaultFilter(initialView) ? initialView : "all"
  );
  const [menuOpen, setMenuOpen] = useState(false);

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
    if (filter === "filmmaking") return filmmaking[0] ?? null;
    if (filter === "ads") return ads[0] ?? null;
    return featured ?? all[0] ?? null;
  }, [filter, featured, filmmaking, ads, all]);

  const filmmakingRail = useMemo(() => {
    if (filter === "ads" || filter === "avatars") return [];
    if (filter === "filmmaking") return filmmaking;
    return filmmaking.filter((e) => e.id !== hero?.id);
  }, [filter, filmmaking, hero?.id]);

  const adsRail = useMemo(() => {
    if (filter === "filmmaking" || filter === "avatars") return [];
    if (filter === "ads") return ads;
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
    if (filter === "filmmaking") {
      return { title: YAIL_VAULT_CATEGORIES[0].label, hint: "Filmmaking labs", count: filmmaking.length };
    }
    if (filter === "ads") {
      return { title: YAIL_VAULT_CATEGORIES[1].label, hint: "Ads labs", count: ads.length };
    }
    return { title: "All labs", hint: "Filmmaking & ads", count: all.length };
  }, [filter, filmmaking.length, ads.length, all.length, avatars.length]);

  const navItems: { id: Filter; label: string; hint: string; count: number }[] = [
    { id: "all", label: "All labs", hint: "Everything in the vault", count: all.length },
    {
      id: "filmmaking",
      label: YAIL_VAULT_CATEGORIES[0].label,
      hint: YAIL_VAULT_CATEGORIES[0].rail,
      count: filmmaking.length,
    },
    {
      id: "ads",
      label: YAIL_VAULT_CATEGORIES[1].label,
      hint: YAIL_VAULT_CATEGORIES[1].rail,
      count: ads.length,
    },
    { id: "avatars", label: "AI Avatars", hint: "Directory & jumbotrons", count: avatars.length },
  ];

  function pickFilter(next: Filter) {
    setFilter(next);
    writeFilterToUrl(next);
    setMenuOpen(false);
  }

  const nav = (
    <nav className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-3 pb-6 pt-2">
      <div>
        <p className="mb-2.5 px-3 font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">Browse</p>
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const on = filter === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => pickFilter(item.id)}
                  className={`w-full text-left ${NAV_PILL} ${on ? NAV_ON : NAV_OFF}`}
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
                </button>
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
          <Link
            href="/"
            className="hidden rounded-md border border-white/20 bg-black/35 px-3.5 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm transition hover:border-white/40 hover:text-white sm:inline-flex"
          >
            Studio
          </Link>
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
                <VaultRail title={YAIL_VAULT_CATEGORIES[0].label} scene="01" entries={filmmakingRail} />
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
