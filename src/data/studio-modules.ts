/** Gallery-based Modules — Prompt Playbooks, Client Showcases, Products & Visuals */

export type StudioModuleType =
  | "prompt_playbooks"
  | "client_showcases"
  | "products_visuals";

export type StudioModuleMediaType = "image" | "video";

export type StudioModuleAspect =
  | "natural"
  | "portrait"
  | "square"
  | "landscape"
  | "wide"
  | "story";

export const ALL_STUDIO_MODULE_TYPES: StudioModuleType[] = [
  "prompt_playbooks",
  "client_showcases",
  "products_visuals",
];

export const STUDIO_MODULE_TYPE_SLUGS: Record<StudioModuleType, string> = {
  prompt_playbooks: "prompt-playbooks",
  client_showcases: "client-showcases",
  products_visuals: "products-visuals",
};

export const STUDIO_MODULE_SLUG_TO_TYPE: Record<string, StudioModuleType> = {
  "prompt-playbooks": "prompt_playbooks",
  "client-showcases": "client_showcases",
  "products-visuals": "products_visuals",
};

export const STUDIO_MODULE_TYPE_LABELS: Record<StudioModuleType, string> = {
  prompt_playbooks: "Prompt Playbooks",
  client_showcases: "Client Showcases",
  products_visuals: "Products & Visuals",
};

export const STUDIO_MODULE_TYPE_DESCRIPTIONS: Record<StudioModuleType, string> = {
  prompt_playbooks:
    "Shot-by-shot prompt galleries. Copy prompts, study structure, and reproduce the look.",
  client_showcases:
    "Campaign work and client deliverables — films, stills, and launch assets.",
  products_visuals:
    "Product-led visuals — hero shots, packaging, and commerce-ready imagery.",
};

export const STUDIO_MODULE_TYPE_ACCENTS: Record<StudioModuleType, string> = {
  prompt_playbooks: "bg-violet-50 text-violet-700 border-violet-200",
  client_showcases: "bg-blue-50 text-blue-700 border-blue-200",
  products_visuals: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function studioModuleTypeFromSlug(slug: string): StudioModuleType | null {
  return STUDIO_MODULE_SLUG_TO_TYPE[slug] ?? null;
}

export function studioModuleTypeSlug(type: StudioModuleType): string {
  return STUDIO_MODULE_TYPE_SLUGS[type];
}

export function studioModuleDetailPath(type: StudioModuleType, moduleSlug: string): string {
  return `/modules/${studioModuleTypeSlug(type)}/${moduleSlug}`;
}

export const STUDIO_MODULE_COVER_ASPECT: StudioModuleAspect = "portrait";

export function studioModuleListPath(type: StudioModuleType): string {
  return `/modules/${studioModuleTypeSlug(type)}`;
}

export interface StudioModuleItem {
  id: string;
  module_id: string;
  media_type: StudioModuleMediaType;
  image_url: string | null;
  video_url: string | null;
  poster_url: string | null;
  aspect_ratio: StudioModuleAspect;
  caption: string | null;
  prompt: string | null;
  sort_order: number;
  created_at: string;
}

export interface StudioModule {
  id: string;
  slug: string;
  module_type: StudioModuleType;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  cover_aspect: StudioModuleAspect;
  published: boolean;
  featured: boolean;
  sort_order: number;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface StudioModuleWithItems extends StudioModule {
  items: StudioModuleItem[];
}

export function studioModuleItemMediaUrl(item: StudioModuleItem): string | null {
  if (item.media_type === "video") return item.video_url?.trim() || null;
  return item.image_url?.trim() || null;
}

export function studioModuleCoverUrl(mod: StudioModule, items?: StudioModuleItem[]): string | null {
  if (mod.cover_image_url?.trim()) return mod.cover_image_url.trim();
  const first = items?.find((i) => studioModuleItemMediaUrl(i));
  return first ? studioModuleItemMediaUrl(first) : null;
}

/** Best still image for link previews (WhatsApp, OG). Prefers cover, then first gallery image. */
export function studioModuleShareImageUrl(mod: StudioModule, items?: StudioModuleItem[]): string | null {
  if (mod.cover_image_url?.trim()) return mod.cover_image_url.trim();
  const firstImage = items?.find((i) => i.media_type === "image" && i.image_url?.trim());
  if (firstImage?.image_url?.trim()) return firstImage.image_url.trim();
  return null;
}

/** Trailing episode number from titles like "Prompt Playbooks 01". */
export function studioModuleEpisodeLabel(title: string): string | null {
  const match = title.trim().match(/\s(\d{1,4})$/);
  return match ? match[1].padStart(2, "0") : null;
}

/** Title with trailing episode number removed for display. */
export function studioModuleDisplayTitle(title: string): string {
  return title.replace(/\s\d{1,4}$/, "").trim() || title;
}
