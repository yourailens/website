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
import type { Prop } from "@/data/props";
import { PROP_CATEGORY_LABELS, PROP_STYLE_LABELS } from "@/data/props";

const btnPrimary =
  "flex flex-1 items-center justify-center gap-2 border border-blue-400/55 bg-transparent px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200 disabled:opacity-60";
const btnGhost =
  "flex items-center justify-center gap-2 border border-white/12 bg-white/[0.02] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/25 hover:text-white";
const pill =
  "border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60";

export default function PropDetailExperience({ item }: { item: Prop }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isPortrait = item.aspect_ratio === "portrait";
  const isSquare = item.aspect_ratio === "square";

  async function handleDownload() {
    setDownloading(true);
    try {
      await fetch(`/api/props/${item.slug}`, { method: "POST" });
    } catch {}
    try {
      const res = await fetch(item.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.slug}.${item.image_url.split(".").pop()?.split("?")[0] ?? "jpg"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(item.image_url, "_blank");
    }
    setDownloading(false);
  }

  return (
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "PROPS", href: "/props" },
            { label: item.title.toUpperCase(), current: true },
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
                src={item.image_url}
                alt={item.title}
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
                {downloading ? "Preparing…" : "Download"}
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href).then(() => {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  });
                }}
                className={btnGhost}
              >
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
            <div className="mt-3 flex gap-4 text-xs text-white/40">
              <span>{item.download_count} downloads</span>
              <span>{item.view_count} views</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className={pill}>{PROP_CATEGORY_LABELS[item.category]}</span>
              <span className={pill}>{PROP_STYLE_LABELS[item.style]}</span>
              {item.featured && (
                <span className="border border-blue-400/50 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                  Featured
                </span>
              )}
            </div>
            <h1 className="mt-4 font-body text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {item.title}
            </h1>
            {item.description && (
              <p className="mt-4 text-base font-light leading-relaxed text-white/55">{item.description}</p>
            )}
            {item.color_tags.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                  Colors
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.color_tags.map((c) => (
                    <span key={c} className={pill}>
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {item.style_tags.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                  Style Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.style_tags.map((t) => (
                    <Link
                      key={t}
                      href={`/props?q=${encodeURIComponent(t)}`}
                      className="border border-white/12 bg-white/[0.02] px-3 py-1 text-xs font-semibold text-white/55 transition hover:border-blue-400/40 hover:text-blue-300"
                    >
                      #{t}
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
