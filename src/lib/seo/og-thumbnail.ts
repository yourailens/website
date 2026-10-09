import { getS3Env } from "@/lib/s3/config";

/** Output size for WhatsApp / OG (landscape card, small file). */
export const OG_THUMB_WIDTH = 1200;
export const OG_THUMB_HEIGHT = 630;

/** Only proxy URLs we own (same bucket as uploads) so the endpoint cannot be abused as an open proxy. */
export function isS3ImageUrlAllowedForOgProxy(href: string): boolean {
  const env = getS3Env();
  if (!env) return false;
  try {
    const u = new URL(href);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    const bucket = env.bucket.toLowerCase();
    const region = env.region.toLowerCase();
    const allowed = new Set([
      `${bucket}.s3.${region}.amazonaws.com`,
      `${bucket}.s3-${region}.amazonaws.com`,
      `${bucket}.s3.amazonaws.com`,
      `s3.${region}.amazonaws.com`,
      `s3-${region}.amazonaws.com`,
      "s3.amazonaws.com",
    ]);
    if (allowed.has(host)) return true;
    // Path-style: s3.region.amazonaws.com/bucket/...
    if (
      (host === `s3.${region}.amazonaws.com` ||
        host === `s3-${region}.amazonaws.com` ||
        host === "s3.amazonaws.com") &&
      u.pathname.toLowerCase().startsWith(`/${bucket}/`)
    ) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function buildOgThumbnailProxyUrl(siteOrigin: string, sourceHttpsUrl: string): string {
  const origin = siteOrigin.replace(/\/+$/, "");
  return `${origin}/api/og/thumbnail?url=${encodeURIComponent(sourceHttpsUrl)}`;
}
