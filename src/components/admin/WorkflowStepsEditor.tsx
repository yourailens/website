"use client";

import Image from "next/image";
import type { WorkflowStep, WorkflowStepMedia, WorkflowStepMediaRole } from "@/data/modules";
import { WORKFLOW_MEDIA_ROLE_LABELS } from "@/data/modules";

function newId() {
  return `ws${Date.now()}${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY_STEP = (): WorkflowStep => ({
  title: "",
  body: "",
  inputs: "",
  prompt: "",
  output: "",
  assets: [],
});

type UploadMedia = (file: File, slug: string, label: string) => Promise<{ url: string; media_type: "image" | "video" }>;

type Props = {
  steps: WorkflowStep[];
  onChange: (steps: WorkflowStep[]) => void;
  moduleSlug: string;
  uploadMedia: UploadMedia;
};

const inputClass =
  "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100";

export default function WorkflowStepsEditor({ steps, onChange, moduleSlug, uploadMedia }: Props) {
  function updateStep(i: number, patch: Partial<WorkflowStep>) {
    const next = [...steps];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  }

  function updateAsset(stepIdx: number, assetIdx: number, patch: Partial<WorkflowStepMedia>) {
    const step = steps[stepIdx];
    const assets = [...(step.assets ?? [])];
    assets[assetIdx] = { ...assets[assetIdx], ...patch };
    updateStep(stepIdx, { assets });
  }

  async function addMedia(stepIdx: number, file: File, role: WorkflowStepMediaRole) {
    const slug = `${moduleSlug}-step-${stepIdx}-${role}`;
    const { url, media_type } = await uploadMedia(file, slug, role);
    const assets = [...(steps[stepIdx].assets ?? []), { id: newId(), url, media_type, role, caption: "" }];
    updateStep(stepIdx, { assets });
  }

  return (
    <div className="rounded-2xl border border-blue-100/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Workflow</p>
          <p className="mt-1 text-xs text-slate-500">
            Each step: what goes in → prompt to run → what you should get out. Add images or videos per step.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...steps, EMPTY_STEP()])}
          className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-200 hover:bg-blue-700"
        >
          + Add step
        </button>
      </div>

      <div className="mt-5 space-y-6">
        {steps.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
            No steps yet.
          </p>
        ) : (
          steps.map((step, i) => (
            <div
              key={i}
              className="relative rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-50/80 to-white p-4 pl-14"
            >
              <span className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                {i + 1}
              </span>
              <div className="mb-3 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="text-[10px] font-bold text-slate-400 disabled:opacity-30">
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === steps.length - 1} className="text-[10px] font-bold text-slate-400 disabled:opacity-30">
                  ↓
                </button>
                <button type="button" onClick={() => onChange(steps.filter((_, j) => j !== i))} className="text-[10px] font-bold text-red-500">
                  Remove step
                </button>
              </div>

              <input
                value={step.title}
                onChange={(e) => updateStep(i, { title: e.target.value })}
                placeholder="Step name (e.g. Hero frame)"
                className={`${inputClass} mb-3 font-bold`}
              />
              <textarea
                value={step.body ?? ""}
                onChange={(e) => updateStep(i, { body: e.target.value })}
                placeholder="What to do in this step (plain language)…"
                rows={2}
                className={`${inputClass} mb-4`}
              />

              <div className="grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-700">Inputs</p>
                  <textarea
                    value={step.inputs ?? ""}
                    onChange={(e) => updateStep(i, { inputs: e.target.value })}
                    placeholder="Refs, plates, settings…"
                    rows={4}
                    className={`${inputClass} mt-2 bg-white`}
                  />
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-blue-700">Prompt</p>
                  <textarea
                    value={step.prompt ?? ""}
                    onChange={(e) => updateStep(i, { prompt: e.target.value })}
                    placeholder="Paste or write the prompt for this step…"
                    rows={4}
                    className={`${inputClass} mt-2 bg-white font-mono text-xs`}
                  />
                </div>
                <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-3">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-violet-700">Output</p>
                  <textarea
                    value={step.output ?? ""}
                    onChange={(e) => updateStep(i, { output: e.target.value })}
                    placeholder="What good looks like…"
                    rows={4}
                    className={`${inputClass} mt-2 bg-white`}
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-100 bg-white p-3">
                <p className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">Step media</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(["input", "output"] as const).map((role) => (
                    <label
                      key={role}
                      className="cursor-pointer rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-800 hover:bg-blue-100"
                    >
                      + {role === "input" ? "Input image/video" : "Output image/video"}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) addMedia(i, f, role).catch(() => {});
                        }}
                      />
                    </label>
                  ))}
                  <label className="cursor-pointer rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50">
                    + Reference
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        e.target.value = "";
                        if (f) addMedia(i, f, "prompt_ref").catch(() => {});
                      }}
                    />
                  </label>
                </div>

                {(step.assets ?? []).length > 0 && (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {(step.assets ?? []).map((asset, ai) => (
                      <div key={asset.id} className="overflow-hidden rounded-lg border border-slate-200">
                        {asset.media_type === "video" ? (
                          <video src={asset.url} controls className="aspect-video w-full bg-black object-cover" />
                        ) : (
                          <div className="relative aspect-video bg-slate-100">
                            <Image src={asset.url} alt="" fill className="object-cover" unoptimized />
                          </div>
                        )}
                        <div className="space-y-2 p-2">
                          <select
                            value={asset.role}
                            onChange={(e) => updateAsset(i, ai, { role: e.target.value as WorkflowStepMediaRole })}
                            className="w-full rounded-lg border border-slate-200 px-2 py-1 text-[10px] font-bold"
                          >
                            {Object.entries(WORKFLOW_MEDIA_ROLE_LABELS).map(([k, lab]) => (
                              <option key={k} value={k}>
                                {lab}
                              </option>
                            ))}
                          </select>
                          <input
                            value={asset.caption ?? ""}
                            onChange={(e) => updateAsset(i, ai, { caption: e.target.value })}
                            placeholder="Caption"
                            className="w-full rounded-lg border border-slate-100 px-2 py-1 text-[10px]"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateStep(i, { assets: (step.assets ?? []).filter((_, j) => j !== ai) })
                            }
                            className="text-[10px] font-bold text-red-500"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <input
                value={step.duration ?? ""}
                onChange={(e) => updateStep(i, { duration: e.target.value })}
                placeholder="Optional timing (e.g. 5 min)"
                className={`${inputClass} mt-3 text-xs`}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
