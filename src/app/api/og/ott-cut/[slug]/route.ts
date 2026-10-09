import { NextResponse } from "next/server";
import { ottCutYoutubeId } from "@/data/ott-cuts";
import { getOttCutBySlug } from "@/lib/ott-cuts/load";
import {
  ensureOttCutOgImage,
  mediaSourceForOg,
  renderOgJpegFromSource,
} from "@/lib/seo/bake-og-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const cut = await getOttCutBySlug(slug);
  const yt = cut ? ottCutYoutubeId(cut.media_url) : null;
  const youtubeThumb = yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null;

  const stored = cut ? await ensureOttCutOgImage({ ...cut, youtubeThumb }) : null;
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
      /* fall through */
    }
  }

  const source = cut
    ? mediaSourceForOg({
        poster_url: cut.poster_url,
        media_url: cut.media_url,
        media_type: cut.media_type,
        youtubeThumb,
      })
    : null;
  const jpeg = await renderOgJpegFromSource(source);
  return new NextResponse(new Uint8Array(jpeg), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpeg.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
