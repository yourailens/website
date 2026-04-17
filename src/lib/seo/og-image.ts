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
