"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  OTT_SEARCH_CATALOG,
  OTT_SEARCH_CHIPS,
  OTT_SEARCH_FEATURED,
  OTT_SEARCH_HINTS,
  groupOttSearch,
  matchOttSearch,
  type OttSearchHit,
} from "@/data/ott-search";

type IndustryHit = { slug: string; name: string; tagline: string | null; coverUrl: string | null };

export function SearchGlyph({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

function Poster({ src, title }: { src?: string | null; title: string }) {
  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-white/30">
        <SearchGlyph size={22} />
      </div>
    );
  }
  if (src.startsWith("/")) {
    return <Image src={src} alt={title} fill className="object-cover transition duration-500 group-hover:scale-[1.06]" sizes="280px" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]" />
  );
}

function ResultCard({ hit, onPick }: { hit: OttSearchHit; onPick: () => void }) {
  return (
    <Link
      href={hit.href}
      prefetch
      onClick={onPick}
      className="group relative block overflow-hidden bg-zinc-950"
    >
      <div className="relative aspect-video overflow-hidden">
        <Poster src={hit.image} title={hit.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <p className="absolute left-3 top-3 font-mono text-[9px] uppercase tracking-[0.28em] text-blue-300">{hit.kind}</p>
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-heading text-lg leading-none text-white">{hit.title}</p>
          {hit.subtitle ? <p className="mt-1 line-clamp-1 text-xs text-white/50">{hit.subtitle}</p> : null}
        </div>
      </div>
    </Link>
  );
}

export default function OttSearchOverlay({
  open,
  onClose,
  industries,
}: {
  open: boolean;
  onClose: () => void;
  industries: IndustryHit[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [hintIndex, setHintIndex] = useState(0);
  const [remoteHits, setRemoteHits] = useState<OttSearchHit[]>([]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => {
      setHintIndex((i) => (i + 1) % OTT_SEARCH_HINTS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    Promise.all([
      fetch("/api/gallery/films")
        .then((res) => (res.ok ? res.json() : { films: [] }))
        .catch(() => ({ films: [] })),
      fetch("/api/gallery/images")
        .then((res) => (res.ok ? res.json() : { images: [] }))
        .catch(() => ({ images: [] })),
    ]).then(([filmsJson, imagesJson]: [{ films?: { href: string; title: string; posterUrl?: string | null }[] }, { images?: { id?: string; src: string; title: string }[] }]) => {
      if (cancelled) return;
      const films: OttSearchHit[] = (filmsJson.films ?? []).map((film) => ({
        href: film.href,
        title: film.title,
        kind: "Film",
        image: film.posterUrl,
        subtitle: "From the film gallery",
      }));
      const stills: OttSearchHit[] = (imagesJson.images ?? []).map((img) => ({
        href: img.id ? `/images/${encodeURIComponent(img.id)}` : "/images",
        title: img.title,
        kind: "Still",
        image: img.src,
        subtitle: "From the stills gallery",
      }));
      setRemoteHits([...films, ...stills]);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const catalog = useMemo(() => {
    const industryHits: OttSearchHit[] = industries.map((ind) => ({
      href: `/industries/${ind.slug}`,
      title: ind.name,
      kind: "Industry",
      image: ind.coverUrl,
      subtitle: ind.tagline ?? "Industry",
    }));
    const merged = [...OTT_SEARCH_CATALOG, ...industryHits, ...remoteHits];
    const seen = new Set<string>();
    return merged.filter((hit) => {
      const key = `${hit.kind}:${hit.href}:${hit.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [industries, remoteHits]);

  const results = useMemo(() => matchOttSearch(catalog, query), [catalog, query]);
  const grouped = useMemo(() => groupOttSearch(results), [results]);
  const searching = query.trim().length > 0;

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search the studio"
      className="fixed inset-0 z-[110] flex min-h-[100dvh] flex-col bg-black"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(37,99,235,0.18),_transparent_55%)]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 3px)" }}
        aria-hidden
      />

      <div className="relative flex items-center justify-between px-5 py-4 sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-blue-400/80">Search the lot</p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-3 text-white/70 transition hover:text-white"
          aria-label="Close search"
        >
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.28em] sm:inline">Esc</span>
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/25">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 4l10 10M14 4L4 14" />
            </svg>
          </span>
        </button>
      </div>

      <div className="relative mx-auto w-full max-w-5xl flex-1 overflow-y-auto px-5 pb-16 sm:px-8">
        <label className="block">
          <span className="sr-only">Search titles, channels, industries</span>
          <div className="flex items-end gap-4 border-b border-white/20 pb-3 focus-within:border-blue-400">
            <span className="mb-1 text-white/50">
              <SearchGlyph size={28} />
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={OTT_SEARCH_HINTS[hintIndex]}
              className="w-full bg-transparent font-heading text-3xl text-white outline-none placeholder:text-white/25 sm:text-5xl"
            />
          </div>
        </label>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.24em] text-white/35">
          Titles, channels, industries, libraries
        </p>

        {!searching ? (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              {OTT_SEARCH_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => setQuery(chip.query)}
                  className="rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-white/75 transition hover:border-white/40 hover:text-white"
                >
                  {chip.label}
                </button>
              ))}
            </div>
            <section className="mt-10">
              <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400/80">Now on the lot</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {OTT_SEARCH_FEATURED.map((hit) => (
                  <ResultCard key={hit.href} hit={hit} onPick={onClose} />
                ))}
              </div>
            </section>
          </>
        ) : grouped.length === 0 ? (
          <p className="mt-16 font-heading text-2xl text-white/50">Nothing matches “{query.trim()}”.</p>
        ) : (
          <div className="mt-10 flex flex-col gap-10">
            {grouped.map((group) => (
              <section key={group.kind}>
                <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.32em] text-blue-400/80">
                  {group.kind}
                  <span className="ml-3 text-white/30">{group.items.length}</span>
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {group.items.slice(0, 12).map((hit) => (
                    <ResultCard key={`${hit.kind}-${hit.href}-${hit.title}`} hit={hit} onPick={onClose} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
