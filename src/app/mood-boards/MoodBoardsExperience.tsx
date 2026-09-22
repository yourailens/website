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
import type { MoodBoard, AestheticStyle, AestheticEra } from "@/data/mood_boards";
import {
  ALL_AESTHETIC_STYLES,
  ALL_AESTHETIC_ERAS,
  AESTHETIC_STYLE_LABELS,
  AESTHETIC_ERA_LABELS,
} from "@/data/mood_boards";

function Card({ item }: { item: MoodBoard }) {
  return (
    <Link
      href={`/mood-boards/${item.slug}`}
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
        {item.color_palette.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex h-3">
            {item.color_palette.slice(0, 6).map((c, i) => (
              <div key={i} className="flex-1" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}
        {item.featured && (
          <div className="absolute left-2 top-2">
            <span className="border border-blue-400/50 bg-blue-500/20 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-blue-200">
              Featured
            </span>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <span className="border border-white/20 bg-black/50 px-2 py-0.5 font-mono text-[9px] text-white/80 backdrop-blur-sm">
            {AESTHETIC_ERA_LABELS[item.era]}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <span className="mt-1.5 inline-block border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
          {AESTHETIC_STYLE_LABELS[item.aesthetic]}
        </span>
      </div>
    </Link>
  );
}

export default function MoodBoardsExperience() {
  const [items, setItems] = useState<MoodBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeAesthetic, setActiveAesthetic] = useState<AestheticStyle | "">("");
  const [activeEra, setActiveEra] = useState<AestheticEra | "">("");
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
      if (activeAesthetic) p.set("aesthetic", activeAesthetic);
      if (activeEra) p.set("era", activeEra);
      p.set("limit", "80");
      setItems(
        ((await (await fetch(`/api/mood-boards?${p}`)).json()) as { mood_boards: MoodBoard[] })
          .mood_boards ?? []
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeAesthetic, activeEra]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const hasFilter = !!(activeAesthetic || activeEra || debouncedSearch);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Mood Boards" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Aesthetic boards by era and vibe — color, texture, and tone references.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by aesthetic, era, mood, style…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Era
            </span>
            <OttFilterChip label="All" active={activeEra === ""} onClick={() => setActiveEra("")} />
            {ALL_AESTHETIC_ERAS.map((e) => (
              <OttFilterChip
                key={e}
                label={AESTHETIC_ERA_LABELS[e]}
                active={activeEra === e}
                onClick={() => setActiveEra(activeEra === e ? "" : e)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Vibe
            </span>
            <OttFilterChip
              label="All"
              active={activeAesthetic === ""}
              onClick={() => setActiveAesthetic("")}
            />
            {ALL_AESTHETIC_STYLES.map((a) => (
              <OttFilterChip
                key={a}
                label={AESTHETIC_STYLE_LABELS[a]}
                active={activeAesthetic === a}
                onClick={() => setActiveAesthetic(activeAesthetic === a ? "" : a)}
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
                setActiveAesthetic("");
                setActiveEra("");
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
                style={{ height: [300, 240, 360, 280, 320][i % 5] }}
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-white/15 py-32 text-center">
            <p className="font-body text-lg font-semibold text-white">No mood boards found</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {items.map((p) => (
              <Card key={p.id} item={p} />
            ))}
          </div>
        )}
      </div>
    </IndustryShell>
  );
}
