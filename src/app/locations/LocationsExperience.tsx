"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Location, LocationCategory } from "@/data/locations";
import { ALL_LOCATION_CATEGORIES, LOCATION_CATEGORY_ACCENTS, LOCATION_CATEGORY_LABELS, LOCATION_TIME_LABELS, LOCATION_WEATHER_LABELS } from "@/data/locations";

function LocationCard({ loc }: { loc: Location }) {
  const accent = LOCATION_CATEGORY_ACCENTS[loc.category];
  return (
    <Link href={`/locations/${loc.slug}`} className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
      <div className="relative w-full overflow-hidden bg-slate-100">
        <Image src={loc.image_url} alt={loc.title} width={400} height={loc.aspect_ratio === "portrait" ? 560 : loc.aspect_ratio === "square" ? 400 : 260} className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" unoptimized />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3"><span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">View</span></div>
        </div>
        {loc.featured && <div className="absolute left-2 top-2"><span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">✦ Featured</span></div>}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-slate-900">{loc.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>{LOCATION_CATEGORY_LABELS[loc.category]}</span>
          {loc.time_of_day !== "any" && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{LOCATION_TIME_LABELS[loc.time_of_day]}</span>}
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
    return () => { if (debRef.current) clearTimeout(debRef.current); };
  }, [search]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (dSearch) p.set("q", dSearch);
      if (activeCat) p.set("category", activeCat);
      p.set("limit", "80");
      const res = await fetch(`/api/locations?${p}`);
      const json = await res.json() as { locations: Location[] };
      setItems(json.locations ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [dSearch, activeCat]);

  useEffect(() => { fetch_(); }, [fetch_]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="w-[95%] mx-auto pt-6 pb-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search locations by category, time of day, mood…" className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" />
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
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Cat</span>
              {(["",...ALL_LOCATION_CATEGORIES] as (LocationCategory | "")[]).map((c) => (
                <button key={c || "all"} type="button" onClick={() => setActiveCat(c === activeCat ? "" : c)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    activeCat === c
                      ? c ? LOCATION_CATEGORY_ACCENTS[c as LocationCategory] + " ring-2 ring-offset-1" : "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}>{c ? LOCATION_CATEGORY_LABELS[c as LocationCategory] : "All"}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[95%] mx-auto py-2.5">
          <p className="text-xs text-slate-400">{loading ? "Searching…" : `${items.length} result${items.length !== 1 ? "s" : ""}`}
            {(activeCat || dSearch) && !loading && <button type="button" onClick={() => { setSearch(""); setActiveCat(""); }} className="ml-3 font-semibold text-blue-600 hover:underline">Clear all</button>}</p>
        </div>
        <div className="w-[95%] mx-auto pb-20">
          {loading ? (
            <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
              {Array.from({ length: 20 }).map((_, i) => <div key={i} className="mb-3 break-inside-avoid animate-pulse rounded-2xl bg-slate-200" style={{ height: [280,360,220,320,260,400,300,240][i%8] }} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-heading text-lg font-bold text-slate-700">No locations found</p>
              <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
              {items.map((loc) => <LocationCard key={loc.id} loc={loc} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
