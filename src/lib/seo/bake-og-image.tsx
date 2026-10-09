import { ImageResponse } from "next/og";
import { uploadObjectToS3 } from "@/lib/s3/client";
import { mediaSourceForOg } from "@/lib/seo/bake-og-source";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import { CANONICAL_SITE_ORIGIN, siteOriginForMetadata } from "@/lib/site-url";

export { mediaSourceForOg } from "@/lib/seo/bake-og-source";

function absoluteSource(source: string | null | undefined): string {
  const trimmed = source?.trim();
  const origin = siteOriginForMetadata() || CANONICAL_SITE_ORIGIN;
  if (!trimmed) return `${origin}/images/og-home.jpeg`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${origin}${trimmed}`;
  return `${origin}/images/og-home.jpeg`;
}

/**
 * WhatsApp-safe 1200×630 share image via next/og (no sharp / native binaries).
 * Returns PNG bytes.
 */
export async function renderOgImageFromSource(source: string | null | undefined): Promise<Buffer> {
  const src = absoluteSource(source);
  try {
    const res = new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            background: "#050505",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            width={OG_THUMB_WIDTH}
            height={OG_THUMB_HEIGHT}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      ),
      { width: OG_THUMB_WIDTH, height: OG_THUMB_HEIGHT }
    );
    return Buffer.from(await res.arrayBuffer());
  } catch {
    // Last resort — fetch the static site OG jpeg and return as-is (already small).
    try {
      const fallback = absoluteSource(null);
      const upstream = await fetch(fallback, {
        cache: "force-cache",
        signal: AbortSignal.timeout(15_000),
      });
      if (upstream.ok) return Buffer.from(await upstream.arrayBuffer());
    } catch {
      /* empty */
    }
    return Buffer.alloc(0);
  }
}

/** @deprecated alias — returns PNG bytes (not JPEG). */
export async function renderOgJpegFromSource(source: string | null | undefined): Promise<Buffer> {
  return renderOgImageFromSource(source);
}

export async function bakeOgJpegToS3(keyPrefix: string, slug: string, sourceUrl: string): Promise<string> {
  const png = await renderOgImageFromSource(sourceUrl);
  if (!png.byteLength) throw new Error("Failed to render OG image");
  const safe = slug.replace(/[^a-z0-9\-]/gi, "").toLowerCase() || "cut";
  const prefix = keyPrefix.replace(/\/+$/, "") || "yail-vault";
  const key = `${prefix}/og-${safe}.png`;
  const { publicUrl } = await uploadObjectToS3(key, png, "image/png");
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

export async function ensureVaultAvatarOgImage(avatar: {
  id: string;
  slug: string;
  portrait_url: string;
  og_image_url?: string | null;
}): Promise<string | null> {
  return ensureBakedOgImage({
    id: avatar.id,
    slug: avatar.slug,
    sourceUrl: avatar.portrait_url,
    og_image_url: avatar.og_image_url,
    table: "yail_vault_avatars",
    s3Prefix: "yail-vault",
  });
}

export async function renderVaultAvatarOgJpeg(portraitUrl: string | null | undefined): Promise<Buffer> {
  return renderOgImageFromSource(portraitUrl);
}

export async function bakeVaultAvatarOgToS3(slug: string, portraitUrl: string): Promise<string> {
  return bakeOgJpegToS3("yail-vault", slug, portraitUrl);
}
