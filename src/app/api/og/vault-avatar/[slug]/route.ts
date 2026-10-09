import { NextResponse } from "next/server";
import { getVaultAvatarBySlug } from "@/lib/yail-vault/load";
import { ensureVaultAvatarOgImage, renderOgImageFromSource } from "@/lib/seo/bake-og-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const avatar = await getVaultAvatarBySlug(slug);

  const stored = avatar ? await ensureVaultAvatarOgImage(avatar) : null;
  if (stored) {
    try {
      const upstream = await fetch(stored, {
        headers: { Accept: "image/png,image/jpeg,image/*" },
        cache: "no-store",
        signal: AbortSignal.timeout(20_000),
      });
      if (upstream.ok) {
        const buf = Buffer.from(await upstream.arrayBuffer());
        const type = upstream.headers.get("content-type") || "image/png";
        return new NextResponse(new Uint8Array(buf), {
          status: 200,
          headers: {
            "Content-Type": type,
            "Content-Length": String(buf.byteLength),
            "Cache-Control": "public, max-age=86400, s-maxage=604800",
          },
        });
      }
    } catch {
      /* fall through */
    }
  }

  const png = await renderOgImageFromSource(avatar?.portrait_url);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
