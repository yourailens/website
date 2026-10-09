import { NextResponse } from "next/server";
import { renderOgImageFromSource } from "@/lib/seo/bake-og-image";
import { isS3ImageUrlAllowedForOgProxy } from "@/lib/seo/og-thumbnail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/og/thumbnail?url=<https://bucket.s3.../key>
 * Returns a 1200×630 PNG for WhatsApp / OG crawlers (no sharp).
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

  try {
    const png = await renderOgImageFromSource(sourceUrl);
    if (!png.byteLength) return NextResponse.redirect(sourceUrl, 302);
    return new NextResponse(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.redirect(sourceUrl, 302);
  }
}
