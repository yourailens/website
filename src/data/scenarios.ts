export type ScenarioType =
  | "portrait" | "duo" | "group_scene" | "action" | "romance"
  | "everyday" | "cinematic" | "magical" | "battle" | "fashion_shoot";

export type ScenarioSetting =
  | "indoor" | "outdoor" | "fantasy" | "sci_fi" | "historical" | "urban" | "nature" | "studio";

export type ScenarioMood =
  | "happy" | "dramatic" | "mysterious" | "peaceful" | "intense" | "playful" | "romantic" | "melancholic";

export type ScenarioCharacterCount = "solo" | "duo" | "group";

export interface Scenario {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  scenario_type: ScenarioType;
  setting: ScenarioSetting;
  mood: ScenarioMood;
  character_count: ScenarioCharacterCount;
  style_tags: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export const SCENARIO_TYPE_LABELS: Record<ScenarioType, string> = {
  portrait:      "Portrait",
  duo:           "Duo",
  group_scene:   "Group Scene",
  action:        "Action",
  romance:       "Romance",
  everyday:      "Everyday",
  cinematic:     "Cinematic",
  magical:       "Magical",
  battle:        "Battle",
  fashion_shoot: "Fashion Shoot",
};

export const SCENARIO_TYPE_ACCENTS: Record<ScenarioType, string> = {
  portrait:      "bg-rose-100 text-rose-800",
  duo:           "bg-pink-100 text-pink-800",
  group_scene:   "bg-violet-100 text-violet-800",
  action:        "bg-orange-100 text-orange-800",
  romance:       "bg-red-100 text-red-800",
  everyday:      "bg-emerald-100 text-emerald-800",
  cinematic:     "bg-slate-100 text-slate-800",
  magical:       "bg-purple-100 text-purple-800",
  battle:        "bg-red-900 text-red-100",
  fashion_shoot: "bg-amber-100 text-amber-800",
};

export const SCENARIO_SETTING_LABELS: Record<ScenarioSetting, string> = {
  indoor: "Indoor", outdoor: "Outdoor", fantasy: "Fantasy",
  sci_fi: "Sci-Fi", historical: "Historical", urban: "Urban", nature: "Nature", studio: "Studio",
};

export const SCENARIO_MOOD_LABELS: Record<ScenarioMood, string> = {
  happy: "Happy", dramatic: "Dramatic", mysterious: "Mysterious", peaceful: "Peaceful",
  intense: "Intense", playful: "Playful", romantic: "Romantic", melancholic: "Melancholic",
};

export const ALL_SCENARIO_TYPES: ScenarioType[] = [
  "portrait", "duo", "group_scene", "action", "romance",
  "everyday", "cinematic", "magical", "battle", "fashion_shoot",
];
