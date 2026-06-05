"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Scenario, ScenarioType } from "@/data/scenarios";
import { ALL_SCENARIO_TYPES, SCENARIO_TYPE_ACCENTS, SCENARIO_TYPE_LABELS, SCENARIO_SETTING_LABELS, SCENARIO_MOOD_LABELS } from "@/data/scenarios";

function ScenarioCard({ s }: { s: Scenario }) {
  const accent = SCENARIO_TYPE_ACCENTS[s.scenario_type];
  return (
    <Link href={`/scenarios/${s.slug}`} className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80">
      <div className="relative w-full overflow-hidden bg-slate-100">
        <Image src={s.image_url} alt={s.title} width={400} height={s.aspect_ratio === "portrait" ? 560 : s.aspect_ratio === "square" ? 400 : 260} className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" unoptimized />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3"><span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">View</span></div>
        </div>
        {s.featured && <div className="absolute left-2 top-2"><span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">✦ Featured</span></div>}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-slate-900">{s.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>{SCENARIO_TYPE_LABELS[s.scenario_type]}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{SCENARIO_SETTING_LABELS[s.setting]}</span>
        </div>
      </div>
    </Link>
  );
}

export default function ScenariosExperience() {
  const [items, setItems] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dSearch, setDSearch] = useState("");
  const [activeType, setActiveType] = useState<ScenarioType | "">("");
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
      if (activeType) p.set("type", activeType);
      p.set("limit", "80");
      const res = await fetch(`/api/scenarios?${p}`);
      const json = await res.json() as { scenarios: Scenario[] };
      setItems(json.scenarios ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [dSearch, activeType]);

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
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search reference scenarios by type, mood, setting…" className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" />
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
              <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Type</span>
              {(["",...ALL_SCENARIO_TYPES] as (ScenarioType | "")[]).map((t) => (
                <button key={t || "all"} type="button" onClick={() => setActiveType(t === activeType ? "" : t)}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                    activeType === t
                      ? t ? SCENARIO_TYPE_ACCENTS[t as ScenarioType] + " ring-2 ring-offset-1" : "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  }`}>{t ? SCENARIO_TYPE_LABELS[t as ScenarioType] : "All"}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="w-[95%] mx-auto py-2.5">
          <p className="text-xs text-slate-400">{loading ? "Searching…" : `${items.length} result${items.length !== 1 ? "s" : ""}`}
            {(activeType || dSearch) && !loading && <button type="button" onClick={() => { setSearch(""); setActiveType(""); }} className="ml-3 font-semibold text-blue-600 hover:underline">Clear all</button>}</p>
        </div>
        <div className="w-[95%] mx-auto pb-20">
          {loading ? (
            <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
              {Array.from({ length: 20 }).map((_, i) => <div key={i} className="mb-3 break-inside-avoid animate-pulse rounded-2xl bg-slate-200" style={{ height: [280,360,220,320,260,400,300,240][i%8] }} />)}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="font-heading text-lg font-bold text-slate-700">No scenarios found</p>
              <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
              {items.map((s) => <ScenarioCard key={s.id} s={s} />)}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
