import type { Industry, IndustryPlaybookExample } from "@/data/industries";
import type { IndustryAspectRatio, IndustryMediaType } from "@/data/industries";
import { resolveMediaType } from "@/lib/industries/media";

export type ResolvedHeroMedia = {
  url: string;
  mediaType: IndustryMediaType;
  aspectRatio: IndustryAspectRatio;
  posterUrl: string | null;
  caption: string | null;
};

function slotFromUrl(
  url: string,
  mediaType: IndustryMediaType,
  aspectRatio: IndustryAspectRatio,
  posterUrl: string | null,
  caption: string | null
): ResolvedHeroMedia {
  return {
    url,
    mediaType: resolveMediaType(mediaType, url),
    aspectRatio,
    posterUrl,
    caption: caption?.trim() || null,
  };
}

/** Industry page top visual: main (hero) URL, or legacy cover URL if main is empty */
export function resolveIndustryHeroMedia(industry: Industry): ResolvedHeroMedia | null {
  const main = industry.hero_image_url?.trim();
  if (main) {
    return slotFromUrl(
      main,
      industry.hero_media_type,
      industry.hero_aspect_ratio,
      industry.hero_poster_url,
      industry.hero_caption
    );
  }
  const fallback = industry.cover_image_url?.trim();
  if (fallback) {
    return slotFromUrl(
      fallback,
      industry.cover_media_type,
      industry.cover_aspect_ratio,
      industry.cover_poster_url,
      null
    );
  }
  return null;
}

/** First published gallery visual for a playbook (module cover on cards & listings). */
export function resolvePlaybookCoverExample(
  examples: IndustryPlaybookExample[]
): IndustryPlaybookExample | undefined {
  return examples
    .filter((e) => e.published && e.media_url?.trim())
    .sort((a, b) => a.sort_order - b.sort_order)[0];
}

/** Playbook page: first published example, then cover, then industry hero */
export function resolvePlaybookHeroMedia(
  industry: Industry,
  examples: IndustryPlaybookExample[]
): ResolvedHeroMedia | null {
  const ex = resolvePlaybookCoverExample(examples);
  if (ex) {
    return {
      url: ex.media_url,
      mediaType: ex.media_type,
      aspectRatio: ex.aspect_ratio,
      posterUrl: ex.poster_url,
      caption: ex.caption,
    };
  }
  return resolveIndustryHeroMedia(industry);
}
