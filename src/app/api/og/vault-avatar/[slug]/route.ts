import { NextResponse } from "next/server";
import { getVaultAvatarBySlug } from "@/lib/yail-vault/load";
import { renderVaultAvatarOgJpeg } from "@/lib/seo/vault-avatar-og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ slug: string }> };

/**
 * GET /api/og/vault-avatar/[slug]
 * Prefer the pre-baked S3 share thumb; otherwise compress on the fly.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const avatar = await getVaultAvatarBySlug(slug);

  if (avatar?.og_image_url) {
    return NextResponse.redirect(avatar.og_image_url, 307);
  }

  const jpeg = await renderVaultAvatarOgJpeg(avatar?.portrait_url);

  return new NextResponse(new Uint8Array(jpeg), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
