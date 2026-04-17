"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import { categoryLabel, GALLERY_CATEGORY_TABS, type FilmCategory, type GalleryImage } from "@/data/gallery";
import { galleryRouteId } from "@/lib/gallery/route-id";

function heroStripSources(images: GalleryImage[]): string[] {
  return images.slice(0, 3).map((i) => i.src);
}

function aspectClass(aspect?: string) {
  if (aspect === "portrait") return "aspect-[3/4]";
  if (aspect === "landscape") return "aspect-[16/11]";
  return "aspect-square";
}

/** Pasted http(s) URLs skip next/image optimization (unknown hosts). */
function remoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

export default function ImageGalleryExperience({ images }: { images: GalleryImage[] }) {
  const [categoryFilter, setCategoryFilter] = useState<FilmCategory | null>(null);

  const heroStrip = useMemo(() => heroStripSources(images), [images]);

  const visibleImages = useMemo(() => {
    return images.map((img, i) => ({ img, i })).filter(
      ({ img }) => categoryFilter === null || img.category === categoryFilter
    );
  }, [images, categoryFilter]);

  return (
    <div className="relative min-h-screen bg-[#fafbff] text-slate-900 antialiased">
      {/* Light atmosphere — fine grid + soft washes (white-first, not Films-style blobs) */}
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(#cbd5e1_0.5px,transparent_0.5px)] opacity-[0.35] [background-size:20px_20px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(900px_500px_at_90%_-10%,rgb(59_130_246/0.08),transparent_55%),radial-gradient(700px_420px_at_0%_100%,rgb(14_165_233/0.06),transparent_50%)]"
        aria-hidden
      />

      <div className="relative">
        <Navbar />

        {/* z-0 keeps hero under sticky nav (z-50) when overlap is used */}
        <main className="relative z-0 w-full pb-28 pt-0">
          {/* ── Hero: full-bleed blue, horizontal polaroid strip only (no visible copy) ── */}
          <section
            className="relative z-0 -mt-[7.5rem] w-full overflow-hidden border-b border-blue-100/70 bg-gradient-to-b from-sky-100/95 via-blue-50/98 to-sky-50/90 pt-[8.5rem] sm:pt-[9rem]"
            aria-labelledby="images-hero-heading"
          >
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_100%_0%,rgb(191_219_254/0.45),transparent_55%),radial-gradient(ellipse_70%_50%_at_0%_100%,rgb(224_242_254/0.7),transparent_50%)]"
              aria-hidden
            />
            <h1 id="images-hero-heading" className="sr-only">
              Images
            </h1>

            <div className="relative z-10 mx-auto flex max-w-[1200px] flex-row flex-nowrap items-end justify-center gap-3 overflow-x-auto px-4 pb-12 pt-2 [scrollbar-width:none] sm:gap-5 md:gap-8 md:px-8 md:pb-16 lg:px-12 [&::-webkit-scrollbar]:hidden">
              {heroStrip.length > 0 ? (
                heroStrip.map((src, i) => (
                  <div
                    key={`${src}-${i}`}
                    className={`shrink-0 bg-white p-2 shadow-[0_22px_55px_-14px_rgba(30,58,138,0.22)] ring-1 ring-slate-200/90 ${
                      i === 0 ? "-rotate-[2.5deg]" : i === 1 ? "rotate-0 translate-y-1" : "rotate-[2.5deg]"
                    } w-[min(32vw,180px)] sm:w-[min(26vw,220px)] md:w-[min(22vw,260px)]`}
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={src}
                        alt=""
                        fill
                        priority={i === 0}
                        className="object-cover"
                        sizes="(max-width:768px) 32vw, 260px"
                        unoptimized={remoteImage(src)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                  No admin uploads yet
                </p>
              )}
            </div>
          </section>

          {/* ── Filters: underline tabs ── */}
          <div className="border-y border-slate-200/80 bg-white/60 backdrop-blur-sm">
            <div className="mx-auto max-w-[1400px] px-5 py-6 sm:px-8 lg:px-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <div>
                  <p className="font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-slate-400">Browse by lane</p>
                  <p className="mt-1 text-sm text-slate-500">Tap a line to filter the wall below.</p>
                </div>
                <div
                  className="flex flex-wrap gap-x-1 gap-y-2 border-b border-slate-200/90 sm:justify-end"
                  role="tablist"
                  aria-label="Filter images by category"
                >
                  {GALLERY_CATEGORY_TABS.map((tab) => {
                    const active = categoryFilter === tab.id;
                    return (
                      <button
                        key={tab.label}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setCategoryFilter(tab.id)}
                        className={`-mb-px border-b-2 px-3 py-2 text-left text-[11px] font-bold uppercase tracking-[0.12em] transition sm:px-4 sm:text-xs ${
                          active
                            ? "border-blue-600 text-slate-900"
                            : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ── Gallery: masonry, captions below (Swiss / print room) ── */}
          <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-b border-dashed border-slate-200 pb-6">
              <div>
                <h2 className="font-heading text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">The wall</h2>
                <p className="mt-1 font-mono text-xs text-slate-400">Selected frames · {visibleImages.length} visible</p>
              </div>
            </div>

            <ul className="columns-1 gap-x-8 gap-y-10 sm:columns-2 lg:columns-3 [&>li]:mb-10">
              {visibleImages.map(({ img: item, i }, rowPos) => (
                <li key={item.id ?? `${item.src}-${i}`} className="break-inside-avoid">
                  <Link
                    href={`/images/${encodeURIComponent(galleryRouteId(item, i))}`}
                    className="gallery-card-enter group block w-full text-left transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    style={{ animationDelay: `${Math.min(rowPos, 14) * 35}ms` }}
                  >
                    <div
                      className={`relative w-full overflow-hidden rounded-md bg-slate-100 ring-1 ring-slate-200/90 transition-[box-shadow,ring-color] duration-300 group-hover:shadow-lg group-hover:shadow-blue-900/10 group-hover:ring-blue-200/80 ${aspectClass(item.aspect)}`}
                    >
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        unoptimized={remoteImage(item.src)}
                      />
                    </div>
                    <div className="mt-3 px-0.5">
                      <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-blue-600">{categoryLabel(item.category)}</p>
                      <p className="font-heading text-base font-bold leading-snug text-slate-900 sm:text-lg">{item.title}</p>
                      {item.peopleTags?.length ? (
                        <p className="mt-1 text-[11px] text-slate-500">{item.peopleTags.join(" · ")}</p>
                      ) : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {visibleImages.length === 0 && (
              <p className="py-20 text-center font-mono text-sm text-slate-400">Nothing filed under that lane yet.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
