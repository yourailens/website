"use client";

import { useState } from "react";
import BlockEditor from "@/components/admin/BlockEditor";
import ModuleCoverFields from "@/components/admin/ModuleCoverFields";
import GearPicker from "@/components/admin/GearPicker";
import PresetChips from "@/components/admin/PresetChips";
import WorkflowStepsEditor from "@/components/admin/WorkflowStepsEditor";
import type { ModuleDiscipline, ModuleWithAssets, WorkflowStep } from "@/data/modules";
import { ALL_MODULE_DISCIPLINES, MODULE_DISCIPLINE_LABELS, stripComposedPresetLines } from "@/data/modules";
import {
  parseCoverVariants,
  syncPrimaryCover,
  type CoverVariantEntry,
  type ModuleCoverAspectId,
  type ModuleCoverVariants,
} from "@/data/module-covers";
import {
  AI_MODEL_PRESETS,
  ASPECT_RATIO_PRESETS,
  COLOR_GRADE_PRESETS,
  COMPOSITION_PRESETS,
  CUSTOM_STORAGE_KEYS,
  LIGHTING_SETUP_PRESETS,
  MOOD_AESTHETIC_PRESETS,
  POPULAR_APERTURES,
  POPULAR_CAMERA_BODIES,
  POPULAR_FOCAL_LENGTHS,
  POPULAR_LENSES,
  SHOT_TYPE_PRESETS,
} from "@/data/gear-presets";

export type ModuleEditorForm = {
  title: string;
  tagline: string;
  description: string;
  discipline: ModuleDiscipline;
  cover_variants: ModuleCoverVariants;
  cover_aspect: ModuleCoverAspectId;
  director_brief: string;
  camera_body: string;
  lens_model: string;
  focal_length: string;
  aperture: string;
  camera_notes: string;
  lighting_presets: string[];
  lighting_notes: string;
  color_grade_presets: string[];
  mood_presets: string[];
  color_notes: string;
  composition_presets: string[];
  shot_type_presets: string[];
  aspect_ratio: string;
  composition_notes: string;
  workflow_steps: WorkflowStep[];
  recommended_models: string[];
  prompt_structure: string;
  prompt_tips: string;
  common_mistakes: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
};

export const BLANK_MODULE_FORM: ModuleEditorForm = {
  title: "",
  tagline: "",
  description: "",
  discipline: "photography",
  cover_variants: {},
  cover_aspect: "landscape",
  director_brief: "",
  camera_body: "",
  lens_model: "",
  focal_length: "",
  aperture: "",
  camera_notes: "",
  lighting_presets: [],
  lighting_notes: "",
  color_grade_presets: [],
  mood_presets: [],
  color_notes: "",
  composition_presets: [],
  shot_type_presets: [],
  aspect_ratio: "",
  composition_notes: "",
  workflow_steps: [{ title: "Lock the brief", body: "", inputs: "", prompt: "", output: "", assets: [] }],
  recommended_models: [],
  prompt_structure: "",
  prompt_tips: "",
  common_mistakes: "",
  featured: false,
  published: false,
  sort_order: 0,
};

export function moduleToEditorForm(m: ModuleWithAssets): ModuleEditorForm {
  const lightingNotes = stripComposedPresetLines(m.lighting_setup, ["Setups"]);
  const colorNotes = stripComposedPresetLines(m.color_and_mood, ["Grades", "Mood"]);
  const compositionNotes = stripComposedPresetLines(m.composition_notes, ["Framing", "Shots", "Aspect"]);

  const colorNotesFallback =
    colorNotes || (m.color_grade_presets?.length || m.mood_presets?.length ? "" : m.color_and_mood ?? "");
  const compositionNotesFallback =
    compositionNotes ||
    (m.composition_presets?.length || m.shot_type_presets?.length || m.aspect_ratio ? "" : m.composition_notes ?? "");

  return {
    title: m.title,
    tagline: m.tagline ?? "",
    description: m.description ?? "",
    discipline: m.discipline,
    cover_variants: (() => {
      const v = parseCoverVariants(m.cover_variants);
      if (Object.keys(v).length > 0) return v;
      if (m.cover_image_url?.trim()) {
        return { [m.cover_aspect]: { url: m.cover_image_url.trim(), media_type: "image" as const } };
      }
      return {};
    })(),
    cover_aspect: m.cover_aspect,
    director_brief: m.director_brief ?? "",
    camera_body: m.camera_body ?? "",
    lens_model: m.lens_model ?? "",
    focal_length: m.focal_length ?? "",
    aperture: m.aperture ?? "",
    camera_notes: m.camera_notes ?? m.camera_setup ?? "",
    lighting_presets: m.lighting_presets ?? [],
    lighting_notes: lightingNotes || (m.lighting_presets.length ? "" : m.lighting_setup ?? ""),
    color_grade_presets: m.color_grade_presets ?? [],
    mood_presets: m.mood_presets ?? [],
    color_notes: colorNotesFallback,
    composition_presets: m.composition_presets ?? [],
    shot_type_presets: m.shot_type_presets ?? [],
    aspect_ratio: m.aspect_ratio ?? "",
    composition_notes: compositionNotesFallback,
    workflow_steps: m.workflow_steps.length
      ? m.workflow_steps.map((s) => ({
          title: s.title,
          body: s.body ?? "",
          duration: s.duration ?? "",
          inputs: s.inputs ?? "",
          prompt: s.prompt ?? "",
          output: s.output ?? "",
          assets: s.assets ?? [],
        }))
      : [{ title: "", body: "", inputs: "", prompt: "", output: "", assets: [] }],
    recommended_models: m.recommended_models ?? [],
    prompt_structure: m.prompt_structure ?? "",
    prompt_tips: m.prompt_tips ?? "",
    common_mistakes: m.common_mistakes ?? "",
    featured: m.featured,
    published: m.published,
    sort_order: m.sort_order,
  };
}

function buildDerivedFields(form: ModuleEditorForm) {
  const lens_and_focal = [form.lens_model, form.focal_length, form.aperture].filter(Boolean).join(" · ") || null;
  const camera_setup =
    [form.camera_body && `Body: ${form.camera_body}`, form.camera_notes.trim()].filter(Boolean).join("\n") || null;
  const lighting_setup =
    [
      form.lighting_presets.length ? `Setups: ${form.lighting_presets.join(" · ")}` : "",
      form.lighting_notes.trim(),
    ]
      .filter(Boolean)
      .join("\n\n") || null;
  const color_and_mood =
    [
      form.color_grade_presets.length ? `Grades: ${form.color_grade_presets.join(" · ")}` : "",
      form.mood_presets.length ? `Mood: ${form.mood_presets.join(" · ")}` : "",
      form.color_notes.trim(),
    ]
      .filter(Boolean)
      .join("\n\n") || null;
  const composition_notes =
    [
      form.composition_presets.length ? `Framing: ${form.composition_presets.join(" · ")}` : "",
      form.shot_type_presets.length ? `Shots: ${form.shot_type_presets.join(" · ")}` : "",
      form.aspect_ratio.trim() ? `Aspect: ${form.aspect_ratio.trim()}` : "",
      form.composition_notes.trim(),
    ]
      .filter(Boolean)
      .join("\n\n") || null;
  return {
    lens_and_focal,
    camera_setup,
    lighting_setup,
    color_and_mood,
    composition_notes,
    aspect_ratio: form.aspect_ratio.trim() || null,
  };
}

type Props = {
  editing: ModuleWithAssets | null;
  form: ModuleEditorForm;
  setForm: React.Dispatch<React.SetStateAction<ModuleEditorForm>>;
  onCancel: () => void;
  onSaved: () => void;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function AdminModuleEditor({ editing, form, setForm, onCancel, onSaved }: Props) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const moduleSlug = (editing?.slug ?? slugify(form.title)) || "module";

  async function uploadCoverBlob(blob: Blob, slug: string, aspectId: ModuleCoverAspectId) {
    const fd = new FormData();
    fd.append("file", blob, `${slug}-cover-${aspectId}.jpg`);
    fd.append("slug", `${slug}-cover-${aspectId}`);
    const res = await fetch("/api/admin/modules/upload-image", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Cover upload failed");
    return ((await res.json()) as { url?: string }).url ?? "";
  }

  async function uploadCoverMediaFile(
    file: File,
    slug: string,
    aspectId: ModuleCoverAspectId
  ): Promise<CoverVariantEntry> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", `${slug}-cover-${aspectId}`);
    const res = await fetch("/api/admin/modules/upload-media", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Cover upload failed");
    const json = (await res.json()) as { url?: string; media_type?: "image" | "video" };
    return { url: json.url ?? "", media_type: json.media_type === "video" ? "video" : "image" };
  }

  async function uploadWorkflowMedia(file: File, slug: string, label: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("slug", slug);
    const res = await fetch("/api/admin/modules/upload-media", { method: "POST", body: fd });
    if (!res.ok) throw new Error("Upload failed");
    const json = (await res.json()) as { url?: string; media_type?: "image" | "video" };
    return {
      url: json.url ?? "",
      media_type: (json.media_type === "video" ? "video" : "image") as "image" | "video",
    };
  }

  function patch<K extends keyof ModuleEditorForm>(k: K, v: ModuleEditorForm[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    try {
      const slug = editing?.slug ?? slugify(form.title);
      const coverSync = syncPrimaryCover(form.cover_variants, form.cover_aspect);

      const workflow_steps = form.workflow_steps
        .map((s) => ({
          title: s.title.trim(),
          body: s.body?.trim() || undefined,
          duration: s.duration?.trim() || undefined,
          inputs: s.inputs?.trim() || undefined,
          prompt: s.prompt?.trim() || undefined,
          output: s.output?.trim() || undefined,
          assets: (s.assets ?? [])
            .filter((a) => a.url?.trim())
            .map((a) => ({
              id: a.id,
              url: a.url.trim(),
              media_type: a.media_type,
              role: a.role,
              caption: a.caption?.trim() || undefined,
            })),
        }))
        .filter(
          (s) =>
            s.title ||
            s.body ||
            s.inputs ||
            s.prompt ||
            s.output ||
            (s.assets?.length ?? 0) > 0
        );

      const derived = buildDerivedFields(form);

      const payload = {
        slug,
        title: form.title,
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        discipline: form.discipline,
        cover_image_url: coverSync.cover_image_url,
        cover_aspect: form.cover_aspect,
        cover_variants: coverSync.cover_variants,
        director_brief: form.director_brief.trim() || null,
        camera_body: form.camera_body.trim() || null,
        lens_model: form.lens_model.trim() || null,
        focal_length: form.focal_length.trim() || null,
        aperture: form.aperture.trim() || null,
        camera_notes: form.camera_notes.trim() || null,
        lighting_presets: form.lighting_presets,
        color_grade_presets: form.color_grade_presets,
        mood_presets: form.mood_presets,
        composition_presets: form.composition_presets,
        shot_type_presets: form.shot_type_presets,
        ...derived,
        workflow_steps,
        recommended_models: form.recommended_models,
        prompt_structure: form.prompt_structure.trim() || null,
        prompt_tips: form.prompt_tips.trim() || null,
        common_mistakes: form.common_mistakes.trim() || null,
        featured: form.featured,
        published: form.published,
        sort_order: form.sort_order,
      };

      const res = await fetch(
        editing ? `/api/admin/modules/${editing.id}` : "/api/admin/modules",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!json.ok) throw new Error(json.error ?? "Save failed");
      setMsg("Saved!");
      onSaved();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100";
  const label = "mb-1.5 block font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400";

  return (
    <div className="min-h-screen bg-[#f4f7fc]">
      <div className="border-b border-blue-100/80 bg-gradient-to-r from-white via-[#f8fbff] to-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">Admin · Modules</p>
            <h1 className="font-heading text-2xl font-black text-slate-900">
              {editing ? editing.title : "New playbook"}
            </h1>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-blue-200"
          >
            ← Back
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        {/* Basics */}
        <section className="rounded-3xl border border-blue-100/80 bg-white p-6 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-600">Basics</p>
          <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Cover (image or video per ratio)</p>
          <ModuleCoverFields
            slug={moduleSlug}
            variants={form.cover_variants}
            primaryAspect={form.cover_aspect}
            onVariantsChange={(v) => patch("cover_variants", v)}
            onPrimaryAspectChange={(id) => patch("cover_aspect", id)}
            uploadBlob={uploadCoverBlob}
            uploadMediaFile={uploadCoverMediaFile}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={label}>Title *</label>
              <input required value={form.title} onChange={(e) => patch("title", e.target.value)} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Tagline</label>
              <input value={form.tagline} onChange={(e) => patch("tagline", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Discipline</label>
              <select value={form.discipline} onChange={(e) => patch("discipline", e.target.value as ModuleDiscipline)} className={input}>
                {ALL_MODULE_DISCIPLINES.map((d) => (
                  <option key={d} value={d}>
                    {MODULE_DISCIPLINE_LABELS[d]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Sort order</label>
              <input type="number" value={form.sort_order} onChange={(e) => patch("sort_order", Number(e.target.value))} className={input} />
            </div>
            <div className="sm:col-span-2">
              <label className={label}>Short description</label>
              <textarea value={form.description} onChange={(e) => patch("description", e.target.value)} rows={2} className={input} />
            </div>
          </div>
        </section>

        {/* Director */}
        <section className="space-y-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-600">Director POV</p>
          <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
            <label className={label}>Director&apos;s brief</label>
            <textarea
              value={form.director_brief}
              onChange={(e) => patch("director_brief", e.target.value)}
              rows={3}
              className={`${input} mt-2`}
              placeholder="What is this module for? Speak like a director to your team."
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <GearPicker
              label="Camera body"
              value={form.camera_body}
              onChange={(v) => patch("camera_body", v)}
              builtin={POPULAR_CAMERA_BODIES}
              storageKey={CUSTOM_STORAGE_KEYS.cameras}
            />
            <GearPicker
              label="Lens"
              value={form.lens_model}
              onChange={(v) => patch("lens_model", v)}
              builtin={POPULAR_LENSES}
              storageKey={CUSTOM_STORAGE_KEYS.lenses}
            />
            <GearPicker
              label="Focal length"
              value={form.focal_length}
              onChange={(v) => patch("focal_length", v)}
              builtin={POPULAR_FOCAL_LENGTHS}
              storageKey={CUSTOM_STORAGE_KEYS.focal}
            />
            <GearPicker
              label="Aperture"
              value={form.aperture}
              onChange={(v) => patch("aperture", v)}
              builtin={POPULAR_APERTURES}
              storageKey={CUSTOM_STORAGE_KEYS.apertures}
            />
          </div>

          <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
            <label className={label}>Extra camera notes</label>
            <textarea
              value={form.camera_notes}
              onChange={(e) => patch("camera_notes", e.target.value)}
              rows={3}
              className={`${input} mt-2`}
              placeholder="Tripod, shutter, angle, sync…"
            />
          </div>

          <PresetChips
            label="Lighting setups"
            hint="Tap presets — add your own. Notes below for nuance."
            selected={form.lighting_presets}
            onChange={(v) => patch("lighting_presets", v)}
            builtin={LIGHTING_SETUP_PRESETS}
            storageKey={CUSTOM_STORAGE_KEYS.lighting}
          />

          <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
            <label className={label}>Lighting notes</label>
            <textarea
              value={form.lighting_notes}
              onChange={(e) => patch("lighting_notes", e.target.value)}
              rows={3}
              className={`${input} mt-2`}
              placeholder="Spill control, ratios, motivated sources…"
            />
          </div>

          <PresetChips
            label="Color grading"
            hint="LUT / grade direction — tap presets or add your own."
            selected={form.color_grade_presets}
            onChange={(v) => patch("color_grade_presets", v)}
            builtin={COLOR_GRADE_PRESETS}
            storageKey={CUSTOM_STORAGE_KEYS.colorGrade}
          />
          <PresetChips
            label="Mood & aesthetic"
            selected={form.mood_presets}
            onChange={(v) => patch("mood_presets", v)}
            builtin={MOOD_AESTHETIC_PRESETS}
            storageKey={CUSTOM_STORAGE_KEYS.mood}
          />
          <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
            <label className={label}>Color & mood notes</label>
            <textarea
              value={form.color_notes}
              onChange={(e) => patch("color_notes", e.target.value)}
              rows={3}
              className={`${input} mt-2`}
              placeholder="Skin tones, saturation rules, white balance…"
            />
          </div>

          <PresetChips
            label="Composition & framing"
            selected={form.composition_presets}
            onChange={(v) => patch("composition_presets", v)}
            builtin={COMPOSITION_PRESETS}
            storageKey={CUSTOM_STORAGE_KEYS.composition}
          />
          <PresetChips
            label="Shot types & coverage"
            selected={form.shot_type_presets}
            onChange={(v) => patch("shot_type_presets", v)}
            builtin={SHOT_TYPE_PRESETS}
            storageKey={CUSTOM_STORAGE_KEYS.shotType}
          />
          <GearPicker
            label="Delivery aspect ratio"
            hint="How the final is meant to be seen."
            value={form.aspect_ratio}
            onChange={(v) => patch("aspect_ratio", v)}
            builtin={ASPECT_RATIO_PRESETS}
            storageKey={CUSTOM_STORAGE_KEYS.aspectRatio}
          />
          <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
            <label className={label}>Composition notes</label>
            <textarea
              value={form.composition_notes}
              onChange={(e) => patch("composition_notes", e.target.value)}
              rows={3}
              className={`${input} mt-2`}
              placeholder="Copy safe zones, geography cheats, blocking…"
            />
          </div>
        </section>

        <WorkflowStepsEditor
          steps={form.workflow_steps}
          onChange={(v) => patch("workflow_steps", v)}
          moduleSlug={moduleSlug}
          uploadMedia={uploadWorkflowMedia}
        />

        {/* Prompts */}
        <section className="space-y-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-600">Prompts & tools</p>
          <PresetChips
            label="AI models & tools"
            selected={form.recommended_models}
            onChange={(v) => patch("recommended_models", v)}
            builtin={AI_MODEL_PRESETS}
            storageKey={CUSTOM_STORAGE_KEYS.models}
          />
          <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
            <label className={label}>Module prompt guide</label>
            <p className="mt-1 mb-3 text-xs text-slate-500">
              Long-form copy for the whole module (not per-step). Per-step prompts live in Workflow above.
            </p>
            <BlockEditor value={form.prompt_structure} onChange={(md) => patch("prompt_structure", md)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
              <label className={label}>Prompt tips</label>
              <textarea value={form.prompt_tips} onChange={(e) => patch("prompt_tips", e.target.value)} rows={3} className={`${input} mt-2`} />
            </div>
            <div className="rounded-2xl border border-blue-100/80 bg-white p-4 shadow-sm">
              <label className={label}>Common mistakes</label>
              <textarea value={form.common_mistakes} onChange={(e) => patch("common_mistakes", e.target.value)} rows={3} className={`${input} mt-2`} />
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-6 rounded-2xl border border-blue-100 bg-white px-6 py-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={form.published} onChange={(e) => patch("published", e.target.checked)} className="rounded border-slate-300" />
            Published
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-700">
            <input type="checkbox" checked={form.featured} onChange={(e) => patch("featured", e.target.checked)} className="rounded border-slate-300" />
            Featured
          </label>
        </div>

        {msg && (
          <p className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.includes("Saved") ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200/80 hover:bg-blue-700 disabled:opacity-60"
        >
          {busy ? "Saving…" : editing ? "Save module" : "Publish module"}
        </button>
      </form>
    </div>
  );
}
