import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  SampleBrand,
  SampleBrandMedia,
  SampleBrandPageData,
  SampleBrandWithMedia,
} from "@/data/sample-brands";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}

function readClient() {
  try {
    return createServiceRoleClient();
  } catch {
    return anonClient();
  }
}

type Row = Record<string, unknown>;

const BRAND_COLS =
  "id,industry_id,slug,name,tagline,description,hero_image_url,hero_media_type,hero_aspect_ratio,hero_poster_url,hero_caption,cover_image_url,cover_media_type,cover_aspect_ratio,cover_poster_url,sort_order,published,created_at,updated_at";
const MEDIA_COLS =
  "id,brand_id,media_type,aspect_ratio,category,label,caption,media_url,poster_url,sort_order,published,created_at,updated_at";

function rowBrand(r: Row): SampleBrand {
  return {
    id: String(r.id ?? ""),
    industry_id: String(r.industry_id ?? ""),
    slug: String(r.slug ?? ""),
    name: String(r.name ?? ""),
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    hero_image_url: (r.hero_image_url as string | null) ?? null,
    hero_media_type: (r.hero_media_type as SampleBrand["hero_media_type"]) ?? "image",
    hero_aspect_ratio: (r.hero_aspect_ratio as SampleBrand["hero_aspect_ratio"]) ?? "landscape",
    hero_poster_url: (r.hero_poster_url as string | null) ?? null,
    hero_caption: (r.hero_caption as string | null) ?? null,
    cover_image_url: (r.cover_image_url as string | null) ?? null,
    cover_media_type: (r.cover_media_type as SampleBrand["cover_media_type"]) ?? "image",
    cover_aspect_ratio: (r.cover_aspect_ratio as SampleBrand["cover_aspect_ratio"]) ?? "landscape",
    cover_poster_url: (r.cover_poster_url as string | null) ?? null,
    sort_order: Number(r.sort_order ?? 0),
    published: Boolean(r.published),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function rowMedia(r: Row): SampleBrandMedia {
  return {
    id: String(r.id ?? ""),
    brand_id: String(r.brand_id ?? ""),
    media_type: (r.media_type as SampleBrandMedia["media_type"]) ?? "image",
    aspect_ratio: (r.aspect_ratio as SampleBrandMedia["aspect_ratio"]) ?? "landscape",
    category: (r.category as SampleBrandMedia["category"]) ?? "situations",
    label: (r.label as string | null) ?? null,
    caption: (r.caption as string | null) ?? null,
    media_url: String(r.media_url ?? ""),
    poster_url: (r.poster_url as string | null) ?? null,
    sort_order: Number(r.sort_order ?? 0),
    published: Boolean(r.published),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

async function attachMedia(
  db: ReturnType<typeof readClient>,
  brands: SampleBrand[],
  publishedOnly: boolean
): Promise<SampleBrandWithMedia[]> {
  if (brands.length === 0) return [];
  const ids = brands.map((b) => b.id);
  let q = db.from("industry_sample_brand_media").select(MEDIA_COLS).in("brand_id", ids).order("sort_order");
  if (publishedOnly) q = q.eq("published", true);

  const { data, error } = await q;
  if (error) {
    console.error("attachMedia:", error);
    return brands.map((b) => ({ ...b, media: [] }));
  }

  const byBrand = new Map<string, SampleBrandMedia[]>();
  for (const r of data ?? []) {
    const m = rowMedia(r as unknown as Row);
    const list = byBrand.get(m.brand_id) ?? [];
    list.push(m);
    byBrand.set(m.brand_id, list);
  }

  return brands.map((b) => ({ ...b, media: byBrand.get(b.id) ?? [] }));
}

export async function getAllPublishedSampleBrands(): Promise<SampleBrandWithMedia[]> {
  const db = readClient();
  const { data: inds, error: iErr } = await db
    .from("industries")
    .select("id,slug,name,sort_order")
    .eq("published", true)
    .order("sort_order");
  if (iErr || !inds?.length) return [];

  const indMap = new Map(
    inds.map((i) => [
      String(i.id),
      { slug: String(i.slug), name: String(i.name), sort: Number(i.sort_order ?? 0) },
    ])
  );
  const ids = inds.map((i) => i.id);

  const { data, error } = await db
    .from("industry_sample_brands")
    .select(BRAND_COLS)
    .in("industry_id", ids)
    .eq("published", true)
    .order("sort_order");
  if (error) {
    console.error("getAllPublishedSampleBrands:", error);
    return [];
  }

  const withMedia = await attachMedia(
    db,
    (data ?? []).map((r) => rowBrand(r as unknown as Row)),
    true
  );

  return withMedia
    .map((b) => {
      const ind = indMap.get(b.industry_id);
      return {
        ...b,
        industry_slug: ind?.slug,
        industry_name: ind?.name,
      };
    })
    .sort((a, b) => {
      const indA = indMap.get(a.industry_id)?.sort ?? 0;
      const indB = indMap.get(b.industry_id)?.sort ?? 0;
      if (indA !== indB) return indA - indB;
      return a.sort_order - b.sort_order;
    });
}

/** Listing cards only need hero/cover — skip gallery media rows */
export async function getPublishedBrandsForIndustryId(industryId: string): Promise<SampleBrandWithMedia[]> {
  const db = readClient();
  const { data, error } = await db
    .from("industry_sample_brands")
    .select(BRAND_COLS)
    .eq("industry_id", industryId)
    .eq("published", true)
    .order("sort_order");
  if (error) {
    console.error("getPublishedBrandsForIndustryId:", error);
    return [];
  }
  return (data ?? []).map((r) => ({ ...rowBrand(r as unknown as Row), media: [] }));
}

export const getPublishedBrandsForIndustry = cache(async (industrySlug: string): Promise<SampleBrandWithMedia[]> => {
  const db = readClient();
  const { data: ind, error: iErr } = await db
    .from("industries")
    .select("id")
    .eq("slug", industrySlug)
    .eq("published", true)
    .single();
  if (iErr || !ind) return [];
  return getPublishedBrandsForIndustryId(String(ind.id));
});

export async function getSampleBrandPage(
  industrySlug: string,
  brandSlug: string
): Promise<SampleBrandPageData | null> {
  const db = readClient();
  const { data: ind, error: iErr } = await db
    .from("industries")
    .select("id,slug,name")
    .eq("slug", industrySlug)
    .eq("published", true)
    .single();
  if (iErr || !ind) return null;

  const { data: brands, error: bErr } = await db
    .from("industry_sample_brands")
    .select(BRAND_COLS)
    .eq("industry_id", ind.id)
    .eq("published", true)
    .order("sort_order");
  if (bErr) return null;

  const rows = (brands ?? []).map((r) => rowBrand(r as unknown as Row));
  const index = rows.findIndex((b) => b.slug === brandSlug);
  if (index < 0) return null;

  const withMedia = await attachMedia(db, [rows[index]], true);
  const brand = withMedia[0];
  if (!brand) return null;

  return {
    industry: { id: String(ind.id), slug: String(ind.slug), name: String(ind.name) },
    brand,
    siblings: rows.filter((_, i) => i !== index),
  };
}

export async function adminGetAllSampleBrands(): Promise<SampleBrandWithMedia[]> {
  const db = createServiceRoleClient();
  const { data: brands, error } = await db.from("industry_sample_brands").select(BRAND_COLS).order("sort_order");
  if (error) {
    console.error("adminGetAllSampleBrands:", error);
    return [];
  }

  const { data: industries } = await db.from("industries").select("id,slug,name");
  const indMap = new Map((industries ?? []).map((i) => [String(i.id), { slug: String(i.slug), name: String(i.name) }]));

  const withMedia = await attachMedia(
    db,
    (brands ?? []).map((r) => rowBrand(r as unknown as Row)),
    false
  );

  return withMedia.map((b) => {
    const ind = indMap.get(b.industry_id);
    return { ...b, industry_slug: ind?.slug, industry_name: ind?.name };
  });
}

export async function adminGetSampleBrandById(id: string): Promise<SampleBrandWithMedia | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("industry_sample_brands").select(BRAND_COLS).eq("id", id).single();
  if (error || !data) return null;

  const brand = rowBrand(data as unknown as Row);
  const { data: ind } = await db.from("industries").select("slug,name").eq("id", brand.industry_id).single();
  const [withMedia] = await attachMedia(db, [brand], false);
  if (!withMedia) return null;

  return {
    ...withMedia,
    industry_slug: ind ? String(ind.slug) : undefined,
    industry_name: ind ? String(ind.name) : undefined,
  };
}

export async function getAllSampleBrandStaticParams(): Promise<
  { slug: string; brandSlug: string }[]
> {
  const db = readClient();
  const { data: inds } = await db.from("industries").select("id,slug").eq("published", true);
  if (!inds?.length) return [];

  const ids = inds.map((i) => i.id);
  const slugById = new Map(inds.map((i) => [String(i.id), String(i.slug)]));

  const { data: brands } = await db
    .from("industry_sample_brands")
    .select("industry_id,slug")
    .in("industry_id", ids)
    .eq("published", true);

  return (brands ?? []).map((b) => ({
    slug: slugById.get(String(b.industry_id)) ?? "",
    brandSlug: String(b.slug),
  })).filter((p) => p.slug && p.brandSlug);
}
