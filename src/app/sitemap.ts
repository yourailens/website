import type { MetadataRoute } from "next";
import { getGalleryFilms, getGalleryImages } from "@/lib/gallery/load";
import { galleryRouteId } from "@/lib/gallery/route-id";
import { getAvatarSummaries } from "@/lib/avatars/load";
import { getPublishedPrompts } from "@/lib/prompts/load";
import { getPublishedOutfits } from "@/lib/outfits/load";
import { getPublishedScenarios } from "@/lib/scenarios/load";
import { getPublishedLocations } from "@/lib/locations/load";

function siteOrigin(): string {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteOrigin();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/images`, lastModified: new Date() },
    { url: `${base}/films`, lastModified: new Date() },
    { url: `${base}/events`, lastModified: new Date() },
    { url: `${base}/events/ai-creator-workshop`, lastModified: new Date() },
    { url: `${base}/events/ai-creator-workshop/day-1`, lastModified: new Date() },
    { url: `${base}/events/ai-creator-workshop/day-2`, lastModified: new Date() },
    { url: `${base}/avatars`, lastModified: new Date() },
    { url: `${base}/pricing`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    { url: `${base}/prompts`, lastModified: new Date() },
    { url: `${base}/outfits`, lastModified: new Date() },
    { url: `${base}/scenarios`, lastModified: new Date() },
    { url: `${base}/locations`, lastModified: new Date() },
    { url: `${base}/instagram`, lastModified: new Date() },
    { url: `${base}/youtube`, lastModified: new Date() },
  ];

  // Best-effort dynamic URLs (admin-uploaded gallery + avatar pages).
  // If DB is unavailable at build time, we still return static URLs.
  try {
    const [images, films, avatars, { prompts }, outfits, scenarios, locations] = await Promise.all([
      getGalleryImages(),
      getGalleryFilms(),
      getAvatarSummaries(),
      getPublishedPrompts({ limit: 500 }),
      getPublishedOutfits({ limit: 500 }),
      getPublishedScenarios({ limit: 500 }),
      getPublishedLocations({ limit: 500 }),
    ]);

    const imageUrls: MetadataRoute.Sitemap = images.map((img, i) => ({
      url: `${base}/images/${encodeURIComponent(galleryRouteId(img, i))}`,
      lastModified: new Date(),
    }));

    const filmUrls: MetadataRoute.Sitemap = films.map((film, i) => ({
      url: `${base}/films/${encodeURIComponent(galleryRouteId(film, i))}`,
      lastModified: new Date(),
    }));

    const avatarUrls: MetadataRoute.Sitemap = avatars.map((a) => ({
      url: `${base}/avatars/${encodeURIComponent(a.slug)}`,
      lastModified: new Date(),
    }));

    const promptUrls: MetadataRoute.Sitemap = prompts.map((p) => ({
      url: `${base}/prompts/${encodeURIComponent(p.slug)}`,
      lastModified: new Date(p.updated_at),
    }));

    const outfitUrls: MetadataRoute.Sitemap = outfits.map((o) => ({
      url: `${base}/outfits/${encodeURIComponent(o.slug)}`,
      lastModified: new Date(o.created_at),
    }));

    const scenarioUrls: MetadataRoute.Sitemap = scenarios.map((s) => ({ url: `${base}/scenarios/${encodeURIComponent(s.slug)}`, lastModified: new Date(s.created_at) }));
    const locationUrls: MetadataRoute.Sitemap = locations.map((l) => ({ url: `${base}/locations/${encodeURIComponent(l.slug)}`, lastModified: new Date(l.created_at) }));

    return [...staticUrls, ...imageUrls, ...filmUrls, ...avatarUrls, ...promptUrls, ...outfitUrls, ...scenarioUrls, ...locationUrls];
  } catch {
    return staticUrls;
  }
}

