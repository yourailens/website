import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";
import { uploadObjectToS3 } from "@/lib/s3/client";
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

/**
 * Bake a WhatsApp-safe JPEG to S3 and return its public URL.
 * Same public prefix as other vault media (`yail-vault/…`) so bucket policy allows it.
 */
export async function bakeVaultAvatarOgToS3(slug: string, portraitUrl: string): Promise<string> {
  const jpeg = await renderVaultAvatarOgJpeg(portraitUrl);
  const safe = slug.replace(/[^a-z0-9\-]/gi, "").toLowerCase() || "avatar";
  // Flat key next to other public vault objects (avoid nested paths some policies miss).
  const key = `yail-vault/og-${safe}.jpg`;
  const { publicUrl } = await uploadObjectToS3(key, jpeg, "image/jpeg");
  return publicUrl;
}

/**
 * Ensure the avatar has a stored public OG JPEG. Bakes + writes DB when missing.
 * Safe to call from metadata / image routes.
 */
export async function ensureVaultAvatarOgImage(avatar: {
  id: string;
  slug: string;
  portrait_url: string;
  og_image_url?: string | null;
}): Promise<string | null> {
  const existing = avatar.og_image_url?.trim();
  if (existing) {
    try {
      const head = await fetch(existing, { method: "HEAD", signal: AbortSignal.timeout(8_000) });
      if (head.ok) return existing;
    } catch {
      /* re-bake below */
    }
  }

  try {
    const { createServiceRoleClient } = await import("@/lib/supabase/admin");
    const url = await bakeVaultAvatarOgToS3(avatar.slug, avatar.portrait_url);
    const db = createServiceRoleClient();
    const { error } = await db
      .from("yail_vault_avatars")
      .update({ og_image_url: url })
      .eq("id", avatar.id);
    if (error) {
      // Column missing — still return the URL so this request can share.
      if (!/og_image_url|schema cache|does not exist/i.test(error.message)) {
        console.error("[vault-avatar-og] failed to persist", error.message);
      }
    }
    return url;
  } catch (e) {
    console.error("[vault-avatar-og] bake failed", e);
    return existing || null;
  }
}
