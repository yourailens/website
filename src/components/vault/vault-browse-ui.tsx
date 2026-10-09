"use client";

import { useEffect, useRef, useState } from "react";
import AiModelBadge from "@/components/vault/AiModelBadge";
import VaultPendingLink from "@/components/vault/VaultPendingLink";
import {
  tagsOfKind,
  yailVaultCategoryLabel,
  type YailVaultEntry,
} from "@/data/yail-vault";

function entryThumb(entry: YailVaultEntry) {
  return entry.poster_url || (entry.media_type === "image" ? entry.media_url : null);
}

function PlayGlyph({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor" aria-hidden>
      <path d="M3 1.5v11l9-5.5L3 1.5z" />
    </svg>
  );
}

/** OTT hero: full-bleed media + bottom-left overlay copy. */
export function VaultOttHero({ entry }: { entry: YailVaultEntry }) {
  const poster = entryThumb(entry);
  const genre = tagsOfKind(entry, "genre")[0]?.name;
  const avatar = tagsOfKind(entry, "avatar")[0]?.name;

  return (
    <section className="relative isolate min-h-[min(72vh,42rem)] w-full overflow-hidden bg-zinc-950">
      {entry.media_type === "video" ? (
        <video
          key={entry.id}
          src={entry.media_url}
          poster={poster ?? undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          loop
          autoPlay
          preload="auto"
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-black to-black" />
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

      <div className="relative z-10 flex min-h-[min(72vh,42rem)] flex-col justify-end px-5 pb-10 pt-24 sm:px-8 sm:pb-12 lg:px-10 lg:pb-14">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/90">
          {yailVaultCategoryLabel(entry.category)}
          {genre ? ` · ${genre}` : ""}
          {avatar ? ` · ${avatar}` : ""}
        </p>
        <h1 className="mt-3 max-w-2xl font-body text-[clamp(2.1rem,5vw,4rem)] font-semibold leading-[0.95] tracking-tight text-white">
          {entry.title}
        </h1>
        {entry.caption ? (
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/70 sm:text-base">
            {entry.caption}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <VaultPendingLink
            href={`/vault/${entry.slug}`}
            className="inline-flex items-center gap-2 rounded-md bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black shadow-[0_8px_24px_-8px_rgba(0,0,0,0.65)] transition hover:bg-sky-100"
          >
            <PlayGlyph size={12} />
            Open
          </VaultPendingLink>
          <AiModelBadge modelId={entry.ai_model} size="md" />
        </div>
      </div>
    </section>
  );
}

function VaultRailCard({ entry }: { entry: YailVaultEntry }) {
  const genre = tagsOfKind(entry, "genre")[0]?.name;
  const tag = genre ?? yailVaultCategoryLabel(entry.category);
  const thumb = entryThumb(entry);
  const isVideo = entry.media_type === "video";
  const [ratio, setRatio] = useState(() =>
    entry.aspect_width && entry.aspect_height
      ? entry.aspect_width / entry.aspect_height
      : 16 / 9
  );

  useEffect(() => {
    if (entry.aspect_width && entry.aspect_height) {
      setRatio(entry.aspect_width / entry.aspect_height);
      return;
    }
    const src = thumb || (isVideo ? entry.media_url : null);
    if (!src) return;
    if (thumb) {
      const img = new window.Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          setRatio(img.naturalWidth / img.naturalHeight);
        }
      };
      img.src = thumb;
      return;
    }
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.onloadedmetadata = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        setRatio(video.videoWidth / video.videoHeight);
      }
    };
    video.src = entry.media_url;
  }, [entry.aspect_height, entry.aspect_width, entry.media_url, isVideo, thumb]);

  return (
    <VaultPendingLink
      href={`/vault/${entry.slug}`}
      className="group relative block h-[9.5rem] shrink-0 overflow-hidden rounded-md bg-zinc-900 sm:h-[11rem] lg:h-[12rem]"
      style={{ aspectRatio: `${ratio}`, width: "auto" }}
    >
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb}
          alt={entry.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      ) : isVideo ? (
        <video
          src={entry.media_url}
          className="h-full w-full object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sky-950 to-black">
          <PlayGlyph size={20} />
        </div>
      )}

      {isVideo ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fafafa] text-black shadow-lg">
            <PlayGlyph size={14} />
          </span>
        </span>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-2.5 pb-2 pt-10">
        {tag ? (
          <p className="font-mono text-[7px] tracking-[0.18em] text-sky-300/90">{tag}</p>
        ) : null}
        <p className="mt-0.5 truncate text-[12px] font-medium leading-tight text-white sm:text-[13px]">
          {entry.title}
        </p>
        {entry.ai_model ? (
          <div className="mt-1.5">
            <AiModelBadge modelId={entry.ai_model} />
          </div>
        ) : null}
      </div>
    </VaultPendingLink>
  );
}

export function VaultRail({
  title,
  scene,
  entries,
  titleHref,
}: {
  title: string;
  scene: string;
  entries: YailVaultEntry[];
  titleHref?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollBy({ left: dir * node.clientWidth * 0.72, behavior: "smooth" });
  };

  if (!entries.length) return null;

  return (
    <section className="w-full">
      <div className="flex items-end justify-between gap-3 px-5 sm:px-8 lg:px-10">
        <div className="min-w-0">
          <p className="font-mono text-[9px] tracking-[0.28em] text-sky-400/90">{scene}</p>
          {titleHref ? (
            <VaultPendingLink
              href={titleHref}
              className="mt-1 block font-body text-[clamp(1.05rem,2.2vw,1.45rem)] font-semibold leading-none tracking-tight transition hover:text-sky-200"
            >
              {title}
            </VaultPendingLink>
          ) : (
            <h2 className="mt-1 font-body text-[clamp(1.05rem,2.2vw,1.45rem)] font-semibold leading-none tracking-tight">
              {title}
            </h2>
          )}
        </div>
        <div className="mb-0.5 hidden shrink-0 gap-1 md:flex">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => scrollBy(-1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => scrollBy(1)}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 text-white/70 transition hover:border-white/40 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="ott-rail mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-5 pb-1 sm:gap-2.5 sm:px-8 lg:px-10"
      >
        {entries.map((entry) => (
          <div key={entry.id} className="snap-start">
            <VaultRailCard entry={entry} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function EmptyVault() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/logo_yail.png" alt="" className="h-10 w-auto opacity-90" />
      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.32em] text-sky-300/80">Vault</p>
      <h1 className="mt-3 font-heading text-4xl tracking-tight text-white sm:text-5xl">Enter the labs</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
        GenAI experiments in filmmaking and ads will land here. Check back once the first cut is published.
      </p>
    </section>
  );
}
