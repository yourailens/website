"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  type GalleryFilm,
} from "@/data/gallery";
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
  const portrait = film.orientation === "portrait";
  const href = `/films/${encodeURIComponent(galleryRouteId(film, index))}`;
  const ep = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      className="group mb-5 block break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04] sm:mb-6"
    >
      <div
        className={`relative w-full overflow-hidden bg-black ${
          portrait ? "aspect-[9/16]" : "aspect-video"
        }`}
      >
        <FilmCardPreview src={film.src} posterUrl={film.posterUrl} />
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full p-3">
            <span className="font-mono text-[10px] tracking-[0.22em] text-blue-300">WATCH</span>
          </div>
        </div>
        {portrait ? (
          <span className="absolute left-2 top-2 border border-white/15 bg-black/50 px-2 py-0.5 font-mono text-[9px] tracking-wider text-white/80">
            VERTICAL
          </span>
        ) : null}
        <div className="pointer-events-none absolute right-2 top-2 flex h-8 w-8 items-center justify-center border border-white/20 bg-black/45 text-blue-300 backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
        <p className="absolute bottom-2 left-2 font-mono text-[9px] tracking-[0.22em] text-blue-300/80">
          {ep}
        </p>
      </div>
      <div className="p-4">
        <p className="truncate text-sm font-semibold text-white">{film.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="border border-white/12 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-white/60">
            {categoryLabel(film.category)}
          </span>
        </div>
        {film.peopleTags?.length ? (
          <p className="mt-1 truncate text-[10px] text-white/40">{film.peopleTags.join(" · ")}</p>
        ) : null}
      </div>
    </Link>
  );
}

function FilmMasonry({ items }: { items: { film: GalleryFilm; index: number }[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <p className="font-body text-lg font-semibold text-white/80">No films found</p>
        <p className="mt-1 text-sm font-light text-white/40">Try adjusting your search or filters</p>
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

  const categories = GALLERY_CATEGORY_TABS.filter(
    (t): t is { id: FilmCategory; label: string } => t.id !== null
  );

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-6 pt-12 sm:pt-14`}>
        <IndustryChannelTitle channel="CHANNEL · CREATIONS" title="Films" />
        <p className="mt-4 max-w-xl text-sm font-light text-white/55">
          Launch films, ads, and motion-led stories from the studio desk.
        </p>
      </section>

      <div className={`relative ${INDUSTRY_PAGE} border-t border-white/10 pb-4 pt-6`}>
        <OttSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search films by title, category, talent…"
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
        <FilmMasonry items={visible} />
      </div>
    </IndustryShell>
  );
}
