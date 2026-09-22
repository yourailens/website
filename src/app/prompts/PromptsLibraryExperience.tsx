"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { OttFilterChip, OttSearchInput } from "@/components/ott/OttLibraryControls";
import {
  INDUSTRY_PAGE,
  IndustryChannelTitle,
  IndustryGlow,
  IndustryShell,
} from "@/app/industries/IndustryUI";
import type {
  Prompt,
  PromptMediaType,
  PromptImageCategory,
  PromptVideoCategory,
  PromptDifficulty,
} from "@/data/prompts";
import {
  IMAGE_CATEGORY_LABELS,
  VIDEO_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  IMAGE_CATEGORIES,
  VIDEO_CATEGORIES,
  DIFFICULTIES,
  promptCategoryLabel,
} from "@/data/prompts";

type FilterState = {
  q: string;
  type: PromptMediaType | "";
  image_cat: PromptImageCategory | "";
  video_cat: PromptVideoCategory | "";
  difficulty: PromptDifficulty | "";
};

const INITIAL_FILTERS: FilterState = {
  q: "",
  type: "",
  image_cat: "",
  video_cat: "",
  difficulty: "",
};

function PromptCard({ p }: { p: Prompt }) {
  const imgH = p.cover_aspect === "portrait" ? 560 : p.cover_aspect === "square" ? 400 : 225;

  return (
    <Link
      href={`/prompts/${p.slug}`}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        {p.cover_image_url ? (
          <Image
            src={p.cover_image_url}
            alt={p.title}
            width={400}
            height={imgH}
            className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-video items-center justify-center bg-white/[0.03]">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              className="text-white/30"
            >
              <path d="M12 2L19 6V12C19 15.87 15.87 20.27 12 21C8.13 20.27 5 15.87 5 12V6L12 2Z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span className="inline-flex items-center gap-1 border border-white/20 bg-black/50 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-200 backdrop-blur-sm">
            {p.media_type}
          </span>
        </div>

        {p.featured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 border border-blue-400/50 bg-blue-500/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-blue-200 backdrop-blur-sm">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col p-4">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span className="border border-white/12 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50">
            {promptCategoryLabel(p)}
          </span>
          <span className="border border-white/12 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
            {DIFFICULTY_LABELS[p.difficulty]}
          </span>
        </div>

        <h3 className="line-clamp-2 font-body text-base font-semibold leading-snug tracking-tight text-white group-hover:text-blue-100">
          {p.title}
        </h3>

        {p.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-white/45">
            {p.excerpt}
          </p>
        )}

        {p.models.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.models.slice(0, 3).map((m) => (
              <span
                key={m}
                className="border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/55"
              >
                {m}
              </span>
            ))}
            {p.models.length > 3 && (
              <span className="border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] font-medium text-white/35">
                +{p.models.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
          <span className="text-[11px] text-white/35">
            {p.view_count > 0 && `${p.view_count.toLocaleString()} views`}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-300 transition-transform group-hover:translate-x-0.5">
            Read workflow
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function PromptsLibraryExperience({
  initialPrompts,
}: {
  initialPrompts: Prompt[];
}) {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [total, setTotal] = useState(initialPrompts.length);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const PAGE = 24;

  const buildQs = useCallback((f: FilterState, off: number) => {
    const p = new URLSearchParams();
    if (f.q.trim()) p.set("q", f.q.trim());
    if (f.type) p.set("type", f.type);
    if (f.type === "image" && f.image_cat) p.set("image_cat", f.image_cat);
    if (f.type === "video" && f.video_cat) p.set("video_cat", f.video_cat);
    if (f.difficulty) p.set("difficulty", f.difficulty);
    p.set("limit", String(PAGE));
    p.set("offset", String(off));
    return p.toString();
  }, []);

  const fetchPrompts = useCallback(
    async (f: FilterState, off: number, append = false) => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts?${buildQs(f, off)}`);
        const json = (await res.json()) as { prompts: Prompt[]; total: number };
        startTransition(() => {
          setPrompts((prev) => (append ? [...prev, ...json.prompts] : json.prompts));
          setTotal(json.total);
          setOffset(off);
        });
      } finally {
        setLoading(false);
      }
    },
    [buildQs]
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchPrompts(filters, 0);
    }, 320);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  function setFilter<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    setFilters((prev) => {
      const next = { ...prev, [key]: val };
      if (key === "type") {
        next.image_cat = "";
        next.video_cat = "";
      }
      return next;
    });
  }

  const loadMore = () => fetchPrompts(filters, offset + PAGE, true);
  const hasMore = prompts.length < total;

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · LIBRARY" title="Workflows" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Prompt workflows for image and video — models, steps, and production notes.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={filters.q}
          onChange={(v) => setFilter("q", v)}
          placeholder="Search workflows, prompts, models, keywords…"
          onClear={() => setFilter("q", "")}
        />
      </div>

      <div className="sticky top-[88px] z-20 border-b border-white/10 bg-black/95 backdrop-blur-sm">
        <div className={`${INDUSTRY_PAGE} overflow-x-auto py-3 scrollbar-hide`}>
          <div className="flex min-w-max items-center gap-2">
            <OttFilterChip
              label="All"
              active={filters.type === ""}
              onClick={() => setFilter("type", "")}
            />
            <OttFilterChip
              label="Images"
              active={filters.type === "image"}
              onClick={() => setFilter("type", "image")}
            />
            <OttFilterChip
              label="Videos"
              active={filters.type === "video"}
              onClick={() => setFilter("type", "video")}
            />

            {filters.type === "image" && (
              <>
                <span className="mx-1 h-4 w-px bg-white/15" aria-hidden />
                {IMAGE_CATEGORIES.map((cat) => (
                  <OttFilterChip
                    key={cat}
                    label={IMAGE_CATEGORY_LABELS[cat]}
                    active={filters.image_cat === cat}
                    onClick={() => setFilter("image_cat", filters.image_cat === cat ? "" : cat)}
                  />
                ))}
              </>
            )}
            {filters.type === "video" && (
              <>
                <span className="mx-1 h-4 w-px bg-white/15" aria-hidden />
                {VIDEO_CATEGORIES.map((cat) => (
                  <OttFilterChip
                    key={cat}
                    label={VIDEO_CATEGORY_LABELS[cat]}
                    active={filters.video_cat === cat}
                    onClick={() => setFilter("video_cat", filters.video_cat === cat ? "" : cat)}
                  />
                ))}
              </>
            )}

            <span className="mx-1 h-4 w-px bg-white/15" aria-hidden />
            {DIFFICULTIES.map((d) => (
              <OttFilterChip
                key={d}
                label={DIFFICULTY_LABELS[d]}
                active={filters.difficulty === d}
                onClick={() => setFilter("difficulty", filters.difficulty === d ? "" : d)}
              />
            ))}
          </div>
        </div>
      </div>

      <section className={`relative ${INDUSTRY_PAGE} pb-24 pt-10`}>
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-white/45">
            {loading ? (
              <span className="inline-block h-4 w-28 animate-pulse bg-white/10" />
            ) : (
              <>
                <span className="font-semibold text-white">{total}</span>{" "}
                {total === 1 ? "workflow" : "workflows"}
                {filters.q && ` for "${filters.q}"`}
              </>
            )}
          </p>
          {(filters.q || filters.type || filters.difficulty) && (
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="text-xs font-semibold text-blue-300 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading && prompts.length === 0 ? (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="mb-3 break-inside-avoid animate-pulse border border-white/10 bg-white/[0.04]"
                style={{ height: [280, 200, 320, 200, 260, 200, 300, 220][i % 8] }}
              />
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-white/15 py-24 text-center">
            <p className="text-base font-semibold text-white">No prompts found</p>
            <p className="mt-2 text-sm text-white/45">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 sm:columns-3 lg:columns-4">
            {prompts.map((p) => (
              <PromptCard key={p.id} p={p} />
            ))}
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              className="border border-blue-400/55 bg-transparent px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200"
            >
              Load more workflows
            </button>
          </div>
        )}
        {loading && prompts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <span className="text-sm text-white/40">Loading…</span>
          </div>
        )}
      </section>
    </IndustryShell>
  );
}
