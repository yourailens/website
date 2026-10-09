import { NextResponse } from "next/server";
import sharp from "sharp";
import { getVaultAvatarBySlug } from "@/lib/yail-vault/load";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH, isS3ImageUrlAllowedForOgProxy } from "@/lib/seo/og-thumbnail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INPUT_BYTES = 25 * 1024 * 1024;

type Ctx = { params: Promise<{ slug: string }> };

/** Allow our S3 vault portraits even if hostname form differs slightly from env. */
function isAllowedPortraitUrl(href: string): boolean {
  if (isS3ImageUrlAllowedForOgProxy(href)) return true;
  try {
    const u = new URL(href);
    if (u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    const path = u.pathname.toLowerCase();
    const looksS3 =
      host.endsWith(".amazonaws.com") ||
      host.endsWith(".cloudfront.net");
    return looksS3 && path.includes("yail-vault");
  } catch {
    return false;
  }
}

/**
 * GET /api/og/vault-avatar/[slug]
 * Compressed 1200×630 JPEG from the avatar DP for WhatsApp / OG crawlers.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const avatar = await getVaultAvatarBySlug(slug);
  if (!avatar?.portrait_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const sourceUrl = avatar.portrait_url.trim();
  if (!isAllowedPortraitUrl(sourceUrl)) {
    return NextResponse.json({ error: "Portrait URL not allowed" }, { status: 403 });
  }

  let input: Buffer;
  try {
    const res = await fetch(sourceUrl, {
      headers: { Accept: "image/*" },
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch portrait" }, { status: 502 });
    }
    const ab = await res.arrayBuffer();
    if (ab.byteLength > MAX_INPUT_BYTES) {
      return NextResponse.json({ error: "Portrait too large" }, { status: 413 });
    }
    input = Buffer.from(ab);
  } catch {
    return NextResponse.json({ error: "Failed to fetch portrait" }, { status: 502 });
  }

  try {
    // Face-friendly crop: prefer upper/attention region of portrait DPs.
    let pipeline = sharp(input).rotate().resize(OG_THUMB_WIDTH, OG_THUMB_HEIGHT, {
      fit: "cover",
      position: "attention",
    });

    let out = await pipeline.jpeg({ quality: 78, mozjpeg: true }).toBuffer();

    // WhatsApp is picky about large previews — shrink further if needed.
    if (out.byteLength > 280_000) {
      out = await sharp(input)
        .rotate()
        .resize(OG_THUMB_WIDTH, OG_THUMB_HEIGHT, { fit: "cover", position: "attention" })
        .jpeg({ quality: 62, mozjpeg: true })
        .toBuffer();
    }

    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to process portrait" }, { status: 500 });
  }
}
