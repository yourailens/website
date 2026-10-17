import type {
  PlannerBio,
  PlannerContact,
  PlannerContactEntry,
  PlannerDirectoryItem,
  PlannerDirectoryKind,
  PlannerEntryKind,
  PlannerFinanceEntry,
  PlannerFinanceKind,
  PlannerMeeting,
  PlannerMember,
  PlannerNote,
  PlannerNoteImage,
  PlannerPaymentMethod,
  PlannerPost,
  PlannerPostImage,
  PlannerTask,
  PlannerTaskStatus,
} from "@/data/planner";
import {
  isPlannerContactStatus,
  isPlannerDirectoryKind,
  isPlannerEntryKind,
  isPlannerFinanceKind,
  isPlannerPaymentMethod,
  isPlannerTaskStatus,
  plannerBioCategory,
  plannerMeetCount,
} from "@/data/planner";
import { createServiceRoleClient } from "@/lib/supabase/admin";

function softEmpty(message: string) {
  return /does not exist|schema cache/i.test(message);
}

function rowToMember(row: Record<string, unknown>): PlannerMember {
  return {
    id: String(row.id),
    email: String(row.email ?? ""),
    display_name: String(row.display_name ?? ""),
    slug: String(row.slug ?? ""),
    role_title: (row.role_title as string | null) ?? null,
    is_ceo: Boolean(row.is_ceo),
    is_core: Boolean(row.is_core),
    active: row.active !== false,
    avatar_url: (row.avatar_url as string | null) ?? null,
    bio: (row.bio as string | null) ?? null,
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function rowToTask(row: Record<string, unknown>): PlannerTask | null {
  if (!isPlannerTaskStatus(row.status)) return null;
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    notes: (row.notes as string | null) ?? null,
    deadline: (row.deadline as string | null) ?? null,
    status: row.status,
    created_by: String(row.created_by ?? ""),
    assignee_id: String(row.assignee_id ?? ""),
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

function rowToEntry(row: Record<string, unknown>): PlannerContactEntry | null {
  if (!isPlannerEntryKind(row.kind)) return null;
  return {
    id: String(row.id),
    contact_id: String(row.contact_id ?? ""),
    kind: row.kind as PlannerEntryKind,
    body: String(row.body ?? ""),
    scheduled_at: (row.scheduled_at as string | null) ?? null,
    created_by: String(row.created_by ?? ""),
    created_at: String(row.created_at ?? ""),
  };
}

function rowToContact(row: Record<string, unknown>): PlannerContact | null {
  if (!isPlannerContactStatus(row.status)) return null;
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    company: (row.company as string | null) ?? null,
    role_title: (row.role_title as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    contacted: Boolean(row.contacted),
    status: row.status,
    next_follow_up_at: (row.next_follow_up_at as string | null) ?? null,
    follow_up_booked: row.follow_up_booked == null ? Boolean(row.next_follow_up_at) : row.follow_up_booked === true,
    immediate_need: (row.immediate_need as string | null) ?? null,
    requirement: (row.requirement as string | null) ?? null,
    meet_count: 0,
    pitch: (row.pitch as string | null) ?? null,
    owner_id: (row.owner_id as string | null) ?? null,
    bio_id: (row.bio_id as string | null) ?? null,
    created_by: String(row.created_by ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function countPlannerMembers(): Promise<number> {
  const db = createServiceRoleClient();
  const { count, error } = await db
    .from("planner_members")
    .select("id", { count: "exact", head: true });
  if (error) {
    if (softEmpty(error.message)) return 0;
    throw new Error(error.message);
  }
  return count ?? 0;
}

export async function getPlannerMemberById(id: string): Promise<PlannerMember | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_members").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  return data ? rowToMember(data as Record<string, unknown>) : null;
}

export async function getPlannerMemberByEmail(email: string): Promise<(PlannerMember & { password_hash: string }) | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_members")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return { ...rowToMember(row), password_hash: String(row.password_hash ?? "") };
}

export async function getPlannerMemberAuthById(
  id: string
): Promise<(PlannerMember & { password_hash: string }) | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_members").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const row = data as Record<string, unknown>;
  return { ...rowToMember(row), password_hash: String(row.password_hash ?? "") };
}

/** Active agents for the login dossier — no secrets. */
export async function listPlannerLoginAgents(): Promise<
  { id: string; display_name: string; slug: string; role_title: string | null }[]
> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_members")
    .select("id, display_name, slug, role_title")
    .eq("active", true)
    .order("display_name");
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((r) => {
    const row = r as Record<string, unknown>;
    return {
      id: String(row.id),
      display_name: String(row.display_name ?? ""),
      slug: String(row.slug ?? ""),
      role_title: (row.role_title as string | null) ?? null,
    };
  });
}

export async function getPlannerMemberBySlug(slug: string): Promise<PlannerMember | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_members").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  return data ? rowToMember(data as Record<string, unknown>) : null;
}

export async function listPlannerMembers(opts?: { activeOnly?: boolean }): Promise<PlannerMember[]> {
  const db = createServiceRoleClient();
  let q = db.from("planner_members").select("*").order("display_name");
  if (opts?.activeOnly !== false) q = q.eq("active", true);
  const { data, error } = await q;
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  return (data ?? []).map((r) => rowToMember(r as Record<string, unknown>));
}

async function memberMap(ids: string[]): Promise<Map<string, PlannerMember>> {
  const unique = [...new Set(ids.filter(Boolean))];
  const map = new Map<string, PlannerMember>();
  if (!unique.length) return map;
  const db = createServiceRoleClient();
  const { data } = await db.from("planner_members").select("*").in("id", unique);
  for (const row of data ?? []) {
    const m = rowToMember(row as Record<string, unknown>);
    map.set(m.id, m);
  }
  return map;
}

export async function listPlannerTasks(opts?: {
  assigneeId?: string;
  status?: PlannerTaskStatus | PlannerTaskStatus[];
}): Promise<PlannerTask[]> {
  const db = createServiceRoleClient();
  let q = db.from("planner_tasks").select("*").order("sort_order", { ascending: false }).order("created_at", { ascending: false });
  if (opts?.assigneeId) q = q.eq("assignee_id", opts.assigneeId);
  if (opts?.status) {
    if (Array.isArray(opts.status)) q = q.in("status", opts.status);
    else q = q.eq("status", opts.status);
  }
  const { data, error } = await q;
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  const tasks = (data ?? [])
    .map((r) => rowToTask(r as Record<string, unknown>))
    .filter((t): t is PlannerTask => Boolean(t));
  const people = await memberMap(tasks.flatMap((t) => [t.assignee_id, t.created_by]));
  return tasks.map((t) => ({
    ...t,
    assignee: people.get(t.assignee_id) ?? null,
    creator: people.get(t.created_by) ?? null,
  }));
}

export async function listPlannerContacts(): Promise<PlannerContact[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_contacts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  const contacts = (data ?? [])
    .map((r) => rowToContact(r as Record<string, unknown>))
    .filter((c): c is PlannerContact => Boolean(c));
  const people = await memberMap(contacts.flatMap((c) => [c.owner_id ?? "", c.created_by]));
  const counts = new Map<string, number>();
  const ids = contacts.map((c) => c.id);
  if (ids.length) {
    const { data: marks } = await db.from("planner_contact_entries").select("contact_id, kind").in("contact_id", ids);
    for (const row of marks ?? []) {
      const mark = row as { contact_id?: string; kind?: string };
      if (!mark.contact_id || !plannerMeetCount([{ kind: String(mark.kind ?? "") }])) continue;
      counts.set(mark.contact_id, (counts.get(mark.contact_id) ?? 0) + 1);
    }
  }
  return contacts.map((c) => ({
    ...c,
    meet_count: counts.get(c.id) ?? 0,
    owner: c.owner_id ? people.get(c.owner_id) ?? null : null,
  }));
}

export async function getPlannerContact(id: string): Promise<PlannerContact | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_contacts").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const contact = rowToContact(data as Record<string, unknown>);
  if (!contact) return null;

  const { data: entries } = await db
    .from("planner_contact_entries")
    .select("*")
    .eq("contact_id", id)
    .order("created_at", { ascending: false });
  const parsed = (entries ?? [])
    .map((r) => rowToEntry(r as Record<string, unknown>))
    .filter((e): e is PlannerContactEntry => Boolean(e));
  const people = await memberMap([
    contact.owner_id ?? "",
    contact.created_by,
    ...parsed.map((e) => e.created_by),
  ]);
  return {
    ...contact,
    meet_count: plannerMeetCount(parsed),
    owner: contact.owner_id ? people.get(contact.owner_id) ?? null : null,
    entries: parsed.map((e) => ({ ...e, creator: people.get(e.created_by) ?? null })),
  };
}

export async function listPlannerMeetingsForMember(memberId: string): Promise<PlannerMeeting[]> {
  const db = createServiceRoleClient();
  const { data: links, error: linkErr } = await db
    .from("planner_meeting_attendees")
    .select("meeting_id")
    .eq("member_id", memberId);
  if (linkErr) {
    if (softEmpty(linkErr.message)) return [];
    throw new Error(linkErr.message);
  }
  const ids = (links ?? []).map((r) => String((r as { meeting_id: string }).meeting_id));
  if (!ids.length) return [];
  const { data, error } = await db
    .from("planner_meetings")
    .select("*")
    .in("id", ids)
    .order("starts_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);

  const { data: allLinks } = await db
    .from("planner_meeting_attendees")
    .select("meeting_id, member_id")
    .in("meeting_id", ids);
  const byMeeting = new Map<string, string[]>();
  for (const row of allLinks ?? []) {
    const r = row as { meeting_id: string; member_id: string };
    const list = byMeeting.get(r.meeting_id) ?? [];
    list.push(r.member_id);
    byMeeting.set(r.meeting_id, list);
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    const id = String(r.id);
    return {
      id,
      title: String(r.title ?? ""),
      notes: (r.notes as string | null) ?? null,
      starts_at: (r.starts_at as string | null) ?? null,
      ends_at: (r.ends_at as string | null) ?? null,
      created_by: String(r.created_by ?? ""),
      created_at: String(r.created_at ?? ""),
      updated_at: String(r.updated_at ?? ""),
      attendee_ids: byMeeting.get(id) ?? [],
    };
  });
}

async function loadPostImages(postIds: string[]): Promise<Map<string, PlannerPostImage[]>> {
  const map = new Map<string, PlannerPostImage[]>();
  if (!postIds.length) return map;
  const db = createServiceRoleClient();
  const { data } = await db
    .from("planner_post_images")
    .select("*")
    .in("post_id", postIds)
    .order("sort_order");
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const img: PlannerPostImage = {
      id: String(r.id),
      post_id: String(r.post_id),
      url: String(r.url ?? ""),
      label: (r.label as string | null) ?? null,
      sort_order: Number(r.sort_order ?? 0),
    };
    const list = map.get(img.post_id) ?? [];
    list.push(img);
    map.set(img.post_id, list);
  }
  return map;
}

export async function listPlannerPosts(opts?: { authorId?: string; limit?: number }): Promise<PlannerPost[]> {
  const db = createServiceRoleClient();
  let q = db.from("planner_posts").select("*").order("created_at", { ascending: false });
  if (opts?.authorId) q = q.eq("author_id", opts.authorId);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data, error } = await q;
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  const posts = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      author_id: String(r.author_id),
      body: String(r.body ?? ""),
      created_at: String(r.created_at ?? ""),
      updated_at: String(r.updated_at ?? ""),
      images: [] as PlannerPostImage[],
    };
  });
  const images = await loadPostImages(posts.map((p) => p.id));
  const people = await memberMap(posts.map((p) => p.author_id));
  return posts.map((p) => ({
    ...p,
    images: images.get(p.id) ?? [],
    author: people.get(p.author_id) ?? null,
  }));
}

async function loadNoteImages(noteIds: string[]): Promise<Map<string, PlannerNoteImage[]>> {
  const map = new Map<string, PlannerNoteImage[]>();
  if (!noteIds.length) return map;
  const db = createServiceRoleClient();
  const { data } = await db
    .from("planner_note_images")
    .select("*")
    .in("note_id", noteIds)
    .order("sort_order");
  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    const img: PlannerNoteImage = {
      id: String(r.id),
      note_id: String(r.note_id),
      url: String(r.url ?? ""),
      label: (r.label as string | null) ?? null,
      sort_order: Number(r.sort_order ?? 0),
    };
    const list = map.get(img.note_id) ?? [];
    list.push(img);
    map.set(img.note_id, list);
  }
  return map;
}

export async function listPlannerNotes(memberId: string): Promise<PlannerNote[]> {
  const db = createServiceRoleClient();
  const { data, error } = await db
    .from("planner_notes")
    .select("*")
    .eq("member_id", memberId)
    .order("updated_at", { ascending: false });
  if (error) {
    if (softEmpty(error.message)) return [];
    throw new Error(error.message);
  }
  const notes = (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      member_id: String(r.member_id),
      author_id: String(r.author_id),
      title: String(r.title ?? ""),
      body: String(r.body ?? ""),
      created_at: String(r.created_at ?? ""),
      updated_at: String(r.updated_at ?? ""),
      images: [] as PlannerNoteImage[],
    };
  });
  const images = await loadNoteImages(notes.map((n) => n.id));
  const people = await memberMap(notes.map((n) => n.author_id));
  return notes.map((n) => ({
    ...n,
    images: images.get(n.id) ?? [],
    author: people.get(n.author_id) ?? null,
  }));
}

export async function getPlannerNote(id: string): Promise<PlannerNote | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_notes").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const r = data as Record<string, unknown>;
  const note: PlannerNote = {
    id: String(r.id),
    member_id: String(r.member_id),
    author_id: String(r.author_id),
    title: String(r.title ?? ""),
    body: String(r.body ?? ""),
    created_at: String(r.created_at ?? ""),
    updated_at: String(r.updated_at ?? ""),
    images: [],
  };
  const images = await loadNoteImages([note.id]);
  const people = await memberMap([note.author_id]);
  return {
    ...note,
    images: images.get(note.id) ?? [],
    author: people.get(note.author_id) ?? null,
  };
}

export async function nextPlannerSortOrder(table: "planner_tasks"): Promise<number> {
  const db = createServiceRoleClient();
  const { data } = await db.from(table).select("sort_order").order("sort_order", { ascending: false }).limit(1);
  const top = data?.[0] as { sort_order?: number } | undefined;
  return (top?.sort_order ?? 0) + 1;
}

function rowToBio(row: Record<string, unknown>, members: PlannerMember[]): PlannerBio {
  const ownerId = (row.owner_id as string | null) ?? null;
  return {
    id: String(row.id),
    slug: String(row.slug ?? ""),
    full_name: String(row.full_name ?? ""),
    preferred_name: (row.preferred_name as string | null) ?? null,
    pronouns: (row.pronouns as string | null) ?? null,
    company: (row.company as string | null) ?? null,
    role_title: (row.role_title as string | null) ?? null,
    department: (row.department as string | null) ?? null,
    email: (row.email as string | null) ?? null,
    phone: (row.phone as string | null) ?? null,
    whatsapp: (row.whatsapp as string | null) ?? null,
    website: (row.website as string | null) ?? null,
    linkedin: (row.linkedin as string | null) ?? null,
    instagram: (row.instagram as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    industry: (row.industry as string | null) ?? null,
    languages: (row.languages as string | null) ?? null,
    category: row.category
      ? plannerBioCategory(row.category)
      : String(row.relationship ?? "").toLowerCase() === "client"
        ? "lead"
        : "misc",
    label:
      (row.label as string | null) ??
      (!row.category && String(row.relationship ?? "").toLowerCase() === "client" ? "Client" : null),
    relationship: (row.relationship as string | null) ?? null,
    source: (row.source as string | null) ?? null,
    introduced_by: (row.introduced_by as string | null) ?? null,
    birthday: row.birthday ? String(row.birthday).slice(0, 10) : null,
    bio: (row.bio as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    owner_id: ownerId,
    created_by: String(row.created_by ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
    owner: members.find((m) => m.id === ownerId) ?? null,
  };
}

export async function listPlannerBios(): Promise<{ rows: PlannerBio[]; missing: boolean }> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_bios").select("*").order("full_name", { ascending: true });
  if (error) {
    if (softEmpty(error.message)) return { rows: [], missing: true };
    throw new Error(error.message);
  }
  const members = await listPlannerMembers();
  return { rows: (data ?? []).map((row) => rowToBio(row as Record<string, unknown>, members)), missing: false };
}

export async function getPlannerBio(slug: string): Promise<PlannerBio | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_bios").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const members = await listPlannerMembers();
  return rowToBio(data as Record<string, unknown>, members);
}

export async function ensureUniqueBioSlug(base: string): Promise<string> {
  const db = createServiceRoleClient();
  let candidate = base || "person";
  let n = 2;
  for (;;) {
    const { data, error } = await db.from("planner_bios").select("id").eq("slug", candidate).limit(1);
    if (error) {
      if (softEmpty(error.message)) return candidate;
      throw new Error(error.message);
    }
    if (!data?.length) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function ensureUniquePlannerSlug(base: string, excludeId?: string): Promise<string> {
  const db = createServiceRoleClient();
  let candidate = base;
  let n = 2;
  for (;;) {
    let q = db.from("planner_members").select("id").eq("slug", candidate).limit(1);
    if (excludeId) q = q.neq("id", excludeId);
    const { data } = await q;
    if (!data?.length) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

function rowToDirectoryItem(row: Record<string, unknown>): PlannerDirectoryItem | null {
  if (!isPlannerDirectoryKind(row.kind)) return null;
  return {
    id: String(row.id),
    title: String(row.title ?? ""),
    blurb: (row.blurb as string | null) ?? null,
    kind: row.kind as PlannerDirectoryKind,
    url: String(row.url ?? ""),
    label: (row.label as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    created_by: String(row.created_by ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listPlannerDirectory(): Promise<{ rows: PlannerDirectoryItem[]; missing: boolean }> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_directory").select("*").order("updated_at", { ascending: false });
  if (error) {
    if (softEmpty(error.message)) return { rows: [], missing: true };
    throw new Error(error.message);
  }
  const rows = (data ?? [])
    .map((r) => rowToDirectoryItem(r as Record<string, unknown>))
    .filter((r): r is PlannerDirectoryItem => Boolean(r));
  const people = await memberMap(rows.map((r) => r.created_by));
  return {
    rows: rows.map((r) => ({ ...r, creator: people.get(r.created_by) ?? null })),
    missing: false,
  };
}

export async function getPlannerDirectoryItem(id: string): Promise<PlannerDirectoryItem | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_directory").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const item = rowToDirectoryItem(data as Record<string, unknown>);
  if (!item) return null;
  const people = await memberMap([item.created_by]);
  return { ...item, creator: people.get(item.created_by) ?? null };
}

function rowToFinanceEntry(row: Record<string, unknown>): PlannerFinanceEntry | null {
  if (!isPlannerFinanceKind(row.kind) || !isPlannerPaymentMethod(row.payment_method)) return null;
  const amount = Number(row.amount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return {
    id: String(row.id),
    kind: row.kind as PlannerFinanceKind,
    amount,
    currency: String(row.currency ?? "INR"),
    title: String(row.title ?? ""),
    party: String(row.party ?? ""),
    payment_method: row.payment_method as PlannerPaymentMethod,
    notes: (row.notes as string | null) ?? null,
    paid_at: String(row.paid_at ?? row.created_at ?? ""),
    created_by: String(row.created_by ?? ""),
    created_at: String(row.created_at ?? ""),
    updated_at: String(row.updated_at ?? ""),
  };
}

export async function listPlannerFinanceEntries(): Promise<{
  rows: PlannerFinanceEntry[];
  expenseTotal: number;
  revenueTotal: number;
  net: number;
  missing: boolean;
}> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_finance_entries").select("*").order("paid_at", { ascending: false });
  if (error) {
    if (softEmpty(error.message)) {
      return { rows: [], expenseTotal: 0, revenueTotal: 0, net: 0, missing: true };
    }
    throw new Error(error.message);
  }
  const rows = (data ?? [])
    .map((r) => rowToFinanceEntry(r as Record<string, unknown>))
    .filter((r): r is PlannerFinanceEntry => Boolean(r));
  const people = await memberMap(rows.map((r) => r.created_by));
  const withPeople = rows.map((r) => ({ ...r, creator: people.get(r.created_by) ?? null }));
  const expenseTotal = withPeople.filter((r) => r.kind === "expense").reduce((sum, r) => sum + r.amount, 0);
  const revenueTotal = withPeople.filter((r) => r.kind === "revenue").reduce((sum, r) => sum + r.amount, 0);
  return {
    rows: withPeople,
    expenseTotal,
    revenueTotal,
    net: revenueTotal - expenseTotal,
    missing: false,
  };
}

export async function getPlannerFinanceEntry(id: string): Promise<PlannerFinanceEntry | null> {
  const db = createServiceRoleClient();
  const { data, error } = await db.from("planner_finance_entries").select("*").eq("id", id).maybeSingle();
  if (error) {
    if (softEmpty(error.message)) return null;
    throw new Error(error.message);
  }
  if (!data) return null;
  const entry = rowToFinanceEntry(data as Record<string, unknown>);
  if (!entry) return null;
  const people = await memberMap([entry.created_by]);
  return { ...entry, creator: people.get(entry.created_by) ?? null };
}
