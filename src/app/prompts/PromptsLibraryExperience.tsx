"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import type { Prompt, PromptMediaType, PromptImageCategory, PromptVideoCategory, PromptDifficulty } from "@/data/prompts";
import {
  IMAGE_CATEGORY_LABELS,
  VIDEO_CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  IMAGE_CATEGORIES,
  VIDEO_CATEGORIES,
  DIFFICULTIES,
  promptMediaAccent,
  difficultyAccent,
  promptCategoryLabel,
} from "@/data/prompts";

// ── Types ────────────────────────────────────────────────────

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

// ── Chip ─────────────────────────────────────────────────────

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 ${
        active
          ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-300"
          : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-700"
      }`}
    >
      {children}
    </button>
  );
}

// ── Card ─────────────────────────────────────────────────────

function PromptCard({ p }: { p: Prompt }) {
  const accent = promptMediaAccent(p.media_type);
  const diff = difficultyAccent(p.difficulty);

  return (
    <Link
      href={`/prompts/${p.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200"
    >
      {/* Cover */}
      <div className={`relative w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 ${
        p.cover_aspect === "portrait" ? "aspect-[3/4]"
        : p.cover_aspect === "square" ? "aspect-square"
        : "aspect-[16/9]"
      }`}>
        {p.cover_image_url ? (
          <Image
            src={p.cover_image_url}
            alt={p.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-slate-400">
              <path d="M12 2L19 6V12C19 15.87 15.87 20.27 12 21C8.13 20.27 5 15.87 5 12V6L12 2Z" />
              <circle cx="12" cy="12" r="2" />
            </svg>
          </div>
        )}

        {/* Media type badge */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${accent.bg} ${accent.text} ${accent.border}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${accent.dot}`} />
            {p.media_type}
          </span>
        </div>

        {p.featured && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 backdrop-blur-sm">
              ✦ Featured
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {promptCategoryLabel(p)}
          </span>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${diff.bg} ${diff.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${diff.dot}`} />
            {DIFFICULTY_LABELS[p.difficulty]}
          </span>
        </div>

        <h3 className="line-clamp-2 font-heading text-base font-black leading-snug tracking-tight text-slate-900 group-hover:text-blue-700">
          {p.title}
        </h3>

        {p.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{p.excerpt}</p>
        )}

        {/* Models */}
        {p.models.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {p.models.slice(0, 3).map((m) => (
              <span key={m} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                {m}
              </span>
            ))}
            {p.models.length > 3 && (
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
                +{p.models.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-[11px] text-slate-400">
            {p.view_count > 0 && `${p.view_count.toLocaleString()} views`}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition-transform group-hover:translate-x-0.5">
            Read workflow
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Main ─────────────────────────────────────────────────────

export default function PromptsLibraryExperience({ initialPrompts }: { initialPrompts: Prompt[] }) {
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
        const json = await res.json() as { prompts: Prompt[]; total: number };
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

  // Debounced search re-fetch
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
      // When type changes, clear sub-category filters
      if (key === "type") {
        next.image_cat = "";
        next.video_cat = "";
      }
      return next;
    });
  }

  const loadMore = () => fetchPrompts(filters, offset + PAGE, true);

  const hasMore = prompts.length < total;
  const currentCats = filters.type === "image" ? IMAGE_CATEGORIES : filters.type === "video" ? VIDEO_CATEGORIES : [];

  return (
    <>
    <Navbar />
    <main className="min-h-screen bg-[#fafafa] pb-24">
      {/* ── Search ── */}
      <section className="border-b border-slate-100 bg-white">
        <div className="w-[95%] mx-auto pt-6 pb-4">
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search workflows, prompts, models, keywords…"
              value={filters.q}
              onChange={(e) => setFilter("q", e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {filters.q ? (
              <button type="button" onClick={() => setFilter("q", "")} className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            ) : (
              <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">⌘K</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Filters ── */}
      <div className="sticky top-[88px] z-20 border-b border-slate-100 bg-white/95 backdrop-blur-sm">
        <div className="w-[95%] mx-auto overflow-x-auto py-3 scrollbar-hide">
          <div className="flex min-w-max items-center gap-2">
            {/* Media type */}
            <Chip active={filters.type === ""} onClick={() => setFilter("type", "")}>All</Chip>
            <Chip active={filters.type === "image"} onClick={() => setFilter("type", "image")}>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
              Images
            </Chip>
            <Chip active={filters.type === "video"} onClick={() => setFilter("type", "video")}>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              Videos
            </Chip>

            {/* Sub-category chips */}
            {filters.type === "image" && (
              <>
                <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
                {IMAGE_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    active={filters.image_cat === cat}
                    onClick={() => setFilter("image_cat", filters.image_cat === cat ? "" : cat)}
                  >
                    {IMAGE_CATEGORY_LABELS[cat]}
                  </Chip>
                ))}
              </>
            )}
            {filters.type === "video" && (
              <>
                <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
                {VIDEO_CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    active={filters.video_cat === cat}
                    onClick={() => setFilter("video_cat", filters.video_cat === cat ? "" : cat)}
                  >
                    {VIDEO_CATEGORY_LABELS[cat]}
                  </Chip>
                ))}
              </>
            )}

            {/* Difficulty */}
            <span className="mx-1 h-4 w-px bg-slate-200" aria-hidden />
            {DIFFICULTIES.map((d) => (
              <Chip
                key={d}
                active={filters.difficulty === d}
                onClick={() => setFilter("difficulty", filters.difficulty === d ? "" : d)}
              >
                {DIFFICULTY_LABELS[d]}
              </Chip>
            ))}
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <section className="w-[95%] mx-auto pt-10">
        {/* Count line */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {loading ? (
              <span className="inline-block h-4 w-28 animate-pulse rounded bg-slate-200" />
            ) : (
              <>
                <span className="font-semibold text-slate-900">{total}</span>{" "}
                {total === 1 ? "workflow" : "workflows"}
                {filters.q && ` for "${filters.q}"`}
              </>
            )}
          </p>
          {(filters.q || filters.type || filters.difficulty) && (
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {loading && prompts.length === 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-100 bg-white">
                <div className="aspect-[16/9] w-full rounded-t-2xl bg-slate-100" />
                <div className="space-y-2 p-5">
                  <div className="h-3 w-1/3 rounded bg-slate-100" />
                  <div className="h-5 w-3/4 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : prompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className="text-slate-300">
                <path d="M12 2L19 6V12C19 15.87 15.87 20.27 12 21C8.13 20.27 5 15.87 5 12V6L12 2Z" />
                <circle cx="12" cy="12" r="2" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-700">No prompts found</p>
            <p className="mt-2 text-sm text-slate-400">Try adjusting your filters or search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {prompts.map((p) => <PromptCard key={p.id} p={p} />)}
          </div>
        )}

        {hasMore && !loading && (
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={loadMore}
              className="rounded-2xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
            >
              Load more workflows
            </button>
          </div>
        )}
        {loading && prompts.length > 0 && (
          <div className="mt-8 flex justify-center">
            <span className="text-sm text-slate-400">Loading…</span>
          </div>
        )}
      </section>
    </main>
    </>
  );
}
