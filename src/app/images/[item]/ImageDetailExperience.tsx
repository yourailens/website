"use client";

import { useState } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import type { GalleryImage } from "@/data/gallery";
import {
  INDUSTRY_PAGE,
  IndustryBreadcrumb,
  IndustryEyebrow,
  IndustryShell,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";

function remoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

function AttrPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] tracking-[0.28em] text-white/40">{label}</span>
      <span className="inline-flex w-fit items-center border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/75">
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
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "STILLS", href: "/images" },
            { label: image.title.toUpperCase(), current: true },
          ]}
        />
      </IndustryTopBar>

      <div className={`${INDUSTRY_PAGE} py-10`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div
            className={`w-full shrink-0 lg:sticky lg:top-28 ${
              isPortrait ? "lg:max-w-sm" : isLandscape ? "lg:max-w-2xl" : "lg:max-w-md"
            }`}
          >
            <div
              className={`relative overflow-hidden border border-white/12 bg-black ${
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
                className="flex flex-1 items-center justify-center gap-2 border border-blue-400/55 bg-transparent px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200 disabled:opacity-60"
              >
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
                onClick={handleShare}
                className="flex items-center justify-center gap-2 border border-white/15 bg-white/[0.03] px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition hover:border-white/30 hover:text-white"
              >
                {copied ? "Copied!" : "Share"}
              </button>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <IndustryEyebrow>{categoryLabelText.toUpperCase()}</IndustryEyebrow>
            <h1 className="mt-4 font-body text-[clamp(1.75rem,4vw,2.75rem)] font-semibold tracking-tight text-white">
              {image.title}
            </h1>

            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <AttrPill label="CATEGORY" value={categoryLabelText} />
              {image.aspect ? <AttrPill label="FORMAT" value={image.aspect} /> : null}
            </div>

            {image.peopleTags?.length ? (
              <div className="mt-8">
                <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">TALENT</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {image.peopleTags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-white/12 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-white/65"
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
                  className="flex w-full items-center justify-between border border-white/12 bg-white/[0.03] px-4 py-3 text-left text-sm font-semibold text-white transition hover:border-white/25"
                >
                  Generation prompt
                  <span className="text-white/40">{promptOpen ? "−" : "+"}</span>
                </button>
                {promptOpen ? (
                  <pre className="mt-3 max-h-64 overflow-auto border border-white/10 bg-black/60 p-4 text-xs leading-relaxed whitespace-pre-wrap text-white/60">
                    {promptText}
                  </pre>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </IndustryShell>
  );
}
