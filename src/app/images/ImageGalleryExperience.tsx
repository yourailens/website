"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FilterChip from "@/components/gallery/FilterChip";
import {
  categoryLabel,
  GALLERY_CATEGORY_TABS,
  type FilmCategory,
  type GalleryImage,
} from "@/data/gallery";
import { GALLERY_CATEGORY_ACCENTS } from "@/lib/gallery/category-accents";
import { galleryRouteId } from "@/lib/gallery/route-id";

function remoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function imageHeight(aspect?: string) {
  if (aspect === "portrait") return 560;
  if (aspect === "landscape") return 260;
  return 400;
}

function ImageCard({ item, index }: { item: GalleryImage; index: number }) {
  const accent = GALLERY_CATEGORY_ACCENTS[item.category];
  const href = `/images/${encodeURIComponent(galleryRouteId(item, index))}`;

  return (
    <Link
      href={href}
      className="group mb-3 block break-inside-avoid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/80"
    >
      <div className="relative w-full overflow-hidden bg-slate-100">
        <Image
          src={item.src}
          alt={item.title}
          width={400}
          height={imageHeight(item.aspect)}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized={remoteImage(item.src)}
        />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3">
            <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
              View
            </span>
          </div>
        </div>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-bold text-slate-900">{item.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent}`}>
            {categoryLabel(item.category)}
          </span>
        </div>
        {item.peopleTags?.length ? (
          <p className="mt-1 truncate text-[10px] text-slate-400">{item.peopleTags.join(" · ")}</p>
        ) : null}
      </div>
    </Link>
  );
}

function MasonryGrid({ items }: { items: { item: GalleryImage; index: number }[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        <p className="font-heading text-lg font-bold text-slate-700">No images found</p>
        <p className="mt-1 text-sm text-slate-400">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
      {items.map(({ item, index }) => (
        <ImageCard key={item.id ?? `${item.src}-${index}`} item={item} index={index} />
      ))}
    </div>
  );
}

export default function ImageGalleryExperience({ images }: { images: GalleryImage[] }) {
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

  const indexed = useMemo(() => images.map((item, index) => ({ item, index })), [images]);

  const visible = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return indexed.filter(({ item }) => {
      if (activeCategory && item.category !== activeCategory) return false;
      if (!q) return true;
      const hay = [
        item.title,
        categoryLabel(item.category),
        ...(item.peopleTags ?? []),
        item.prompt ?? "",
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
          <div className="mx-auto w-[95%] pt-6 pb-4">
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
                placeholder="Search images by title, category, talent, tags…"
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

        <div className="mx-auto w-[95%] py-2.5">
          <p className="text-xs text-slate-400">
            {visible.length} result{visible.length !== 1 ? "s" : ""}
            {hasFilter ? (
              <button type="button" onClick={clearAll} className="ml-3 font-semibold text-blue-600 hover:underline">
                Clear all
              </button>
            ) : null}
          </p>
        </div>

        <div className="mx-auto w-[95%] pb-20">
          <MasonryGrid items={visible} />
        </div>
      </div>
    </>
  );
}
