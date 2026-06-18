"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import type { StudioModule } from "@/data/studio-modules";
import {
  ALL_STUDIO_MODULE_TYPES,
  STUDIO_MODULE_TYPE_DESCRIPTIONS,
  STUDIO_MODULE_TYPE_LABELS,
  studioModuleListPath,
} from "@/data/studio-modules";

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
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7fc]">
        <section className="border-b border-blue-100/80 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4ff]">
          <div className="mx-auto w-[92%] max-w-6xl py-14 md:py-20">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">Studio</p>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Modules
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              Prompt playbooks, client showcases, and product visuals — each a shareable gallery with
              images, videos, and copy-ready prompts.
            </p>
          </div>
        </section>

        <div className="mx-auto w-[92%] max-w-6xl py-12">
          <div className="grid gap-6 md:grid-cols-3">
            {ALL_STUDIO_MODULE_TYPES.map((type) => (
              <Link
                key={type}
                href={studioModuleListPath(type)}
                className="group rounded-2xl border border-slate-200/90 bg-white p-8 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
              >
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">
                  {counts[type] != null ? `${counts[type]} galleries` : "Browse"}
                </p>
                <h2 className="mt-3 font-heading text-2xl font-bold text-slate-900 group-hover:text-blue-800">
                  {STUDIO_MODULE_TYPE_LABELS[type]}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {STUDIO_MODULE_TYPE_DESCRIPTIONS[type]}
                </p>
                <p className="mt-6 font-mono text-[10px] font-semibold uppercase tracking-widest text-blue-600">
                  Explore →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
