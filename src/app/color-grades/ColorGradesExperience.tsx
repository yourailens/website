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
import type { ColorGrade, ColorGradeStyle, ColorGradeMood } from "@/data/color_grades";
import {
  ALL_COLOR_GRADE_STYLES,
  ALL_COLOR_GRADE_MOODS,
  COLOR_GRADE_STYLE_LABELS,
  COLOR_GRADE_MOOD_LABELS,
} from "@/data/color_grades";

function Card({ item }: { item: ColorGrade }) {
  return (
    <Link
      href={`/color-grades/${item.slug}`}
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
        {item.dominant_colors.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 flex h-4">
            {item.dominant_colors.slice(0, 6).map((c, i) => (
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
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {COLOR_GRADE_STYLE_LABELS[item.grade_style]}
          </span>
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/45">
            {COLOR_GRADE_MOOD_LABELS[item.mood]}
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function ColorGradesExperience() {
  const [items, setItems] = useState<ColorGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeStyle, setActiveStyle] = useState<ColorGradeStyle | "">("");
  const [activeMood, setActiveMood] = useState<ColorGradeMood | "">("");
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
      if (activeStyle) p.set("grade_style", activeStyle);
      if (activeMood) p.set("mood", activeMood);
      p.set("limit", "80");
      setItems(
        ((await (await fetch(`/api/color-grades?${p}`)).json()) as { color_grades: ColorGrade[] })
          .color_grades ?? []
      );
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeStyle, activeMood]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const hasFilter = !!(activeStyle || activeMood || debouncedSearch);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Color Grades" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Cinematic color grading presets by style, mood, and palette.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by grade style, mood, color…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Style
            </span>
            <OttFilterChip label="All" active={activeStyle === ""} onClick={() => setActiveStyle("")} />
            {ALL_COLOR_GRADE_STYLES.map((s) => (
              <OttFilterChip
                key={s}
                label={COLOR_GRADE_STYLE_LABELS[s]}
                active={activeStyle === s}
                onClick={() => setActiveStyle(activeStyle === s ? "" : s)}
              />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
              Mood
            </span>
            <OttFilterChip label="All" active={activeMood === ""} onClick={() => setActiveMood("")} />
            {ALL_COLOR_GRADE_MOODS.map((m) => (
              <OttFilterChip
                key={m}
                label={COLOR_GRADE_MOOD_LABELS[m]}
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
                setActiveStyle("");
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
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-4">
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
            <p className="font-body text-lg font-semibold text-white">No color grades found</p>
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
