"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { GalleryImage } from "@/data/gallery";
import { GALLERY_CATEGORY_ACCENTS } from "@/lib/gallery/category-accents";

function remoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function AttrPill({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400">{label}</span>
      <span
        className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-bold ${
          accent ?? "border border-slate-200 bg-white text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default function ImageDetailExperience({
  image,
  categoryLabelText,
}: {
  image: GalleryImage;
  categoryLabelText: string;
}) {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const accent = GALLERY_CATEGORY_ACCENTS[image.category];
  const isPortrait = image.aspect === "portrait";
  const isLandscape = image.aspect === "landscape";
  const promptText = (image.prompt ?? "").trim();

  async function handleDownload() {
    setDownloading(true);
    try {
      const res = await fetch(image.src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = image.src.split(".").pop()?.split("?")[0] ?? "jpg";
      a.download = `${image.title.replace(/\s+/g, "-").toLowerCase()}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(image.src, "_blank");
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
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto w-[95%] py-3">
            <div className="flex items-center gap-4">
              <Link
                href="/images"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Images
              </Link>
              <nav className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                <span>/</span>
                <span className="min-w-0 truncate font-semibold text-slate-700">{image.title}</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="mx-auto w-[95%] py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
            <div
              className={`w-full shrink-0 lg:sticky lg:top-28 ${
                isPortrait ? "lg:max-w-sm" : isLandscape ? "lg:max-w-2xl" : "lg:max-w-md"
              }`}
            >
              <div
                className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl shadow-slate-200/80 ${
                  isPortrait ? "aspect-[3/4]" : isLandscape ? "aspect-[16/9]" : "aspect-square"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.title}
                  fill
                  className="object-cover"
                  unoptimized={remoteImage(image.src)}
                  priority
                />
              </div>

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
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7,10 12,15 17,10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  )}
                  {downloading ? "Preparing…" : "Download"}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 active:scale-95"
                >
                  {copied ? "Copied!" : "Share"}
                </button>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${accent}`}>{categoryLabelText}</span>
                {image.aspect ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-600">
                    {image.aspect}
                  </span>
                ) : null}
              </div>

              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {image.title}
              </h1>

              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
                <AttrPill label="Category" value={categoryLabelText} accent={accent} />
                {image.aspect ? <AttrPill label="Format" value={image.aspect} /> : null}
              </div>

              {image.peopleTags?.length ? (
                <div className="mt-8">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Talent</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {image.peopleTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {promptText ? (
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={() => setPromptOpen((v) => !v)}
                    className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-bold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
                  >
                    Generation prompt
                    <span className="text-slate-400">{promptOpen ? "−" : "+"}</span>
                  </button>
                  {promptOpen ? (
                    <pre className="mt-3 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-600">
                      {promptText}
                    </pre>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
