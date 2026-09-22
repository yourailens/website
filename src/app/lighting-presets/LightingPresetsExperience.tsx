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
import type { LightingPreset, LightingType, LightingMood } from "@/data/lighting_presets";
import {
  ALL_LIGHTING_TYPES,
  ALL_LIGHTING_MOODS,
  LIGHTING_TYPE_LABELS,
  LIGHTING_MOOD_LABELS,
} from "@/data/lighting_presets";

function Card({ item }: { item: LightingPreset }) {
  return (
    <Link
      href={`/lighting-presets/${item.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src={item.image_url}
          alt={item.title}
          width={400}
          height={item.aspect_ratio === "portrait" ? 560 : item.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {item.featured && (
          <div className="absolute left-2 top-2">
            <span className="border border-blue-400/50 bg-blue-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-200">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {LIGHTING_TYPE_LABELS[item.lighting_type]}
          </span>
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
            {LIGHTING_MOOD_LABELS[item.mood]}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function LightingPresetsExperience() {
  const [items, setItems] = useState<LightingPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeType, setActiveType] = useState<LightingType | "">("");
  const [activeMood, setActiveMood] = useState<LightingMood | "">("");
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (ref.current) clearTimeout(ref.current);
    ref.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, [search]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (debouncedSearch) p.set("q", debouncedSearch);
      if (activeType) p.set("lighting_type", activeType);
      if (activeMood) p.set("mood", activeMood);
      p.set("limit", "80");
      const res = await fetch(`/api/lighting-presets?${p}`);
      setItems(
        ((await res.json()) as { lighting_presets: LightingPreset[] }).lighting_presets ?? []
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeType, activeMood]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const hasFilter = !!(activeType || activeMood || debouncedSearch);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Lighting" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Lighting presets by type, mood, and color temperature for cinematic looks.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search lighting by type, mood, color temperature…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Type
            </span>
            <OttFilterChip label="All" active={activeType === ""} onClick={() => setActiveType("")} />
            {ALL_LIGHTING_TYPES.map((t) => (
              <OttFilterChip
                key={t}
                label={LIGHTING_TYPE_LABELS[t]}
                active={activeType === t}
                onClick={() => setActiveType(activeType === t ? "" : t)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Mood
            </span>
            <OttFilterChip label="All" active={activeMood === ""} onClick={() => setActiveMood("")} />
            {ALL_LIGHTING_MOODS.map((m) => (
              <OttFilterChip
                key={m}
                label={LIGHTING_MOOD_LABELS[m]}
                active={activeMood === m}
                onClick={() => setActiveMood(activeMood === m ? "" : m)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} py-2.5`}>
        <p className="text-xs text-white/40">
          {loading ? "Searching…" : `${items.length} result${items.length !== 1 ? "s" : ""}`}
          {hasFilter && !loading && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveType("");
                setActiveMood("");
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
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 break-inside-avoid animate-pulse border border-white/10 bg-white/[0.04]"
                style={{ height: 240 }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-white/15 py-32 text-center">
            <p className="font-body text-lg font-semibold text-white">No lighting presets found</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-4">
            {items.map((p) => (
              <Card key={p.id} item={p} />
            ))}
          </div>
        )}
      </div>
    </IndustryShell>
  );
}
