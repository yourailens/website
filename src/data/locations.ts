export type LocationCategory =
  | "urban" | "nature" | "fantasy" | "sci_fi" | "historical"
  | "interior" | "underwater" | "aerial" | "desert" | "forest" | "beach" | "mountains" | "mystical";

export type LocationTimeOfDay = "day" | "golden_hour" | "night" | "dawn" | "dusk" | "any";
export type LocationWeather = "clear" | "cloudy" | "rainy" | "snowy" | "foggy" | "stormy" | "any";

export interface Location {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  category: LocationCategory;
  time_of_day: LocationTimeOfDay;
  weather: LocationWeather;
  style_tags: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export const LOCATION_CATEGORY_LABELS: Record<LocationCategory, string> = {
  urban:      "Urban",
  nature:     "Nature",
  fantasy:    "Fantasy",
  sci_fi:     "Sci-Fi",
  historical: "Historical",
  interior:   "Interior",
  underwater: "Underwater",
  aerial:     "Aerial",
  desert:     "Desert",
  forest:     "Forest",
  beach:      "Beach",
  mountains:  "Mountains",
  mystical:   "Mystical",
};

export const LOCATION_CATEGORY_ACCENTS: Record<LocationCategory, string> = {
  urban:      "bg-slate-100 text-slate-800",
  nature:     "bg-emerald-100 text-emerald-800",
  fantasy:    "bg-violet-100 text-violet-800",
  sci_fi:     "bg-cyan-100 text-cyan-800",
  historical: "bg-amber-100 text-amber-800",
  interior:   "bg-orange-100 text-orange-800",
  underwater: "bg-blue-100 text-blue-800",
  aerial:     "bg-sky-100 text-sky-800",
  desert:     "bg-yellow-100 text-yellow-800",
  forest:     "bg-green-100 text-green-800",
  beach:      "bg-teal-100 text-teal-800",
  mountains:  "bg-indigo-100 text-indigo-800",
  mystical:   "bg-purple-100 text-purple-800",
};

export const LOCATION_TIME_LABELS: Record<LocationTimeOfDay, string> = {
  day: "Day", golden_hour: "Golden Hour", night: "Night",
  dawn: "Dawn", dusk: "Dusk", any: "Any Time",
};

export const LOCATION_WEATHER_LABELS: Record<LocationWeather, string> = {
  clear: "Clear", cloudy: "Cloudy", rainy: "Rainy",
  snowy: "Snowy", foggy: "Foggy", stormy: "Stormy", any: "Any",
};

export const ALL_LOCATION_CATEGORIES: LocationCategory[] = [
  "urban", "nature", "fantasy", "sci_fi", "historical",
  "interior", "underwater", "aerial", "desert", "forest", "beach", "mountains", "mystical",
];
