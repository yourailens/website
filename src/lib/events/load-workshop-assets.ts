import { GALLERY_FILMS, GALLERY_IMAGES, type GalleryFilm, type GalleryImage } from "@/data/gallery";
import { getGalleryFilms, getGalleryImages } from "@/lib/gallery/load";
import { getInstagramLinks, type SocialLink } from "@/lib/social/load";

export type WorkshopVisualAssets = {
  images: GalleryImage[];
  films: GalleryFilm[];
  instagram: SocialLink[];
};

/**
 * Prefer live Supabase gallery + Instagram; fall back to bundled static assets for dev/offline.
 */
export async function getWorkshopVisualAssets(): Promise<WorkshopVisualAssets> {
  const [dbImg, dbFilm, ig] = await Promise.all([getGalleryImages(), getGalleryFilms(), getInstagramLinks()]);
  const images = (dbImg.length ? dbImg : GALLERY_IMAGES).slice(0, 12);
  const films = (dbFilm.length ? dbFilm : GALLERY_FILMS).slice(0, 6);
  const withThumbs = ig.filter((l) => l.thumbnail_url).slice(0, 10);
  return { images, films, instagram: withThumbs };
}
