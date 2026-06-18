"use client";

import { useState } from "react";
import type { StudioModuleItem } from "@/data/studio-modules";
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
      className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-[11px] font-bold text-violet-700 transition hover:bg-violet-100"
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
}) {
  const url = studioModuleItemMediaUrl(item);
  if (!url) return null;

  const hasCaption = Boolean(item.caption?.trim());
  const hasPrompt = Boolean(item.prompt?.trim());
  const hasFooter = hasCaption || (showPrompt && hasPrompt);

  return (
    <figure className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 sm:mb-4">
      {item.media_type === "video" ? (
        item.aspect_ratio === "natural" ? (
          <DeferredVideo src={url} poster={item.poster_url} className="block h-auto w-full bg-slate-100" />
        ) : (
          <div
            className={`relative w-full overflow-hidden bg-slate-100 ${coverAspectClass(item.aspect_ratio)}`}
          >
            <DeferredVideo src={url} poster={item.poster_url} className="h-full w-full object-cover" />
          </div>
        )
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={item.caption?.trim() || "Gallery item"}
          className="block h-auto w-full bg-slate-50"
          loading="lazy"
          decoding="async"
        />
      )}

      {hasFooter ? (
        <figcaption className="space-y-2 border-t border-blue-50 px-4 py-3 sm:px-5 sm:py-4">
          {hasCaption ? (
            <p className="text-sm font-light leading-relaxed text-slate-600">{item.caption!.trim()}</p>
          ) : null}
          {showPrompt && hasPrompt ? (
            <div>
              <pre className="max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-700 whitespace-pre-wrap">
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
