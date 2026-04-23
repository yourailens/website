import { createClient } from "@supabase/supabase-js";
import {
  CHARACTER_TAGS,
  type CharacterTag,
  type FilmCategory,
  type GalleryFilm,
  type GalleryImage,
} from "@/data/gallery";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) return null;
  return createClient(url, anon);
}

function readClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return anonClient();
  }
}

function rowToImage(row: {
  id: string;
  title: string;
  category: string;
  aspect: string | null;
  public_url: string;
  people_tags: string[] | null;
  prompt?: string | null;
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
    prompt: row.prompt ?? undefined,
  };
}

function rowToFilm(row: {
  id: string;
  title: string;
  category: string;
  orientation: string | null;
  public_url: string;
  poster_url: string | null;
  people_tags: string[] | null;
  prompt?: string | null;
}): GalleryFilm {
  return {
    id: row.id,
    src: row.public_url,
    posterUrl: row.poster_url ?? undefined,
    title: row.title,
    category: row.category as FilmCategory,
    orientation: (row.orientation as GalleryFilm["orientation"]) ?? undefined,
    peopleTags: (row.people_tags ?? []).filter((v): v is CharacterTag =>
      (CHARACTER_TAGS as string[]).includes(v)
    ),
    prompt: row.prompt ?? undefined,
  };
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = readClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id,title,category,aspect,public_url,people_tags,prompt,sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data?.length) return [];
  return data.map(rowToImage);
}

export async function getGalleryFilms(): Promise<GalleryFilm[]> {
  const supabase = readClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("gallery_films")
    .select("id,title,category,orientation,public_url,poster_url,people_tags,prompt,sort_order")
    .order("sort_order", { ascending: true });
  if (error || !data?.length) return [];
  return data.map(rowToFilm);
}
