export type IndustryMediaType = "image" | "video";
export type IndustryAspectRatio = "portrait" | "square" | "landscape";

export const MEDIA_TYPE_OPTIONS: { value: IndustryMediaType; label: string }[] = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
];

export const ASPECT_RATIO_OPTIONS: { value: IndustryAspectRatio; label: string; hint: string }[] = [
  { value: "portrait", label: "Portrait", hint: "9:16" },
  { value: "square", label: "Square", hint: "1:1" },
  { value: "landscape", label: "Landscape", hint: "16:9" },
];

export function aspectRatioClass(ratio: IndustryAspectRatio | null | undefined): string {
  switch (ratio) {
    case "portrait":
      return "aspect-[9/16]";
    case "square":
      return "aspect-square";
    default:
      return "aspect-video";
  }
}

export function inferMediaTypeFromUrl(url: string | null | undefined): IndustryMediaType | null {
  if (!url) return null;
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) ? "video" : "image";
}

export function resolveMediaType(
  explicit: IndustryMediaType | null | undefined,
  url: string | null | undefined
): IndustryMediaType {
  if (explicit === "image" || explicit === "video") return explicit;
  return inferMediaTypeFromUrl(url) ?? "image";
}
