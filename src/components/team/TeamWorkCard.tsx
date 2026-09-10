"use client";

import { coverAspectClass } from "@/data/module-covers";
import { teamWorkMediaUrl, type StudioTeamWorkItem } from "@/data/studio-team";

export default function TeamWorkCard({ item }: { item: StudioTeamWorkItem }) {
  const url = teamWorkMediaUrl(item);
  if (!url) return null;
  const caption = item.caption?.trim() || item.title?.trim();

  return (
    <figure className="mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-1 ring-slate-100/80 sm:mb-4">
      {item.media_type === "video" ? (
        item.aspect_ratio === "natural" ? (
          <video src={url} poster={item.poster_url ?? undefined} controls playsInline className="block h-auto w-full bg-slate-100" />
        ) : (
          <div className={`relative w-full overflow-hidden bg-slate-100 ${coverAspectClass(item.aspect_ratio)}`}>
            <video src={url} poster={item.poster_url ?? undefined} controls playsInline className="h-full w-full object-cover" />
          </div>
        )
      ) : item.aspect_ratio === "natural" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={caption || "Work"} className="block h-auto w-full bg-slate-50" loading="lazy" decoding="async" />
      ) : (
        <div className={`relative w-full overflow-hidden bg-slate-50 ${coverAspectClass(item.aspect_ratio)}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={caption || "Work"} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        </div>
      )}
      {caption ? (
        <figcaption className="border-t border-blue-50 px-4 py-3 text-sm font-light leading-relaxed text-slate-600">
          {item.title?.trim() ? <p className="font-semibold text-slate-800">{item.title.trim()}</p> : null}
          {item.caption?.trim() ? <p className={item.title?.trim() ? "mt-1" : ""}>{item.caption.trim()}</p> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
