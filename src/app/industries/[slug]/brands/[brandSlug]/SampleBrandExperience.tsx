"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import type { SampleBrandPageData } from "@/data/sample-brands";
import {
  SAMPLE_BRAND_ASPECT_RATIOS,
  SAMPLE_BRAND_MEDIA_CATEGORIES,
  categoryLabel,
  type SampleBrandAspectRatio,
  type SampleBrandMedia,
  type SampleBrandMediaCategory,
  type SampleBrandMediaType,
} from "@/data/sample-brands";
import { aspectRatioClass, masonrySpanClass, resolveMediaType } from "@/lib/sample-brands/media";
import { SampleBrandMediaTile } from "../../../SampleBrandMedia";
import { industryEyebrow, plainCopy } from "../../../industry-copy";
import {
  IndustryBreadcrumb,
  IndustryEyebrow,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTextLink,
  IndustryTintSection,
  IndustryTopBar,
} from "../../../IndustryUI";
import { IndustryCTABlock } from "../../../QAComponents";

type MediaTab = "all" | SampleBrandMediaType;

function BrandHero({
  url,
  mediaType,
  aspectRatio,
  posterUrl,
  caption,
  name,
}: {
  url: string;
  mediaType: SampleBrandMediaType;
  aspectRatio: SampleBrandAspectRatio;
  posterUrl?: string | null;
  caption?: string | null;
  name: string;
}) {
  const type = resolveMediaType(mediaType, url);
  const box = `relative w-full overflow-hidden rounded-2xl bg-slate-900/5 ring-1 ring-blue-100/70 ${aspectRatioClass(aspectRatio)} max-h-[min(72vh,820px)]`;

  return (
    <div className={box}>
      {type === "video" ? (
        <video
          src={url}
          poster={posterUrl ?? undefined}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
        />
      ) : (
        <Image src={url} alt={name} fill className="object-cover" sizes="100vw" priority unoptimized />
      )}
      {caption?.trim() ? (
        <p className="absolute bottom-4 left-4 right-4 text-center text-xs font-light tracking-wide text-white/90 drop-shadow-md">
          {caption.trim()}
        </p>
      ) : null}
    </div>
  );
}

export default function SampleBrandExperience({ data }: { data: SampleBrandPageData }) {
  const { industry, brand, siblings } = data;
  const [tab, setTab] = useState<MediaTab>("all");
  const [ratioFilter, setRatioFilter] = useState<SampleBrandAspectRatio | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<SampleBrandMediaCategory | "all">("all");

  const publishedMedia = useMemo(
    () => brand.media.filter((m) => m.published).sort((a, b) => a.sort_order - b.sort_order),
    [brand.media]
  );

  const filtered = useMemo(() => {
    return publishedMedia.filter((m) => {
      if (tab !== "all" && m.media_type !== tab) return false;
      if (ratioFilter !== "all" && m.aspect_ratio !== ratioFilter) return false;
      if (categoryFilter !== "all" && m.category !== categoryFilter) return false;
      return true;
    });
  }, [publishedMedia, tab, ratioFilter, categoryFilter]);

  const byCategory = useMemo(() => {
    const groups: { category: SampleBrandMediaCategory; items: SampleBrandMedia[] }[] = [];
    for (const cat of SAMPLE_BRAND_MEDIA_CATEGORIES) {
      const items = filtered.filter((m) => m.category === cat.value);
      if (items.length > 0) groups.push({ category: cat.value, items });
    }
    return groups;
  }, [filtered]);

  const heroUrl = brand.hero_image_url ?? brand.cover_image_url;
  const heroType = brand.hero_image_url ? brand.hero_media_type : brand.cover_media_type;
  const heroRatio = brand.hero_image_url ? brand.hero_aspect_ratio : brand.cover_aspect_ratio;
  const heroPoster = brand.hero_poster_url ?? brand.cover_poster_url;

  const imageCount = publishedMedia.filter((m) => m.media_type === "image").length;
  const videoCount = publishedMedia.filter((m) => m.media_type === "video").length;

  return (
    <IndustryShell>
      <Navbar />

      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "Solutions", href: "/industries" },
            { label: industry.name, href: `/industries/${industry.slug}` },
            { label: brand.name, current: true },
          ]}
        />
      </IndustryTopBar>

      <section className="px-4 pb-6 pt-2 sm:px-6 lg:px-10">
        <IndustryEyebrow>{industryEyebrow("Sample brand", industry.name)}</IndustryEyebrow>
        <h1
          className="mt-2 font-body text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          {brand.name}
        </h1>
        {brand.tagline?.trim() ? (
          <p className="mt-2 max-w-lg text-sm font-light text-slate-500">{plainCopy(brand.tagline)}</p>
        ) : null}
        {(imageCount > 0 || videoCount > 0) && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-slate-400">
            {imageCount > 0 ? `${imageCount} stills` : ""}
            {imageCount > 0 && videoCount > 0 ? ", " : ""}
            {videoCount > 0 ? `${videoCount} films` : ""}
          </p>
        )}
      </section>

      {heroUrl ? (
        <section className="px-4 sm:px-6 lg:px-10">
          <BrandHero
            url={heroUrl}
            mediaType={heroType}
            aspectRatio={heroRatio}
            posterUrl={heroPoster}
            caption={brand.hero_caption}
            name={brand.name}
          />
        </section>
      ) : null}

      <IndustryTintSection className="!pt-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <IndustryEyebrow>The world</IndustryEyebrow>
            <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">gallery</span>}>
              Built for {brand.name}
            </IndustrySectionTitle>
          </div>
          <IndustryTextLink href={`/industries/${industry.slug}`}>← {industry.name}</IndustryTextLink>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-blue-100/80 pb-4">
          {(
            [
              { id: "all" as const, label: "All" },
              { id: "image" as const, label: "Images" },
              { id: "video" as const, label: "Videos" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                tab === t.id
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400">Ratio</span>
          <button
            type="button"
            onClick={() => setRatioFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              ratioFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            All
          </button>
          {SAMPLE_BRAND_ASPECT_RATIOS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRatioFilter(r.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                ratioFilter === r.value ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</span>
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              categoryFilter === "all" ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            All
          </button>
          {SAMPLE_BRAND_MEDIA_CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategoryFilter(c.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                categoryFilter === c.value ? "bg-blue-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {c.short}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-blue-200/80 bg-white/70 py-16 text-center text-sm font-light text-slate-500">
            No published assets match these filters yet.
          </p>
        ) : (
          <div className="mt-10 space-y-14">
            {byCategory.map(({ category, items }) => (
              <div key={category}>
                <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600/90">
                  {categoryLabel(category)}
                </h3>
                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, i) => (
                    <div key={item.id} className={masonrySpanClass(item.aspect_ratio)}>
                      <SampleBrandMediaTile item={item} priority={i < 2} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </IndustryTintSection>

      {brand.description?.trim() ? (
        <section className="px-4 py-8 sm:px-6 lg:px-10">
          <p className="mx-auto max-w-2xl text-center text-sm font-light leading-relaxed text-slate-500">
            {brand.description.trim()}
          </p>
        </section>
      ) : null}

      {siblings.length > 0 ? (
        <IndustryTintSection>
          <IndustryEyebrow>More sample brands</IndustryEyebrow>
          <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">{industry.name}</span>}>
            Other worlds
          </IndustrySectionTitle>
          <ul className="mt-6 flex flex-wrap gap-3">
            {siblings.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/industries/${industry.slug}/brands/${s.slug}`}
                  className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-300 hover:text-blue-700"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </IndustryTintSection>
      ) : null}

      <IndustryTintSection className="!py-14">
        <div className="text-center">
          <IndustryEyebrow>Your brand</IndustryEyebrow>
          <IndustrySectionTitle>
            Build your <span className="font-semibold text-blue-700">{industry.name}</span> world
          </IndustrySectionTitle>
          <div className="mt-8 flex justify-center">
            <IndustryCTABlock industryName={industry.name} />
          </div>
        </div>
      </IndustryTintSection>
    </IndustryShell>
  );
}
