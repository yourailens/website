"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  categoryLabel,
  GALLERY_CATEGORY_TABS,
  type FilmCategory,
  type GalleryImage,
} from "@/data/gallery";
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
  const href = `/images/${encodeURIComponent(galleryRouteId(item, index))}`;
  const ep = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      className="group mb-3 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative w-full overflow-hidden bg-black">
        <Image
          src={item.src}
          alt={item.title}
          width={400}
          height={imageHeight(item.aspect)}
          className="w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized={remoteImage(item.src)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <p className="absolute bottom-2 left-2 font-mono text-[9px] tracking-[0.22em] text-blue-300 opacity-0 transition group-hover:opacity-100">
          {ep}
        </p>
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {categoryLabel(item.category)}
          </span>
        </div>
        {item.peopleTags?.length ? (
          <p className="mt-1 truncate text-[10px] text-white/40">{item.peopleTags.join(" · ")}</p>
        ) : null}
      </div>
    </Link>
  );
}

function MasonryGrid({ items }: { items: { item: GalleryImage; index: number }[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="font-body text-lg font-semibold text-white/80">No images found</p>
        <p className="mt-1 text-sm font-light text-white/40">Try adjusting your search or filters</p>
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

  const categories = GALLERY_CATEGORY_TABS.filter(
    (t): t is { id: FilmCategory; label: string } => t.id !== null
  );

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · CREATIONS" title="Stills" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Campaign imagery, product shots, and key art from the studio desk.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search images by title, category, talent, tags…"
          onClear={() => setSearch("")}
        />
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="w-14 shrink-0 font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
            Lane
          </span>
          <OttFilterChip label="All" active={activeCategory === ""} onClick={() => setActiveCategory("")} />
          {categories.map((tab) => (
            <OttFilterChip
              key={tab.id}
              label={tab.label}
              active={activeCategory === tab.id}
              onClick={() => setActiveCategory(activeCategory === tab.id ? "" : tab.id)}
            />
          ))}
        </div>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} py-2.5`}>
        <p className="text-xs font-light text-white/40">
          {visible.length} result{visible.length !== 1 ? "s" : ""}
          {hasFilter ? (
            <button
              type="button"
              onClick={clearAll}
              className="ml-3 font-semibold text-blue-300 hover:underline"
            >
              Clear all
            </button>
          ) : null}
        </p>
      </div>

      <div className={`relative ${INDUSTRY_PAGE} pb-20`}>
        <MasonryGrid items={visible} />
      </div>
    </IndustryShell>
  );
}
