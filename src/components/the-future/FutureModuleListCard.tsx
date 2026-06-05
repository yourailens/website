"use client";

import Image from "next/image";
import Link from "next/link";
import { coverAspectClass } from "@/data/module-covers";
import { FUTURE_COPY } from "@/data/the-future-copy";
import type { FutureModuleListItem } from "@/data/the-future";

type Props = {
  mod: FutureModuleListItem;
  href: string;
  index?: number;
  showDraft?: boolean;
};

export default function FutureModuleListCard({ mod, href, index, showDraft = false }: Props) {
  const hasPreview = Boolean(mod.preview_url?.trim());
  const aspect = coverAspectClass(mod.preview_aspect);

  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-2xl border border-transparent p-3 transition hover:border-blue-100 hover:bg-white sm:gap-5 sm:p-4"
    >
      <div className="relative w-[7.5rem] shrink-0 sm:w-36">
        <div
          className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-sm ring-1 ring-slate-200/80 ${aspect}`}
        >
          {hasPreview && mod.preview_media_type === "video" ? (
            <video
              src={mod.preview_url!}
              poster={mod.preview_poster_url ?? undefined}
              muted
              playsInline
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : hasPreview ? (
            <Image
              src={mod.preview_url!}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 144px, 160px"
              unoptimized
            />
          ) : (
            <div className="flex h-full min-h-[100px] items-center justify-center">
              <span className="font-heading text-2xl font-black text-slate-300">
                {(mod.title.trim().charAt(0) || "?").toUpperCase()}
              </span>
            </div>
          )}
          {index != null ? (
            <span className="absolute left-2 top-2 rounded-md bg-white/95 px-1.5 py-0.5 font-mono text-[10px] font-black text-blue-700 shadow-sm">
              {String(index + 1).padStart(2, "0")}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center py-0.5">
        <h2 className="font-heading text-xl font-black leading-snug text-slate-900 group-hover:text-blue-800 sm:text-2xl">
          {mod.title}
        </h2>
        {mod.tagline ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{mod.tagline}</p>
        ) : null}
        <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400 transition group-hover:text-blue-600">
          {FUTURE_COPY.exploreCta}
          <span aria-hidden className="transition group-hover:translate-x-0.5">
            →
          </span>
        </span>
        {showDraft && !mod.published ? (
          <span className="mt-2 inline-block text-[10px] font-bold text-amber-600">Draft</span>
        ) : null}
      </div>
    </Link>
  );
}
