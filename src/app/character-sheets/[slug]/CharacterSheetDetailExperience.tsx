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
import type { CharacterSheet } from "@/data/character_sheets";
import {
  ETHNICITY_LABELS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  SKIN_TONE_LABELS,
  ARCHETYPE_LABELS,
} from "@/data/character_sheets";

const btnPrimary =
  "flex flex-1 items-center justify-center gap-2 border border-blue-400/55 bg-transparent px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200 disabled:opacity-60";
const btnGhost =
  "flex items-center justify-center gap-2 border border-white/12 bg-white/[0.02] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/25 hover:text-white";
const pill =
  "border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/60";

async function trackDownload(slug: string) {
  try {
    await fetch(`/api/character-sheets/${slug}`, { method: "POST" });
  } catch {}
}

function AttrPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-white/35">
        {label}
      </span>
      <span className={`inline-flex w-fit items-center ${pill}`}>{value}</span>
    </div>
  );
}

const SKIN_TONE_COLORS: Record<string, string> = {
  fair: "#f9e4cc",
  light: "#f1c27d",
  medium: "#d9956c",
  olive: "#c68642",
  tan: "#b07050",
  brown: "#8d5524",
  dark: "#4a2912",
  deep: "#2d1a0e",
};

function SkinSwatch({ tone, label }: { tone: string; label: string }) {
  const color = SKIN_TONE_COLORS[tone] ?? "#ccc";
  return (
    <div className="flex items-center gap-2.5">
      <span className="h-9 w-9 border border-white/12" style={{ backgroundColor: color }} />
      <div>
        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-white/35">
          Skin Tone
        </p>
        <p className="text-xs font-semibold text-white/70">{label}</p>
      </div>
    </div>
  );
}

export default function CharacterSheetDetailExperience({ sheet }: { sheet: CharacterSheet }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const isPortrait = sheet.aspect_ratio === "portrait";
  const isSquare = sheet.aspect_ratio === "square";

  async function handleDownload() {
    setDownloading(true);
    await trackDownload(sheet.slug);
    try {
      const res = await fetch(sheet.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${sheet.slug}.${sheet.image_url.split(".").pop()?.split("?")[0] ?? "jpg"}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(sheet.image_url, "_blank");
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
            { label: "MODELS", href: "/character-sheets" },
            { label: sheet.title.toUpperCase(), current: true },
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
                src={sheet.image_url}
                alt={sheet.title}
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
              <span>{sheet.download_count} downloads</span>
              <span>{sheet.view_count} views</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={pill}>{ETHNICITY_LABELS[sheet.ethnicity]}</span>
              <span className={pill}>{ARCHETYPE_LABELS[sheet.archetype]}</span>
              <span className={pill}>{GENDER_LABELS[sheet.gender]}</span>
              {sheet.featured && (
                <span className="border border-blue-400/50 bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-4 font-body text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {sheet.title}
            </h1>

            {sheet.description && (
              <p className="mt-4 text-base font-light leading-relaxed text-white/55">{sheet.description}</p>
            )}

            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <AttrPill label="Age Group" value={AGE_GROUP_LABELS[sheet.age_group]} />
              <AttrPill label="Gender" value={GENDER_LABELS[sheet.gender]} />
              <AttrPill label="Ethnicity" value={ETHNICITY_LABELS[sheet.ethnicity]} />
              <AttrPill label="Archetype" value={ARCHETYPE_LABELS[sheet.archetype]} />
              {sheet.nationality && <AttrPill label="Nationality" value={sheet.nationality} />}
              {sheet.hair_color && <AttrPill label="Hair Color" value={sheet.hair_color} />}
              {sheet.eye_color && <AttrPill label="Eye Color" value={sheet.eye_color} />}
            </div>

            <div className="mt-8">
              <SkinSwatch tone={sheet.skin_tone} label={SKIN_TONE_LABELS[sheet.skin_tone]} />
            </div>

            {sheet.style_tags.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-white/35">
                  Style Tags
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {sheet.style_tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/character-sheets?q=${encodeURIComponent(tag)}`}
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
