import { NextResponse } from "next/server";
import { getVaultAvatarBySlug } from "@/lib/yail-vault/load";
import { ensureVaultAvatarOgImage, renderVaultAvatarOgJpeg } from "@/lib/seo/vault-avatar-og";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ slug: string }> };

/**
 * Always returns a JPEG body (never redirect) — WhatsApp often drops redirected og:image.
 */
export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const avatar = await getVaultAvatarBySlug(slug);

  // Prefer fetching the baked public object so crawlers get a tiny file fast.
  const stored = avatar ? await ensureVaultAvatarOgImage(avatar) : null;
  if (stored) {
    try {
      const upstream = await fetch(stored, {
        headers: { Accept: "image/jpeg,image/*" },
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      if (upstream.ok) {
        const buf = Buffer.from(await upstream.arrayBuffer());
        return new NextResponse(new Uint8Array(buf), {
          status: 200,
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": String(buf.byteLength),
            "Cache-Control": "public, max-age=86400, s-maxage=604800",
          },
        });
      }
    } catch {
      /* fall through to live bake */
    }
  }

  const jpeg = await renderVaultAvatarOgJpeg(avatar?.portrait_url);
  return new NextResponse(new Uint8Array(jpeg), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
