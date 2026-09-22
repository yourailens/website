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
import type { Prop, PropCategory, PropStyle } from "@/data/props";
import { ALL_PROP_CATEGORIES, ALL_PROP_STYLES, PROP_CATEGORY_LABELS, PROP_STYLE_LABELS } from "@/data/props";

function PropCard({ prop }: { prop: Prop }) {
  return (
    <Link
      href={`/props/${prop.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src={prop.image_url}
          alt={prop.title}
          width={400}
          height={prop.aspect_ratio === "portrait" ? 560 : prop.aspect_ratio === "square" ? 400 : 260}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        {prop.featured && (
          <div className="absolute left-2 top-2">
            <span className="border border-blue-400/50 bg-blue-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-200">
              Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{prop.title}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {PROP_CATEGORY_LABELS[prop.category]}
          </span>
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
            {PROP_STYLE_LABELS[prop.style]}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PropsExperience() {
  const [items, setItems] = useState<Prop[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<PropCategory | "">("");
  const [activeStyle, setActiveStyle] = useState<PropStyle | "">("");
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
      if (activeCategory) p.set("category", activeCategory);
      if (activeStyle) p.set("style", activeStyle);
      p.set("limit", "80");
      const res = await fetch(`/api/props?${p}`);
      const json = (await res.json()) as { props: Prop[] };
      setItems(json.props ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeCategory, activeStyle]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const hasFilter = !!(activeCategory || activeStyle || debouncedSearch);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Props" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Prop references for product shoots, set dressing, and campaign stills.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search props by name, color, style…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Style
            </span>
            <OttFilterChip label="All" active={activeStyle === ""} onClick={() => setActiveStyle("")} />
            {ALL_PROP_STYLES.map((s) => (
              <OttFilterChip
                key={s}
                label={PROP_STYLE_LABELS[s]}
                active={activeStyle === s}
                onClick={() => setActiveStyle(activeStyle === s ? "" : s)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Type
            </span>
            <OttFilterChip label="All" active={activeCategory === ""} onClick={() => setActiveCategory("")} />
            {ALL_PROP_CATEGORIES.map((c) => (
              <OttFilterChip
                key={c}
                label={PROP_CATEGORY_LABELS[c]}
                active={activeCategory === c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
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
                setActiveCategory("");
                setActiveStyle("");
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
                style={{ height: [280, 280, 280, 280, 280, 280, 280, 280][i % 8] }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-white/15 py-32 text-center">
            <p className="font-body text-lg font-semibold text-white">No props found</p>
            <p className="mt-1 text-sm text-white/45">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {items.map((p) => (
              <PropCard key={p.id} prop={p} />
            ))}
          </div>
        )}
      </div>
    </IndustryShell>
  );
}
