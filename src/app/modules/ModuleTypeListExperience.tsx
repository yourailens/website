"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ModuleListCard from "@/components/modules/ModuleListCard";
import type { StudioModule, StudioModuleType } from "@/data/studio-modules";
import {
  STUDIO_MODULE_TYPE_DESCRIPTIONS,
  STUDIO_MODULE_TYPE_LABELS,
  studioModuleUsesSeriesLayout,
} from "@/data/studio-modules";
import {
  IndustryBreadcrumb,
  IndustryEyebrow,
  IndustryHeroBand,
  IndustryShell,
  IndustryTintSection,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";

function listMeta(type: StudioModuleType, count: number): string | null {
  if (count === 0) return null;
  if (type === "prompt_playbooks") {
    return `${count} playbook${count === 1 ? "" : "s"} · copy prompts inside each gallery`;
  }
  if (type === "client_showcases") {
    return `${count} showcase${count === 1 ? "" : "s"} · campaign work and deliverables`;
  }
  if (type === "subjects_visuals") {
    return `${count} volume${count === 1 ? "" : "s"} · subject-led hero shots and styling`;
  }
  return null;
}

export default function ModuleTypeListExperience({ moduleType }: { moduleType: StudioModuleType }) {
  const [modules, setModules] = useState<StudioModule[]>([]);
  const [loading, setLoading] = useState(true);
  const label = STUDIO_MODULE_TYPE_LABELS[moduleType];
  const description = STUDIO_MODULE_TYPE_DESCRIPTIONS[moduleType];
  const isSeries = studioModuleUsesSeriesLayout(moduleType);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/studio-modules?type=${moduleType}`);
        const json = (await res.json()) as { modules?: StudioModule[] };
        if (!cancelled) setModules(json.modules ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleType]);

  const sorted = useMemo(() => {
    return [...modules].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
  }, [modules]);

  const meta = listMeta(moduleType, sorted.length);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "MODULES", href: "/modules" },
            { label: label.toUpperCase(), current: true },
          ]}
        />
      </IndustryTopBar>

      <IndustryHeroBand>
        <IndustryEyebrow>MODULES</IndustryEyebrow>
        <h1 className="mt-4 max-w-3xl font-body text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-tight text-white">
          {label}
        </h1>
        <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-white/60 md:text-lg">
          {description}
        </p>
        {meta ? (
          <p className="mt-4 font-mono text-[10px] tracking-[0.28em] text-white/40">{meta}</p>
        ) : null}
      </IndustryHeroBand>

      <IndustryTintSection borderTop={false}>
        {loading ? (
          <div className="flex justify-center py-20">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="border border-dashed border-white/15 px-6 py-20 text-center">
            <p className="text-sm font-light text-white/45">New {label.toLowerCase()} are on the way.</p>
          </div>
        ) : isSeries ? (
          <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {sorted.map((mod) => (
              <div key={mod.id} className="mb-5">
                <ModuleListCard mod={mod} variant="series" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {sorted.map((mod) => (
              <ModuleListCard key={mod.id} mod={mod} />
            ))}
          </div>
        )}
      </IndustryTintSection>
    </IndustryShell>
  );
}
