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
import type { Scenario, ScenarioType } from "@/data/scenarios";
import {
  ALL_SCENARIO_TYPES,
  SCENARIO_TYPE_LABELS,
  SCENARIO_SETTING_LABELS,
} from "@/data/scenarios";

function ScenarioCard({ s }: { s: Scenario }) {
  return (
    <Link
      href={`/scenarios/${s.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src={s.image_url}
          alt={s.title}
          width={400}
          height={s.aspect_ratio === "portrait" ? 560 : s.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {s.featured && (
          <div className="absolute left-2 top-2">
            <span className="border border-blue-400/50 bg-blue-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-200">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{s.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {SCENARIO_TYPE_LABELS[s.scenario_type]}
          </span>
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
            {SCENARIO_SETTING_LABELS[s.setting]}
          </span>
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
    return () => {
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [search]);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (dSearch) p.set("q", dSearch);
      if (activeType) p.set("type", activeType);
      p.set("limit", "80");
      const res = await fetch(`/api/scenarios?${p}`);
      const json = (await res.json()) as { scenarios: Scenario[] };
      setItems(json.scenarios ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [dSearch, activeType]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Scenarios" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Reference scenarios by type, mood, and setting for story-led shoots.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search reference scenarios by type, mood, setting…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
            Type
          </span>
          <OttFilterChip label="All" active={activeType === ""} onClick={() => setActiveType("")} />
          {ALL_SCENARIO_TYPES.map((t) => (
            <OttFilterChip
              key={t}
              label={SCENARIO_TYPE_LABELS[t]}
              active={activeType === t}
              onClick={() => setActiveType(activeType === t ? "" : t)}
            />
          ))}
        </div>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} py-2.5`}>
        <p className="text-xs text-white/40">
          {loading ? "Searching…" : `${items.length} result${items.length !== 1 ? "s" : ""}`}
          {(activeType || dSearch) && !loading && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveType("");
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
            <p className="font-body text-lg font-semibold text-white">No scenarios found</p>
            <p className="mt-1 text-sm text-white/45">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {items.map((s) => (
              <ScenarioCard key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
    </IndustryShell>
  );
}
