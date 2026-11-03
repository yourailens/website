import {
  isCommunityPlacement,
  parseCommunityFrames,
  type CommunityPiece,
  type CommunityPlacement,
  type CommunitySite,
} from "@/data/community";
import { coverStill, readCommunityStills } from "@/lib/community/frames";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function softEmpty(message: string) {
  return /does not exist|schema cache/i.test(message);
}

export const DEFAULT_COMMUNITY_SITE: CommunitySite = {
  id: 1,
  eyebrow: "YAIL",
  title: "AI Creators Community",
  lede: "A home for people making films, ads, and worlds with generative media.",
  member_count: 180,
  member_label: "members",
  cta_label: "Show your interest",
  updated_at: new Date().toISOString(),
};

function rowToSite(row: Record<string, unknown>): CommunitySite {
  const count = Number(row.member_count);
  return {
    id: 1,
    eyebrow: String(row.eyebrow ?? "YAIL"),
    title: String(row.title ?? "AI Creators Community"),
    lede: (row.lede as string | null) ?? null,
    member_count: Number.isFinite(count) ? Math.max(0, Math.round(count)) : 180,
    member_label: String(row.member_label ?? "members"),
    cta_label: String(row.cta_label ?? "Show your interest"),
    updated_at: String(row.updated_at ?? new Date().toISOString()),
  };
}

function rowToPiece(row: Record<string, unknown>): CommunityPiece | null {
  const placement = row.placement;
  const media_type = row.media_type;
  if (!isCommunityPlacement(placement)) return null;
  if (media_type !== "image" && media_type !== "video") return null;
  const url = String(row.media_url ?? "").trim();
  if (!url) return null;
  return {
    id: String(row.id),
    placement,
    title: String(row.title ?? ""),
    description: (row.description as string | null) ?? null,
    media_type,
    media_url: url,
    poster_url: (row.poster_url as string | null) ?? null,
    frame_stills: parseCommunityFrames(row.frame_stills),
    show_on_home: Boolean(row.show_on_home),
    published: Boolean(row.published),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function ordered(rows: CommunityPiece[]) {
  return [...rows].sort((a, b) => b.sort_order - a.sort_order || b.created_at.localeCompare(a.created_at));
}

export async function getCommunitySite(): Promise<CommunitySite> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("community_site").select("*").eq("id", 1).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return DEFAULT_COMMUNITY_SITE;
    throw new Error(error.message);
  }
  return data ? rowToSite(data as Record<string, unknown>) : DEFAULT_COMMUNITY_SITE;
}

export async function adminGetCommunitySite(): Promise<CommunitySite> {
  return getCommunitySite();
}

async function listPieces(publishedOnly: boolean): Promise<CommunityPiece[]> {
  const db = createServiceRoleClient();
  let q = db.from("community_pieces").select("*");
  if (publishedOnly) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  const pieces = ordered(
    (data ?? []).map((r) => rowToPiece(r as Record<string, unknown>)).filter((e): e is CommunityPiece => Boolean(e))
  );
  return Promise.all(
    pieces.map(async (piece) => {
      if (piece.media_type !== "video" || piece.frame_stills.length) return piece;
      const frame_stills = await readCommunityStills(piece.media_url);
      if (!frame_stills.length) return piece;
      return {
        ...piece,
        frame_stills,
        poster_url: piece.poster_url || coverStill(frame_stills)?.url || null,
      };
    })
  );
}

export async function getPublishedCommunityPieces(): Promise<CommunityPiece[]> {
  return listPieces(true);
}

export async function getPublishedCommunityPiece(id: string): Promise<CommunityPiece | null> {
  if (!id) return null;
  const pieces = await listPieces(true);
  return pieces.find((piece) => piece.id === id) ?? null;
}

export async function adminGetAllCommunityPieces(): Promise<CommunityPiece[]> {
  return listPieces(false);
}

export function piecesByPlacement(pieces: CommunityPiece[], placement: CommunityPlacement) {
  return pieces.filter((piece) => piece.placement === placement);
}

export async function nextCommunitySortOrder() {
  const db = createServiceRoleClient();
  const { data } = await db
    .from("community_pieces")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1);
  return (data?.[0]?.sort_order ?? 0) + 1;
}
