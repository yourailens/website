import { NextResponse } from "next/server";
import sharp from "sharp";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH, isS3ImageUrlAllowedForOgProxy } from "@/lib/seo/og-thumbnail";

export const runtime = "nodejs";

const MAX_INPUT_BYTES = 25 * 1024 * 1024;

/**
 * GET /api/og/thumbnail?url=<https://bucket.s3.../key>
 * Returns a compressed JPEG (1200×630 cover) for WhatsApp / OG crawlers.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  if (!raw?.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let sourceUrl: string;
  try {
    sourceUrl = decodeURIComponent(raw);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!isS3ImageUrlAllowedForOgProxy(sourceUrl)) {
    return NextResponse.json({ error: "URL not allowed" }, { status: 403 });
  }

  let input: Buffer;
  try {
    const res = await fetch(sourceUrl, {
      headers: { Accept: "image/*" },
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
    if (!res.ok) {
      return NextResponse.redirect(sourceUrl, 302);
    }
    const ab = await res.arrayBuffer();
    if (ab.byteLength > MAX_INPUT_BYTES) {
      return NextResponse.redirect(sourceUrl, 302);
    }
    input = Buffer.from(ab);
  } catch {
    return NextResponse.redirect(sourceUrl, 302);
  }

  try {
    const out = await sharp(input)
      .rotate()
      .resize(OG_THUMB_WIDTH, OG_THUMB_HEIGHT, { fit: "cover", position: "attention" })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(out), {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.redirect(sourceUrl, 302);
  }
}
