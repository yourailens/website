export const COMMUNITY_PLACEMENTS = ["hero", "jumbo", "gallery"] as const;
export type CommunityPlacement = (typeof COMMUNITY_PLACEMENTS)[number];

export type CommunitySite = {
  id: 1;
  eyebrow: string;
  title: string;
  lede: string | null;
  member_count: number;
  member_label: string;
  cta_label: string;
  updated_at: string;
};

export type CommunityFrame = {
  url: string;
  t: number;
};

export function parseCommunityFrames(value: unknown): CommunityFrame[] {
  if (!Array.isArray(value)) return [];
  const frames: CommunityFrame[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const url = String((item as { url?: unknown }).url ?? "").trim();
    const t = Number((item as { t?: unknown }).t);
    if (!url || !Number.isFinite(t) || t < 0) continue;
    frames.push({ url, t: Math.round(t * 100) / 100 });
  }
  return frames;
}

export type CommunityPiece = {
  id: string;
  placement: CommunityPlacement;
  title: string;
  description: string | null;
  media_type: "image" | "video";
  media_url: string;
  poster_url: string | null;
  frame_stills: CommunityFrame[];
  show_on_home: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function isCommunityPlacement(v: unknown): v is CommunityPlacement {
  return COMMUNITY_PLACEMENTS.includes(v as CommunityPlacement);
}

export type CommunityRailCard = {
  id: string;
  title: string;
  description?: string | null;
  href: string;
  mediaType: "image" | "video";
  mediaUrl: string;
  posterUrl?: string | null;
};

export function communityPlacementLabel(placement: CommunityPlacement) {
  if (placement === "hero") return "Hero";
  if (placement === "jumbo") return "Jumbotron";
  return "Gallery";
}
