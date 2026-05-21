"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { CharacterSheet } from "@/data/character_sheets";
import {
  ETHNICITY_LABELS,
  ETHNICITY_ACCENTS,
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  SKIN_TONE_LABELS,
  ARCHETYPE_LABELS,
  ARCHETYPE_ACCENTS,
} from "@/data/character_sheets";

async function trackDownload(slug: string) {
  try { await fetch(`/api/character-sheets/${slug}`, { method: "POST" }); } catch {}
}

// ── Attribute pill ────────────────────────────────────────────

function AttrPill({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">{label}</span>
      <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${accent ?? "border border-slate-200 bg-white text-slate-700"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Skin tone swatch ──────────────────────────────────────────

const SKIN_TONE_COLORS: Record<string, string> = {
  fair:   "#f9e4cc",
  light:  "#f1c27d",
  medium: "#d9956c",
  olive:  "#c68642",
  tan:    "#b07050",
  brown:  "#8d5524",
  dark:   "#4a2912",
  deep:   "#2d1a0e",
};

function SkinSwatch({ tone, label }: { tone: string; label: string }) {
  const color = SKIN_TONE_COLORS[tone] ?? "#ccc";
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="h-9 w-9 rounded-xl border border-slate-200 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">Skin Tone</p>
        <p className="text-xs font-semibold text-slate-700">{label}</p>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────

export default function CharacterSheetDetailExperience({ sheet }: { sheet: CharacterSheet }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const ethnicityAccent = ETHNICITY_ACCENTS[sheet.ethnicity];
  const archetypeAccent = ARCHETYPE_ACCENTS[sheet.archetype];
  const isPortrait = sheet.aspect_ratio === "portrait";
  const isSquare   = sheet.aspect_ratio === "square";

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
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">

        {/* ── Breadcrumb ── */}
        <div className="border-b border-slate-200 bg-white">
          <div className="w-[95%] mx-auto py-3">
            <div className="flex items-center gap-4">
              <Link
                href="/character-sheets"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Character Sheets
              </Link>
              <nav className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                <span>/</span>
                <span className="min-w-0 truncate font-semibold text-slate-700">{sheet.title}</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="w-[95%] mx-auto py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">

            {/* ── Image panel ── */}
            <div className={`w-full shrink-0 lg:sticky lg:top-28 ${
              isPortrait ? "lg:max-w-sm" : isSquare ? "lg:max-w-md" : "lg:max-w-2xl"
            }`}>
              <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl shadow-slate-200/80 ${
                isPortrait ? "aspect-[3/4]" : isSquare ? "aspect-square" : "aspect-[16/9]"
              }`}>
                <Image
                  src={sheet.image_url}
                  alt={sheet.title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95 disabled:opacity-60"
                >
                  {downloading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  )}
                  {downloading ? "Preparing…" : "Download Sheet"}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                >
                  {copied ? (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                      Share
                    </>
                  )}
                </button>
              </div>

              {/* Stats */}
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" fill="none"/><line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2"/></svg>
                  {sheet.download_count} downloads
                </span>
                <span className="flex items-center gap-1">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  {sheet.view_count} views
                </span>
              </div>
            </div>

            {/* ── Info panel ── */}
            <div className="min-w-0 flex-1">

              {/* Top badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${ethnicityAccent}`}>
                  {ETHNICITY_LABELS[sheet.ethnicity]}
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${archetypeAccent}`}>
                  {ARCHETYPE_LABELS[sheet.archetype]}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                  {GENDER_LABELS[sheet.gender]}
                </span>
                {sheet.featured && (
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">✦ Featured</span>
                )}
              </div>

              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {sheet.title}
              </h1>

              {sheet.description && (
                <p className="mt-4 text-base leading-relaxed text-slate-600">{sheet.description}</p>
              )}

              {/* ── Character attributes grid ── */}
              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
                <AttrPill label="Age Group" value={AGE_GROUP_LABELS[sheet.age_group]} />
                <AttrPill label="Gender" value={GENDER_LABELS[sheet.gender]} />
                <AttrPill label="Ethnicity" value={ETHNICITY_LABELS[sheet.ethnicity]} accent={ethnicityAccent} />
                <AttrPill label="Archetype" value={ARCHETYPE_LABELS[sheet.archetype]} accent={archetypeAccent} />
                {sheet.nationality && (
                  <AttrPill label="Nationality" value={sheet.nationality} />
                )}
                {sheet.hair_color && (
                  <AttrPill label="Hair Color" value={sheet.hair_color} />
                )}
                {sheet.eye_color && (
                  <AttrPill label="Eye Color" value={sheet.eye_color} />
                )}
              </div>

              {/* Skin tone swatch */}
              <div className="mt-8">
                <SkinSwatch tone={sheet.skin_tone} label={SKIN_TONE_LABELS[sheet.skin_tone]} />
              </div>

              {/* Style tags */}
              {sheet.style_tags.length > 0 && (
                <div className="mt-8">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Style Tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sheet.style_tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/character-sheets?q=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
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
      </div>
    </>
  );
}
