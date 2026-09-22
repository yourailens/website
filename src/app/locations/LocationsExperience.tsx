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
import type { Location, LocationCategory } from "@/data/locations";
import {
  ALL_LOCATION_CATEGORIES,
  LOCATION_CATEGORY_LABELS,
  LOCATION_TIME_LABELS,
} from "@/data/locations";

function LocationCard({ loc }: { loc: Location }) {
  return (
    <Link
      href={`/locations/${loc.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src={loc.image_url}
          alt={loc.title}
          width={400}
          height={loc.aspect_ratio === "portrait" ? 560 : loc.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {loc.featured && (
          <div className="absolute left-2 top-2">
            <span className="border border-blue-400/50 bg-blue-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-200">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{loc.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {LOCATION_CATEGORY_LABELS[loc.category]}
          </span>
          {loc.time_of_day !== "any" && (
            <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
              {LOCATION_TIME_LABELS[loc.time_of_day]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function LocationsExperience() {
  const [items, setItems] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dSearch, setDSearch] = useState("");
  const [activeCat, setActiveCat] = useState<LocationCategory | "">("");
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDSearch(search), 350);
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [search]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (dSearch) p.set("q", dSearch);
      if (activeCat) p.set("category", activeCat);
      p.set("limit", "80");
      const res = await fetch(`/api/locations?${p}`);
      const json = (await res.json()) as { locations: Location[] };
      setItems(json.locations ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dSearch, activeCat]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Locations" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Environment and set references across time of day, weather, and mood.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search locations by category, time of day, mood…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
            Cat
          </span>
          <OttFilterChip label="All" active={activeCat === ""} onClick={() => setActiveCat("")} />
          {ALL_LOCATION_CATEGORIES.map((c) => (
            <OttFilterChip
              key={c}
              label={LOCATION_CATEGORY_LABELS[c]}
              active={activeCat === c}
              onClick={() => setActiveCat(activeCat === c ? "" : c)}
            />
          ))}
        </div>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} py-2.5`}>
        <p className="text-xs text-white/40">
          {loading ? "Searching…" : `${items.length} result${items.length !== 1 ? "s" : ""}`}
          {(activeCat || dSearch) && !loading && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCat("");
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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-white/15 py-32 text-center">
            <p className="font-body text-lg font-semibold text-white">No locations found</p>
            <p className="mt-1 text-sm text-white/45">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {items.map((loc) => (
              <LocationCard key={loc.id} loc={loc} />
            ))}
          </div>
        )}
      </div>
    </IndustryShell>
  );
}
