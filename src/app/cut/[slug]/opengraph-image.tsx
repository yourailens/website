import { ottCutYoutubeId } from "@/data/ott-cuts";
import { getOttCutBySlug } from "@/lib/ott-cuts/load";
import { OG_THUMB_HEIGHT, OG_THUMB_WIDTH } from "@/lib/seo/og-thumbnail";
import {
  ensureOttCutOgImage,
  mediaSourceForOg,
  renderOgImageFromSource,
} from "@/lib/seo/bake-og-image";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "YourAILens Studios cut";
export const size = { width: OG_THUMB_WIDTH, height: OG_THUMB_HEIGHT };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const cut = await getOttCutBySlug(slug);
  const yt = cut ? ottCutYoutubeId(cut.media_url) : null;
  const youtubeThumb = yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : null;

  const stored = cut ? await ensureOttCutOgImage({ ...cut, youtubeThumb }) : null;
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

  const source = cut
    ? mediaSourceForOg({
        poster_url: cut.poster_url,
        media_url: cut.media_url,
        media_type: cut.media_type,
        youtubeThumb,
      })
    : null;
  const png = await renderOgImageFromSource(source);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.byteLength),
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
