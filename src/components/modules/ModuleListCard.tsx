"use client";

import Link from "next/link";
import type { StudioModule } from "@/data/studio-modules";
import {
  STUDIO_MODULE_SERIES_LABEL,
  STUDIO_MODULE_SERIES_THEME,
  STUDIO_MODULE_TYPE_ACCENTS,
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
  const theme = STUDIO_MODULE_SERIES_THEME[mod.module_type];
  const href = studioModuleDetailPath(mod.module_type, mod.slug);
  const isSeries =
    variant === "series" ||
    (variant === "grid" && studioModuleUsesSeriesLayout(mod.module_type));

  if (isSeries) {
    const seriesLabel = STUDIO_MODULE_SERIES_LABEL[mod.module_type];
    return (
      <Link
        href={href}
        className={`group relative flex break-inside-avoid flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-100/80 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${theme.ring} ${theme.glow}`}
      >
        <div
          className={`relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${theme.cardGradient}`}
        >
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
              <span className="font-heading text-6xl font-black text-slate-300/80">
                {episode ?? "·"}
              </span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
          {episode ? (
            <span
              className={`absolute bottom-3 left-3 font-heading text-5xl font-black leading-none tracking-tight ${theme.num} mix-blend-soft-light`}
              aria-hidden
            >
              {episode}
            </span>
          ) : null}
        </div>

        <div className="relative flex flex-1 flex-col p-5">
          {episode ? (
            <p className={`font-mono text-[10px] font-bold uppercase tracking-[0.35em] ${theme.episode}`}>
              {seriesLabel} {episode}
            </p>
          ) : null}
          <h2
            className={`mt-2 font-heading text-xl font-bold leading-snug text-slate-900 transition ${theme.hoverTitle}`}
          >
            {displayTitle}
          </h2>
          {mod.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-500">{mod.description}</p>
          ) : null}
          <p className={`mt-4 font-mono text-[10px] font-bold uppercase tracking-widest ${theme.cta}`}>
            Open gallery →
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${theme.glow}`}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
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
            <span className="font-heading text-4xl font-black text-slate-300">
              {(mod.title.trim().charAt(0) || "M").toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent" />
        <span
          className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STUDIO_MODULE_TYPE_ACCENTS[mod.module_type]}`}
        >
          {STUDIO_MODULE_TYPE_LABELS[mod.module_type]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-heading text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-800">
          {mod.title}
        </h2>
        {mod.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{mod.description}</p>
        ) : null}
        <p className={`mt-3 font-mono text-[10px] font-semibold uppercase tracking-widest ${theme.cta}`}>
          View gallery →
        </p>
      </div>
    </Link>
  );
}
