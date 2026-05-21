"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Prop } from "@/data/props";
import type { LightingPreset } from "@/data/lighting_presets";
import type { ColorGrade } from "@/data/color_grades";
import type { MoodBoard } from "@/data/mood_boards";

// ─── Types (generic card shape) ─────────────────────────────────────────────
interface AnyResource {
  id: string;
  slug: string;
  title: string;
  image_url: string;
  aspect_ratio: "portrait" | "square" | "landscape";
  tag: string;
}

// ─── Resource category definitions ──────────────────────────────────────────
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
  gradient: string;
  bgFrom: string;
  border: string;
  dot: string;
  collections: CollectionDef[];
};
const CATEGORIES: CategoryDef[] = [
  {
    key: "characters",
    label: "Characters & Style",
    tagline: "People, outfits and props for every shoot.",
    gradient: "from-violet-500 to-purple-700",
    bgFrom: "from-violet-50",
    border: "border-violet-100",
    dot: "bg-violet-500",
    collections: [
      { label: "Character Sheets", href: "/character-sheets", endpoint: "/api/character-sheets?limit=8", key: "character_sheets", tagField: "archetype", tagLabels: (v: string) => v.replace(/_/g, " ") },
      { label: "Outfit Sheets",    href: "/outfits",          endpoint: "/api/outfits?limit=8",          key: "outfits",          tagField: "category",  tagLabels: (v: string) => v },
      { label: "Props Library",    href: "/props",            endpoint: "/api/props?limit=8",            key: "props",            tagField: "category",  tagLabels: (v: string) => v.replace(/_/g, " ") },
    ],
  },
  {
    key: "scenes",
    label: "Scenes & World",
    tagline: "Scenarios, locations and aesthetic vibes.",
    gradient: "from-emerald-500 to-teal-700",
    bgFrom: "from-emerald-50",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
    collections: [
      { label: "Reference Scenarios", href: "/scenarios",   endpoint: "/api/scenarios?limit=8",   key: "scenarios",   tagField: "scene_type",  tagLabels: (v: string) => v.replace(/_/g, " ") },
      { label: "Locations",           href: "/locations",   endpoint: "/api/locations?limit=8",   key: "locations",   tagField: "environment", tagLabels: (v: string) => v.replace(/_/g, " ") },
      { label: "Mood Boards",         href: "/mood-boards", endpoint: "/api/mood-boards?limit=8", key: "mood_boards", tagField: "aesthetic",   tagLabels: (v: string) => v.replace(/_/g, " ") },
    ],
  },
  {
    key: "production",
    label: "Production",
    tagline: "Workflows, lighting and cinematic color.",
    gradient: "from-blue-500 to-indigo-700",
    bgFrom: "from-blue-50",
    border: "border-blue-100",
    dot: "bg-blue-500",
    collections: [
      { label: "Workflows",              href: "/prompts",          endpoint: "/api/prompts?limit=8",          key: "prompts",          tagField: "medium",       tagLabels: (v: string) => v },
      { label: "Lighting Presets",       href: "/lighting-presets", endpoint: "/api/lighting-presets?limit=8", key: "lighting_presets", tagField: "lighting_type", tagLabels: (v: string) => v.replace(/_/g, " ") },
      { label: "Color Grading Presets",  href: "/color-grades",     endpoint: "/api/color-grades?limit=8",     key: "color_grades",     tagField: "grade_style",  tagLabels: (v: string) => v },
    ],
  },
];

// ─── Resource card (horizontal strip item) ───────────────────────────────────
function ResourceCard({ item, href }: { item: AnyResource; href: string }) {
  return (
    <Link
      href={`${href}/${item.slug}`}
      className="group relative h-52 w-48 shrink-0 overflow-hidden rounded-2xl shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image_url}
        alt={item.title}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-2.5">
        <p className="line-clamp-2 text-[11px] font-bold leading-snug text-white drop-shadow">{item.title}</p>
        {item.tag && (
          <span className="mt-1 inline-block rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            {item.tag}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Horizontal strip with fade edges ────────────────────────────────────────
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
          <div
            key={i}
            className="h-52 w-48 shrink-0 animate-pulse rounded-2xl bg-slate-200"
          />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
        Nothing published yet
      </div>
    );
  }
  return (
    <div className="relative">
      <div
        ref={ref}
        className="scrollbar-hide flex gap-3 overflow-x-auto pb-1"
        style={{ maskImage: "linear-gradient(to right, black 0, black calc(100% - 40px), transparent 100%)" }}
      >
        {items.map((item) => (
          <ResourceCard key={item.id} item={item} href={href} />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ResourcesHubExperience() {
  const [data, setData] = useState<Record<string, AnyResource[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const allCollections = CATEGORIES.flatMap((c) => c.collections);
    Promise.all(
      allCollections.map(async (col) => {
        try {
          const res = await fetch(col.endpoint);
          const json = await res.json() as Record<string, unknown[]>;
          const items = (json[col.key] ?? []) as Record<string, unknown>[];
          const mapped: AnyResource[] = items.map((item) => ({
            id: String(item.id ?? ""),
            slug: String(item.slug ?? ""),
            title: String(item.title ?? ""),
            image_url: String(item.image_url ?? ""),
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
      results.forEach(({ key, items }) => { map[key] = items; });
      setData(map);
      setLoading(false);
    });
  }, []);

  const totalCount = Object.values(data).reduce((acc, arr) => acc + arr.length, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden bg-white">
          {/* Background decoration */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-violet-100/60 blur-3xl" />
          <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-emerald-100/40 blur-3xl" />

          <div className="relative w-[95%] mx-auto py-14 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Reference Library
            </div>
            <h1 className="mt-5 font-heading text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Every resource,<br />
              <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
                one place.
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-500">
              9 reference libraries for AI filmmakers and creators. Browse characters, outfits, props, scenes, lighting, color grades, mood boards and workflows — all downloadable and searchable.
            </p>

            {/* Stat pills */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {[
                { label: "Libraries", value: "9" },
                { label: "Categories", value: "3" },
                { label: "Available now", value: `${loading ? "…" : totalCount}+` },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 shadow-sm">
                  <p className="font-heading text-2xl font-black text-slate-900">{s.value}</p>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Category bands ─────────────────────────────────────────────── */}
        <div className="w-[95%] mx-auto space-y-16 py-14">
          {CATEGORIES.map((cat) => (
            <section key={cat.key}>
              {/* Category header */}
              <div className="mb-8 flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-1.5 rounded-full bg-gradient-to-b ${cat.gradient}`} />
                  <div>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">{cat.tagline}</p>
                    <h2 className="font-heading text-2xl font-black tracking-tight text-slate-900">{cat.label}</h2>
                  </div>
                </div>
              </div>

              {/* Collections */}
              <div className="space-y-8">
                {cat.collections.map((col) => {
                  const items = data[col.key] ?? [];
                  return (
                    <div key={col.key}>
                      {/* Collection header row */}
                      <div className="mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${cat.gradient} flex items-center justify-center shadow-sm`}>
                            <CollectionIcon href={col.href} />
                          </div>
                          <h3 className="text-sm font-bold text-slate-800">{col.label}</h3>
                          {!loading && items.length > 0 && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">{items.length}+ items</span>
                          )}
                        </div>
                        <Link
                          href={col.href}
                          className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600"
                        >
                          View all
                          <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                        </Link>
                      </div>
                      {/* Cards strip */}
                      <HorizontalStrip items={items} href={col.href} loading={loading} />
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* ── Bottom CTA ─────────────────────────────────────────────────── */}
        <div className="bg-slate-50">
          <div className="w-[95%] mx-auto py-16 text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Growing library</p>
            <h2 className="mt-3 font-heading text-3xl font-black tracking-tight text-slate-900">More coming every week.</h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-500">
              New reference sheets, lighting setups, and mood boards are added regularly. Follow our socials to stay updated.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/instagram" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Instagram</Link>
              <Link href="/youtube" className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">YouTube</Link>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

// ─── Small icon for each collection ──────────────────────────────────────────
function CollectionIcon({ href }: { href: string }) {
  const cls = "text-white";
  if (href === "/prompts") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
    </svg>
  );
  if (href === "/outfits") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>
    </svg>
  );
  if (href === "/character-sheets") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <circle cx="12" cy="7" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
  if (href === "/scenarios") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <circle cx="9" cy="9" r="3"/><path d="M3 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
    </svg>
  );
  if (href === "/locations") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
  if (href === "/props") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  );
  if (href === "/lighting-presets") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    </svg>
  );
  if (href === "/color-grades") return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12.5" r="2.5"/>
    </svg>
  );
  // mood-boards
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={cls} strokeLinecap="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  );
}
