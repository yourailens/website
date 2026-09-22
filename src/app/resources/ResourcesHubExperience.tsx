"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  INDUSTRY_PAGE,
  IndustryChannelTitle,
  IndustryEyebrow,
  IndustryGlow,
  IndustryPrimaryLink,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTextLink,
  IndustryTintSection,
} from "@/app/industries/IndustryUI";

interface AnyResource {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  aspect_ratio: "portrait" | "square" | "landscape";
  tag: string;
}

type CollectionDef = {
  label: string;
  href: string;
  endpoint: string;
  key: string;
  tagField: string;
  tagLabels: (v: string) => string;
};

type CategoryDef = {
  key: string;
  label: string;
  tagline: string;
  collections: CollectionDef[];
};

const CATEGORIES: CategoryDef[] = [
  {
    key: "characters",
    label: "Characters & Style",
    tagline: "People, outfits and props for every shoot.",
    collections: [
      {
        label: "Models",
        href: "/character-sheets",
        endpoint: "/api/character-sheets?limit=8",
        key: "character_sheets",
        tagField: "archetype",
        tagLabels: (v) => v.replace(/_/g, " "),
      },
      {
        label: "Outfit Sheets",
        href: "/outfits",
        endpoint: "/api/outfits?limit=8",
        key: "outfits",
        tagField: "category",
        tagLabels: (v) => v,
      },
      {
        label: "Props Library",
        href: "/props",
        endpoint: "/api/props?limit=8",
        key: "props",
        tagField: "category",
        tagLabels: (v) => v.replace(/_/g, " "),
      },
    ],
  },
  {
    key: "scenes",
    label: "Scenes & World",
    tagline: "Scenarios, locations and aesthetic vibes.",
    collections: [
      {
        label: "Reference Scenarios",
        href: "/scenarios",
        endpoint: "/api/scenarios?limit=8",
        key: "scenarios",
        tagField: "scene_type",
        tagLabels: (v) => v.replace(/_/g, " "),
      },
      {
        label: "Locations",
        href: "/locations",
        endpoint: "/api/locations?limit=8",
        key: "locations",
        tagField: "environment",
        tagLabels: (v) => v.replace(/_/g, " "),
      },
      {
        label: "Mood Boards",
        href: "/mood-boards",
        endpoint: "/api/mood-boards?limit=8",
        key: "mood_boards",
        tagField: "aesthetic",
        tagLabels: (v) => v.replace(/_/g, " "),
      },
    ],
  },
  {
    key: "production",
    label: "Production",
    tagline: "Workflows, lighting and cinematic color.",
    collections: [
      {
        label: "Workflows",
        href: "/prompts",
        endpoint: "/api/prompts?limit=8",
        key: "prompts",
        tagField: "medium",
        tagLabels: (v) => v,
      },
      {
        label: "Lighting Presets",
        href: "/lighting-presets",
        endpoint: "/api/lighting-presets?limit=8",
        key: "lighting_presets",
        tagField: "lighting_type",
        tagLabels: (v) => v.replace(/_/g, " "),
      },
      {
        label: "Color Grading Presets",
        href: "/color-grades",
        endpoint: "/api/color-grades?limit=8",
        key: "color_grades",
        tagField: "grade_style",
        tagLabels: (v) => v,
      },
    ],
  },
];

function resolveResourceImageUrl(item: Record<string, unknown>): string {
  for (const key of ["image_url", "cover_image_url", "og_image_url", "cover_poster_url"]) {
    const v = item[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

function ResourceCard({ item, href, index }: { item: AnyResource; href: string; index: number }) {
  const src = item.image_url.trim();
  const ep = String(index + 1).padStart(2, "0");
  return (
    <Link
      href={`${href}/${item.slug}`}
      className="group relative h-52 w-44 shrink-0 overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 sm:w-48"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-zinc-900">
          <span className="font-body text-3xl font-semibold text-blue-500/35">
            {(item.title.trim().charAt(0) || "?").toUpperCase()}
          </span>
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <p className="absolute left-2.5 top-2.5 font-mono text-[9px] tracking-[0.22em] text-blue-300">
        {ep}
      </p>
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="line-clamp-2 text-[11px] font-semibold leading-snug text-white">{item.title}</p>
        {item.tag ? (
          <span className="mt-1 inline-block font-mono text-[9px] tracking-[0.16em] text-white/45 uppercase">
            {item.tag}
          </span>
        ) : null}
      </div>
    </Link>
  );
}

function HorizontalStrip({
  items,
  href,
  loading,
}: {
  items: AnyResource[];
  href: string;
  loading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 w-44 shrink-0 animate-pulse border border-white/10 bg-white/[0.04] sm:w-48" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center border border-dashed border-white/15 text-xs font-light text-white/40">
        Nothing published yet
      </div>
    );
  }
  return (
    <div className="relative">
      <div
        ref={ref}
        className="scrollbar-hide flex gap-3 overflow-x-auto pb-1"
        style={{
          maskImage:
            "linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)",
        }}
      >
        {items.map((item, i) => (
          <ResourceCard key={item.id} item={item} href={href} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function ResourcesHubExperience() {
  const [data, setData] = useState<Record<string, AnyResource[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allCollections = CATEGORIES.flatMap((c) => c.collections);
    Promise.all(
      allCollections.map(async (col) => {
        try {
          const res = await fetch(col.endpoint);
          const json = (await res.json()) as Record<string, unknown[]>;
          const items = (json[col.key] ?? []) as Record<string, unknown>[];
          const mapped: AnyResource[] = items.map((item) => ({
            id: String(item.id ?? ""),
            slug: String(item.slug ?? ""),
            title: String(item.title ?? ""),
            image_url: resolveResourceImageUrl(item),
            aspect_ratio: (item.aspect_ratio as AnyResource["aspect_ratio"]) ?? "square",
            tag: col.tagLabels(String((item as Record<string, unknown>)[col.tagField] ?? "")),
          }));
          return { key: col.key, items: mapped };
        } catch {
          return { key: col.key, items: [] };
        }
      })
    ).then((results) => {
      const map: Record<string, AnyResource[]> = {};
      results.forEach(({ key, items }) => {
        map[key] = items;
      });
      setData(map);
      setLoading(false);
    });
  }, []);

  const totalCount = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-10 pt-12 sm:pt-16`}>
        <IndustryChannelTitle channel="CHANNEL · REFERENCE LIBRARY" title="Libraries" />
        <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
          Nine reference desks for AI filmmakers — characters, outfits, props, scenes, lighting,
          color grades, mood boards, and workflows.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <IndustryPrimaryLink href="/prompts">Browse workflows</IndustryPrimaryLink>
          <p className="font-mono text-[10px] tracking-[0.22em] text-white/40">
            {loading ? "…" : `${totalCount}+`} ITEMS · 9 LIBRARIES
          </p>
        </div>
      </section>

      {CATEGORIES.map((cat) => (
        <IndustryTintSection key={cat.key}>
          <IndustryEyebrow>{cat.tagline.toUpperCase()}</IndustryEyebrow>
          <IndustrySectionTitle>{cat.label}</IndustrySectionTitle>

          <div className="mt-10 space-y-10">
            {cat.collections.map((col) => {
              const items = data[col.key] ?? [];
              return (
                <div key={col.key}>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-body text-lg font-semibold tracking-tight text-white">
                        {col.label}
                      </h3>
                      {!loading && items.length > 0 ? (
                        <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-white/40">
                          {items.length}+ ITEMS
                        </p>
                      ) : null}
                    </div>
                    <IndustryTextLink href={col.href}>View all</IndustryTextLink>
                  </div>
                  <HorizontalStrip items={items} href={col.href} loading={loading} />
                </div>
              );
            })}
          </div>
        </IndustryTintSection>
      ))}

      <IndustryTintSection className="!py-16">
        <div className="text-center">
          <IndustryEyebrow>GROWING LIBRARY</IndustryEyebrow>
          <IndustrySectionTitle>More coming every week.</IndustrySectionTitle>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-white/55">
            New reference sheets, lighting setups, and mood boards land regularly.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <IndustryPrimaryLink href="/instagram">Instagram</IndustryPrimaryLink>
            <Link
              href="/youtube"
              className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-blue-300"
            >
              YouTube
            </Link>
          </div>
        </div>
      </IndustryTintSection>
    </IndustryShell>
  );
}
