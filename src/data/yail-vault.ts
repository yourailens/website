export const YAIL_VAULT_CATEGORIES = [
  { id: "filmmaking", label: "AI Filmmaking", rail: "Filmmaking labs" },
  { id: "ads", label: "AI Ads", rail: "Ads labs" },
] as const;

export type YailVaultCategory = (typeof YAIL_VAULT_CATEGORIES)[number]["id"];

export const YAIL_VAULT_TAG_KINDS = ["genre", "subject", "label", "avatar"] as const;
export type YailVaultTagKind = (typeof YAIL_VAULT_TAG_KINDS)[number];

export type YailVaultTag = {
  id: string;
  kind: YailVaultTagKind;
  name: string;
  slug: string;
};

export type YailVaultEntry = {
  id: string;
  slug: string;
  category: YailVaultCategory;
  title: string;
  caption: string | null;
  notes: string | null;
  media_type: "image" | "video";
  media_url: string;
  poster_url: string | null;
  /** Pre-baked 1200×630 JPEG on S3 for WhatsApp / OG. */
  og_image_url: string | null;
  /** Pixel size of the media frame (any ratio). Null until measured. */
  aspect_width: number | null;
  aspect_height: number | null;
  /** Catalog id from YAIL_VAULT_AI_MODELS */
  ai_model: string | null;
  /** FKs to yail_vault_avatars (many-to-many) */
  avatar_ids: string[];
  /** Hero on All labs (/vault). */
  featured: boolean;
  /** Hero on this cut’s category page (Filmmaking or Ads). */
  category_hero: boolean;
  /** Hero on this cut’s Genre page under Filmmaking. */
  genre_hero: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  tags: YailVaultTag[];
};

export function isYailVaultCategory(value: unknown): value is YailVaultCategory {
  return value === "filmmaking" || value === "ads";
}

export function isYailVaultTagKind(value: unknown): value is YailVaultTagKind {
  return value === "genre" || value === "subject" || value === "label" || value === "avatar";
}

export function yailVaultCategoryLabel(category: YailVaultCategory) {
  return YAIL_VAULT_CATEGORIES.find((c) => c.id === category)?.label ?? category;
}

export function tagsOfKind(entry: YailVaultEntry, kind: YailVaultTagKind) {
  return entry.tags.filter((t) => t.kind === kind);
}

/** Pick the flagged hero for a page, else fall back to the first cut. */
export function pickVaultHero(
  entries: YailVaultEntry[],
  kind: "featured" | "category" | "genre"
): YailVaultEntry | null {
  if (!entries.length) return null;
  if (kind === "featured") {
    return entries.find((e) => e.featured) ?? entries[0] ?? null;
  }
  if (kind === "category") {
    return entries.find((e) => e.category_hero) ?? entries[0] ?? null;
  }
  return entries.find((e) => e.genre_hero) ?? entries[0] ?? null;
}
