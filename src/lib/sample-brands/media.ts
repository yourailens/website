import type { SampleBrandAspectRatio, SampleBrandMediaType } from "@/data/sample-brands";

export function inferMediaTypeFromUrl(url: string | null | undefined): SampleBrandMediaType | null {
  if (!url) return null;
  return /\.(mp4|webm|mov)(\?|$)/i.test(url) ? "video" : "image";
}

export function resolveMediaType(
  explicit: SampleBrandMediaType | null | undefined,
  url: string | null | undefined
): SampleBrandMediaType {
  if (explicit === "image" || explicit === "video") return explicit;
  return inferMediaTypeFromUrl(url) ?? "image";
}

export function aspectRatioClass(ratio: SampleBrandAspectRatio | null | undefined): string {
  switch (ratio) {
    case "portrait":
      return "aspect-[9/16]";
    case "portrait_45":
      return "aspect-[4/5]";
    case "square":
      return "aspect-square";
    case "ultrawide":
      return "aspect-[21/9]";
    default:
      return "aspect-video";
  }
}

/** Masonry span hints — wider tiles for cinematic ratios */
export function masonrySpanClass(ratio: SampleBrandAspectRatio): string {
  if (ratio === "ultrawide" || ratio === "landscape") return "sm:col-span-2";
  return "sm:col-span-1";
}
