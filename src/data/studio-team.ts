import type { StudioModuleAspect, StudioModuleMediaType } from "@/data/studio-modules";

export type TeamMediaType = StudioModuleMediaType;
export type TeamAspect = StudioModuleAspect;

export type StudioTeamLink = {
  id?: string;
  label: string;
  url: string;
  sort_order: number;
};

export type StudioTeamWorkItem = {
  id?: string;
  media_type: TeamMediaType;
  image_url: string | null;
  video_url: string | null;
  poster_url: string | null;
  aspect_ratio: TeamAspect;
  title: string | null;
  caption: string | null;
  sort_order: number;
};

export type StudioTeamMember = {
  id: string;
  slug: string;
  name: string;
  role: string;
  short_bio: string | null;
  bio: string | null;
  portrait_url: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type StudioTeamMemberPublic = StudioTeamMember & {
  work: StudioTeamWorkItem[];
  links: StudioTeamLink[];
};

export function teamWorkMediaUrl(item: StudioTeamWorkItem): string | null {
  if (item.media_type === "video") return item.video_url?.trim() || null;
  return item.image_url?.trim() || null;
}

export function teamMemberPortrait(member: StudioTeamMember, work?: StudioTeamWorkItem[]): string | null {
  if (member.portrait_url?.trim()) return member.portrait_url.trim();
  const firstImage = work?.find((w) => w.media_type === "image" && w.image_url?.trim());
  return firstImage?.image_url?.trim() || null;
}
