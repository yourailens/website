/** Built-in gear & production presets — admins can add custom via browser storage. */

export const POPULAR_CAMERA_BODIES = [
  "Sony A7 IV",
  "Sony A7R V",
  "Sony FX3",
  "Canon EOS R5",
  "Canon EOS R6 II",
  "Nikon Z8",
  "Nikon Z9",
  "Fujifilm GFX 100 II",
  "Fujifilm X-T5",
  "Panasonic Lumix S5 II",
  "RED Komodo",
  "ARRI Alexa Mini LF (reference)",
  "iPhone 15 Pro Max",
  "Phase One IQ4 (medium format)",
] as const;

export const POPULAR_LENSES = [
  "24mm f/1.4",
  "35mm f/1.4",
  "50mm f/1.2",
  "85mm f/1.4",
  "100mm macro",
  "24–70mm f/2.8",
  "70–200mm f/2.8",
  "16–35mm f/2.8",
  "135mm f/1.8",
  "Anamorphic 40mm T2.4",
  "Tilt-shift 90mm",
] as const;

export const POPULAR_FOCAL_LENGTHS = [
  "14mm",
  "24mm",
  "28mm",
  "35mm",
  "40mm",
  "50mm",
  "65mm",
  "85mm",
  "100mm",
  "135mm",
  "200mm",
] as const;

export const POPULAR_APERTURES = [
  "f/1.2",
  "f/1.4",
  "f/1.8",
  "f/2",
  "f/2.8",
  "f/4",
  "f/5.6",
  "f/8",
  "f/11",
  "T2.8 (cinema)",
] as const;

export const LIGHTING_SETUP_PRESETS = [
  "Soft key 45° + fill",
  "Butterfly / paramount",
  "Rembrandt",
  "Split light",
  "Rim + fill",
  "Natural window light",
  "Overcast soft daylight",
  "Golden hour backlight",
  "Neon practicals",
  "High-key studio",
  "Low-key dramatic",
  "Product: strip + soft top",
] as const;

export const COLOR_GRADE_PRESETS = [
  "Neutral / natural",
  "Warm skin-tone protect",
  "Cool corporate clean",
  "Teal & orange (subtle)",
  "Bleach bypass",
  "High contrast B&W",
  "Lifted blacks / milky",
  "Crushed blacks / noir",
  "Pastel / desaturated",
  "Vibrant commercial",
  "Film emulation — Kodak",
  "Film emulation — Fuji",
  "LOG → Rec.709 conversion",
  "S-curve punch",
  "Skin-tone first grade",
] as const;

export const MOOD_AESTHETIC_PRESETS = [
  "Cinematic",
  "Documentary raw",
  "Editorial glossy",
  "Intimate / quiet",
  "Energetic / punchy",
  "Luxury / restrained",
  "Playful / bright",
  "Moody / atmospheric",
  "Clean minimal",
  "Gritty urban",
  "Dreamy soft",
  "Tense thriller",
  "Warm nostalgic",
  "Cool futuristic",
] as const;

export const COMPOSITION_PRESETS = [
  "Rule of thirds",
  "Center-weighted hero",
  "Symmetry",
  "Leading lines",
  "Frame within frame",
  "Negative space for copy",
  "Foreground depth layer",
  "Overhead flat lay",
  "Eye-level neutral",
  "Low angle power",
  "High angle vulnerability",
  "Dutch angle (motivated)",
  "Profile silhouette",
  "Depth via foreground bokeh",
] as const;

export const SHOT_TYPE_PRESETS = [
  "Wide establish",
  "Master shot",
  "Medium shot",
  "Medium close-up",
  "Close-up",
  "Extreme close-up (detail)",
  "Insert / cutaway",
  "Over-the-shoulder",
  "POV",
  "Two-shot",
  "Tracking / dolly",
  "Static locked-off",
  "Handheld documentary",
  "Drone establish",
] as const;

export const ASPECT_RATIO_PRESETS = [
  "16:9",
  "2.39:1",
  "4:3",
  "1:1",
  "4:5",
  "9:16",
  "3:2",
  "21:9",
] as const;

export const AI_MODEL_PRESETS = [
  "Midjourney v6",
  "Flux",
  "DALL·E 3",
  "Stable Diffusion XL",
  "Kling",
  "Runway Gen-3",
  "Higgsfield",
  "Pika",
  "Sora",
  "Ideogram",
  "Photoshop Generative Fill",
  "DaVinci Resolve",
  "Topaz Photo AI",
] as const;

export const CUSTOM_STORAGE_KEYS = {
  cameras: "yalens-custom-cameras",
  lenses: "yalens-custom-lenses",
  focal: "yalens-custom-focal",
  apertures: "yalens-custom-apertures",
  lighting: "yalens-custom-lighting",
  colorGrade: "yalens-custom-color-grade",
  mood: "yalens-custom-mood",
  composition: "yalens-custom-composition",
  shotType: "yalens-custom-shot-type",
  aspectRatio: "yalens-custom-aspect-ratio",
  models: "yalens-custom-models",
} as const;

export function loadCustomOptions(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveCustomOption(key: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed || typeof window === "undefined") return;
  const existing = loadCustomOptions(key);
  if (existing.includes(trimmed)) return;
  localStorage.setItem(key, JSON.stringify([trimmed, ...existing]));
}

export function mergeOptions(builtin: readonly string[], key: string): string[] {
  const custom = typeof window !== "undefined" ? loadCustomOptions(key) : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of [...custom, ...builtin]) {
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  }
  return out;
}
