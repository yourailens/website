export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
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
  includes: string[];
  deliverables: string[];
  best_for: string[];
  faqs: { q: string; a: string }[];
  traditional_value: number | null;
  thumbnail_url: string | null;
  cover_url: string | null;
  accent_color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
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

export const BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  blue:   { bg: "bg-blue-600",   text: "text-white" },
  green:  { bg: "bg-emerald-500", text: "text-white" },
  violet: { bg: "bg-violet-600", text: "text-white" },
  orange: { bg: "bg-orange-500", text: "text-white" },
};

export function formatPrice(p: number) {
  if (p >= 100000) return `₹${(p / 100000).toFixed(p % 100000 === 0 ? 0 : 1)}L`;
  if (p >= 1000)   return `₹${(p / 1000).toFixed(p % 1000 === 0 ? 0 : 1)}K`;
  return `₹${p}`;
}
