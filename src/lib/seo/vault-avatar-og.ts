/**
 * Avatar OG helpers — sharp-free, delegates to next/og bake pipeline.
 * Kept as a stable import path for existing routes.
 */
export {
  bakeVaultAvatarOgToS3,
  ensureVaultAvatarOgImage,
  renderVaultAvatarOgJpeg,
} from "@/lib/seo/bake-og-image";

export function isAllowedVaultPortraitUrl(href: string): boolean {
  try {
    const u = new URL(href);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    return host.endsWith(".amazonaws.com") || host.endsWith(".cloudfront.net") || host === "i.ytimg.com";
  } catch {
    return false;
  }
}
