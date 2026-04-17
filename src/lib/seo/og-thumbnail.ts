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
    const expected = `${env.bucket}.s3.${env.region}.amazonaws.com`;
    return u.hostname.toLowerCase() === expected.toLowerCase();
  } catch {
    return false;
  }
}

export function buildOgThumbnailProxyUrl(siteOrigin: string, sourceHttpsUrl: string): string {
  const origin = siteOrigin.replace(/\/+$/, "");
  return `${origin}/api/og/thumbnail?url=${encodeURIComponent(sourceHttpsUrl)}`;
}
