import { createClient } from "@supabase/supabase-js";
import { AVATAR_SLUGS, type AvatarSlug, isAvatarSlug } from "@/lib/avatars/config";
import { createServiceRoleClient } from "@/lib/supabase/admin";

export type AvatarGalleryRow = { id: string; publicUrl: string; sortOrder: number };

export type AvatarCharacterPublic = {
  slug: AvatarSlug;
  displayName: string;
  headline: string;
  story: string;
  heroImageUrl: string | null;
  gallery: AvatarGalleryRow[];
};

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

export async function getAvatarSummaries(): Promise<
  { slug: AvatarSlug; displayName: string; headline: string; heroImageUrl: string | null }[]
> {
  const supabase = readClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("avatar_characters")
    .select("slug,display_name,headline,hero_image_url")
    .in("slug", [...AVATAR_SLUGS]);
  if (error || !data?.length) return [];
  const order = new Map(AVATAR_SLUGS.map((s, i) => [s, i]));
  return data
    .filter((r): r is typeof r & { slug: AvatarSlug } => isAvatarSlug(r.slug))
    .sort((a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0))
    .map((r) => ({
      slug: r.slug,
      displayName: r.display_name,
      headline: r.headline,
      heroImageUrl: r.hero_image_url,
    }));
}

export async function getAvatarBySlug(slug: string): Promise<AvatarCharacterPublic | null> {
  if (!isAvatarSlug(slug)) return null;
  const supabase = readClient();
  if (!supabase) return null;
  const { data: row, error } = await supabase
    .from("avatar_characters")
    .select("slug,display_name,headline,story,hero_image_url")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !row) return null;
  const { data: imgs } = await supabase
    .from("avatar_character_images")
    .select("id,public_url,sort_order")
    .eq("character_slug", slug)
    .order("sort_order", { ascending: true });
  const gallery: AvatarGalleryRow[] = (imgs ?? []).map((g) => ({
    id: g.id,
    publicUrl: g.public_url,
    sortOrder: g.sort_order,
  }));
  return {
    slug: row.slug as AvatarSlug,
    displayName: row.display_name,
    headline: row.headline,
    story: row.story,
    heroImageUrl: row.hero_image_url,
    gallery,
  };
}
