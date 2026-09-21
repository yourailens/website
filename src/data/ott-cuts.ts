export type OttCutCategory = "ads" | "films" | "community";
export type OttCutMediaType = "image" | "video";
export type OttCutAspect = "natural" | "portrait" | "square" | "landscape" | "wide" | "story";

export const OTT_CUT_CATEGORIES: { id: OttCutCategory; scene: string; label: string }[] = [
  { id: "ads", scene: "01", label: "AI ads" },
  { id: "films", scene: "02", label: "AI films" },
  { id: "community", scene: "03", label: "AI community" },
];

export const OTT_CUT_ASPECTS: { id: OttCutAspect; label: string; ratio?: number; className: string }[] = [
  { id: "natural", label: "Auto", className: "aspect-video" },
  { id: "story", label: "9:16", ratio: 9 / 16, className: "aspect-[9/16]" },
  { id: "portrait", label: "3:4", ratio: 3 / 4, className: "aspect-[3/4]" },
  { id: "square", label: "1:1", ratio: 1, className: "aspect-square" },
  { id: "landscape", label: "16:9", ratio: 16 / 9, className: "aspect-video" },
  { id: "wide", label: "21:9", ratio: 21 / 9, className: "aspect-[21/9]" },
];

export type OttCut = {
  id: string;
  slug: string;
  caption: string;
  description: string | null;
  category: OttCutCategory;
  media_type: OttCutMediaType;
  media_url: string;
  poster_url: string | null;
  aspect_ratio: OttCutAspect;
  published: boolean;
  sort_order: number;
  created_at: string;
};

export function ottCutCategoryLabel(id: OttCutCategory): string {
  return OTT_CUT_CATEGORIES.find((c) => c.id === id)?.label ?? id;
}

export function ottCutAspectLabel(id: OttCutAspect): string {
  return OTT_CUT_ASPECTS.find((a) => a.id === id)?.label ?? "Auto";
}

export function ottCutFrameClass(id: OttCutAspect): string {
  if (id === "natural") return "aspect-video";
  return OTT_CUT_ASPECTS.find((a) => a.id === id)?.className ?? "aspect-video";
}

export function ottCutYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([\w-]{11})/i);
  return m?.[1] ?? null;
}

export function ottCutYoutubeEmbed(url: string): string | null {
  const id = ottCutYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function guessOttCutMediaType(url: string): OttCutMediaType {
  if (ottCutYoutubeId(url)) return "video";
  if (/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(url)) return "video";
  return "image";
}
