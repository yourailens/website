import type { MetadataRoute } from "next";
import { getGalleryFilms, getGalleryImages } from "@/lib/gallery/load";
import { galleryRouteId } from "@/lib/gallery/route-id";
import { getAvatarSummaries } from "@/lib/avatars/load";
import { getPublishedStudioModules } from "@/lib/studio-modules/load";
import { STUDIO_MODULE_TYPE_SLUGS } from "@/data/studio-modules";

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
    { url: `${base}/resources`, lastModified: new Date() },
    { url: `${base}/modules`, lastModified: new Date() },
    { url: `${base}/modules/prompt-playbooks`, lastModified: new Date() },
    { url: `${base}/modules/client-showcases`, lastModified: new Date() },
    { url: `${base}/modules/products-visuals`, lastModified: new Date() },
    { url: `${base}/prompts`, lastModified: new Date() },
    { url: `${base}/outfits`, lastModified: new Date() },
    { url: `${base}/character-sheets`, lastModified: new Date() },
    { url: `${base}/scenarios`, lastModified: new Date() },
    { url: `${base}/locations`, lastModified: new Date() },
    { url: `${base}/props`, lastModified: new Date() },
    { url: `${base}/lighting-presets`, lastModified: new Date() },
    { url: `${base}/color-grades`, lastModified: new Date() },
    { url: `${base}/mood-boards`, lastModified: new Date() },
    { url: `${base}/instagram`, lastModified: new Date() },
    { url: `${base}/youtube`, lastModified: new Date() },
  ];

  try {
    const [images, films, avatars, modules] = await Promise.all([
      getGalleryImages(),
      getGalleryFilms(),
      getAvatarSummaries(),
      getPublishedStudioModules({ limit: 500 }),
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
      url: `${base}/modules/${encodeURIComponent(STUDIO_MODULE_TYPE_SLUGS[m.module_type])}/${encodeURIComponent(m.slug)}`,
      lastModified: new Date(m.updated_at),
    }));

    return [...staticUrls, ...imageUrls, ...filmUrls, ...avatarUrls, ...moduleUrls];
  } catch {
    return staticUrls;
  }
}
