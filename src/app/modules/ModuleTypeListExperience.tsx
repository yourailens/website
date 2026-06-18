"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ModuleListCard from "@/components/modules/ModuleListCard";
import type { StudioModule, StudioModuleType } from "@/data/studio-modules";
import {
  STUDIO_MODULE_TYPE_DESCRIPTIONS,
  STUDIO_MODULE_TYPE_LABELS,
} from "@/data/studio-modules";

export default function ModuleTypeListExperience({ moduleType }: { moduleType: StudioModuleType }) {
  const [modules, setModules] = useState<StudioModule[]>([]);
  const [loading, setLoading] = useState(true);
  const label = STUDIO_MODULE_TYPE_LABELS[moduleType];
  const description = STUDIO_MODULE_TYPE_DESCRIPTIONS[moduleType];
  const isPlaybooks = moduleType === "prompt_playbooks";

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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7fc]">
        <section
          className={
            isPlaybooks
              ? "border-b border-violet-100/80 bg-gradient-to-b from-[#faf8ff] via-white to-[#f4f0ff]"
              : "border-b border-blue-100/80 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4ff]"
          }
        >
          <div className="mx-auto w-[92%] max-w-6xl py-14 md:py-20">
            <Link
              href="/modules"
              className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-600 hover:text-blue-800"
            >
              ← All modules
            </Link>
            <p
              className={`mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.4em] ${isPlaybooks ? "text-violet-600" : "text-blue-600"}`}
            >
              Modules
            </p>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              {label}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{description}</p>
            {isPlaybooks && sorted.length > 0 ? (
              <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                {sorted.length} playbook{sorted.length === 1 ? "" : "s"} · copy prompts inside each gallery
              </p>
            ) : null}
          </div>
        </section>

        <div className="mx-auto w-[92%] max-w-6xl py-12">
          {loading ? (
            <div className="flex justify-center py-20">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          ) : sorted.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-blue-200/80 bg-white/70 px-6 py-20 text-center">
              <p className="text-sm font-light text-slate-500">New {label.toLowerCase()} are on the way.</p>
            </div>
          ) : isPlaybooks ? (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {sorted.map((mod) => (
                <div key={mod.id} className="mb-5">
                  <ModuleListCard mod={mod} variant="playbook" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((mod) => (
                <ModuleListCard key={mod.id} mod={mod} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
