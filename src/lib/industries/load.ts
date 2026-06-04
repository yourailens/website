import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  Industry,
  IndustryPlaybook,
  IndustryPlaybookExample,
  IndustryPlaybookWithExamples,
  IndustryWithPlaybooks,
  PlaybookPageData,
} from "@/data/industries";
import type { SampleBrandWithMedia } from "@/data/sample-brands";
import { getPublishedBrandsForIndustryId } from "@/lib/sample-brands/load";

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

function rowIndustry(r: Row): Industry {
  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    name: String(r.name ?? ""),
    question: (r.question as string | null) ?? null,
    answer: (r.answer as string | null) ?? null,
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    hero_image_url: (r.hero_image_url as string | null) ?? null,
    hero_media_type: (r.hero_media_type as Industry["hero_media_type"]) ?? "image",
    hero_aspect_ratio: (r.hero_aspect_ratio as Industry["hero_aspect_ratio"]) ?? "landscape",
    hero_poster_url: (r.hero_poster_url as string | null) ?? null,
    hero_caption: (r.hero_caption as string | null) ?? null,
    cover_image_url: (r.cover_image_url as string | null) ?? null,
    cover_media_type: (r.cover_media_type as Industry["cover_media_type"]) ?? "image",
    cover_aspect_ratio: (r.cover_aspect_ratio as Industry["cover_aspect_ratio"]) ?? "landscape",
    cover_poster_url: (r.cover_poster_url as string | null) ?? null,
    icon_label: (r.icon_label as string | null) ?? null,
    sort_order: Number(r.sort_order ?? 0),
    published: Boolean(r.published),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function rowPlaybook(r: Row): IndustryPlaybook {
  return {
    id: String(r.id ?? ""),
    industry_id: String(r.industry_id ?? ""),
    slug: String(r.slug ?? ""),
    name: String(r.name ?? ""),
    question: (r.question as string | null) ?? null,
    answer: (r.answer as string | null) ?? null,
    tagline: (r.tagline as string | null) ?? null,
    description: (r.description as string | null) ?? null,
    icon_label: (r.icon_label as string | null) ?? null,
    sort_order: Number(r.sort_order ?? 0),
    published: Boolean(r.published),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

function rowExample(r: Row): IndustryPlaybookExample {
  return {
    id: String(r.id ?? ""),
    playbook_id: String(r.playbook_id ?? ""),
    title: String(r.title ?? ""),
    caption: (r.caption as string | null) ?? null,
    media_url: String(r.media_url ?? ""),
    media_type: (r.media_type as IndustryPlaybookExample["media_type"]) ?? "image",
    poster_url: (r.poster_url as string | null) ?? null,
    aspect_ratio: (r.aspect_ratio as IndustryPlaybookExample["aspect_ratio"]) ?? "landscape",
    service_slug: (r.service_slug as string | null) ?? null,
    sort_order: Number(r.sort_order ?? 0),
    published: Boolean(r.published),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

const INDUSTRY_COLS =
  "id,slug,name,question,answer,tagline,description,hero_image_url,hero_media_type,hero_aspect_ratio,hero_poster_url,hero_caption,cover_image_url,cover_media_type,cover_aspect_ratio,cover_poster_url,icon_label,sort_order,published,created_at,updated_at";
const PLAYBOOK_COLS =
  "id,industry_id,slug,name,question,answer,tagline,description,icon_label,sort_order,published,created_at,updated_at";
const EXAMPLE_COLS =
  "id,playbook_id,title,caption,media_url,media_type,poster_url,aspect_ratio,service_slug,sort_order,published,created_at,updated_at";
/** Lighter select for industry listing (cover + counts only) */
const EXAMPLE_LISTING_COLS =
  "playbook_id,title,caption,media_url,media_type,poster_url,aspect_ratio,sort_order,published";

type AttachPlaybooksOptions = {
  /** Industry hub / listing: one cover example per playbook, full count in example_count */
  listingPreview?: boolean;
};

async function attachPlaybooks(
  db: ReturnType<typeof readClient>,
  industries: Industry[],
  publishedOnly: boolean,
  options?: AttachPlaybooksOptions
): Promise<IndustryWithPlaybooks[]> {
  if (industries.length === 0) return [];

  const ids = industries.map((i) => i.id);
  let pq = db.from("industry_playbooks").select(PLAYBOOK_COLS).in("industry_id", ids).order("sort_order");
  if (publishedOnly) pq = pq.eq("published", true);

  const { data: playbooks, error: pErr } = await pq;
  if (pErr) {
    console.error("attachPlaybooks playbooks:", pErr);
    return industries.map((i) => ({ ...i, playbooks: [] }));
  }

  const playbookRows = (playbooks ?? []).map((r) => rowPlaybook(r as unknown as Row));
  const playbookIds = playbookRows.map((p) => p.id);

  const byPlaybook = new Map<string, IndustryPlaybookExample[]>();
  const exampleCountByPlaybook = new Map<string, number>();

  if (playbookIds.length > 0) {
    const exampleCols = options?.listingPreview ? EXAMPLE_LISTING_COLS : EXAMPLE_COLS;
    let eq = db.from("industry_playbook_examples").select(exampleCols).in("playbook_id", playbookIds).order("sort_order");
    if (publishedOnly) eq = eq.eq("published", true);
    const { data: ex, error: eErr } = await eq;
    if (eErr) console.error("attachPlaybooks examples:", eErr);
    else {
      for (const [i, r] of (ex ?? []).entries()) {
        const row = r as unknown as Row;
        const pid = String(row.playbook_id ?? "");
        if (!row.id) row.id = `${pid}-${row.sort_order ?? i}`;
        const exRow = rowExample(row);
        exampleCountByPlaybook.set(pid, (exampleCountByPlaybook.get(pid) ?? 0) + 1);
        if (options?.listingPreview) {
          if (!byPlaybook.has(pid)) byPlaybook.set(pid, [exRow]);
        } else {
          const list = byPlaybook.get(pid) ?? [];
          list.push(exRow);
          byPlaybook.set(pid, list);
        }
      }
    }
  }

  const byIndustry = new Map<string, IndustryPlaybookWithExamples[]>();
  for (const p of playbookRows) {
    const list = byIndustry.get(p.industry_id) ?? [];
    const playbookExamples = byPlaybook.get(p.id) ?? [];
    if (options?.listingPreview) {
      const cover = playbookExamples[0];
      list.push({
        ...p,
        examples: [],
        example_count: exampleCountByPlaybook.get(p.id) ?? playbookExamples.length,
        cover_preview: cover
          ? {
              media_url: cover.media_url,
              media_type: cover.media_type,
              poster_url: cover.poster_url,
              aspect_ratio: cover.aspect_ratio,
              title: cover.title,
              caption: cover.caption,
            }
          : null,
      });
    } else {
      list.push({ ...p, examples: playbookExamples });
    }
    byIndustry.set(p.industry_id, list);
  }

  return industries.map((i) => ({
    ...i,
    playbooks: byIndustry.get(i.id) ?? [],
  }));
}

export const getPublishedIndustries = cache(async (): Promise<IndustryWithPlaybooks[]> => {
  const db = readClient();
  const { data, error } = await db
    .from("industries")
    .select(INDUSTRY_COLS)
    .eq("published", true)
    .order("sort_order");
  if (error) {
    console.error("getPublishedIndustries:", error);
    return [];
  }
  return attachPlaybooks(
    db,
    (data ?? []).map((r) => rowIndustry(r as unknown as Row)),
    true
  );
});

export const getIndustryBySlug = cache(async (slug: string): Promise<IndustryWithPlaybooks | null> => {
  const db = readClient();
  const { data, error } = await db.from("industries").select(INDUSTRY_COLS).eq("slug", slug).eq("published", true).single();
  if (error || !data) return null;
  const [withPlaybooks] = await attachPlaybooks(db, [rowIndustry(data as unknown as Row)], true);
  return withPlaybooks ?? null;
});

/** Optimized payload for /industries/[slug] — parallel fetch, trimmed playbook examples, no brand gallery media */
export const getIndustryPageData = cache(
  async (slug: string): Promise<{ industry: IndustryWithPlaybooks; sampleBrands: SampleBrandWithMedia[] } | null> => {
    const db = readClient();
    const { data, error } = await db
      .from("industries")
      .select(INDUSTRY_COLS)
      .eq("slug", slug)
      .eq("published", true)
      .single();
    if (error || !data) return null;

    const industry = rowIndustry(data as unknown as Row);

    const [[withPlaybooks], sampleBrands] = await Promise.all([
      attachPlaybooks(db, [industry], true, { listingPreview: true }),
      getPublishedBrandsForIndustryId(industry.id),
    ]);

    if (!withPlaybooks) return null;
    return { industry: withPlaybooks, sampleBrands };
  }
);

export async function adminGetAllIndustries(): Promise<IndustryWithPlaybooks[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("industries").select(INDUSTRY_COLS).order("sort_order");
  if (error) {
    console.error("adminGetAllIndustries:", error);
    return [];
  }
  return attachPlaybooks(
    db,
    (data ?? []).map((r) => rowIndustry(r as unknown as Row)),
    false
  );
}

export async function adminGetIndustryById(id: string): Promise<IndustryWithPlaybooks | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("industries").select(INDUSTRY_COLS).eq("id", id).single();
  if (error || !data) return null;
  const [withPlaybooks] = await attachPlaybooks(db, [rowIndustry(data as unknown as Row)], false);
  return withPlaybooks ?? null;
}

export async function getPlaybookPage(
  industrySlug: string,
  playbookSlug: string
): Promise<PlaybookPageData | null> {
  const industry = await getIndustryBySlug(industrySlug);
  if (!industry) return null;

  const playbooks = industry.playbooks
    .filter((p) => p.published)
    .sort((a, b) => a.sort_order - b.sort_order);
  const index = playbooks.findIndex((p) => p.slug === playbookSlug);
  if (index < 0) return null;

  const playbook = playbooks[index];
  return {
    industry,
    playbook,
    siblings: playbooks,
    playbookIndex: index,
  };
}

export async function getAllPlaybookStaticParams(): Promise<{ slug: string; playbookSlug: string }[]> {
  const industries = await getPublishedIndustries();
  return industries.flatMap((ind) =>
    ind.playbooks
      .filter((p) => p.published)
      .map((p) => ({ slug: ind.slug, playbookSlug: p.slug }))
  );
}
