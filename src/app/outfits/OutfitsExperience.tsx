"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { OttFilterChip, OttSearchInput } from "@/components/ott/OttLibraryControls";
import {
  INDUSTRY_PAGE,
  IndustryChannelTitle,
  IndustryGlow,
  IndustryShell,
} from "@/app/industries/IndustryUI";
import type { Outfit, OutfitCategory, OutfitCharacterType } from "@/data/outfits";
import {
  ALL_OUTFIT_CATEGORIES,
  OUTFIT_CATEGORY_LABELS,
  OUTFIT_CHARACTER_LABELS,
} from "@/data/outfits";

function MasonryGrid({ outfits }: { outfits: Outfit[] }) {
  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-white/15 py-32 text-center">
        <p className="font-body text-lg font-semibold text-white">No outfits found</p>
        <p className="mt-1 text-sm text-white/45">Try adjusting your search or filters</p>
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

function OutfitCard({ outfit }: { outfit: Outfit }) {
  return (
    <Link
      href={`/outfits/${outfit.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src={outfit.image_url}
          alt={outfit.title}
          width={400}
          height={outfit.aspect_ratio === "portrait" ? 560 : outfit.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {outfit.featured && (
          <div className="absolute left-2 top-2">
            <span className="border border-blue-400/50 bg-blue-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-200">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{outfit.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {OUTFIT_CATEGORY_LABELS[outfit.category]}
          </span>
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
            {OUTFIT_CHARACTER_LABELS[outfit.character_type]}
          </span>
        </div>
        {outfit.style_tags.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {outfit.style_tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-white/40">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function OutfitsExperience() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<OutfitCategory | "">("");
  const [activeCharacter, setActiveCharacter] = useState<OutfitCharacterType | "">("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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
      const json = (await res.json()) as { outfits: Outfit[] };
      setOutfits(json.outfits ?? []);
    } catch {
      setOutfits([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeCategory, activeCharacter]);

  useEffect(() => {
    fetchOutfits();
  }, [fetchOutfits]);

  const characterTypes: OutfitCharacterType[] = ["female", "male", "unisex"];

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Outfits" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Outfit sheets by character type and style for cast and campaign looks.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search outfit sheets by style, character, tags…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Char
            </span>
            <OttFilterChip
              label="All"
              active={activeCharacter === ""}
              onClick={() => setActiveCharacter("")}
            />
            {characterTypes.map((c) => (
              <OttFilterChip
                key={c}
                label={OUTFIT_CHARACTER_LABELS[c]}
                active={activeCharacter === c}
                onClick={() => setActiveCharacter(activeCharacter === c ? "" : c)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Style
            </span>
            <OttFilterChip
              label="All"
              active={activeCategory === ""}
              onClick={() => setActiveCategory("")}
            />
            {ALL_OUTFIT_CATEGORIES.map((cat) => (
              <OttFilterChip
                key={cat}
                label={OUTFIT_CATEGORY_LABELS[cat]}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(activeCategory === cat ? "" : cat)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} py-2.5`}>
        <p className="text-xs text-white/40">
          {loading ? "Searching…" : `${outfits.length} result${outfits.length !== 1 ? "s" : ""}`}
          {(activeCategory || activeCharacter || debouncedSearch) && !loading && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("");
                setActiveCharacter("");
              }}
              className="ml-3 font-semibold text-blue-300 hover:underline"
            >
              Clear all
            </button>
          )}
        </p>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} pb-20`}>
        {loading ? (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 break-inside-avoid animate-pulse border border-white/10 bg-white/[0.04]"
                style={{ height: [280, 360, 220, 320, 260, 400, 300, 240][i % 8] }}
              />
            ))}
          </div>
        ) : (
          <MasonryGrid outfits={outfits} />
        )}
      </div>
    </IndustryShell>
  );
}
