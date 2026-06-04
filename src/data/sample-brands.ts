export type SampleBrandMediaType = "image" | "video";

export type SampleBrandAspectRatio =
  | "portrait"
  | "portrait_45"
  | "square"
  | "landscape"
  | "ultrawide";

export type SampleBrandMediaCategory =
  | "people"
  | "products_objects"
  | "ambience"
  | "situations"
  | "posters"
  | "social_creatives"
  | "brand_identity"
  | "campaign_hero";

export const SAMPLE_BRAND_MEDIA_CATEGORIES: {
  value: SampleBrandMediaCategory;
  label: string;
  short: string;
}[] = [
  { value: "people", label: "People & talent", short: "People" },
  { value: "products_objects", label: "Products & objects", short: "Products" },
  { value: "ambience", label: "Ambience & environment", short: "Ambience" },
  { value: "situations", label: "Situations & scenes", short: "Situations" },
  { value: "posters", label: "Posters & key art", short: "Posters" },
  { value: "social_creatives", label: "Social & paid creatives", short: "Social" },
  { value: "brand_identity", label: "Brand & identity", short: "Identity" },
  { value: "campaign_hero", label: "Campaign hero", short: "Hero" },
];

export const SAMPLE_BRAND_ASPECT_RATIOS: {
  value: SampleBrandAspectRatio;
  label: string;
  hint: string;
}[] = [
  { value: "portrait", label: "Portrait", hint: "9:16" },
  { value: "portrait_45", label: "4:5", hint: "4:5" },
  { value: "square", label: "Square", hint: "1:1" },
  { value: "landscape", label: "Landscape", hint: "16:9" },
  { value: "ultrawide", label: "Ultrawide", hint: "21:9" },
];

export type SampleBrand = {
  id: string;
  industry_id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  hero_media_type: SampleBrandMediaType;
  hero_aspect_ratio: SampleBrandAspectRatio;
  hero_poster_url: string | null;
  hero_caption: string | null;
  cover_image_url: string | null;
  cover_media_type: SampleBrandMediaType;
  cover_aspect_ratio: SampleBrandAspectRatio;
  cover_poster_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type SampleBrandMedia = {
  id: string;
  brand_id: string;
  media_type: SampleBrandMediaType;
  aspect_ratio: SampleBrandAspectRatio;
  category: SampleBrandMediaCategory;
  label: string | null;
  caption: string | null;
  media_url: string;
  poster_url: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type SampleBrandWithMedia = SampleBrand & {
  media: SampleBrandMedia[];
  industry_slug?: string;
  industry_name?: string;
};

export type SampleBrandPageData = {
  industry: { id: string; slug: string; name: string };
  brand: SampleBrandWithMedia;
  siblings: SampleBrand[];
};

export function categoryLabel(cat: SampleBrandMediaCategory): string {
  return SAMPLE_BRAND_MEDIA_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

export function aspectRatioLabel(ratio: SampleBrandAspectRatio): string {
  return SAMPLE_BRAND_ASPECT_RATIOS.find((a) => a.value === ratio)?.label ?? ratio;
}
