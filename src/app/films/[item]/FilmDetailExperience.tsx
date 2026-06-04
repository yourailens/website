"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { GalleryFilm } from "@/data/gallery";
import { GALLERY_CATEGORY_ACCENTS } from "@/lib/gallery/category-accents";

function videoMime(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDownloadVideoProps = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

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

export default function FilmDetailExperience({
  film,
  categoryLabelText,
}: {
  film: GalleryFilm;
  categoryLabelText: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const accent = GALLERY_CATEGORY_ACCENTS[film.category];
  const portrait = film.orientation === "portrait";
  const promptText = (film.prompt ?? "").trim();

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const play = () => void v.play().catch(() => {});
    play();
    v.addEventListener("loadeddata", play);
    return () => v.removeEventListener("loadeddata", play);
  }, [film.src]);

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
                href="/films"
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Films
              </Link>
              <nav className="flex min-w-0 items-center gap-2 text-xs text-slate-400">
                <span>/</span>
                <span className="min-w-0 truncate font-semibold text-slate-700">{film.title}</span>
              </nav>
            </div>
          </div>
        </div>

        <div className="mx-auto w-[95%] py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
            <div
              className={`w-full shrink-0 lg:sticky lg:top-28 ${
                portrait ? "lg:max-w-sm" : "lg:max-w-2xl"
              }`}
            >
              <div
                className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-900 shadow-xl shadow-slate-200/80 ${
                  portrait ? "aspect-[9/16]" : "aspect-video"
                }`}
              >
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  controls
                  playsInline
                  preload="auto"
                  poster={film.posterUrl}
                  {...noDownloadVideoProps}
                >
                  <source src={film.src} type={videoMime(film.src)} />
                </video>
              </div>

              <div className="mt-4 flex gap-3">
                <a
                  href={film.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 active:scale-95"
                >
                  Open video
                </a>
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
                {portrait ? (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    Vertical
                  </span>
                ) : (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                    Landscape
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-heading text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {film.title}
              </h1>

              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
                <AttrPill label="Category" value={categoryLabelText} accent={accent} />
                <AttrPill label="Orientation" value={portrait ? "Portrait" : "Landscape"} />
              </div>

              {film.peopleTags?.length ? (
                <div className="mt-8">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Talent</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {film.peopleTags.map((tag) => (
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
