import { NextResponse } from "next/server";
import { getVaultAvatarBySlug } from "@/lib/yail-vault/load";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import { renderVaultAvatarOgJpeg } from "@/lib/seo/vault-avatar-og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "YAIL Vault AI Avatar";
export const size = { width: OG_THUMB_WIDTH, height: OG_THUMB_HEIGHT };
export const contentType = "image/jpeg";

type Props = { params: Promise<{ slug: string }> };

/** Prefer the stored S3 share thumb; otherwise bake on the fly. */
export default async function Image({ params }: Props) {
  const { slug } = await params;
  const avatar = await getVaultAvatarBySlug(slug);

  if (avatar?.og_image_url) {
    return NextResponse.redirect(avatar.og_image_url, 307);
  }

  const jpeg = await renderVaultAvatarOgJpeg(avatar?.portrait_url);
  return new Response(new Uint8Array(jpeg), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
