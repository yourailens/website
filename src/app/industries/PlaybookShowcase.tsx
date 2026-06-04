"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IndustryPlaybookExample, PlaybookCoverPreview } from "@/data/industries";
import { resolveMediaType } from "@/lib/industries/media";
import { resolvePlaybookCoverExample } from "@/lib/industries/resolve-hero-media";
import { plainCopy } from "./industry-copy";
import { IndustryEyebrow, IndustrySectionTitle, IndustryTintSection } from "./IndustryUI";

function coverAlt(cover: PlaybookCoverPreview): string {
  return cover.caption?.trim() || cover.title || "Playbook cover";
}

export type PlaybookItem = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  example_count?: number;
  cover: PlaybookCoverPreview | null;
};

function publishedSampleCount(pb: PlaybookItem): number {
  return pb.example_count ?? 0;
}

/** Listing covers: poster still for video — never download MP4s in the grid */
function PlaybookCoverStill({
  cover,
  className = "absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]",
  sizes = "(max-width:1024px) 100vw, 55vw",
}: {
  cover: PlaybookCoverPreview;
  className?: string;
  sizes?: string;
}) {
  const isVideo = resolveMediaType(cover.media_type, cover.media_url) === "video";
  const src = isVideo ? cover.poster_url?.trim() || null : cover.media_url;

  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50/70">
        <span className="text-xs font-light text-slate-400">Open playbook for samples</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={coverAlt(cover)}
      fill
      className={className}
      sizes={sizes}
      loading="lazy"
      unoptimized
    />
  );
}

function PlaybookIndexRow({
  index,
  name,
  tagline,
  href,
  active,
  onActivate,
  sampleCount,
}: {
  index: number;
  name: string;
  tagline?: string | null;
  href: string;
  active: boolean;
  onActivate: () => void;
  sampleCount: number;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={href}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      className={`group flex items-start gap-4 rounded-xl border-2 px-4 py-4 transition duration-200 ${
        active
          ? "border-blue-400 bg-white shadow-md shadow-blue-100/40"
          : "border-transparent bg-white/70 hover:border-blue-200/80 hover:bg-white hover:shadow-sm"
      }`}
    >
      <span
        className={`mt-0.5 font-mono text-2xl font-black tabular-nums transition-colors ${
          active ? "text-blue-600" : "text-blue-200 group-hover:text-blue-400"
        }`}
      >
        {num}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600/80">Playbook</span>
        <span
          className={`mt-0.5 block font-body text-base font-bold leading-snug transition-colors ${
            active ? "text-slate-900" : "text-slate-700 group-hover:text-blue-800"
          }`}
          style={{ letterSpacing: "-0.02em" }}
        >
          {name}
        </span>
        {tagline?.trim() ? (
          <span className="mt-1 block line-clamp-2 text-sm font-light text-slate-500">{plainCopy(tagline)}</span>
        ) : null}
        {sampleCount > 0 ? (
          <span className="mt-2 inline-block text-[10px] font-medium text-slate-400">
            {sampleCount} {sampleCount === 1 ? "sample" : "samples"}
          </span>
        ) : null}
      </span>
      <span
        className={`mt-1 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500 ${
          active ? "text-blue-500" : ""
        }`}
        aria-hidden
      >
        →
      </span>
    </Link>
  );
}

function PlaybookPreviewPanel({
  playbook,
  index,
  href,
}: {
  playbook: PlaybookItem;
  index: number;
  href: string;
}) {
  const num = String(index + 1).padStart(2, "0");

  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100/90 bg-white shadow-lg shadow-blue-100/30">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        {playbook.cover ? (
          <PlaybookCoverStill cover={playbook.cover} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50/70">
            <span className="text-xs font-light text-slate-400">Cover coming soon</span>
          </div>
        )}
      </div>
      <div className="border-t border-blue-50 px-6 py-6">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600/90">Playbook {num}</p>
        <h3
          className="mt-2 font-body text-2xl font-black leading-tight text-slate-900"
          style={{ letterSpacing: "-0.03em" }}
        >
          {playbook.name}
        </h3>
        {playbook.tagline?.trim() ? (
          <p className="mt-2 text-sm font-light leading-relaxed text-slate-600">{plainCopy(playbook.tagline)}</p>
        ) : null}
        <Link
          href={href}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700"
        >
          Open playbook
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

/** Only mount playbooks UI when the section scrolls near the viewport */
function PlaybookShowcaseWhenVisible({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { rootMargin: "200px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-[120px]">
      {visible ? (
        children
      ) : (
        <div className="mt-10 h-48 animate-pulse rounded-2xl bg-blue-50/80" aria-hidden />
      )}
    </div>
  );
}

export function PlaybookShowcase({
  playbooks,
  industrySlug,
  industryName,
}: {
  playbooks: PlaybookItem[];
  industrySlug: string;
  industryName?: string;
}) {
  const [activeId, setActiveId] = useState(playbooks[0]?.id ?? "");
  const href = useCallback((slug: string) => `/industries/${industrySlug}/${slug}`, [industrySlug]);

  if (playbooks.length === 0) return null;

  const activeIndex = Math.max(0, playbooks.findIndex((p) => p.id === activeId));
  const activePlaybook = playbooks[activeIndex] ?? playbooks[0];

  return (
    <IndustryTintSection>
      <div className="max-w-2xl">
        <IndustryEyebrow>Playbooks</IndustryEyebrow>
        <IndustrySectionTitle
          accent={industryName ? <span className="font-semibold text-blue-700">{industryName}</span> : undefined}
        >
          {industryName ? "for" : "Browse"}
        </IndustrySectionTitle>
        <p className="mt-3 text-sm font-light leading-relaxed text-slate-600">
          Pick a topic to see sample work on the full playbook page.
        </p>
      </div>

      <PlaybookShowcaseWhenVisible>
        {/* All breakpoints: text list; one cover preview on large screens only */}
        <div className="mt-10 lg:grid lg:grid-cols-[minmax(300px,380px)_1fr] lg:items-start lg:gap-10">
          <ul className="space-y-2" role="list">
            {playbooks.map((pb, i) => (
              <li key={pb.id}>
                <PlaybookIndexRow
                  index={i}
                  name={pb.name}
                  tagline={pb.tagline}
                  href={href(pb.slug)}
                  active={pb.id === activePlaybook.id}
                  onActivate={() => setActiveId(pb.id)}
                  sampleCount={publishedSampleCount(pb)}
                />
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden lg:sticky lg:top-28 lg:mt-0 lg:block">
            <PlaybookPreviewPanel playbook={activePlaybook} index={activeIndex} href={href(activePlaybook.slug)} />
          </div>
        </div>
      </PlaybookShowcaseWhenVisible>
    </IndustryTintSection>
  );
}

function coverFromExamples(examples: IndustryPlaybookExample[]): PlaybookCoverPreview | null {
  const ex = resolvePlaybookCoverExample(examples);
  if (!ex) return null;
  return {
    media_url: ex.media_url,
    media_type: ex.media_type,
    poster_url: ex.poster_url,
    aspect_ratio: ex.aspect_ratio,
    title: ex.title,
    caption: ex.caption,
  };
}

/** Prev / next on playbook detail — poster stills only */
export function PlaybookNavPair({
  prev,
  next,
  industrySlug,
}: {
  prev?: { slug: string; name: string; index: number; tagline?: string | null; examples: IndustryPlaybookExample[] };
  next?: { slug: string; name: string; index: number; tagline?: string | null; examples: IndustryPlaybookExample[] };
  industrySlug: string;
}) {
  if (!prev && !next) return null;

  const NavCard = ({
    item,
    flip,
  }: {
    item: { slug: string; name: string; index: number; tagline?: string | null; examples: IndustryPlaybookExample[] };
    flip?: boolean;
  }) => {
    const cover = coverFromExamples(item.examples);
    const num = String(item.index + 1).padStart(2, "0");
    const sampleCount = item.examples.filter((e) => e.published).length;

    return (
      <Link
        href={`/industries/${industrySlug}/${item.slug}`}
        className={`group grid overflow-hidden rounded-2xl border border-blue-100/90 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md ${
          flip ? "sm:grid-cols-[1fr_1.05fr]" : "sm:grid-cols-[1.05fr_1fr]"
        }`}
      >
        <div
          className={`relative min-h-[160px] overflow-hidden bg-slate-100 sm:min-h-[180px] ${
            flip ? "sm:order-2" : ""
          }`}
        >
          {cover ? (
            <PlaybookCoverStill cover={cover} sizes="50vw" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50/70">
              <span className="text-xs text-slate-400">No preview</span>
            </div>
          )}
        </div>
        <div
          className={`flex flex-col justify-center px-5 py-5 sm:px-6 ${
            flip ? "sm:order-1 sm:border-r-2 sm:border-r-blue-200/70" : "sm:border-l-2 sm:border-l-blue-200/70"
          }`}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-blue-600/90">Playbook {num}</p>
          <h3 className="mt-2 font-body text-lg font-black text-slate-900 group-hover:text-blue-700">{item.name}</h3>
          {item.tagline?.trim() ? (
            <p className="mt-1 line-clamp-2 text-sm font-light text-slate-600">{plainCopy(item.tagline)}</p>
          ) : null}
          <p className="mt-3 text-xs font-semibold text-blue-600">
            Open playbook
            {sampleCount > 0 ? (
              <span className="ml-2 font-normal text-slate-400">
                , {sampleCount} {sampleCount === 1 ? "sample" : "samples"}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
    );
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {prev ? (
        <div className="min-w-0 flex-1">
          <NavCard item={prev} />
        </div>
      ) : null}
      {next ? (
        <div className="min-w-0 flex-1">
          <NavCard item={next} flip />
        </div>
      ) : null}
    </div>
  );
}
