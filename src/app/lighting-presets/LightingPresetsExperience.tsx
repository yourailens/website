"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { LightingPreset, LightingType, LightingMood } from "@/data/lighting_presets";
import { ALL_LIGHTING_TYPES, ALL_LIGHTING_MOODS, LIGHTING_TYPE_LABELS, LIGHTING_TYPE_ACCENTS, LIGHTING_MOOD_LABELS } from "@/data/lighting_presets";

function FilterChip({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent?: string }) {
  return <button type="button" onClick={onClick} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${active ? accent ? `${accent} shadow-sm` : "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}>{label}</button>;
}

function Card({ item }: { item: LightingPreset }) {
  const accent = LIGHTING_TYPE_ACCENTS[item.lighting_type];
  return (
    <Link href={`/lighting-presets/${item.slug}`} className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative w-full overflow-hidden bg-slate-100">
        <Image src={item.image_url} alt={item.title} width={400} height={item.aspect_ratio === "portrait" ? 560 : item.aspect_ratio === "square" ? 400 : 260} className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" unoptimized />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 p-3">
          <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">View</span>
        </div>
        {item.featured && <div className="absolute left-2 top-2"><span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow">✦</span></div>}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>{LIGHTING_TYPE_LABELS[item.lighting_type]}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{LIGHTING_MOOD_LABELS[item.mood]}</span>
        </div>
      </div>
    </Link>
  );
}

export default function LightingPresetsExperience() {
  const [items, setItems] = useState<LightingPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeType, setActiveType] = useState<LightingType | "">("");
  const [activeMood, setActiveMood] = useState<LightingMood | "">("");
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { if (ref.current) clearTimeout(ref.current); ref.current = setTimeout(() => setDebouncedSearch(search), 350); return () => { if (ref.current) clearTimeout(ref.current); }; }, [search]);
  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (debouncedSearch) p.set("q", debouncedSearch);
      if (activeType) p.set("lighting_type", activeType);
      if (activeMood) p.set("mood", activeMood);
      p.set("limit", "80");
      const res = await fetch(`/api/lighting-presets?${p}`);
      setItems(((await res.json()) as { lighting_presets: LightingPreset[] }).lighting_presets ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [debouncedSearch, activeType, activeMood]);
  useEffect(() => { fetch_(); }, [fetch_]);
  const hasFilter = !!(activeType || activeMood || debouncedSearch);
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white"><div className="w-[95%] mx-auto pt-6 pb-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search lighting by type, mood, color temperature…" className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" />
            {search ? <button type="button" onClick={() => setSearch("")} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button> : <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center"><span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">⌘K</span></div>}
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1.5 items-center"><span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Type</span><FilterChip label="All" active={activeType === ""} onClick={() => setActiveType("")} />{ALL_LIGHTING_TYPES.map((t) => <FilterChip key={t} label={LIGHTING_TYPE_LABELS[t]} active={activeType === t} accent={activeType === t ? LIGHTING_TYPE_ACCENTS[t] : undefined} onClick={() => setActiveType(activeType === t ? "" : t)} />)}</div>
            <div className="flex flex-wrap gap-1.5 items-center"><span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Mood</span><FilterChip label="All" active={activeMood === ""} onClick={() => setActiveMood("")} />{ALL_LIGHTING_MOODS.map((m) => <FilterChip key={m} label={LIGHTING_MOOD_LABELS[m]} active={activeMood === m} onClick={() => setActiveMood(activeMood === m ? "" : m)} />)}</div>
          </div>
        </div></div>
        <div className="w-[95%] mx-auto py-2.5"><p className="text-xs text-slate-400">{loading ? "Searching…" : `${items.length} result${items.length !== 1 ? "s" : ""}`}{hasFilter && !loading && <button type="button" onClick={() => { setSearch(""); setActiveType(""); setActiveMood(""); }} className="ml-3 font-semibold text-blue-600 hover:underline">Clear all</button>}</p></div>
        <div className="w-[95%] mx-auto pb-20">
          {loading ? <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">{Array.from({ length: 16 }).map((_, i) => <div key={i} className="mb-3 break-inside-avoid animate-pulse rounded-2xl bg-slate-200" style={{ height: 240 }} />)}</div>
          : items.length === 0 ? <div className="flex flex-col items-center justify-center py-32 text-center"><p className="font-heading text-lg font-bold text-slate-700">No lighting presets found</p></div>
          : <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-4">{items.map((p) => <Card key={p.id} item={p} />)}</div>}
        </div>
      </div>
    </>
  );
}
