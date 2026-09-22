"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import ModuleGalleryCard from "@/components/modules/ModuleGalleryCard";
import type { StudioModuleWithItems } from "@/data/studio-modules";
import {
  STUDIO_MODULE_LIST_BACK_LABEL,
  studioModuleCoverUrl,
  studioModuleDisplayTitle,
  studioModuleEpisodeLabel,
  studioModuleListPath,
  studioModuleShowsPrompts,
  studioModuleUsesSeriesLayout,
} from "@/data/studio-modules";
import {
  INDUSTRY_PAGE,
  IndustryBreadcrumb,
  IndustryEyebrow,
  IndustryShell,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";

export default function ModuleGalleryExperience({ mod }: { mod: StudioModuleWithItems }) {
  const items = mod.items.filter((i) => i.image_url || i.video_url);
  const cover = studioModuleCoverUrl(mod, mod.items);
  const episode = studioModuleEpisodeLabel(mod.title);
  const displayTitle = studioModuleDisplayTitle(mod.title);
  const isSeries = studioModuleUsesSeriesLayout(mod.module_type);
  const backLabel = STUDIO_MODULE_LIST_BACK_LABEL[mod.module_type];
  const listHref = studioModuleListPath(mod.module_type);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <IndustryBreadcrumb
            items={[
              { label: "MODULES", href: "/modules" },
              { label: backLabel.toUpperCase(), href: listHref },
              {
                label: (isSeries ? displayTitle : mod.title).toUpperCase(),
                current: true,
              },
            ]}
          />
          <div className="flex items-center gap-3">
            {items.length > 0 ? (
              <span className="font-mono text-[10px] tracking-[0.22em] text-white/40">
                {items.length} shot{items.length === 1 ? "" : "s"}
              </span>
            ) : null}
            {cover ? (
              <div className="h-10 w-8 overflow-hidden border border-white/15 bg-zinc-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cover} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
          </div>
        </div>
      </IndustryTopBar>

      <section className={`relative border-b border-white/10 ${INDUSTRY_PAGE} py-8 lg:py-10`}>
        {episode ? (
          <IndustryEyebrow>
            {backLabel.toUpperCase()} · {episode}
          </IndustryEyebrow>
        ) : (
          <IndustryEyebrow>{backLabel.toUpperCase()}</IndustryEyebrow>
        )}
        <h1 className="mt-3 max-w-4xl font-body text-[clamp(1.5rem,3.5vw,2.4rem)] font-semibold tracking-tight text-white">
          {isSeries ? displayTitle : mod.title}
        </h1>
        {mod.description ? (
          <p className="mt-4 max-w-3xl text-sm font-light leading-relaxed text-white/55 sm:text-base">
            {mod.description}
          </p>
        ) : null}
      </section>

      <div className={`${INDUSTRY_PAGE} py-8 md:py-10`}>
        {items.length === 0 ? (
          <div className="mx-auto max-w-lg px-6 py-20 text-center">
            <p className="text-sm font-light text-white/45">Gallery items coming soon.</p>
            <Link
              href={listHref}
              className="mt-6 inline-flex text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300"
            >
              ← Back to {backLabel}
            </Link>
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
    </IndustryShell>
  );
}
