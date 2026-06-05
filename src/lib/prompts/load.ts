import { createClient } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import type { Prompt } from "@/data/prompts";

function anonClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars");
  return createClient(url, anon);
}

function readClient() {
  try { return createServiceRoleClient(); } catch { return anonClient(); }
}

type Row = Record<string, unknown>;

function rowToPrompt(r: Row): Prompt {
  return {
    id: String(r.id ?? ""),
    slug: String(r.slug ?? ""),
    title: String(r.title ?? ""),
    excerpt: (r.excerpt as string | null) ?? null,
    cover_image_url: (r.cover_image_url as string | null) ?? null,
    cover_aspect: (r.cover_aspect as Prompt["cover_aspect"]) ?? "landscape",
    demo_video_url: (r.demo_video_url as string | null) ?? null,
    og_image_url: (r.og_image_url as string | null) ?? null,
    media_type: (r.media_type as Prompt["media_type"]) ?? "image",
    image_category: (r.image_category as Prompt["image_category"]) ?? null,
    video_category: (r.video_category as Prompt["video_category"]) ?? null,
    difficulty: (r.difficulty as Prompt["difficulty"]) ?? "intermediate",
    models: Array.isArray(r.models) ? (r.models as string[]) : [],
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    body: String(r.body ?? ""),
    view_count: Number(r.view_count ?? 0),
    featured: Boolean(r.featured),
    published: Boolean(r.published),
    sort_order: Number(r.sort_order ?? 0),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
  };
}

const SELECT_COLS = `
  id, slug, title, excerpt, cover_image_url, cover_aspect, demo_video_url, og_image_url,
  media_type, image_category, video_category, difficulty,
  models, tags, body, view_count, featured, published,
  sort_order, created_at, updated_at
`.trim();

// ── Public reads (RLS: published = true) ─────────────────────

export async function getPublishedPrompts(opts?: {
  search?: string;
  media_type?: "image" | "video";
  image_category?: string;
  video_category?: string;
  difficulty?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ prompts: Prompt[]; total: number }> {
  const sb = readClient();
  let q = sb
    .from("prompts")
    .select(SELECT_COLS, { count: "exact" })
    .eq("published", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  if (opts?.media_type) q = q.eq("media_type", opts.media_type);
  if (opts?.image_category) q = q.eq("image_category", opts.image_category);
  if (opts?.video_category) q = q.eq("video_category", opts.video_category);
  if (opts?.difficulty) q = q.eq("difficulty", opts.difficulty);
  if (opts?.featured === true) q = q.eq("featured", true);
  if (opts?.limit) q = q.limit(opts.limit);
  if (opts?.offset) q = q.range(opts.offset, (opts.offset ?? 0) + (opts.limit ?? 20) - 1);

  if (opts?.search?.trim()) {
    q = q.textSearch("search_vector", opts.search.trim().replace(/\s+/g, " & "), {
      type: "plain",
      config: "english",
    });
  }

  const { data, error, count } = await q;
  if (error) return { prompts: [], total: 0 };
  return {
    prompts: ((data as unknown) as Row[] ?? []).map(rowToPrompt),
    total: count ?? 0,
  };
}

export async function getPromptBySlug(slug: string): Promise<Prompt | null> {
  const sb = readClient();
  const { data, error } = await sb
    .from("prompts")
    .select(SELECT_COLS)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return rowToPrompt(data as unknown as Row);
}

// ── Admin reads (service role, sees all rows) ─────────────────

export async function adminGetAllPrompts(): Promise<Prompt[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("prompts")
    .select(SELECT_COLS)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) return [];
  return ((data as unknown) as Row[] ?? []).map(rowToPrompt);
}

export async function adminGetPromptById(id: string): Promise<Prompt | null> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("prompts")
    .select(SELECT_COLS)
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  return rowToPrompt(data as unknown as Row);
}
