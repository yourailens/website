// ── Enums (mirror the DB enums) ─────────────────────────────

export type PromptMediaType = "image" | "video";

export type PromptImageCategory =
  | "photorealistic"
  | "ultrarealistic"
  | "natural"
  | "product"
  | "2d_illustration"
  | "3d_render"
  | "animation"
  | "editorial"
  | "portrait"
  | "cinematic"
  | "abstract"
  | "other";

export type PromptVideoCategory =
  | "animation"
  | "cinematic"
  | "product"
  | "lip_sync"
  | "motion_fx"
  | "character"
  | "documentary"
  | "transition"
  | "vfx"
  | "other";

export type PromptDifficulty = "beginner" | "intermediate" | "advanced";

// ── Row shape returned from DB ───────────────────────────────

export type PromptCoverAspect = "square" | "portrait" | "landscape";

export type Prompt = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  cover_aspect: PromptCoverAspect;
  demo_video_url: string | null;
  og_image_url: string | null;
  media_type: PromptMediaType;
  image_category: PromptImageCategory | null;
  video_category: PromptVideoCategory | null;
  difficulty: PromptDifficulty;
  models: string[];
  tags: string[];
  body: string;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

// ── Label helpers ────────────────────────────────────────────

export const IMAGE_CATEGORY_LABELS: Record<PromptImageCategory, string> = {
  photorealistic: "Photorealistic",
  ultrarealistic: "Ultra-realistic",
  natural: "Natural",
  product: "Product",
  "2d_illustration": "2D Illustration",
  "3d_render": "3D Render",
  animation: "Animation",
  editorial: "Editorial",
  portrait: "Portrait",
  cinematic: "Cinematic",
  abstract: "Abstract",
  other: "Other",
};

export const VIDEO_CATEGORY_LABELS: Record<PromptVideoCategory, string> = {
  animation: "Animation",
  cinematic: "Cinematic",
  product: "Product",
  lip_sync: "Lip Sync",
  motion_fx: "Motion FX",
  character: "Character",
  documentary: "Documentary",
  transition: "Transition",
  vfx: "VFX",
  other: "Other",
};

export const DIFFICULTY_LABELS: Record<PromptDifficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const IMAGE_CATEGORIES: PromptImageCategory[] = [
  "photorealistic", "ultrarealistic", "natural", "product",
  "2d_illustration", "3d_render", "animation", "editorial",
  "portrait", "cinematic", "abstract", "other",
];

export const VIDEO_CATEGORIES: PromptVideoCategory[] = [
  "animation", "cinematic", "product", "lip_sync",
  "motion_fx", "character", "documentary", "transition", "vfx", "other",
];

export const DIFFICULTIES: PromptDifficulty[] = ["beginner", "intermediate", "advanced"];

export const PROMPT_AI_MODELS = [
  "Kling AI", "Higgsfield", "Seedance", "Midjourney", "Flux",
  "Stable Diffusion", "DALL-E 3", "Firefly", "Sora", "Veo 3",
  "Runway", "Pika", "Udio", "ElevenLabs", "Grok",
];

/** Category label for a given prompt (resolves image or video category) */
export function promptCategoryLabel(p: Pick<Prompt, "media_type" | "image_category" | "video_category">): string {
  if (p.media_type === "image" && p.image_category) return IMAGE_CATEGORY_LABELS[p.image_category];
  if (p.media_type === "video" && p.video_category) return VIDEO_CATEGORY_LABELS[p.video_category];
  return "Other";
}

/** Colour accent for media type */
export function promptMediaAccent(type: PromptMediaType) {
  return type === "image"
    ? { bg: "bg-violet-100", text: "text-violet-700", border: "border-violet-200", dot: "bg-violet-500" }
    : { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" };
}

export function difficultyAccent(d: PromptDifficulty) {
  if (d === "beginner") return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-400" };
  if (d === "intermediate") return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" };
  return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" };
}
