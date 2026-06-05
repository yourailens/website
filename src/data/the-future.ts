import type { ModuleCoverAspectId } from "@/data/module-covers";

export type FutureMediaType = "image" | "video";

export type FutureField = {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string | null;
  cover_image_url: string | null;
  cover_video_url: string | null;
  cover_media_type: FutureMediaType;
  cover_aspect: ModuleCoverAspectId;
  sort_order: number;
  published: boolean;
};

export type FutureSequenceFrame = {
  id: string;
  module_id: string;
  label: string;
  caption: string | null;
  media_type: FutureMediaType;
  image_url: string | null;
  video_url: string | null;
  poster_url: string | null;
  aspect_ratio: ModuleCoverAspectId;
  sort_order: number;
};

export type FutureModule = {
  id: string;
  field_id: string;
  slug: string;
  title: string;
  tagline: string | null;
  intro: string | null;
  cover_image_url: string | null;
  cover_video_url: string | null;
  cover_media_type: FutureMediaType;
  cover_aspect: ModuleCoverAspectId;
  view_count: number;
  sort_order: number;
  published: boolean;
};

export type FutureModuleWithFrames = FutureModule & {
  frames: FutureSequenceFrame[];
};

export type FutureModulePreview = {
  preview_url: string | null;
  preview_media_type: FutureMediaType;
  preview_aspect: ModuleCoverAspectId;
  preview_poster_url: string | null;
};

export type FutureModuleListItem = FutureModule & FutureModulePreview;

export type FutureFieldWithModules = FutureField & {
  modules: FutureModuleListItem[];
};

export type FutureFieldSummary = FutureField & {
  module_count: number;
};

export const FUTURE_FIELD_SLUGS = ["science-technology", "arts", "law"] as const;
