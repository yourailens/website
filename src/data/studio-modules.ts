/** Gallery-based Modules — Prompt Playbooks, Client Showcases, Subjects & Visuals */

export type StudioModuleType =
  | "prompt_playbooks"
  | "client_showcases"
  | "subjects_visuals";

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
  "subjects_visuals",
];

export const STUDIO_MODULE_TYPE_SLUGS: Record<StudioModuleType, string> = {
  prompt_playbooks: "prompt-playbooks",
  client_showcases: "client-showcases",
  subjects_visuals: "subjects-visuals",
};

export const STUDIO_MODULE_SLUG_TO_TYPE: Record<string, StudioModuleType> = {
  "prompt-playbooks": "prompt_playbooks",
  "client-showcases": "client_showcases",
  "subjects-visuals": "subjects_visuals",
};

export const STUDIO_MODULE_TYPE_LABELS: Record<StudioModuleType, string> = {
  prompt_playbooks: "Prompt Playbooks",
  client_showcases: "Client Showcases",
  subjects_visuals: "Subjects & Visuals",
};

export const STUDIO_MODULE_TYPE_DESCRIPTIONS: Record<StudioModuleType, string> = {
  prompt_playbooks:
    "Shot-by-shot prompt galleries. Copy prompts, study structure, and reproduce the look.",
  client_showcases:
    "Campaign work and client deliverables. Films, stills, and launch assets.",
  subjects_visuals:
    "Subject-led visuals. Hero shots, styling, and commerce-ready imagery.",
};

export const STUDIO_MODULE_TYPE_ACCENTS: Record<StudioModuleType, string> = {
  prompt_playbooks: "bg-violet-50 text-violet-700 border-violet-200",
  client_showcases: "bg-blue-50 text-blue-700 border-blue-200",
  subjects_visuals: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

/** Types that use the playbook-style series cards + strip hero + masonry gallery. */
export function studioModuleUsesSeriesLayout(type: StudioModuleType): boolean {
  return type === "prompt_playbooks" || type === "client_showcases";
}

export const STUDIO_MODULE_LIST_BACK_LABEL: Record<StudioModuleType, string> = {
  prompt_playbooks: "All playbooks",
  client_showcases: "All showcases",
  subjects_visuals: "All subjects",
};

export const STUDIO_MODULE_SERIES_LABEL: Record<StudioModuleType, string> = {
  prompt_playbooks: "Episode",
  client_showcases: "Showcase",
  subjects_visuals: "Volume",
};

export type StudioModuleSeriesTheme = {
  ring: string;
  glow: string;
  cta: string;
  num: string;
  link: string;
  linkHover: string;
  episode: string;
  hoverTitle: string;
  coverBorder: string;
  heroBorder: string;
  heroBg: string;
  heroDivider: string;
  heroDescBorder: string;
  headerAccent: string;
  cardGradient: string;
};

export const STUDIO_MODULE_SERIES_THEME: Record<StudioModuleType, StudioModuleSeriesTheme> = {
  prompt_playbooks: {
    ring: "group-hover:ring-violet-200",
    glow: "group-hover:shadow-violet-200/60",
    cta: "text-violet-700",
    num: "text-violet-200",
    link: "text-violet-600",
    linkHover: "hover:text-violet-800",
    episode: "text-violet-600",
    hoverTitle: "group-hover:text-violet-900",
    coverBorder: "border-violet-100",
    heroBorder: "border-violet-100/90",
    heroBg: "bg-gradient-to-r from-[#faf8ff] via-white to-[#f6f2ff]",
    heroDivider: "bg-violet-200/80",
    heroDescBorder: "border-violet-100/70",
    headerAccent: "text-violet-600",
    cardGradient: "from-slate-100 via-violet-50/30 to-slate-200",
  },
  client_showcases: {
    ring: "group-hover:ring-blue-200",
    glow: "group-hover:shadow-blue-200/60",
    cta: "text-blue-700",
    num: "text-blue-200",
    link: "text-blue-600",
    linkHover: "hover:text-blue-800",
    episode: "text-blue-600",
    hoverTitle: "group-hover:text-blue-900",
    coverBorder: "border-blue-100",
    heroBorder: "border-blue-100/90",
    heroBg: "bg-gradient-to-r from-[#f8fbff] via-white to-[#eef4ff]",
    heroDivider: "bg-blue-200/80",
    heroDescBorder: "border-blue-50",
    headerAccent: "text-blue-600",
    cardGradient: "from-slate-100 via-blue-50/40 to-slate-200",
  },
  subjects_visuals: {
    ring: "group-hover:ring-emerald-200",
    glow: "group-hover:shadow-emerald-200/60",
    cta: "text-emerald-700",
    num: "text-emerald-200",
    link: "text-emerald-600",
    linkHover: "hover:text-emerald-800",
    episode: "text-emerald-600",
    hoverTitle: "group-hover:text-emerald-900",
    coverBorder: "border-emerald-100",
    heroBorder: "border-emerald-100/90",
    heroBg: "bg-gradient-to-r from-[#f6fdf9] via-white to-[#eef8f1]",
    heroDivider: "bg-emerald-200/80",
    heroDescBorder: "border-emerald-50",
    headerAccent: "text-emerald-600",
    cardGradient: "from-slate-100 via-emerald-50/30 to-slate-200",
  },
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
