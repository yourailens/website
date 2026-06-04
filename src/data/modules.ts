import type { ModuleCoverAspectId, ModuleCoverVariants } from "@/data/module-covers";

export type { ModuleCoverAspectId, ModuleCoverVariants };

export type ModuleDiscipline =
  | "photography"
  | "video"
  | "design"
  | "motion"
  | "social"
  | "other";

export type ModuleAssetKind =
  | "reference"
  | "example_output"
  | "lighting_diagram"
  | "mood"
  | "prop"
  | "download"
  | "video";

export type WorkflowStepMediaRole = "input" | "prompt_ref" | "output";

export type WorkflowStepMedia = {
  id: string;
  media_type: "image" | "video";
  url: string;
  caption?: string;
  role: WorkflowStepMediaRole;
};

export type WorkflowStep = {
  title: string;
  /** Step instructions (what to do) */
  body?: string;
  duration?: string;
  /** What you bring in — refs, plates, brief */
  inputs?: string;
  /** Prompt to run in your tool */
  prompt?: string;
  /** What you should get back */
  output?: string;
  assets?: WorkflowStepMedia[];
};

export const WORKFLOW_MEDIA_ROLE_LABELS: Record<WorkflowStepMediaRole, string> = {
  input: "Input",
  prompt_ref: "Reference",
  output: "Output",
};

export type ModuleAsset = {
  id: string;
  module_id: string;
  title: string;
  caption: string | null;
  kind: ModuleAssetKind;
  image_url: string | null;
  video_url: string | null;
  aspect_ratio: "portrait" | "square" | "landscape";
  sort_order: number;
};

export type Module = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  discipline: ModuleDiscipline;
  cover_image_url: string | null;
  cover_aspect: ModuleCoverAspectId;
  cover_variants: ModuleCoverVariants;
  director_brief: string | null;
  camera_body: string | null;
  lens_model: string | null;
  focal_length: string | null;
  aperture: string | null;
  camera_notes: string | null;
  lighting_presets: string[];
  color_grade_presets: string[];
  mood_presets: string[];
  composition_presets: string[];
  shot_type_presets: string[];
  aspect_ratio: string | null;
  camera_setup: string | null;
  lighting_setup: string | null;
  lens_and_focal: string | null;
  composition_notes: string | null;
  color_and_mood: string | null;
  workflow_steps: WorkflowStep[];
  recommended_models: string[];
  prompt_structure: string | null;
  prompt_tips: string | null;
  common_mistakes: string | null;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ModuleWithAssets = Module & { assets: ModuleAsset[] };

export const ALL_MODULE_DISCIPLINES: ModuleDiscipline[] = [
  "photography",
  "video",
  "design",
  "motion",
  "social",
  "other",
];

export const MODULE_DISCIPLINE_LABELS: Record<ModuleDiscipline, string> = {
  photography: "Photography",
  video: "Video",
  design: "Design",
  motion: "Motion",
  social: "Social",
  other: "Other",
};

export const MODULE_DISCIPLINE_ACCENTS: Record<ModuleDiscipline, string> = {
  photography: "bg-amber-100 text-amber-900 border-amber-200",
  video: "bg-indigo-100 text-indigo-900 border-indigo-200",
  design: "bg-rose-100 text-rose-900 border-rose-200",
  motion: "bg-violet-100 text-violet-900 border-violet-200",
  social: "bg-emerald-100 text-emerald-900 border-emerald-200",
  other: "bg-slate-100 text-slate-800 border-slate-200",
};

export const MODULE_ASSET_KIND_LABELS: Record<ModuleAssetKind, string> = {
  reference: "Reference",
  example_output: "Example output",
  lighting_diagram: "Lighting diagram",
  mood: "Mood",
  prop: "Prop",
  download: "Download",
  video: "Video",
};

/** Strip auto-generated preset header lines from legacy composed text fields. */
export function stripComposedPresetLines(text: string | null | undefined, prefixes: string[]): string {
  if (!text?.trim()) return "";
  let out = text;
  for (const prefix of prefixes) {
    out = out.replace(new RegExp(`^${prefix}:[^\\n]*\\n\\n?`, "gim"), "");
  }
  return out.trim();
}

export function formatGearSummary(mod: Pick<Module, "camera_body" | "lens_model" | "focal_length" | "aperture">): string[] {
  const lines: string[] = [];
  if (mod.camera_body) lines.push(mod.camera_body);
  const lens = [mod.lens_model, mod.focal_length, mod.aperture].filter(Boolean).join(" · ");
  if (lens) lines.push(lens);
  return lines;
}
