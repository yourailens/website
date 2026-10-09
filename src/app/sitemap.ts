import type { MetadataRoute } from "next";
import { getGalleryFilms, getGalleryImages } from "@/lib/gallery/load";
import { galleryRouteId } from "@/lib/gallery/route-id";
import { loadPublicServices } from "@/lib/services/load";
import { getPublishedTeamMembers } from "@/lib/team/load";
import { getPublishedVaultEntries } from "@/lib/yail-vault/load";
import { HOME_WATCH_TITLES } from "@/data/home-watch";

function siteOrigin(): string {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteOrigin();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/images`, lastModified: new Date() },
    { url: `${base}/films`, lastModified: new Date() },
    { url: `${base}/vault`, lastModified: new Date() },
    { url: `${base}/ai-verse`, lastModified: new Date() },
    { url: `${base}/ai-filmmaking`, lastModified: new Date() },
    { url: `${base}/ai-ads`, lastModified: new Date() },
    { url: `${base}/team`, lastModified: new Date() },
    { url: `${base}/events`, lastModified: new Date() },
    { url: `${base}/events/ai-creator-workshop`, lastModified: new Date() },
    { url: `${base}/events/ai-creator-workshop/day-1`, lastModified: new Date() },
    { url: `${base}/events/ai-creator-workshop/day-2`, lastModified: new Date() },
    { url: `${base}/pricing`, lastModified: new Date() },
    { url: `${base}/pricing/estimator`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    ...HOME_WATCH_TITLES.map((t) => ({
      url: `${base}/watch/${t.slug}`,
      lastModified: new Date(),
    })),
    { url: `${base}/instagram`, lastModified: new Date() },
    { url: `${base}/youtube`, lastModified: new Date() },
  ];

  try {
    const [images, films, packages, team, vault] = await Promise.all([
      getGalleryImages(),
      getGalleryFilms(),
      loadPublicServices(),
      getPublishedTeamMembers(),
      getPublishedVaultEntries(),
    ]);

    const imageUrls: MetadataRoute.Sitemap = images.map((img, i) => ({
      url: `${base}/images/${encodeURIComponent(galleryRouteId(img, i))}`,
      lastModified: new Date(),
    }));

    const filmUrls: MetadataRoute.Sitemap = films.map((film, i) => ({
      url: `${base}/films/${encodeURIComponent(galleryRouteId(film, i))}`,
      lastModified: new Date(),
    }));

    const packageUrls: MetadataRoute.Sitemap = packages.map((s) => ({
      url: `${base}/pricing/${encodeURIComponent(s.slug)}`,
      lastModified: new Date(s.updated_at || s.created_at),
    }));

    const teamUrls: MetadataRoute.Sitemap = team.map((m) => ({
      url: `${base}/team/${encodeURIComponent(m.slug)}`,
      lastModified: new Date(m.updated_at),
    }));

    const vaultUrls: MetadataRoute.Sitemap = vault.map((entry) => ({
      url: `${base}/vault/${encodeURIComponent(entry.slug)}`,
      lastModified: new Date(entry.updated_at),
    }));

    return [...staticUrls, ...packageUrls, ...imageUrls, ...filmUrls, ...teamUrls, ...vaultUrls];
  } catch {
    return staticUrls;
  }
}
