export type AestheticStyle =
  | "dark_academia" | "y2k" | "cottagecore" | "cyberpunk" | "wabi_sabi"
  | "minimalist" | "maximalist" | "streetwear" | "old_money" | "clean_girl"
  | "coastal_grandmother" | "retro_futurism" | "bohemian" | "preppy"
  | "grunge" | "art_deco" | "mob_wife" | "vanilla_girl" | "brat" | "other";

export type AestheticEra =
  | "seventies" | "eighties" | "nineties" | "two_thousands" | "twenty_tens" | "modern" | "timeless";

export interface MoodBoard {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  image_url: string;
  aesthetic: AestheticStyle;
  era: AestheticEra;
  color_palette: string[];
  style_tags: string[];
  aspect_ratio: "portrait" | "square" | "landscape";
  download_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export const AESTHETIC_STYLE_LABELS: Record<AestheticStyle, string> = {
  dark_academia: "Dark Academia", y2k: "Y2K", cottagecore: "Cottagecore",
  cyberpunk: "Cyberpunk", wabi_sabi: "Wabi-Sabi", minimalist: "Minimalist",
  maximalist: "Maximalist", streetwear: "Streetwear", old_money: "Old Money",
  clean_girl: "Clean Girl", coastal_grandmother: "Coastal Grandmother",
  retro_futurism: "Retro Futurism", bohemian: "Bohemian", preppy: "Preppy",
  grunge: "Grunge", art_deco: "Art Deco", mob_wife: "Mob Wife",
  vanilla_girl: "Vanilla Girl", brat: "Brat", other: "Other",
};

export const AESTHETIC_ERA_LABELS: Record<AestheticEra, string> = {
  seventies: "70s", eighties: "80s", nineties: "90s",
  two_thousands: "2000s", twenty_tens: "2010s", modern: "Modern", timeless: "Timeless",
};

export const AESTHETIC_STYLE_ACCENTS: Record<AestheticStyle, string> = {
  dark_academia: "bg-stone-100 text-stone-800", y2k: "bg-fuchsia-100 text-fuchsia-800",
  cottagecore: "bg-green-100 text-green-800", cyberpunk: "bg-violet-100 text-violet-800",
  wabi_sabi: "bg-amber-100 text-amber-800", minimalist: "bg-slate-100 text-slate-700",
  maximalist: "bg-rose-100 text-rose-800", streetwear: "bg-gray-900 text-gray-200",
  old_money: "bg-emerald-100 text-emerald-900", clean_girl: "bg-sky-100 text-sky-700",
  coastal_grandmother: "bg-blue-100 text-blue-800", retro_futurism: "bg-cyan-100 text-cyan-800",
  bohemian: "bg-orange-100 text-orange-800", preppy: "bg-pink-100 text-pink-800",
  grunge: "bg-zinc-900 text-zinc-200", art_deco: "bg-yellow-100 text-yellow-800",
  mob_wife: "bg-red-100 text-red-800", vanilla_girl: "bg-pink-50 text-pink-700",
  brat: "bg-lime-100 text-lime-800", other: "bg-slate-100 text-slate-600",
};

export const ALL_AESTHETIC_STYLES: AestheticStyle[] = [
  "dark_academia", "y2k", "cottagecore", "cyberpunk", "wabi_sabi", "minimalist",
  "maximalist", "streetwear", "old_money", "clean_girl", "coastal_grandmother",
  "retro_futurism", "bohemian", "preppy", "grunge", "art_deco", "mob_wife",
  "vanilla_girl", "brat", "other",
];
export const ALL_AESTHETIC_ERAS: AestheticEra[] = [
  "seventies", "eighties", "nineties", "two_thousands", "twenty_tens", "modern", "timeless",
];
