import { createClient } from "@supabase/supabase-js";
import {
  CHARACTER_TAGS,
  GALLERY_FILMS as FALLBACK_FILMS,
  GALLERY_IMAGES as FALLBACK_IMAGES,
  type CharacterTag,
  type FilmCategory,
  type GalleryFilm,
  type GalleryImage,
} from "@/data/gallery";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

function rowToImage(row: {
  id: string;
  title: string;
  category: string;
  aspect: string | null;
  public_url: string;
  people_tags: string[] | null;
}): GalleryImage {
  return {
    id: row.id,
    src: row.public_url,
    title: row.title,
    category: row.category as FilmCategory,
    aspect: (row.aspect as GalleryImage["aspect"]) ?? undefined,
    peopleTags: (row.people_tags ?? []).filter((v): v is CharacterTag =>
      (CHARACTER_TAGS as string[]).includes(v)
    ),
  };
}

function rowToFilm(row: {
  id: string;
  title: string;
  category: string;
  orientation: string | null;
  public_url: string;
  people_tags: string[] | null;
}): GalleryFilm {
  return {
    id: row.id,
    src: row.public_url,
    title: row.title,
    category: row.category as FilmCategory,
    orientation: (row.orientation as GalleryFilm["orientation"]) ?? undefined,
    peopleTags: (row.people_tags ?? []).filter((v): v is CharacterTag =>
      (CHARACTER_TAGS as string[]).includes(v)
    ),
  };
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = anonClient();
  if (!supabase) return FALLBACK_IMAGES;
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id,title,category,aspect,public_url,people_tags,sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data?.length) return FALLBACK_IMAGES;
  return data.map(rowToImage);
}

export async function getGalleryFilms(): Promise<GalleryFilm[]> {
  const supabase = anonClient();
  if (!supabase) return FALLBACK_FILMS;
  const { data, error } = await supabase
    .from("gallery_films")
    .select("id,title,category,orientation,public_url,people_tags,sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data?.length) return FALLBACK_FILMS;
  return data.map(rowToFilm);
}
