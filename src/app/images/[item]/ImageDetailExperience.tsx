"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import CopyUrlButton from "@/components/CopyUrlButton";
import type { GalleryImage } from "@/data/gallery";

function remoteImage(src: string) {
  return /^https?:\/\//i.test(src);
}

export default function ImageDetailExperience({
  images,
  openIndex,
  prevHref,
  nextHref,
  backHref,
  categoryLabel,
}: {
  images: GalleryImage[];
  openIndex: number;
  prevHref: string;
  nextHref: string;
  backHref: string;
  categoryLabel: string;
}) {
  const [promptOpen, setPromptOpen] = useState(false);

  const current = images[openIndex]!;
  const promptText = useMemo(() => (current.prompt ?? "").trim(), [current.prompt]);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white/95 backdrop-blur-md text-slate-900">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-4 sm:px-8 lg:px-10">
        <div className="min-w-0 pl-0.5">
          <p className="truncate font-heading text-lg font-bold text-slate-900 sm:text-xl">{current.title}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
            {categoryLabel} · {String(openIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </p>
          {current.peopleTags?.length ? <p className="mt-1 text-xs text-slate-600">{current.peopleTags.join(" · ")}</p> : null}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={prevHref}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
            aria-label="Previous image"
          >
            ←
          </Link>
          <Link
            href={nextHref}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
            aria-label="Next image"
          >
            →
          </Link>
          {promptText ? (
            <button
              type="button"
              onClick={() => setPromptOpen(true)}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50"
            >
              Prompt
            </button>
          ) : null}
          <CopyUrlButton className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50/50" />
          <Link href={backHref} className="rounded-md bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
            Back
          </Link>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col bg-[#f8fafc] px-4 pb-8 pt-8 sm:px-8 lg:px-12">
        <div className="relative mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center justify-center rounded-lg bg-white p-4 shadow-inner shadow-slate-200/80 ring-1 ring-slate-100 sm:p-8">
          <div className="relative h-full max-h-[min(78dvh,calc(100dvh-10rem))] w-full">
            <Image
              src={current.src}
              alt={current.title}
              fill
              className="object-contain"
              sizes="100vw"
              priority
              unoptimized={remoteImage(current.src)}
            />
          </div>
        </div>
        <p className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Share this URL to open this image directly
        </p>
      </div>

      {promptOpen ? (
        <div
          className="fixed inset-0 z-[260] flex items-stretch justify-center bg-slate-950/55 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Prompt"
          onClick={() => setPromptOpen(false)}
        >
          <div
            className="h-[100dvh] w-full overflow-hidden border border-slate-200 bg-white shadow-2xl shadow-slate-900/20 sm:h-auto sm:max-h-[min(80dvh,56rem)] sm:max-w-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <p className="font-heading text-lg font-black text-slate-900">Prompt</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(promptText);
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-800 transition hover:bg-slate-50"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={() => setPromptOpen(false)}
                  className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 px-5 py-4">
              <pre className="h-full max-h-[calc(100dvh-5.25rem)] overflow-y-auto whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-slate-800 sm:max-h-[55dvh]">
                {promptText}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

