import { getVaultAvatarBySlug } from "@/lib/yail-vault/load";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import { ensureVaultAvatarOgImage, renderOgImageFromSource } from "@/lib/seo/bake-og-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "YAIL Vault AI Avatar";
export const size = { width: OG_THUMB_WIDTH, height: OG_THUMB_HEIGHT };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
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
        return new Response(new Uint8Array(buf), {
          headers: {
            "Content-Type": upstream.headers.get("content-type") || "image/png",
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
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
