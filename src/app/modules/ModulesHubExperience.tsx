"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { StudioModule } from "@/data/studio-modules";
import {
  ALL_STUDIO_MODULE_TYPES,
  STUDIO_MODULE_TYPE_DESCRIPTIONS,
  STUDIO_MODULE_TYPE_LABELS,
  studioModuleListPath,
} from "@/data/studio-modules";
import {
  INDUSTRY_PAGE,
  IndustryChannelTitle,
  IndustryEyebrow,
  IndustryGlow,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTintSection,
} from "@/app/industries/IndustryUI";

export default function ModulesHubExperience() {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        ALL_STUDIO_MODULE_TYPES.map(async (type) => {
          const res = await fetch(`/api/studio-modules?type=${type}`);
          const json = (await res.json()) as { modules?: StudioModule[] };
          return [type, json.modules?.length ?? 0] as const;
        })
      );
      if (!cancelled) setCounts(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-10 pt-12 sm:pt-16`}>
        <IndustryChannelTitle channel="CHANNEL · STUDIO" title="Modules" />
        <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
          Prompt playbooks, client showcases, and subjects & visuals — each a shareable gallery with
          images, videos, and copy-ready prompts.
        </p>
      </section>

      <IndustryTintSection>
        <IndustryEyebrow>DESKS</IndustryEyebrow>
        <IndustrySectionTitle>
          Three module channels.{" "}
          <span className="font-light text-white/55">Open a gallery.</span>
        </IndustrySectionTitle>

        <div className="mt-10 grid gap-4 md:grid-cols-3 lg:gap-5">
          {ALL_STUDIO_MODULE_TYPES.map((type, index) => {
            const ep = String(index + 1).padStart(2, "0");
            return (
              <Link
                key={type}
                href={studioModuleListPath(type)}
                className="group flex h-full flex-col border border-white/12 bg-white/[0.02] px-6 py-8 transition hover:border-white/25 hover:bg-white/[0.04]"
              >
                <p className="font-mono text-[10px] tracking-[0.28em] text-blue-300">CH. {ep}</p>
                <p className="mt-4 font-mono text-[10px] tracking-[0.22em] text-white/40">
                  {counts[type] != null
                    ? `${counts[type]} ${counts[type] === 1 ? "gallery" : "galleries"}`
                    : "Browse"}
                </p>
                <h2 className="mt-2 font-body text-[clamp(1.25rem,2.2vw,1.6rem)] font-semibold tracking-tight text-white transition group-hover:text-blue-100">
                  {STUDIO_MODULE_TYPE_LABELS[type]}
                </h2>
                <p className="mt-3 flex-1 text-sm font-light leading-relaxed text-white/50">
                  {STUDIO_MODULE_TYPE_DESCRIPTIONS[type]}
                </p>
                <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                  Open channel
                </p>
              </Link>
            );
          })}
        </div>
      </IndustryTintSection>
    </IndustryShell>
  );
}
