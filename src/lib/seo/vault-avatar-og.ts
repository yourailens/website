import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH, isS3ImageUrlAllowedForOgProxy } from "@/lib/seo/og-thumbnail";

const MAX_INPUT_BYTES = 25 * 1024 * 1024;

/** Allow vault portraits even if hostname form differs slightly from env. */
export function isAllowedVaultPortraitUrl(href: string): boolean {
  if (isS3ImageUrlAllowedForOgProxy(href)) return true;
  try {
    const u = new URL(href);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    const pathName = u.pathname.toLowerCase();
    const looksS3 = host.endsWith(".amazonaws.com") || host.endsWith(".cloudfront.net");
    return looksS3 && pathName.includes("yail-vault");
  } catch {
    return false;
  }
}

async function fallbackOgJpeg(): Promise<Buffer> {
  const file = path.join(process.cwd(), "public", "images", "og-home.jpeg");
  const raw = await readFile(file);
  return sharp(raw)
    .rotate()
    .resize(OG_THUMB_WIDTH, OG_THUMB_HEIGHT, { fit: "cover", position: "attention" })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();
}

/**
 * Build a WhatsApp-safe 1200×630 JPEG for an avatar DP.
 * Never throws for missing/invalid source — returns site OG fallback instead.
 */
export async function renderVaultAvatarOgJpeg(portraitUrl: string | null | undefined): Promise<Buffer> {
  const sourceUrl = portraitUrl?.trim();
  if (!sourceUrl || !isAllowedVaultPortraitUrl(sourceUrl)) {
    return fallbackOgJpeg();
  }

  try {
    const res = await fetch(sourceUrl, {
      headers: { Accept: "image/*" },
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) return fallbackOgJpeg();
    const ab = await res.arrayBuffer();
    if (ab.byteLength === 0 || ab.byteLength > MAX_INPUT_BYTES) return fallbackOgJpeg();

    const input = Buffer.from(ab);
    let out = await sharp(input)
      .rotate()
      .resize(OG_THUMB_WIDTH, OG_THUMB_HEIGHT, { fit: "cover", position: "attention" })
      .jpeg({ quality: 78, mozjpeg: true, progressive: false })
      .toBuffer();

    // WhatsApp drops large previews — shrink further if needed.
    if (out.byteLength > 280_000) {
      out = await sharp(input)
        .rotate()
        .resize(OG_THUMB_WIDTH, OG_THUMB_HEIGHT, { fit: "cover", position: "attention" })
        .jpeg({ quality: 58, mozjpeg: true, progressive: false })
        .toBuffer();
    }

    return out;
  } catch {
    return fallbackOgJpeg();
  }
}
