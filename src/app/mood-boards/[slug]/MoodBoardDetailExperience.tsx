"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { MoodBoard } from "@/data/mood_boards";
import { AESTHETIC_STYLE_ACCENTS, AESTHETIC_STYLE_LABELS, AESTHETIC_ERA_LABELS } from "@/data/mood_boards";

export default function MoodBoardDetailExperience({ item }: { item: MoodBoard }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const accent = AESTHETIC_STYLE_ACCENTS[item.aesthetic];
  const isPortrait = item.aspect_ratio === "portrait"; const isSquare = item.aspect_ratio === "square";
  async function handleDownload() {
    setDownloading(true);
    try { await fetch(`/api/mood-boards/${item.slug}`, { method: "POST" }); } catch {}
    try { const res = await fetch(item.image_url); const blob = await res.blob(); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${item.slug}.${item.image_url.split(".").pop()?.split("?")[0] ?? "jpg"}`; a.click(); URL.revokeObjectURL(url); } catch { window.open(item.image_url, "_blank"); }
    setDownloading(false);
  }
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white"><div className="w-[95%] mx-auto py-3 flex items-center gap-4">
          <Link href="/mood-boards" className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Mood Boards</Link>
          <span className="text-xs text-slate-400">/ <span className="font-semibold text-slate-700">{item.title}</span></span>
        </div></div>
        <div className="w-[95%] mx-auto py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
            <div className={`w-full shrink-0 lg:sticky lg:top-28 ${isPortrait ? "lg:max-w-sm" : isSquare ? "lg:max-w-md" : "lg:max-w-2xl"}`}>
              <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl ${isPortrait ? "aspect-[3/4]" : isSquare ? "aspect-square" : "aspect-[16/9]"}`}>
                <Image src={item.image_url} alt={item.title} fill className="object-cover" unoptimized priority />
              </div>
              {item.color_palette.length > 0 && (
                <div className="mt-3 flex overflow-hidden rounded-2xl border border-slate-200">
                  {item.color_palette.map((c, i) => <div key={i} className="flex-1 h-8" style={{ backgroundColor: c }} title={c} />)}
                </div>
              )}
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={handleDownload} disabled={downloading} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                  {downloading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}{downloading ? "Preparing…" : "Download"}
                </button>
                <button type="button" onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 active:scale-95">{copied ? "Copied!" : "Share"}</button>
              </div>
              <div className="mt-3 flex gap-4 text-xs text-slate-400"><span>{item.download_count} downloads</span><span>{item.view_count} views</span></div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${accent}`}>{AESTHETIC_STYLE_LABELS[item.aesthetic]}</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{AESTHETIC_ERA_LABELS[item.era]}</span>
                {item.featured && <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">✦ Featured</span>}
              </div>
              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{item.title}</h1>
              {item.description && <p className="mt-4 text-base leading-relaxed text-slate-600">{item.description}</p>}
              {item.style_tags.length > 0 && <div className="mt-8"><p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Style Tags</p><div className="mt-3 flex flex-wrap gap-2">{item.style_tags.map((t) => <Link key={t} href={`/mood-boards?q=${encodeURIComponent(t)}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700">#{t}</Link>)}</div></div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
