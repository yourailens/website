"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SpotPlayer from "@/components/ads/SpotPlayer";
import {
  ottCutAspectLabel,
  ottCutCategoryLabel,
  ottCutChannelPath,
  ottCutFrameClass,
  ottCutYoutubeId,
  type OttCut,
} from "@/data/ott-cuts";

type Props = { cut: OttCut };

export default function CutShareExperience({ cut }: Props) {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<"preview" | "playing" | "paused">("preview");
  const yt = ottCutYoutubeId(cut.media_url);
  const channel = ottCutChannelPath(cut.category);
  const poster =
    cut.poster_url ||
    (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null) ||
    (cut.media_type === "image" ? cut.media_url : null);

  const share = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
    try {
      if (navigator.share) {
        await navigator.share({ title: cut.caption, url });
      }
    } catch {
      /* cancelled */
    }
  }, [cut.caption]);

  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      <Navbar />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 8% 0%, rgba(37,99,235,0.28), transparent 55%), radial-gradient(ellipse 40% 30% at 92% 8%, rgba(29,78,216,0.16), transparent 50%)",
        }}
        aria-hidden
      />

      <main className="relative mx-auto w-[min(960px,92%)] pb-16 pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`${channel}#${cut.slug}`}
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
          >
            ← {ottCutCategoryLabel(cut.category)}
          </Link>
          <button
            type="button"
            onClick={() => void share()}
            className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold tracking-wide text-white/90 transition hover:border-white/35 hover:bg-white/[0.1]"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <div
          className={`relative mt-5 mx-auto overflow-hidden rounded-xl border border-white/10 bg-black shadow-[0_40px_100px_-40px_rgba(0,0,0,0.95)] ${
            cut.aspect_ratio === "story" || cut.aspect_ratio === "portrait"
              ? `w-full max-w-sm ${ottCutFrameClass(cut.aspect_ratio)}`
              : `w-full ${ottCutFrameClass(cut.aspect_ratio)}`
          }`}
        >
          {cut.media_type === "video" ? (
            yt ? (
              mode === "playing" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1&autoplay=1`}
                  title={cut.caption}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`}
                    alt={cut.caption}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setMode("playing")}
                    className="absolute inset-0 z-20 flex items-center justify-center"
                    aria-label={`Play ${cut.caption}`}
                  >
                    <span className="flex h-16 w-16 items-center justify-center border border-blue-300/50 bg-blue-600/80">
                      <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
                    </span>
                  </button>
                </>
              )
            ) : (
              <SpotPlayer
                src={cut.media_url}
                poster={cut.poster_url}
                caption={cut.caption}
                mode={mode}
                onMode={setMode}
              />
            )
          ) : poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={poster} alt={cut.caption} className="absolute inset-0 h-full w-full object-contain" />
          ) : (
            <div className="absolute inset-0 bg-zinc-950" />
          )}
        </div>

        <div className="mt-8 max-w-2xl">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-300/80">
            {ottCutCategoryLabel(cut.category)} · {ottCutAspectLabel(cut.aspect_ratio)}
          </p>
          <h1 className="mt-2 font-body text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold tracking-tight">
            {cut.caption}
          </h1>
          {cut.description ? (
            <p className="mt-3 text-sm font-light leading-relaxed text-white/55">{cut.description}</p>
          ) : null}
        </div>
      </main>
    </div>
  );
}
