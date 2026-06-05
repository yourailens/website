export type OutfitCategory =
  | "casual"
  | "formal"
  | "fantasy"
  | "sci_fi"
  | "traditional"
  | "editorial"
  | "anime"
  | "gothic"
  | "vintage"
  | "activewear"
  | "swimwear"
  | "bridal";

export type OutfitCharacterType = "female" | "male" | "unisex";

export interface Outfit {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  category: OutfitCategory;
  character_type: OutfitCharacterType;
  style_tags: string[];
  color_palette: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export const OUTFIT_CATEGORY_LABELS: Record<OutfitCategory, string> = {
  casual:      "Casual",
  formal:      "Formal",
  fantasy:     "Fantasy",
  sci_fi:      "Sci-Fi",
  traditional: "Traditional",
  editorial:   "Editorial",
  anime:       "Anime",
  gothic:      "Gothic",
  vintage:     "Vintage",
  activewear:  "Activewear",
  swimwear:    "Swimwear",
  bridal:      "Bridal",
};

export const OUTFIT_CATEGORY_ACCENTS: Record<OutfitCategory, string> = {
  casual:      "bg-emerald-100 text-emerald-800",
  formal:      "bg-slate-100 text-slate-800",
  fantasy:     "bg-violet-100 text-violet-800",
  sci_fi:      "bg-cyan-100 text-cyan-800",
  traditional: "bg-amber-100 text-amber-800",
  editorial:   "bg-rose-100 text-rose-800",
  anime:       "bg-pink-100 text-pink-800",
  gothic:      "bg-gray-900 text-gray-200",
  vintage:     "bg-orange-100 text-orange-800",
  activewear:  "bg-lime-100 text-lime-800",
  swimwear:    "bg-sky-100 text-sky-800",
  bridal:      "bg-pink-50 text-pink-700",
};

export const OUTFIT_CHARACTER_LABELS: Record<OutfitCharacterType, string> = {
  female: "Female",
  male:   "Male",
  unisex: "Unisex",
};

export const ALL_OUTFIT_CATEGORIES: OutfitCategory[] = [
  "casual", "formal", "fantasy", "sci_fi", "traditional",
  "editorial", "anime", "gothic", "vintage", "activewear", "swimwear", "bridal",
];
