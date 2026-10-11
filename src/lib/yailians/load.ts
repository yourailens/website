import type {
  YailiansScreening,
  YailiansScreeningStatus,
  YailiansSite,
  YailiansVoice,
  YailiansWorldItem,
  YailiansWorldKind,
} from "@/data/yailians";
import { isYailiansScreeningStatus, isYailiansWorldKind } from "@/data/yailians";
import { ottCutYoutubeId } from "@/data/ott-cuts";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function softEmpty(message: string) {
  return /does not exist|schema cache/i.test(message);
}

function rowToSite(row: Record<string, unknown>): YailiansSite {
  return {
    id: 1,
    title: String(row.title ?? "YAILIANS"),
    tagline: (row.tagline as string | null) ?? null,
    synopsis: (row.synopsis as string | null) ?? null,
    trailer_url: (row.trailer_url as string | null) ?? null,
    trailer_poster: (row.trailer_poster as string | null) ?? null,
    hero_image_url: (row.hero_image_url as string | null) ?? null,
    runtime_label: (row.runtime_label as string | null) ?? "45 min",
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

function rowToVoice(row: Record<string, unknown>): YailiansVoice {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    role: (row.role as string | null) ?? null,
    quote: String(row.quote ?? ""),
    portrait_url: (row.portrait_url as string | null) ?? null,
    video_url: (row.video_url as string | null) ?? null,
    featured_on_hub: Boolean(row.featured_on_hub),
    published: Boolean(row.published),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function rowToScreening(row: Record<string, unknown>): YailiansScreening | null {
  const status = row.status;
  if (!isYailiansScreeningStatus(status)) return null;
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    venue: (row.venue as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    starts_at: (row.starts_at as string | null) ?? null,
    ends_at: (row.ends_at as string | null) ?? null,
    status,
    notes: (row.notes as string | null) ?? null,
    cover_url: (row.cover_url as string | null) ?? null,
    ticket_url: (row.ticket_url as string | null) ?? null,
    featured_on_hub: Boolean(row.featured_on_hub),
    published: Boolean(row.published),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function rowToWorld(row: Record<string, unknown>): YailiansWorldItem | null {
  const kind = row.kind;
  const media_type = row.media_type;
  if (!isYailiansWorldKind(kind)) return null;
  if (media_type !== "image" && media_type !== "video") return null;
  return {
    id: String(row.id),
    kind,
    title: String(row.title ?? ""),
    caption: (row.caption as string | null) ?? null,
    media_type,
    media_url: String(row.media_url ?? ""),
    poster_url: (row.poster_url as string | null) ?? null,
    featured_on_hub: Boolean(row.featured_on_hub),
    published: Boolean(row.published),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

const DEFAULT_SITE: YailiansSite = {
  id: 1,
  title: "YAILIANS",
  tagline: "Our first 45 min AI film.",
  synopsis: null,
  trailer_url: null,
  trailer_poster: null,
  hero_image_url: null,
  runtime_label: "45 min",
  updated_at: new Date().toISOString(),
};

export async function getYailiansSite(): Promise<YailiansSite> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("yailians_site").select("*").eq("id", 1).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return DEFAULT_SITE;
    throw new Error(error.message);
  }
  return data ? rowToSite(data as Record<string, unknown>) : DEFAULT_SITE;
}

export async function upsertYailiansSite(patch: Partial<YailiansSite>): Promise<YailiansSite> {
  const db = createServiceRoleClient();
  const current = await getYailiansSite();
  const trailer_url =
    patch.trailer_url !== undefined ? patch.trailer_url?.trim() || null : current.trailer_url;
  let trailer_poster =
    patch.trailer_poster !== undefined
      ? patch.trailer_poster?.trim() || null
      : current.trailer_poster;
  // If trailer is YouTube and poster is empty, store the YT thumbnail.
  if (trailer_url && !trailer_poster) {
    const yt = ottCutYoutubeId(trailer_url);
    if (yt) trailer_poster = `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg`;
  }
  const next = {
    id: 1,
    title: patch.title?.trim() || current.title,
    tagline: patch.tagline !== undefined ? patch.tagline?.trim() || null : current.tagline,
    synopsis: patch.synopsis !== undefined ? patch.synopsis?.trim() || null : current.synopsis,
    trailer_url,
    trailer_poster,
    hero_image_url:
      patch.hero_image_url !== undefined
        ? patch.hero_image_url?.trim() || null
        : current.hero_image_url,
    runtime_label:
      patch.runtime_label !== undefined
        ? patch.runtime_label?.trim() || null
        : current.runtime_label,
  };
  let { data, error } = await db.from("yailians_site").upsert(next).select("*").single();
  // Pre-086 DBs may not have hero_image_url yet — retry without it.
  if (error && /hero_image_url/i.test(error.message)) {
    const { hero_image_url: _drop, ...withoutHero } = next;
    const retry = await db.from("yailians_site").upsert(withoutHero).select("*").single();
    data = retry.data;
    error = retry.error;
  }
  if (error) throw new Error(error.message);
  return rowToSite(data as Record<string, unknown>);
}

export async function adminGetAllVoices(): Promise<YailiansVoice[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yailians_voices")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((r) => rowToVoice(r as Record<string, unknown>));
}

export async function getPublishedVoices(opts?: {
  featuredOnly?: boolean;
}): Promise<YailiansVoice[]> {
  const db = createServiceRoleClient();
  let q = db
    .from("yailians_voices")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (opts?.featuredOnly) q = q.eq("featured_on_hub", true);
  const { data, error } = await q;
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((r) => rowToVoice(r as Record<string, unknown>));
}

export async function adminGetAllScreenings(): Promise<YailiansScreening[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yailians_screenings")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("starts_at", { ascending: false });
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? [])
    .map((r) => rowToScreening(r as Record<string, unknown>))
    .filter((e): e is YailiansScreening => Boolean(e));
}

export async function getPublishedScreenings(opts?: {
  status?: YailiansScreeningStatus;
  featuredOnly?: boolean;
}): Promise<YailiansScreening[]> {
  const db = createServiceRoleClient();
  let q = db.from("yailians_screenings").select("*").eq("published", true);
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.featuredOnly) q = q.eq("featured_on_hub", true);
  q = q.order("sort_order", { ascending: false }).order("starts_at", { ascending: false });
  const { data, error } = await q;
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? [])
    .map((r) => rowToScreening(r as Record<string, unknown>))
    .filter((e): e is YailiansScreening => Boolean(e));
}

export async function adminGetAllWorld(): Promise<YailiansWorldItem[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("yailians_world")
    .select("*")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? [])
    .map((r) => rowToWorld(r as Record<string, unknown>))
    .filter((e): e is YailiansWorldItem => Boolean(e));
}

export async function getPublishedWorld(opts?: {
  kind?: YailiansWorldKind;
  featuredOnly?: boolean;
}): Promise<YailiansWorldItem[]> {
  const db = createServiceRoleClient();
  let q = db.from("yailians_world").select("*").eq("published", true);
  if (opts?.kind) q = q.eq("kind", opts.kind);
  if (opts?.featuredOnly) q = q.eq("featured_on_hub", true);
  q = q.order("sort_order", { ascending: false }).order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? [])
    .map((r) => rowToWorld(r as Record<string, unknown>))
    .filter((e): e is YailiansWorldItem => Boolean(e));
}

export async function nextSortOrder(table: "yailians_voices" | "yailians_screenings" | "yailians_world") {
  const db = createServiceRoleClient();
  const { data } = await db
    .from(table)
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  return (data?.[0]?.sort_order ?? 0) + 1;
}
