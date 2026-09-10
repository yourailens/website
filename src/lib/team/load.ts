import { createServiceRoleClient } from "@/lib/supabase/admin";
import type {
  StudioTeamLink,
  StudioTeamMember,
  StudioTeamMemberPublic,
  StudioTeamWorkItem,
} from "@/data/studio-team";
import { mergeSeededTeamMembers, seededTeamMemberBySlug } from "@/data/team-seed";

type Row = Record<string, unknown>;

function rowToMember(r: Row): StudioTeamMember {
  return {
    id: String(r.id),
    slug: String(r.slug),
    name: String(r.name),
    role: typeof r.role === "string" ? r.role : "",
    short_bio: typeof r.short_bio === "string" ? r.short_bio : null,
    bio: typeof r.bio === "string" ? r.bio : null,
    portrait_url: typeof r.portrait_url === "string" ? r.portrait_url : null,
    published: Boolean(r.published),
    sort_order: Number(r.sort_order ?? 0),
    created_at: String(r.created_at),
    updated_at: String(r.updated_at),
  };
}

function rowToWork(r: Row): StudioTeamWorkItem {
  return {
    id: String(r.id),
    media_type: r.media_type === "video" ? "video" : "image",
    image_url: typeof r.image_url === "string" ? r.image_url : null,
    video_url: typeof r.video_url === "string" ? r.video_url : null,
    poster_url: typeof r.poster_url === "string" ? r.poster_url : null,
    aspect_ratio: (r.aspect_ratio as StudioTeamWorkItem["aspect_ratio"]) ?? "natural",
    title: typeof r.title === "string" ? r.title : null,
    caption: typeof r.caption === "string" ? r.caption : null,
    sort_order: Number(r.sort_order ?? 0),
  };
}

function rowToLink(r: Row): StudioTeamLink {
  return {
    id: String(r.id),
    label: String(r.label ?? ""),
    url: String(r.url ?? ""),
    sort_order: Number(r.sort_order ?? 0),
  };
}

async function fetchWork(memberIds: string[]): Promise<Map<string, StudioTeamWorkItem[]>> {
  const map = new Map<string, StudioTeamWorkItem[]>();
  if (memberIds.length === 0) return map;
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_team_work")
    .select("*")
    .in("member_id", memberIds)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    const item = rowToWork(row as Row);
    const id = String((row as Row).member_id);
    const list = map.get(id) ?? [];
    list.push(item);
    map.set(id, list);
  }
  return map;
}

async function fetchLinks(memberIds: string[]): Promise<Map<string, StudioTeamLink[]>> {
  const map = new Map<string, StudioTeamLink[]>();
  if (memberIds.length === 0) return map;
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_team_links")
    .select("*")
    .in("member_id", memberIds)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  for (const row of data ?? []) {
    const item = rowToLink(row as Row);
    const id = String((row as Row).member_id);
    const list = map.get(id) ?? [];
    list.push(item);
    map.set(id, list);
  }
  return map;
}

export async function getPublishedTeamMembers(): Promise<StudioTeamMemberPublic[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_team_members")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    if (error.message.includes("does not exist") || error.code === "42P01" || error.code === "PGRST205") {
      return mergeSeededTeamMembers([]);
    }
    throw new Error(error.message);
  }
  const members = (data ?? []).map((r) => rowToMember(r as Row));
  const ids = members.map((m) => m.id);
  const [workMap, linkMap] = await Promise.all([fetchWork(ids), fetchLinks(ids)]);
  return mergeSeededTeamMembers(
    members.map((m) => ({
      ...m,
      work: workMap.get(m.id) ?? [],
      links: linkMap.get(m.id) ?? [],
    })),
  );
}

export async function getPublishedTeamMemberBySlug(slug: string): Promise<StudioTeamMemberPublic | null> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_team_members")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) {
    if (error.message.includes("does not exist") || error.code === "42P01" || error.code === "PGRST205") {
      return seededTeamMemberBySlug(slug);
    }
    throw new Error(error.message);
  }
  if (!data) return seededTeamMemberBySlug(slug);
  const member = rowToMember(data as Row);
  const [workMap, linkMap] = await Promise.all([fetchWork([member.id]), fetchLinks([member.id])]);
  return {
    ...member,
    work: workMap.get(member.id) ?? [],
    links: linkMap.get(member.id) ?? [],
  };
}

export async function adminGetAllTeamMembers(): Promise<StudioTeamMemberPublic[]> {
  const sb = createServiceRoleClient();
  const { data, error } = await sb
    .from("studio_team_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  const members = (data ?? []).map((r) => rowToMember(r as Row));
  const ids = members.map((m) => m.id);
  const [workMap, linkMap] = await Promise.all([fetchWork(ids), fetchLinks(ids)]);
  return members.map((m) => ({
    ...m,
    work: workMap.get(m.id) ?? [],
    links: linkMap.get(m.id) ?? [],
  }));
}
