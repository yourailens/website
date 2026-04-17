import {
  OG_THUMB_HEIGHT,
  OG_THUMB_WIDTH,
  buildOgThumbnailProxyUrl,
  isS3ImageUrlAllowedForOgProxy,
} from "@/lib/seo/og-thumbnail";

/** Same asset as homepage social preview — optimized JPEG on our origin. */
export const OG_FALLBACK_IMAGE_PATH = "/images/og-home.jpeg";

/** Pixel size of `public/images/og-home.jpeg` (update if you replace the file). */
export const OG_FALLBACK_IMAGE_WIDTH = 1179;
export const OG_FALLBACK_IMAGE_HEIGHT = 1372;

export function absoluteUrl(siteOrigin: string, pathOrUrl: string): string {
  const trimmed = siteOrigin.replace(/\/+$/, "");
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${trimmed}${path}`;
}

export function guessImageMimeType(url: string): string {
  const base = url.split("?")[0]?.toLowerCase() ?? "";
  if (base.endsWith(".png")) return "image/png";
  if (base.endsWith(".webp")) return "image/webp";
  if (base.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

function looksLikeVideoFile(url: string): boolean {
  const base = url.split("?")[0]?.toLowerCase() ?? "";
  return /\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(base);
}

/**
 * Waveyn-style: crawlers (esp. WhatsApp) need one absolute https image URL in og:image.
 * S3 gallery assets: use on-the-fly compressed 1200×630 JPEG via `/api/og/thumbnail` so crawlers
 * do not download huge originals. Other URLs: use as-is.
 */
export function pickOgImageForShare(
  siteOrigin: string,
  src: string
): {
  url: string;
  type: string;
  width?: number;
  height?: number;
} {
  const abs = absoluteUrl(siteOrigin, src);

  if (looksLikeVideoFile(src)) {
    const fallback = absoluteUrl(siteOrigin, OG_FALLBACK_IMAGE_PATH);
    return {
      url: fallback,
      type: "image/jpeg",
      width: OG_FALLBACK_IMAGE_WIDTH,
      height: OG_FALLBACK_IMAGE_HEIGHT,
    };
  }

  // Film posters are already 1200×630 JPEG on S3 — no second resize pass.
  if (isS3ImageUrlAllowedForOgProxy(abs) && abs.includes("/gallery/posters/")) {
    return {
      url: abs,
      type: "image/jpeg",
      width: OG_THUMB_WIDTH,
      height: OG_THUMB_HEIGHT,
    };
  }

  if (isS3ImageUrlAllowedForOgProxy(abs)) {
    return {
      url: buildOgThumbnailProxyUrl(siteOrigin, abs),
      type: "image/jpeg",
      width: OG_THUMB_WIDTH,
      height: OG_THUMB_HEIGHT,
    };
  }

  return {
    url: abs,
    type: guessImageMimeType(src),
  };
}
