export type LightingType =
  | "golden_hour" | "blue_hour" | "midday_sun" | "studio_soft" | "studio_hard"
  | "cinematic" | "neon" | "candlelight" | "backlit" | "silhouette" | "overcast" | "other";

export type LightingMood =
  | "warm" | "cool" | "neutral" | "dramatic" | "ethereal" | "dark" | "bright" | "mysterious";

export interface LightingPreset {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  lighting_type: LightingType;
  mood: LightingMood;
  color_temp: string | null;
  style_tags: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export const LIGHTING_TYPE_LABELS: Record<LightingType, string> = {
  golden_hour: "Golden Hour", blue_hour: "Blue Hour", midday_sun: "Midday Sun",
  studio_soft: "Studio Soft", studio_hard: "Studio Hard", cinematic: "Cinematic",
  neon: "Neon", candlelight: "Candlelight", backlit: "Backlit",
  silhouette: "Silhouette", overcast: "Overcast", other: "Other",
};

export const LIGHTING_MOOD_LABELS: Record<LightingMood, string> = {
  warm: "Warm", cool: "Cool", neutral: "Neutral", dramatic: "Dramatic",
  ethereal: "Ethereal", dark: "Dark", bright: "Bright", mysterious: "Mysterious",
};

export const LIGHTING_TYPE_ACCENTS: Record<LightingType, string> = {
  golden_hour: "bg-amber-100 text-amber-800", blue_hour: "bg-blue-100 text-blue-800",
  midday_sun: "bg-yellow-100 text-yellow-800", studio_soft: "bg-slate-100 text-slate-700",
  studio_hard: "bg-slate-200 text-slate-800", cinematic: "bg-indigo-100 text-indigo-800",
  neon: "bg-fuchsia-100 text-fuchsia-800", candlelight: "bg-orange-100 text-orange-800",
  backlit: "bg-violet-100 text-violet-800", silhouette: "bg-gray-900 text-gray-200",
  overcast: "bg-sky-100 text-sky-700", other: "bg-slate-100 text-slate-600",
};

export const ALL_LIGHTING_TYPES: LightingType[] = [
  "golden_hour", "blue_hour", "midday_sun", "studio_soft", "studio_hard",
  "cinematic", "neon", "candlelight", "backlit", "silhouette", "overcast", "other",
];
export const ALL_LIGHTING_MOODS: LightingMood[] = [
  "warm", "cool", "neutral", "dramatic", "ethereal", "dark", "bright", "mysterious",
];
