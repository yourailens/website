export type CharacterEthnicity =
  | "east_asian"
  | "south_asian"
  | "southeast_asian"
  | "african"
  | "middle_eastern"
  | "latin_hispanic"
  | "european"
  | "indigenous"
  | "mixed"
  | "other";

export type CharacterAgeGroup =
  | "child"
  | "teen"
  | "young_adult"
  | "adult"
  | "middle_aged"
  | "senior";

export type CharacterGender = "female" | "male" | "non_binary";

export type CharacterSkinTone =
  | "fair"
  | "light"
  | "medium"
  | "olive"
  | "tan"
  | "brown"
  | "dark"
  | "deep";

export type CharacterArchetype =
  | "hero"
  | "villain"
  | "mentor"
  | "rebel"
  | "scholar"
  | "artist"
  | "warrior"
  | "caretaker"
  | "explorer"
  | "everyman"
  | "other";

export interface CharacterSheet {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  ethnicity: CharacterEthnicity;
  age_group: CharacterAgeGroup;
  gender: CharacterGender;
  skin_tone: CharacterSkinTone;
  archetype: CharacterArchetype;
  nationality: string | null;
  hair_color: string | null;
  eye_color: string | null;
  style_tags: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

// ── Labels ────────────────────────────────────────────────────

export const ETHNICITY_LABELS: Record<CharacterEthnicity, string> = {
  east_asian:       "East Asian",
  south_asian:      "South Asian",
  southeast_asian:  "Southeast Asian",
  african:          "African",
  middle_eastern:   "Middle Eastern",
  latin_hispanic:   "Latin / Hispanic",
  european:         "European",
  indigenous:       "Indigenous",
  mixed:            "Mixed",
  other:            "Other",
};

export const AGE_GROUP_LABELS: Record<CharacterAgeGroup, string> = {
  child:        "Child",
  teen:         "Teen",
  young_adult:  "Young Adult",
  adult:        "Adult",
  middle_aged:  "Middle Aged",
  senior:       "Senior",
};

export const GENDER_LABELS: Record<CharacterGender, string> = {
  female:     "Female",
  male:       "Male",
  non_binary: "Non-Binary",
};

export const SKIN_TONE_LABELS: Record<CharacterSkinTone, string> = {
  fair:   "Fair",
  light:  "Light",
  medium: "Medium",
  olive:  "Olive",
  tan:    "Tan",
  brown:  "Brown",
  dark:   "Dark",
  deep:   "Deep",
};

export const ARCHETYPE_LABELS: Record<CharacterArchetype, string> = {
  hero:       "Hero",
  villain:    "Villain",
  mentor:     "Mentor",
  rebel:      "Rebel",
  scholar:    "Scholar",
  artist:     "Artist",
  warrior:    "Warrior",
  caretaker:  "Caretaker",
  explorer:   "Explorer",
  everyman:   "Everyman",
  other:      "Other",
};

// ── Accent colours ────────────────────────────────────────────

export const ETHNICITY_ACCENTS: Record<CharacterEthnicity, string> = {
  east_asian:      "bg-red-100 text-red-800",
  south_asian:     "bg-amber-100 text-amber-800",
  southeast_asian: "bg-orange-100 text-orange-800",
  african:         "bg-yellow-100 text-yellow-800",
  middle_eastern:  "bg-lime-100 text-lime-800",
  latin_hispanic:  "bg-emerald-100 text-emerald-800",
  european:        "bg-sky-100 text-sky-800",
  indigenous:      "bg-teal-100 text-teal-800",
  mixed:           "bg-violet-100 text-violet-800",
  other:           "bg-slate-100 text-slate-600",
};

export const ARCHETYPE_ACCENTS: Record<CharacterArchetype, string> = {
  hero:       "bg-blue-100 text-blue-800",
  villain:    "bg-gray-900 text-gray-200",
  mentor:     "bg-indigo-100 text-indigo-800",
  rebel:      "bg-rose-100 text-rose-800",
  scholar:    "bg-cyan-100 text-cyan-800",
  artist:     "bg-purple-100 text-purple-800",
  warrior:    "bg-red-100 text-red-800",
  caretaker:  "bg-green-100 text-green-800",
  explorer:   "bg-amber-100 text-amber-800",
  everyman:   "bg-slate-100 text-slate-700",
  other:      "bg-slate-100 text-slate-600",
};

// ── Enum arrays for iteration ─────────────────────────────────

export const ALL_ETHNICITIES: CharacterEthnicity[] = [
  "east_asian", "south_asian", "southeast_asian", "african",
  "middle_eastern", "latin_hispanic", "european", "indigenous", "mixed", "other",
];

export const ALL_AGE_GROUPS: CharacterAgeGroup[] = [
  "child", "teen", "young_adult", "adult", "middle_aged", "senior",
];

export const ALL_GENDERS: CharacterGender[] = ["female", "male", "non_binary"];

export const ALL_SKIN_TONES: CharacterSkinTone[] = [
  "fair", "light", "medium", "olive", "tan", "brown", "dark", "deep",
];

export const ALL_ARCHETYPES: CharacterArchetype[] = [
  "hero", "villain", "mentor", "rebel", "scholar", "artist",
  "warrior", "caretaker", "explorer", "everyman", "other",
];
