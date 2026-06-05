"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { MoodBoard, AestheticStyle, AestheticEra } from "@/data/mood_boards";
import { ALL_AESTHETIC_STYLES, ALL_AESTHETIC_ERAS, AESTHETIC_STYLE_LABELS, AESTHETIC_STYLE_ACCENTS, AESTHETIC_ERA_LABELS } from "@/data/mood_boards";

function FilterChip({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent?: string }) {
  return <button type="button" onClick={onClick} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${active ? accent ? `${accent} shadow-sm` : "bg-blue-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"}`}>{label}</button>;
}

function Card({ item }: { item: MoodBoard }) {
  const accent = AESTHETIC_STYLE_ACCENTS[item.aesthetic];
  return (
    <Link href={`/mood-boards/${item.slug}`} className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative w-full overflow-hidden bg-slate-100">
        <Image src={item.image_url} alt={item.title} width={400} height={item.aspect_ratio === "portrait" ? 560 : item.aspect_ratio === "square" ? 400 : 260} className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" unoptimized />
        {item.color_palette.length > 0 && <div className="absolute bottom-0 left-0 right-0 flex h-3">{item.color_palette.slice(0, 6).map((c, i) => <div key={i} className="flex-1" style={{ backgroundColor: c }} />)}</div>}
        {item.featured && <div className="absolute left-2 top-2"><span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white shadow">✦</span></div>}
        <div className="absolute right-2 top-2"><span className="rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">{AESTHETIC_ERA_LABELS[item.era]}</span></div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
        <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>{AESTHETIC_STYLE_LABELS[item.aesthetic]}</span>
      </div>
    </Link>
  );
}

export default function MoodBoardsExperience() {
  const [items, setItems] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(""); const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeAesthetic, setActiveAesthetic] = useState<AestheticStyle | "">("");
  const [activeEra, setActiveEra] = useState<AestheticEra | "">("");
  const ref = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { if (ref.current) clearTimeout(ref.current); ref.current = setTimeout(() => setDebouncedSearch(search), 350); return () => { if (ref.current) clearTimeout(ref.current); }; }, [search]);
  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (debouncedSearch) p.set("q", debouncedSearch);
      if (activeAesthetic) p.set("aesthetic", activeAesthetic);
      if (activeEra) p.set("era", activeEra);
      p.set("limit", "80");
      setItems(((await (await fetch(`/api/mood-boards?${p}`)).json()) as { mood_boards: MoodBoard[] }).mood_boards ?? []);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [debouncedSearch, activeAesthetic, activeEra]);
  useEffect(() => { fetch_(); }, [fetch_]);
  const hasFilter = !!(activeAesthetic || activeEra || debouncedSearch);
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white"><div className="w-[95%] mx-auto pt-6 pb-4">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg></div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by aesthetic, era, mood, style…" className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400" />
            {search ? <button type="button" onClick={() => setSearch("")} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button> : <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center"><span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">⌘K</span></div>}
          </div>
          <div className="mt-3 space-y-2">
            <div className="flex flex-wrap gap-1.5 items-center"><span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Era</span><FilterChip label="All" active={activeEra === ""} onClick={() => setActiveEra("")} />{ALL_AESTHETIC_ERAS.map((e) => <FilterChip key={e} label={AESTHETIC_ERA_LABELS[e]} active={activeEra === e} onClick={() => setActiveEra(activeEra === e ? "" : e)} />)}</div>
            <div className="flex flex-wrap gap-1.5 items-center"><span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300 shrink-0 w-14">Vibe</span><FilterChip label="All" active={activeAesthetic === ""} onClick={() => setActiveAesthetic("")} />{ALL_AESTHETIC_STYLES.map((a) => <FilterChip key={a} label={AESTHETIC_STYLE_LABELS[a]} active={activeAesthetic === a} accent={activeAesthetic === a ? AESTHETIC_STYLE_ACCENTS[a] : undefined} onClick={() => setActiveAesthetic(activeAesthetic === a ? "" : a)} />)}</div>
          </div>
        </div></div>
        <div className="w-[95%] mx-auto py-2.5"><p className="text-xs text-slate-400">{loading ? "Searching…" : `${items.length} result${items.length !== 1 ? "s" : ""}`}{hasFilter && !loading && <button type="button" onClick={() => { setSearch(""); setActiveAesthetic(""); setActiveEra(""); }} className="ml-3 font-semibold text-blue-600 hover:underline">Clear all</button>}</p></div>
        <div className="w-[95%] mx-auto pb-20">
          {loading ? <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="mb-3 break-inside-avoid animate-pulse rounded-2xl bg-slate-200" style={{ height: [300, 240, 360, 280, 320][i % 5] }} />)}</div>
          : items.length === 0 ? <div className="flex flex-col items-center justify-center py-32 text-center"><p className="font-heading text-lg font-bold text-slate-700">No mood boards found</p></div>
          : <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">{items.map((p) => <Card key={p.id} item={p} />)}</div>}
        </div>
      </div>
    </>
  );
}
