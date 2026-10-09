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
  /** Pixel size of the media frame (any ratio). Null until measured. */
  aspect_width: number | null;
  aspect_height: number | null;
  /** Catalog id from YAIL_VAULT_AI_MODELS */
  ai_model: string | null;
  /** FKs to yail_vault_avatars (many-to-many) */
  avatar_ids: string[];
  featured: boolean;
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
