"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ModuleMarkdown from "@/components/ModuleMarkdown";
import ModulePresetSection from "@/components/ModulePresetSection";
import ModuleWorkflowStep from "@/components/ModuleWorkflowStep";
import type { ModuleWithAssets } from "@/data/modules";
import { coverAspectClass, getCoverForAspect } from "@/data/module-covers";
import {
  MODULE_ASSET_KIND_LABELS,
  MODULE_DISCIPLINE_ACCENTS,
  MODULE_DISCIPLINE_LABELS,
  stripComposedPresetLines,
} from "@/data/modules";

function TextBlock({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">{label}</p>
      <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{body}</div>
    </div>
  );
}

export default function ModuleDetailExperience({ mod }: { mod: ModuleWithAssets }) {
  const [copied, setCopied] = useState(false);
  const accent = MODULE_DISCIPLINE_ACCENTS[mod.discipline];
  const coverEntry = getCoverForAspect(mod);
  const heroAspect = coverAspectClass(mod.cover_aspect);

  const hasGear = Boolean(mod.camera_body || mod.lens_model || mod.focal_length || mod.aperture);
  const lightingNotes = stripComposedPresetLines(mod.lighting_setup, ["Setups"]);
  const colorNotes = stripComposedPresetLines(mod.color_and_mood, ["Grades", "Mood"]);
  const compositionNotes = stripComposedPresetLines(mod.composition_notes, ["Framing", "Shots", "Aspect"]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f4f7fc]">
        <div className="border-b border-slate-200/80 bg-white">
          <div className="mx-auto flex w-[92%] max-w-6xl items-center gap-4 py-3">
            <Link
              href="/modules"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
              Modules
            </Link>
            <span className="text-xs text-slate-400">
              / <span className="font-semibold text-slate-700">{mod.title}</span>
            </span>
          </div>
        </div>

        <header className="border-b border-blue-100/60 bg-gradient-to-b from-white to-[#f0f6ff]">
          <div className="mx-auto grid w-[92%] max-w-6xl gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
            <div>
              <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${accent}`}>
                {MODULE_DISCIPLINE_LABELS[mod.discipline]}
              </span>
              <h1 className="mt-4 font-heading text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
                {mod.title}
              </h1>
              {mod.tagline && (
                <p className="mt-4 text-lg leading-relaxed text-slate-600">{mod.tagline}</p>
              )}
              {mod.description && (
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{mod.description}</p>
              )}
              <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-slate-400">
                {mod.view_count} views
              </p>
            </div>
            <div
              className={`relative mx-auto w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-xl ${heroAspect} max-h-[min(70vh,520px)]`}
            >
              {coverEntry?.media_type === "video" ? (
                <video src={coverEntry.url} controls className="h-full w-full object-cover" />
              ) : coverEntry?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverEntry.url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300">
                  <span className="font-heading text-5xl font-black text-slate-400/80">
                    {(mod.title.charAt(0) || "M").toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto w-[92%] max-w-6xl py-12 space-y-14">
          {mod.director_brief && (
            <section>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">
                Director&apos;s brief
              </p>
              <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-800">{mod.director_brief}</p>
            </section>
          )}

          {(hasGear || mod.camera_notes) && (
            <section>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                On set — gear
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {mod.camera_body && (
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-blue-600">Camera</p>
                    <p className="mt-2 font-heading text-sm font-bold text-slate-900">{mod.camera_body}</p>
                  </div>
                )}
                {mod.lens_model && (
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-blue-600">Lens</p>
                    <p className="mt-2 font-heading text-sm font-bold text-slate-900">{mod.lens_model}</p>
                  </div>
                )}
                {mod.focal_length && (
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-blue-600">Focal</p>
                    <p className="mt-2 font-heading text-sm font-bold text-slate-900">{mod.focal_length}</p>
                  </div>
                )}
                {mod.aperture && (
                  <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                    <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-blue-600">Aperture</p>
                    <p className="mt-2 font-heading text-sm font-bold text-slate-900">{mod.aperture}</p>
                  </div>
                )}
              </div>
              {mod.camera_notes && (
                <div className="mt-4">
                  <TextBlock label="Camera notes" body={mod.camera_notes} />
                </div>
              )}
            </section>
          )}

          <ModulePresetSection title="Lighting setups" presets={mod.lighting_presets} note={lightingNotes} />

          <ModulePresetSection title="Color grading" presets={mod.color_grade_presets} />
          <ModulePresetSection title="Mood & aesthetic" presets={mod.mood_presets} note={colorNotes} />

          <ModulePresetSection title="Composition & framing" presets={mod.composition_presets} />
          <ModulePresetSection title="Shot types & coverage" presets={mod.shot_type_presets} />
          {mod.aspect_ratio ? (
            <section>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">Delivery aspect</p>
              <p className="mt-3 inline-block rounded-full border border-blue-100 bg-blue-50 px-4 py-2 font-heading text-sm font-bold text-blue-900">
                {mod.aspect_ratio}
              </p>
            </section>
          ) : null}
          {compositionNotes ? (
            <div className="max-w-3xl">
              <TextBlock label="Composition notes" body={compositionNotes} />
            </div>
          ) : null}

          {mod.workflow_steps.length > 0 && (
            <section>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Workflow
              </p>
              <ol className="mt-6 space-y-4">
                {mod.workflow_steps.map((step, i) => (
                  <ModuleWorkflowStep key={`${step.title}-${i}`} step={step} index={i} />
                ))}
              </ol>
            </section>
          )}

          {(mod.recommended_models.length > 0 || mod.prompt_structure) && (
            <section className="grid gap-8 lg:grid-cols-2">
              {mod.recommended_models.length > 0 && (
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                    Models & tools
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {mod.recommended_models.map((m) => (
                      <span
                        key={m}
                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-900"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {mod.prompt_structure && (
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                      Prompt guide
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(mod.prompt_structure ?? "").then(() => {
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        });
                      }}
                      className="rounded-lg border border-slate-200 px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-white"
                    >
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="mt-4 max-h-[32rem] overflow-auto rounded-2xl border border-blue-100 bg-white p-5 shadow-inner">
                    <ModuleMarkdown body={mod.prompt_structure} />
                  </div>
                </div>
              )}
            </section>
          )}

          {(mod.prompt_tips || mod.common_mistakes) && (
            <section className="grid gap-4 md:grid-cols-2">
              {mod.prompt_tips && <TextBlock label="Prompt tips" body={mod.prompt_tips} />}
              {mod.common_mistakes && <TextBlock label="Common mistakes" body={mod.common_mistakes} />}
            </section>
          )}

          {mod.assets.length > 0 && (
            <section>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-slate-400">
                Assets & references
              </p>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {mod.assets.map((a) => {
                  const ar =
                    a.aspect_ratio === "portrait"
                      ? "aspect-[3/4]"
                      : a.aspect_ratio === "square"
                        ? "aspect-square"
                        : "aspect-[16/10]";
                  return (
                    <div
                      key={a.id}
                      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                      {a.video_url ? (
                        <video src={a.video_url} controls className={`w-full ${ar} object-cover bg-black`} />
                      ) : a.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.image_url} alt={a.title} className={`w-full ${ar} object-cover`} loading="lazy" />
                      ) : (
                        <div className={`flex ${ar} items-center justify-center bg-slate-100 text-slate-400 text-xs`}>
                          No media
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-bold text-slate-800">{a.title}</p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                          {MODULE_ASSET_KIND_LABELS[a.kind]}
                        </p>
                        {a.caption && <p className="mt-1 text-[11px] text-slate-500">{a.caption}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
