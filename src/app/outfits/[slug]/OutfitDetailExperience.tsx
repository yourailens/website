"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  INDUSTRY_PAGE,
  IndustryBreadcrumb,
  IndustryShell,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";
import type { Outfit } from "@/data/outfits";
import { OUTFIT_CATEGORY_LABELS, OUTFIT_CHARACTER_LABELS } from "@/data/outfits";

const btnPrimary =
  "flex flex-1 items-center justify-center gap-2 border border-blue-400/55 bg-transparent px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200 disabled:opacity-60";
const btnGhost =
  "flex items-center justify-center gap-2 border border-white/12 bg-white/[0.02] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/25 hover:text-white";
const pill =
  "border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60";

async function trackDownload(slug: string) {
  try {
    await fetch(`/api/outfits/${slug}`, { method: "POST" });
  } catch {}
}

export default function OutfitDetailExperience({ outfit }: { outfit: Outfit }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isPortrait = outfit.aspect_ratio === "portrait";
  const isSquare = outfit.aspect_ratio === "square";

  async function handleDownload() {
    setDownloading(true);
    await trackDownload(outfit.slug);
    try {
      const res = await fetch(outfit.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${outfit.slug}.${outfit.image_url.split(".").pop()?.split("?")[0] ?? "jpg"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(outfit.image_url, "_blank");
    }
    setDownloading(false);
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "OUTFITS", href: "/outfits" },
            { label: outfit.title.toUpperCase(), current: true },
          ]}
        />
      </IndustryTopBar>

      <div className={`${INDUSTRY_PAGE} py-10`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div
            className={`w-full shrink-0 lg:sticky lg:top-28 ${isPortrait ? "lg:max-w-sm" : isSquare ? "lg:max-w-md" : "lg:max-w-2xl"}`}
          >
            <div
              className={`relative overflow-hidden border border-white/12 bg-black ${isPortrait ? "aspect-[3/4]" : isSquare ? "aspect-square" : "aspect-[16/9]"}`}
            >
              <Image
                src={outfit.image_url}
                alt={outfit.title}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>
            <div className="mt-4 flex gap-3">
              <button type="button" onClick={handleDownload} disabled={downloading} className={btnPrimary}>
                {downloading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                )}
                {downloading ? "Preparing…" : "Download Sheet"}
              </button>
              <button type="button" onClick={handleShare} className={btnGhost}>
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
              <span>{outfit.download_count} downloads</span>
              <span>{outfit.view_count} views</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={pill}>{OUTFIT_CATEGORY_LABELS[outfit.category]}</span>
              <span className={pill}>{OUTFIT_CHARACTER_LABELS[outfit.character_type]}</span>
              {outfit.featured && (
                <span className="border border-blue-400/50 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                  Featured
                </span>
              )}
            </div>
            <h1 className="mt-4 font-body text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {outfit.title}
            </h1>
            {outfit.description && (
              <p className="mt-4 text-base font-light leading-relaxed text-white/55">{outfit.description}</p>
            )}
            {outfit.color_palette.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                  Color palette
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {outfit.color_palette.map((hex) => (
                    <div key={hex} className="flex items-center gap-2">
                      <span className="h-8 w-8 border border-white/12" style={{ backgroundColor: hex }} />
                      <span className="font-mono text-xs text-white/45">{hex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {outfit.style_tags.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                  Style tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {outfit.style_tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/outfits?q=${encodeURIComponent(tag)}`}
                      className="border border-white/12 bg-white/[0.02] px-3 py-1 text-xs font-semibold text-white/55 transition hover:border-blue-400/40 hover:text-blue-300"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </IndustryShell>
  );
}
