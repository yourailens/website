"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { Location } from "@/data/locations";
import { LOCATION_CATEGORY_ACCENTS, LOCATION_CATEGORY_LABELS, LOCATION_TIME_LABELS, LOCATION_WEATHER_LABELS } from "@/data/locations";

export default function LocationDetailExperience({ location: loc }: { location: Location }) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const accent = LOCATION_CATEGORY_ACCENTS[loc.category];

  async function handleDownload() {
    setDownloading(true);
    try { await fetch(`/api/locations/${loc.slug}`, { method: "POST" }); } catch {}
    try {
      const res = await fetch(loc.image_url);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${loc.slug}.jpg`; a.click(); URL.revokeObjectURL(url);
    } catch { window.open(loc.image_url, "_blank"); }
    setDownloading(false);
  }
  function handleShare() { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-10">
            <div className="flex items-center gap-4">
              <Link href="/locations" className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                Locations
              </Link>
              <nav className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                <span>/</span>
                <span className="min-w-0 truncate font-semibold text-slate-700">{loc.title}</span>
              </nav>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
            <div className={`w-full shrink-0 lg:sticky lg:top-28 ${loc.aspect_ratio === "portrait" ? "lg:max-w-sm" : loc.aspect_ratio === "square" ? "lg:max-w-md" : "lg:max-w-2xl"}`}>
              <div className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl ${loc.aspect_ratio === "portrait" ? "aspect-[3/4]" : loc.aspect_ratio === "square" ? "aspect-square" : "aspect-[16/9]"}`}>
                <Image src={loc.image_url} alt={loc.title} fill className="object-cover" unoptimized priority />
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={handleDownload} disabled={downloading} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95 disabled:opacity-60">
                  {downloading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>}
                  {downloading ? "Preparing…" : "Download"}
                </button>
                <button type="button" onClick={handleShare} className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95">
                  {copied ? <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>Copied!</> : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16,6 12,2 8,6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>Share</>}
                </button>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span>{loc.download_count} downloads</span><span>{loc.view_count} views</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${accent}`}>{LOCATION_CATEGORY_LABELS[loc.category]}</span>
                {loc.time_of_day !== "any" && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{LOCATION_TIME_LABELS[loc.time_of_day]}</span>}
                {loc.weather !== "any" && <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">{LOCATION_WEATHER_LABELS[loc.weather]}</span>}
                {loc.featured && <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white">✦ Featured</span>}
              </div>
              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{loc.title}</h1>
              {loc.description && <p className="mt-4 text-base leading-relaxed text-slate-600">{loc.description}</p>}
              {loc.style_tags.length > 0 && (
                <div className="mt-8">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Tags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {loc.style_tags.map((tag) => <Link key={tag} href={`/locations?q=${encodeURIComponent(tag)}`} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">#{tag}</Link>)}
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
