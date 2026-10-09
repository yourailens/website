import { NextResponse } from "next/server";
import { getVaultEntryBySlug } from "@/lib/yail-vault/load";
import {
  ensureVaultEntryOgImage,
  mediaSourceForOg,
  renderOgImageFromSource,
} from "@/lib/seo/bake-og-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const entry = await getVaultEntryBySlug(slug);

  const stored = entry ? await ensureVaultEntryOgImage(entry) : null;
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

  const source = entry
    ? mediaSourceForOg({
        poster_url: entry.poster_url,
        media_url: entry.media_url,
        media_type: entry.media_type,
      })
    : null;
  const png = await renderOgImageFromSource(source);
  return new NextResponse(new Uint8Array(png), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
