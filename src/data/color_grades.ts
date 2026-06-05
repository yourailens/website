export type ColorGradeStyle =
  | "cinematic" | "vintage" | "moody" | "vibrant" | "pastel" | "noir"
  | "natural" | "fantasy" | "horror" | "sci_fi" | "editorial" | "other";

export type ColorGradeMood =
  | "warm" | "cool" | "neutral" | "dramatic" | "dreamy" | "gritty" | "ethereal" | "raw";

export interface ColorGrade {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  grade_style: ColorGradeStyle;
  mood: ColorGradeMood;
  dominant_colors: string[];
  style_tags: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export const COLOR_GRADE_STYLE_LABELS: Record<ColorGradeStyle, string> = {
  cinematic: "Cinematic", vintage: "Vintage", moody: "Moody", vibrant: "Vibrant",
  pastel: "Pastel", noir: "Noir", natural: "Natural", fantasy: "Fantasy",
  horror: "Horror", sci_fi: "Sci-Fi", editorial: "Editorial", other: "Other",
};

export const COLOR_GRADE_MOOD_LABELS: Record<ColorGradeMood, string> = {
  warm: "Warm", cool: "Cool", neutral: "Neutral", dramatic: "Dramatic",
  dreamy: "Dreamy", gritty: "Gritty", ethereal: "Ethereal", raw: "Raw",
};

export const COLOR_GRADE_STYLE_ACCENTS: Record<ColorGradeStyle, string> = {
  cinematic: "bg-indigo-100 text-indigo-800", vintage: "bg-amber-100 text-amber-800",
  moody: "bg-violet-100 text-violet-800", vibrant: "bg-emerald-100 text-emerald-800",
  pastel: "bg-pink-100 text-pink-700", noir: "bg-gray-900 text-gray-200",
  natural: "bg-green-100 text-green-800", fantasy: "bg-purple-100 text-purple-800",
  horror: "bg-red-100 text-red-800", sci_fi: "bg-cyan-100 text-cyan-800",
  editorial: "bg-slate-100 text-slate-700", other: "bg-slate-100 text-slate-600",
};

export const ALL_COLOR_GRADE_STYLES: ColorGradeStyle[] = [
  "cinematic", "vintage", "moody", "vibrant", "pastel", "noir",
  "natural", "fantasy", "horror", "sci_fi", "editorial", "other",
];
export const ALL_COLOR_GRADE_MOODS: ColorGradeMood[] = [
  "warm", "cool", "neutral", "dramatic", "dreamy", "gritty", "ethereal", "raw",
];
