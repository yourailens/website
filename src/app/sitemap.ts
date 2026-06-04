import type { MetadataRoute } from "next";
import { getGalleryFilms, getGalleryImages } from "@/lib/gallery/load";
import { galleryRouteId } from "@/lib/gallery/route-id";
import { getAvatarSummaries } from "@/lib/avatars/load";
import { getPublishedModules } from "@/lib/modules/load";

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
    { url: `${base}/modules`, lastModified: new Date() },
    { url: `${base}/instagram`, lastModified: new Date() },
    { url: `${base}/youtube`, lastModified: new Date() },
  ];

  try {
    const [images, films, avatars, modules] = await Promise.all([
      getGalleryImages(),
      getGalleryFilms(),
      getAvatarSummaries(),
      getPublishedModules({ limit: 500 }),
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

    const moduleUrls: MetadataRoute.Sitemap = modules.map((m) => ({
      url: `${base}/modules/${encodeURIComponent(m.slug)}`,
      lastModified: new Date(m.updated_at),
    }));

    return [...staticUrls, ...imageUrls, ...filmUrls, ...avatarUrls, ...moduleUrls];
  } catch {
    return staticUrls;
  }
}
