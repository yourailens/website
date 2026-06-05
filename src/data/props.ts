export type PropCategory =
  | "accessories" | "jewelry" | "bags" | "footwear" | "headwear"
  | "tech" | "weapons" | "tools" | "food_drink" | "furniture"
  | "nature" | "vehicles" | "other";

export type PropStyle =
  | "realistic" | "fantasy" | "sci_fi" | "vintage" | "modern" | "anime" | "editorial" | "other";

export interface Prop {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  category: PropCategory;
  style: PropStyle;
  color_tags: string[];
  style_tags: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export const PROP_CATEGORY_LABELS: Record<PropCategory, string> = {
  accessories: "Accessories", jewelry: "Jewelry", bags: "Bags",
  footwear: "Footwear", headwear: "Headwear", tech: "Tech",
  weapons: "Weapons", tools: "Tools", food_drink: "Food & Drink",
  furniture: "Furniture", nature: "Nature", vehicles: "Vehicles", other: "Other",
};

export const PROP_STYLE_LABELS: Record<PropStyle, string> = {
  realistic: "Realistic", fantasy: "Fantasy", sci_fi: "Sci-Fi",
  vintage: "Vintage", modern: "Modern", anime: "Anime",
  editorial: "Editorial", other: "Other",
};

export const PROP_CATEGORY_ACCENTS: Record<PropCategory, string> = {
  accessories: "bg-amber-100 text-amber-800", jewelry: "bg-yellow-100 text-yellow-800",
  bags: "bg-orange-100 text-orange-800", footwear: "bg-red-100 text-red-800",
  headwear: "bg-pink-100 text-pink-800", tech: "bg-cyan-100 text-cyan-800",
  weapons: "bg-gray-900 text-gray-200", tools: "bg-stone-100 text-stone-700",
  food_drink: "bg-lime-100 text-lime-800", furniture: "bg-emerald-100 text-emerald-800",
  nature: "bg-green-100 text-green-800", vehicles: "bg-blue-100 text-blue-800",
  other: "bg-slate-100 text-slate-600",
};

export const ALL_PROP_CATEGORIES: PropCategory[] = [
  "accessories", "jewelry", "bags", "footwear", "headwear", "tech",
  "weapons", "tools", "food_drink", "furniture", "nature", "vehicles", "other",
];
export const ALL_PROP_STYLES: PropStyle[] = [
  "realistic", "fantasy", "sci_fi", "vintage", "modern", "anime", "editorial", "other",
];
