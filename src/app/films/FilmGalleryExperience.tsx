"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FilterChip from "@/components/gallery/FilterChip";
import {
  categoryLabel,
  GALLERY_CATEGORY_TABS,
  type FilmCategory,
  type GalleryFilm,
} from "@/data/gallery";
import { GALLERY_CATEGORY_ACCENTS } from "@/lib/gallery/category-accents";
import { galleryRouteId } from "@/lib/gallery/route-id";

function videoType(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

function FilmCardPreview({ src, posterUrl }: { src: string; posterUrl?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const root = wrapRef.current;
    const v = videoRef.current;
    if (!root || !v) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const ent of entries) {
          if (ent.isIntersecting) void v.play().catch(() => {});
          else v.pause();
        }
      },
      { threshold: 0.15, rootMargin: "60px 0px" }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [src]);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        muted
        loop
        playsInline
        preload="metadata"
        poster={posterUrl}
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src={src} type={videoType(src)} />
      </video>
    </div>
  );
}

function FilmCard({ film, index }: { film: GalleryFilm; index: number }) {
  const accent = GALLERY_CATEGORY_ACCENTS[film.category];
  const portrait = film.orientation === "portrait";
  const href = `/films/${encodeURIComponent(galleryRouteId(film, index))}`;

  return (
    <Link
      href={href}
      className="group mb-5 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80 sm:mb-6"
    >
      <div
        className={`relative w-full overflow-hidden bg-slate-900 ${
          portrait ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        <FilmCardPreview src={film.src} posterUrl={film.posterUrl} />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3">
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              Watch
            </span>
          </div>
        </div>
        {portrait ? (
          <span className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm">
            Vertical
          </span>
        ) : null}
        <div className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <div className="p-4">
        <p className="truncate text-sm font-bold text-slate-900">{film.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>
            {categoryLabel(film.category)}
          </span>
        </div>
        {film.peopleTags?.length ? (
          <p className="mt-1 truncate text-[10px] text-slate-400">{film.peopleTags.join(" · ")}</p>
        ) : null}
      </div>
    </Link>
  );
}

function FilmMasonry({ items }: { items: { film: GalleryFilm; index: number }[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
            <path d="M4 8l8-5 8 5v12H4V8z" />
            <path d="M9 21V12h6v9" />
          </svg>
        </div>
        <p className="font-heading text-lg font-bold text-slate-700">No films found</p>
        <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-5 sm:columns-2 sm:gap-6 lg:columns-3 lg:gap-6">
      {items.map(({ film, index }) => (
        <FilmCard key={film.id ?? `${film.src}-${index}`} film={film} index={index} />
      ))}
    </div>
  );
}

export default function FilmGalleryExperience({ films }: { films: GalleryFilm[] }) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilmCategory | "">("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const indexed = useMemo(() => films.map((film, index) => ({ film, index })), [films]);

  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return indexed.filter(({ film }) => {
      if (activeCategory && film.category !== activeCategory) return false;
      if (!q) return true;
      const hay = [
        film.title,
        categoryLabel(film.category),
        film.orientation ?? "",
        ...(film.peopleTags ?? []),
        film.prompt ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [indexed, activeCategory, debouncedSearch]);

  const hasFilter = !!(activeCategory || debouncedSearch);

  function clearAll() {
    setSearch("");
    setActiveCategory("");
  }

  const categories = GALLERY_CATEGORY_TABS.filter((t): t is { id: FilmCategory; label: string } => t.id !== null);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="w-full px-4 pt-6 pb-4 sm:px-6 lg:px-8">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search films by title, category, talent…"
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm font-medium text-slate-800 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-700"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <span className="rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                    ⌘K
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="w-16 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-slate-300">
                Lane
              </span>
              <FilterChip label="All" active={activeCategory === ""} onClick={() => setActiveCategory("")} />
              {categories.map((tab) => (
                <FilterChip
                  key={tab.id}
                  label={tab.label}
                  active={activeCategory === tab.id}
                  accent={activeCategory === tab.id ? GALLERY_CATEGORY_ACCENTS[tab.id] : undefined}
                  onClick={() => setActiveCategory(activeCategory === tab.id ? "" : tab.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="text-xs text-slate-400">
            {visible.length} result{visible.length !== 1 ? "s" : ""}
            {hasFilter ? (
              <button type="button" onClick={clearAll} className="ml-3 font-semibold text-blue-600 hover:underline">
                Clear all
              </button>
            ) : null}
          </p>
        </div>

        <div className="w-full px-2 pb-20 sm:px-4 lg:px-5">
          <FilmMasonry items={visible} />
        </div>
      </div>
    </>
  );
}
