export const YAILIANS_WORLD_KINDS = ["world", "creature", "character", "craft"] as const;
export type YailiansWorldKind = (typeof YAILIANS_WORLD_KINDS)[number];

export const YAILIANS_SCREENING_STATUSES = ["upcoming", "past"] as const;
export type YailiansScreeningStatus = (typeof YAILIANS_SCREENING_STATUSES)[number];

export type YailiansSite = {
  id: number;
  title: string;
  tagline: string | null;
  synopsis: string | null;
  trailer_url: string | null;
  trailer_poster: string | null;
  /** Landscape hub hero still (16:9-ish). */
  hero_image_url: string | null;
  runtime_label: string | null;
  updated_at: string;
};

export type YailiansVoice = {
  id: string;
  name: string;
  role: string | null;
  /** Optional pull-quote from the interview. */
  quote: string | null;
  portrait_url: string | null;
  /** Interview video URL. */
  video_url: string | null;
  /** Still frame / thumbnail for the interview. */
  poster_url: string | null;
  featured_on_hub: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type YailiansScreening = {
  id: string;
  title: string;
  venue: string | null;
  city: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: YailiansScreeningStatus;
  notes: string | null;
  cover_url: string | null;
  ticket_url: string | null;
  featured_on_hub: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type YailiansWorldItem = {
  id: string;
  kind: YailiansWorldKind;
  title: string;
  caption: string | null;
  media_type: "image" | "video";
  media_url: string;
  poster_url: string | null;
  featured_on_hub: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export function isYailiansWorldKind(v: unknown): v is YailiansWorldKind {
  return YAILIANS_WORLD_KINDS.includes(v as YailiansWorldKind);
}

export function isYailiansScreeningStatus(v: unknown): v is YailiansScreeningStatus {
  return YAILIANS_SCREENING_STATUSES.includes(v as YailiansScreeningStatus);
}

export function yailiansWorldKindLabel(kind: YailiansWorldKind) {
  switch (kind) {
    case "world":
      return "Worlds";
    case "creature":
      return "Creatures";
    case "character":
      return "Characters";
    case "craft":
      return "Craft";
    default:
      return kind;
  }
}
