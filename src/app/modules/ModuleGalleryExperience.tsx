"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ModuleGalleryCard from "@/components/modules/ModuleGalleryCard";
import type { StudioModuleWithItems } from "@/data/studio-modules";
import {
  STUDIO_MODULE_LIST_BACK_LABEL,
  STUDIO_MODULE_SERIES_THEME,
  studioModuleCoverUrl,
  studioModuleDisplayTitle,
  studioModuleEpisodeLabel,
  studioModuleListPath,
  studioModuleShowsPrompts,
  studioModuleUsesSeriesLayout,
} from "@/data/studio-modules";

export default function ModuleGalleryExperience({ mod }: { mod: StudioModuleWithItems }) {
  const items = mod.items.filter((i) => i.image_url || i.video_url);
  const cover = studioModuleCoverUrl(mod, mod.items);
  const episode = studioModuleEpisodeLabel(mod.title);
  const displayTitle = studioModuleDisplayTitle(mod.title);
  const isSeries = studioModuleUsesSeriesLayout(mod.module_type);
  const theme = STUDIO_MODULE_SERIES_THEME[mod.module_type];
  const backLabel = STUDIO_MODULE_LIST_BACK_LABEL[mod.module_type];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7fc]">
        {isSeries ? (
          <section className={`w-full border-b ${theme.heroBorder} ${theme.heroBg}`}>
            <div className="flex min-h-[3.25rem] w-full items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-6 lg:px-10">
              <Link
                href={studioModuleListPath(mod.module_type)}
                className={`shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.28em] ${theme.link} ${theme.linkHover} sm:text-[10px]`}
              >
                ← {backLabel}
              </Link>

              <span className={`hidden h-4 w-px shrink-0 sm:block ${theme.heroDivider}`} aria-hidden />

              {episode ? (
                <span className={`shrink-0 font-mono text-[10px] font-bold tabular-nums tracking-widest ${theme.link}`}>
                  {episode}
                </span>
              ) : null}

              <h1 className="min-w-0 flex-1 truncate font-heading text-sm font-bold text-slate-900 sm:text-base">
                {displayTitle}
              </h1>

              <div className="flex shrink-0 items-center gap-3">
                {items.length > 0 ? (
                  <span className="hidden font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400 sm:inline">
                    {items.length} shot{items.length === 1 ? "" : "s"}
                  </span>
                ) : null}
                {cover ? (
                  <div className={`h-9 w-7 overflow-hidden rounded-md border bg-slate-100 shadow-sm sm:h-10 sm:w-8 ${theme.coverBorder}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cover} alt="" className="h-full w-full object-cover" />
                  </div>
                ) : null}
              </div>
            </div>

            {mod.description ? (
              <div className={`w-full border-t px-4 py-2.5 sm:px-6 lg:px-10 ${theme.heroDescBorder}`}>
                <p className="max-w-4xl text-xs leading-relaxed text-slate-600 sm:text-sm">
                  {mod.description}
                </p>
              </div>
            ) : null}
          </section>
        ) : (
          <section className={`w-full border-b ${theme.heroBorder} ${theme.heroBg}`}>
            <div className="flex min-h-[3.25rem] w-full flex-wrap items-center gap-3 px-4 py-2.5 sm:px-6 lg:px-10">
              <Link
                href="/modules"
                className={`font-mono text-[9px] font-bold uppercase tracking-[0.28em] ${theme.link} ${theme.linkHover} sm:text-[10px]`}
              >
                Modules
              </Link>
              <span className="text-slate-300">/</span>
              <Link
                href={studioModuleListPath(mod.module_type)}
                className={`font-mono text-[9px] font-bold uppercase tracking-[0.28em] ${theme.link} ${theme.linkHover} sm:text-[10px]`}
              >
                {backLabel}
              </Link>
              <span className={`hidden h-4 w-px sm:block ${theme.heroDivider}`} aria-hidden />
              <h1 className="min-w-0 flex-1 truncate font-heading text-sm font-bold text-slate-900 sm:text-base">
                {mod.title}
              </h1>
              {cover ? (
                <div className={`h-9 w-7 shrink-0 overflow-hidden rounded-md border bg-slate-100 sm:h-10 sm:w-8 ${theme.coverBorder}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                </div>
              ) : null}
            </div>
            {mod.description ? (
              <div className={`w-full border-t px-4 py-2.5 sm:px-6 lg:px-10 ${theme.heroDescBorder}`}>
                <p className="max-w-4xl text-xs leading-relaxed text-slate-600 sm:text-sm">{mod.description}</p>
              </div>
            ) : null}
          </section>
        )}

        <div className="w-full px-3 py-8 sm:px-4 md:py-10">
          {items.length === 0 ? (
            <div className="mx-auto max-w-lg px-6 py-20 text-center">
              <p className="text-sm font-light text-slate-500">Gallery items coming soon.</p>
            </div>
          ) : (
            <div className="columns-1 gap-3 sm:columns-2 sm:gap-4 lg:columns-3">
              {items.map((item) => (
                <ModuleGalleryCard
                  key={item.id}
                  item={item}
                  showPrompt={studioModuleShowsPrompts(mod.module_type)}
                  promptAccent={mod.module_type}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
