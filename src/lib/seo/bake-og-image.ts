import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH, isS3ImageUrlAllowedForOgProxy } from "@/lib/seo/og-thumbnail";

const MAX_INPUT_BYTES = 25 * 1024 * 1024;

function isAllowedSourceUrl(href: string): boolean {
  if (isS3ImageUrlAllowedForOgProxy(href)) return true;
  try {
    const u = new URL(href);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "i.ytimg.com" || host === "img.youtube.com") return true;
    if (host.endsWith(".amazonaws.com") || host.endsWith(".cloudfront.net")) return true;
    return false;
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
    .jpeg({ quality: 78, mozjpeg: true, progressive: false })
    .toBuffer();
}

async function loadLocalPublic(rel: string): Promise<Buffer | null> {
  try {
    const clean = rel.split("?")[0]?.split("#")[0] ?? rel;
    if (!clean.startsWith("/") || clean.includes("..")) return null;
    return await readFile(path.join(process.cwd(), "public", clean.slice(1)));
  } catch {
    return null;
  }
}

/** WhatsApp-safe 1200×630 JPEG from a remote or /public image. */
export async function renderOgJpegFromSource(source: string | null | undefined): Promise<Buffer> {
  const trimmed = source?.trim();
  if (!trimmed) return fallbackOgJpeg();

  try {
    let input: Buffer | null = null;
    if (trimmed.startsWith("/")) {
      input = await loadLocalPublic(trimmed);
    } else if (isAllowedSourceUrl(trimmed)) {
      const res = await fetch(trimmed, {
        headers: { Accept: "image/*" },
        cache: "no-store",
        signal: AbortSignal.timeout(45_000),
      });
      if (res.ok) {
        const ab = await res.arrayBuffer();
        if (ab.byteLength > 0 && ab.byteLength <= MAX_INPUT_BYTES) {
          input = Buffer.from(ab);
        }
      }
    }
    if (!input) return fallbackOgJpeg();

    let out = await sharp(input)
      .rotate()
      .resize(OG_THUMB_WIDTH, OG_THUMB_HEIGHT, { fit: "cover", position: "attention" })
      .jpeg({ quality: 78, mozjpeg: true, progressive: false })
      .toBuffer();

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

export async function bakeOgJpegToS3(keyPrefix: string, slug: string, sourceUrl: string): Promise<string> {
  const jpeg = await renderOgJpegFromSource(sourceUrl);
  const safe = slug.replace(/[^a-z0-9\-]/gi, "").toLowerCase() || "cut";
  const prefix = keyPrefix.replace(/\/+$/, "") || "yail-vault";
  const key = `${prefix}/og-${safe}.jpg`;
  const { publicUrl } = await uploadObjectToS3(key, jpeg, "image/jpeg");
  return publicUrl;
}

type EnsureArgs = {
  id: string;
  slug: string;
  sourceUrl: string;
  og_image_url?: string | null;
  table: "yail_vault_avatars" | "yail_vault_entries" | "ott_cuts";
  s3Prefix: string;
};

/** Bake + persist og_image_url when missing or unreachable. */
export async function ensureBakedOgImage(args: EnsureArgs): Promise<string | null> {
  const existing = args.og_image_url?.trim();
  if (existing) {
    try {
      const head = await fetch(existing, { method: "HEAD", signal: AbortSignal.timeout(8_000) });
      if (head.ok) return existing;
    } catch {
      /* re-bake */
    }
  }

  if (!args.sourceUrl.trim()) return existing || null;

  try {
    const { createServiceRoleClient } = await import("@/lib/supabase/admin");
    const url = await bakeOgJpegToS3(args.s3Prefix, args.slug, args.sourceUrl);
    const db = createServiceRoleClient();
    const { error } = await db.from(args.table).update({ og_image_url: url }).eq("id", args.id);
    if (error && !/og_image_url|schema cache|does not exist/i.test(error.message)) {
      console.error(`[bake-og] persist ${args.table}`, error.message);
    }
    return url;
  } catch (e) {
    console.error(`[bake-og] bake ${args.table}`, e);
    return existing || null;
  }
}

export function mediaSourceForOg(opts: {
  poster_url?: string | null;
  media_url?: string | null;
  media_type?: string | null;
  youtubeThumb?: string | null;
}): string {
  if (opts.poster_url?.trim()) return opts.poster_url.trim();
  if (opts.youtubeThumb?.trim()) return opts.youtubeThumb.trim();
  if (opts.media_type === "image" && opts.media_url?.trim()) return opts.media_url.trim();
  return "";
}

export async function ensureVaultEntryOgImage(entry: {
  id: string;
  slug: string;
  media_type: string;
  media_url: string;
  poster_url?: string | null;
  og_image_url?: string | null;
}): Promise<string | null> {
  const sourceUrl = mediaSourceForOg({
    poster_url: entry.poster_url,
    media_url: entry.media_url,
    media_type: entry.media_type,
  });
  return ensureBakedOgImage({
    id: entry.id,
    slug: entry.slug,
    sourceUrl,
    og_image_url: entry.og_image_url,
    table: "yail_vault_entries",
    s3Prefix: "yail-vault",
  });
}

export async function ensureOttCutOgImage(cut: {
  id: string;
  slug: string;
  media_type: string;
  media_url: string;
  poster_url?: string | null;
  og_image_url?: string | null;
  youtubeThumb?: string | null;
}): Promise<string | null> {
  const sourceUrl = mediaSourceForOg({
    poster_url: cut.poster_url,
    media_url: cut.media_url,
    media_type: cut.media_type,
    youtubeThumb: cut.youtubeThumb,
  });
  return ensureBakedOgImage({
    id: cut.id,
    slug: cut.slug,
    sourceUrl,
    og_image_url: cut.og_image_url,
    table: "ott_cuts",
    s3Prefix: "ott-cuts",
  });
}
