"use client";

import Link from "next/link";
import type { StudioModule } from "@/data/studio-modules";
import {
  STUDIO_MODULE_SERIES_LABEL,
  STUDIO_MODULE_TYPE_LABELS,
  studioModuleCoverUrl,
  studioModuleDetailPath,
  studioModuleDisplayTitle,
  studioModuleEpisodeLabel,
  studioModuleUsesSeriesLayout,
} from "@/data/studio-modules";

export default function ModuleListCard({
  mod,
  variant = "grid",
}: {
  mod: StudioModule;
  variant?: "grid" | "series";
}) {
  const cover = studioModuleCoverUrl(mod);
  const episode = studioModuleEpisodeLabel(mod.title);
  const displayTitle = studioModuleDisplayTitle(mod.title);
  const href = studioModuleDetailPath(mod.module_type, mod.slug);
  const isSeries =
    variant === "series" ||
    (variant === "grid" && studioModuleUsesSeriesLayout(mod.module_type));

  if (isSeries) {
    const seriesLabel = STUDIO_MODULE_SERIES_LABEL[mod.module_type];
    return (
      <Link
        href={href}
        className="group relative flex break-inside-avoid flex-col overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-black">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt=""
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-body text-6xl font-semibold text-blue-500/35">
                {episode ?? "·"}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          {episode ? (
            <span
              className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.28em] text-blue-300"
              aria-hidden
            >
              {seriesLabel} {episode}
            </span>
          ) : null}
        </div>

        <div className="relative flex flex-1 flex-col px-5 pb-5 pt-4">
          <h2 className="font-body text-xl font-semibold leading-snug tracking-tight text-white transition group-hover:text-blue-100">
            {displayTitle}
          </h2>
          {mod.description ? (
            <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-white/50">
              {mod.description}
            </p>
          ) : null}
          <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
            Open gallery
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-body text-4xl font-semibold text-blue-500/35">
              {(mod.title.trim().charAt(0) || "M").toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 font-mono text-[10px] tracking-[0.22em] text-blue-300">
          {STUDIO_MODULE_TYPE_LABELS[mod.module_type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <h2 className="font-body text-lg font-semibold leading-snug tracking-tight text-white group-hover:text-blue-100">
          {mod.title}
        </h2>
        {mod.description ? (
          <p className="mt-2 line-clamp-2 text-sm font-light leading-relaxed text-white/50">
            {mod.description}
          </p>
        ) : null}
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
          View gallery
        </p>
      </div>
    </Link>
  );
}
