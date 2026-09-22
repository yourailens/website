"use client";

import { useState } from "react";
import type { StudioModuleItem, StudioModuleType } from "@/data/studio-modules";
import { studioModuleItemMediaUrl } from "@/data/studio-modules";
import { coverAspectClass } from "@/data/module-covers";

function DeferredVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string | null;
  className?: string;
}) {
  return (
    <video
      src={src}
      poster={poster ?? undefined}
      muted
      playsInline
      loop
      autoPlay
      className={className}
    />
  );
}

function CopyPromptButton({ prompt }: { prompt: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-2 inline-flex items-center gap-1.5 border border-blue-400/45 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300 transition hover:border-blue-300 hover:text-blue-200"
    >
      {copied ? "Copied!" : "Copy prompt"}
    </button>
  );
}

export default function ModuleGalleryCard({
  item,
  showPrompt,
}: {
  item: StudioModuleItem;
  showPrompt?: boolean;
  promptAccent?: StudioModuleType;
}) {
  const url = studioModuleItemMediaUrl(item);
  if (!url) return null;

  const hasCaption = Boolean(item.caption?.trim());
  const hasPrompt = Boolean(item.prompt?.trim());
  const hasFooter = hasCaption || (showPrompt && hasPrompt);

  return (
    <figure className="mb-3 break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.03] sm:mb-4">
      {item.media_type === "video" ? (
        item.aspect_ratio === "natural" ? (
          <DeferredVideo src={url} poster={item.poster_url} className="block h-auto w-full bg-black" />
        ) : (
          <div
            className={`relative w-full overflow-hidden bg-black ${coverAspectClass(item.aspect_ratio)}`}
          >
            <DeferredVideo src={url} poster={item.poster_url} className="h-full w-full object-cover" />
          </div>
        )
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={item.caption?.trim() || "Gallery item"}
          className="block h-auto w-full bg-black"
          loading="lazy"
          decoding="async"
        />
      )}

      {hasFooter ? (
        <figcaption className="space-y-2 border-t border-white/10 px-4 py-3 sm:px-5 sm:py-4">
          {hasCaption ? (
            <p className="text-sm font-light leading-relaxed text-white/55">{item.caption!.trim()}</p>
          ) : null}
          {showPrompt && hasPrompt ? (
            <div>
              <pre className="max-h-40 overflow-auto border border-white/10 bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap">
                {item.prompt!.trim()}
              </pre>
              <CopyPromptButton prompt={item.prompt!.trim()} />
            </div>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
