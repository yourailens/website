export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type ServiceHeroMediaType = "image" | "video";

export type ServiceGalleryItem = {
  id: string;
  service_id: string;
  media_type: ServiceHeroMediaType;
  image_url: string | null;
  video_url: string | null;
  poster_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type ServiceInclude = {
  q: string;
  a: string;
};

export type Service = {
  id: string;
  category_slug: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  unit: string;
  delivery_days: number;
  is_popular: boolean;
  is_featured: boolean;
  is_published: boolean;
  badge_label: string | null;
  badge_color: string | null;
  includes: ServiceInclude[];
  deliverables: string[];
  best_for: string[];
  faqs: { q: string; a: string }[];
  traditional_value: number | null;
  thumbnail_url: string | null;
  cover_url: string | null;
  header_image_url: string | null;
  hero_media_type: ServiceHeroMediaType | null;
  hero_video_url: string | null;
  hero_image_url: string | null;
  hero_caption: string | null;
  hero_label: string | null;
  accent_color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceWithGallery = Service & {
  gallery: ServiceGalleryItem[];
};

export type ServiceAddon = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compatible_with: string[];
  is_published: boolean;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

/** Primary public categories after the pricing redesign. */
export const PRICING_CATEGORY_ORDER = ["videos", "visuals"] as const;

export const PRICING_CATEGORY_LABELS: Record<string, string> = {
  videos: "Films & commercials",
  visuals: "Images & stills",
};

export const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  blue: { bg: "bg-blue-600", text: "text-white" },
  green: { bg: "bg-emerald-500", text: "text-white" },
  violet: { bg: "bg-violet-600", text: "text-white" },
  orange: { bg: "bg-orange-500", text: "text-white" },
};

export function formatPrice(p: number) {
  if (p >= 100000) return `₹${(p / 100000).toFixed(p % 100000 === 0 ? 0 : 1)}L`;
  if (p >= 1000) return `₹${(p / 1000).toFixed(p % 1000 === 0 ? 0 : 1)}K`;
  return `₹${p}`;
}

export function formatPriceFull(p: number) {
  return `₹${p.toLocaleString("en-IN")}`;
}

/** Normalize includes from legacy string[] or Q&A objects. */
export function normalizeServiceIncludes(raw: unknown): ServiceInclude[] {
  if (!Array.isArray(raw)) return [];
  const out: ServiceInclude[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push({ q: "Included", a: item.trim() });
      continue;
    }
    if (item && typeof item === "object") {
      const row = item as { q?: unknown; a?: unknown };
      const q = typeof row.q === "string" ? row.q.trim() : "";
      const a = typeof row.a === "string" ? row.a.trim() : "";
      if (q || a) out.push({ q: q || "Included", a });
    }
  }
  return out;
}

export function serviceCardImage(s: Service): string | null {
  return (
    s.thumbnail_url?.trim() ||
    s.hero_image_url?.trim() ||
    s.header_image_url?.trim() ||
    s.cover_url?.trim() ||
    null
  );
}

export function serviceHeroMedia(s: Service): {
  type: ServiceHeroMediaType;
  url: string;
  poster?: string | null;
} | null {
  if (s.hero_media_type === "video" && s.hero_video_url?.trim()) {
    return {
      type: "video",
      url: s.hero_video_url.trim(),
      poster: s.hero_image_url?.trim() || s.thumbnail_url?.trim() || null,
    };
  }
  if (s.hero_media_type === "image" && s.hero_image_url?.trim()) {
    return { type: "image", url: s.hero_image_url.trim() };
  }
  if (s.hero_video_url?.trim()) {
    return {
      type: "video",
      url: s.hero_video_url.trim(),
      poster: s.hero_image_url?.trim() || null,
    };
  }
  if (s.hero_image_url?.trim()) {
    return { type: "image", url: s.hero_image_url.trim() };
  }
  if (s.header_image_url?.trim()) {
    return { type: "image", url: s.header_image_url.trim() };
  }
  return null;
}

export function galleryItemUrl(item: ServiceGalleryItem): string | null {
  if (item.media_type === "video") return item.video_url?.trim() || null;
  return item.image_url?.trim() || null;
}
