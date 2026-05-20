"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Outfit, OutfitCategory, OutfitCharacterType } from "@/data/outfits";
import {
  ALL_OUTFIT_CATEGORIES,
  OUTFIT_CATEGORY_ACCENTS,
  OUTFIT_CATEGORY_LABELS,
  OUTFIT_CHARACTER_LABELS,
} from "@/data/outfits";

// ── Masonry grid ──────────────────────────────────────────────

function MasonryGrid({ outfits }: { outfits: Outfit[] }) {
  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </div>
        <p className="font-heading text-lg font-bold text-slate-700">No outfits found</p>
        <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-5">
      {outfits.map((outfit) => (
        <OutfitCard key={outfit.id} outfit={outfit} />
      ))}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────

function OutfitCard({ outfit }: { outfit: Outfit }) {
  const accent = OUTFIT_CATEGORY_ACCENTS[outfit.category];

  return (
    <Link
      href={`/outfits/${outfit.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80"
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden bg-slate-100">
        <Image
          src={outfit.image_url}
          alt={outfit.title}
          width={400}
          height={outfit.aspect_ratio === "portrait" ? 560 : outfit.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
                View
              </span>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-white/80">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                {outfit.download_count > 0 ? `${outfit.download_count}` : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Featured badge */}
        {outfit.featured && (
          <div className="absolute left-2 top-2">
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
              ✦ Featured
            </span>
          </div>
        )}
      </div>

      {/* Meta */}
      <div className="p-3">
        <p className="truncate text-sm font-bold text-slate-900">{outfit.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>
            {OUTFIT_CATEGORY_LABELS[outfit.category]}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {OUTFIT_CHARACTER_LABELS[outfit.character_type]}
          </span>
        </div>
        {outfit.style_tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {outfit.style_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-slate-400">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

// ── Filter bar ────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onClick,
  accent,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
        active
          ? accent
            ? `${accent} shadow-sm ring-2 ring-offset-1 ring-current/30`
            : "bg-blue-600 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      }`}
    >
      {label}
    </button>
  );
}

// ── Main experience ───────────────────────────────────────────

export default function OutfitsExperience() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<OutfitCategory | "">("");
  const [activeCharacter, setActiveCharacter] = useState<OutfitCharacterType | "">("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchOutfits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("q", debouncedSearch);
      if (activeCategory) params.set("category", activeCategory);
      if (activeCharacter) params.set("character_type", activeCharacter);
      params.set("limit", "80");
      const res = await fetch(`/api/outfits?${params}`);
      const json = await res.json() as { outfits: Outfit[] };
      setOutfits(json.outfits ?? []);
    } catch { setOutfits([]); }
    finally { setLoading(false); }
  }, [debouncedSearch, activeCategory, activeCharacter]);

  useEffect(() => { fetchOutfits(); }, [fetchOutfits]);

  const characterTypes: OutfitCharacterType[] = ["female", "male", "unisex"];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        {/* ── Search + filters ── */}
        <div className="border-b border-slate-200 bg-white">
          <div className="w-[95%] mx-auto pt-6 pb-4">
            {/* Search bar */}
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search outfit sheets by style, character, tags…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
              />
              {search ? (
                <button type="button" onClick={() => setSearch("")} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              ) : (
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">⌘K</span>
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="mt-3 space-y-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Char</span>
                <FilterChip label="All" active={activeCharacter === ""} onClick={() => setActiveCharacter("")} />
                {characterTypes.map((c) => (
                  <FilterChip key={c} label={OUTFIT_CHARACTER_LABELS[c]} active={activeCharacter === c} onClick={() => setActiveCharacter(activeCharacter === c ? "" : c)} />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Style</span>
                <FilterChip label="All" active={activeCategory === ""} onClick={() => setActiveCategory("")} />
                {ALL_OUTFIT_CATEGORIES.map((cat) => (
                  <FilterChip key={cat} label={OUTFIT_CATEGORY_LABELS[cat]} active={activeCategory === cat} accent={activeCategory === cat ? OUTFIT_CATEGORY_ACCENTS[cat] : undefined} onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-[95%] mx-auto py-2.5">
          <p className="text-xs text-slate-400">
            {loading ? "Searching…" : `${outfits.length} result${outfits.length !== 1 ? "s" : ""}`}
            {(activeCategory || activeCharacter || debouncedSearch) && !loading && (
              <button type="button" onClick={() => { setSearch(""); setActiveCategory(""); setActiveCharacter(""); }} className="ml-3 font-semibold text-blue-600 hover:underline">Clear all</button>
            )}
          </p>
        </div>

        {/* ── Masonry grid ── */}
        <div className="w-[95%] mx-auto pb-20">
          {loading ? (
            <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="mb-3 break-inside-avoid animate-pulse rounded-2xl bg-slate-200"
                  style={{ height: [280, 360, 220, 320, 260, 400, 300, 240][i % 8] }}
                />
              ))}
            </div>
          ) : (
            <MasonryGrid outfits={outfits} />
          )}
        </div>
      </div>
    </>
  );
}
