"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import type { Module, ModuleDiscipline } from "@/data/modules";
import { coverAspectClass, getCoverForAspect } from "@/data/module-covers";
import {
  ALL_MODULE_DISCIPLINES,
  MODULE_DISCIPLINE_ACCENTS,
  MODULE_DISCIPLINE_LABELS,
} from "@/data/modules";

function ModuleCard({ mod }: { mod: Module }) {
  const accent = MODULE_DISCIPLINE_ACCENTS[mod.discipline];
  const cover = getCoverForAspect(mod);
  const aspect = coverAspectClass(mod.cover_aspect);

  return (
    <Link
      href={`/modules/${mod.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
    >
      <div className={`relative ${aspect} overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200`}>
        {cover?.media_type === "video" ? (
          <video src={cover.url} muted playsInline loop className="h-full w-full object-cover" />
        ) : cover?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
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
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-transparent to-transparent" />
        <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${accent}`}>
          {MODULE_DISCIPLINE_LABELS[mod.discipline]}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-heading text-lg font-bold leading-snug text-slate-900 group-hover:text-blue-800">
          {mod.title}
        </h2>
        {mod.tagline && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{mod.tagline}</p>
        )}
        <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-blue-600">
          Director playbook →
        </p>
      </div>
    </Link>
  );
}

export default function ModulesHubExperience() {
  const searchParams = useSearchParams();
  const disciplineParam = searchParams.get("discipline") as ModuleDiscipline | null;
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ModuleDiscipline | "all">(
    disciplineParam && ALL_MODULE_DISCIPLINES.includes(disciplineParam) ? disciplineParam : "all"
  );

  useEffect(() => {
    if (disciplineParam && ALL_MODULE_DISCIPLINES.includes(disciplineParam)) {
      setFilter(disciplineParam);
    }
  }, [disciplineParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const q = filter !== "all" ? `?discipline=${filter}` : "";
        const res = await fetch(`/api/modules${q}`);
        const json = (await res.json()) as { modules?: Module[] };
        if (!cancelled) setModules(json.modules ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const sorted = useMemo(() => {
    const copy = [...modules];
    copy.sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return a.sort_order - b.sort_order;
    });
    return copy;
  }, [modules]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7fc]">
        <section className="border-b border-blue-100/80 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4ff]">
          <div className="mx-auto w-[92%] max-w-6xl py-14 md:py-20">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
              Modules
            </p>
            <h1 className="mt-3 max-w-3xl font-heading text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              AI that doesn&apos;t look like AI — shot by shot.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              Each module is a director&apos;s playbook: camera, lighting, lens, workflow, models, and prompt
              structure — with images and videos on each workflow step. Pick a job and follow inputs → prompt → output.
              the room.
            </p>
          </div>
        </section>

        <div className="mx-auto w-[92%] max-w-6xl py-10">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                filter === "all" ? "bg-blue-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200"
              }`}
            >
              All
            </button>
            {ALL_MODULE_DISCIPLINES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setFilter(d)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                  filter === d ? "bg-blue-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                }`}
              >
                {MODULE_DISCIPLINE_LABELS[d]}
              </button>
            ))}
          </div>

          <div className="mt-12">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
              {filter === "all" ? "All modules" : MODULE_DISCIPLINE_LABELS[filter]}
            </p>
            {loading ? (
              <div className="flex justify-center py-24">
                <span className="h-9 w-9 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : sorted.length === 0 ? (
              <p className="mt-8 text-center text-slate-500">No modules published yet. Check back soon.</p>
            ) : (
              <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sorted.map((m) => (
                  <ModuleCard key={m.id} mod={m} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
