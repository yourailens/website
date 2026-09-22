"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import type { GalleryFilm } from "@/data/gallery";
import {
  INDUSTRY_PAGE,
  IndustryBreadcrumb,
  IndustryEyebrow,
  IndustryShell,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";

function videoMime(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDownloadVideoProps = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
  onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
};

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
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "FILMS", href: "/films" },
            { label: film.title.toUpperCase(), current: true },
          ]}
        />
      </IndustryTopBar>

      <div className={`${INDUSTRY_PAGE} py-10`}>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-14">
          <div
            className={`w-full shrink-0 lg:sticky lg:top-28 ${
              portrait ? "lg:max-w-sm" : "lg:max-w-2xl"
            }`}
          >
            <div
              className={`relative overflow-hidden border border-white/12 bg-black ${
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
                className="flex flex-1 items-center justify-center gap-2 border border-blue-400/55 bg-transparent px-5 py-3.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200"
              >
                Open video
              </a>
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
              {film.title}
            </h1>

            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
              <AttrPill label="CATEGORY" value={categoryLabelText} />
              <AttrPill label="ORIENTATION" value={portrait ? "Portrait" : "Landscape"} />
            </div>

            {film.peopleTags?.length ? (
              <div className="mt-8">
                <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">TALENT</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {film.peopleTags.map((tag) => (
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
