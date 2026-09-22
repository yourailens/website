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
import type { Scenario } from "@/data/scenarios";
import {
  SCENARIO_TYPE_LABELS,
  SCENARIO_SETTING_LABELS,
  SCENARIO_MOOD_LABELS,
} from "@/data/scenarios";

const btnPrimary =
  "flex flex-1 items-center justify-center gap-2 border border-blue-400/55 bg-transparent px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200 disabled:opacity-60";
const btnGhost =
  "flex items-center justify-center gap-2 border border-white/12 bg-white/[0.02] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/25 hover:text-white";
const pill =
  "border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60";

export default function ScenarioDetailExperience({ scenario: s }: { scenario: Scenario }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await fetch(`/api/scenarios/${s.slug}`, { method: "POST" });
    } catch {}
    try {
      const res = await fetch(s.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${s.slug}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(s.image_url, "_blank");
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
            { label: "SCENARIOS", href: "/scenarios" },
            { label: s.title.toUpperCase(), current: true },
          ]}
        />
      </IndustryTopBar>

      <div className={`${INDUSTRY_PAGE} py-10`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div
            className={`w-full shrink-0 lg:sticky lg:top-28 ${s.aspect_ratio === "portrait" ? "lg:max-w-sm" : s.aspect_ratio === "square" ? "lg:max-w-md" : "lg:max-w-2xl"}`}
          >
            <div
              className={`relative overflow-hidden border border-white/12 bg-black ${s.aspect_ratio === "portrait" ? "aspect-[3/4]" : s.aspect_ratio === "square" ? "aspect-square" : "aspect-[16/9]"}`}
            >
              <Image src={s.image_url} alt={s.title} fill className="object-cover" unoptimized priority />
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
              <button type="button" onClick={handleShare} className={btnGhost}>
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
              <span>{s.download_count} downloads</span>
              <span>{s.view_count} views</span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={pill}>{SCENARIO_TYPE_LABELS[s.scenario_type]}</span>
              <span className={pill}>{SCENARIO_SETTING_LABELS[s.setting]}</span>
              <span className={pill}>{SCENARIO_MOOD_LABELS[s.mood]}</span>
              <span className={`${pill} capitalize`}>{s.character_count}</span>
            </div>
            <h1 className="mt-4 font-body text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {s.title}
            </h1>
            {s.description && (
              <p className="mt-4 text-base font-light leading-relaxed text-white/55">{s.description}</p>
            )}
            {s.style_tags.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                  Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {s.style_tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/scenarios?q=${encodeURIComponent(tag)}`}
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
