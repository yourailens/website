export const PLANNER_TASK_STATUSES = ["open", "doing", "done", "blocked"] as const;
export type PlannerTaskStatus = (typeof PLANNER_TASK_STATUSES)[number];

export const PLANNER_CONTACT_STATUSES = ["new", "contacted", "active", "won", "lost", "paused"] as const;
export type PlannerContactStatus = (typeof PLANNER_CONTACT_STATUSES)[number];

export const PLANNER_ENTRY_KINDS = [
  "meet",
  "contacted",
  "outcome",
  "next",
  "requirement",
  "pitch",
  "note",
  "scheduled",
  "ask",
] as const;

/** A logged meeting, not a note or a plan. */
export const PLANNER_MEET_KINDS = ["meet", "contacted", "outcome"] as const;
export type PlannerEntryKind = (typeof PLANNER_ENTRY_KINDS)[number];

export type PlannerMember = {
  id: string;
  email: string;
  display_name: string;
  slug: string;
  role_title: string | null;
  is_ceo: boolean;
  /** Core agents unlock gated ops (finances, etc.). */
  is_core: boolean;
  active: boolean;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

/** Safe fields for the spy login agent picker (no emails / hashes). */
export type PlannerLoginAgent = {
  id: string;
  display_name: string;
  slug: string;
  role_title: string | null;
};

export type PlannerTask = {
  id: string;
  title: string;
  notes: string | null;
  deadline: string | null;
  status: PlannerTaskStatus;
  created_by: string;
  assignee_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  /** Joined for UI */
  assignee?: PlannerMember | null;
  creator?: PlannerMember | null;
};

export type PlannerContact = {
  id: string;
  name: string;
  company: string | null;
  role_title: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  contacted: boolean;
  status: PlannerContactStatus;
  next_follow_up_at: string | null;
  follow_up_booked: boolean;
  immediate_need: string | null;
  requirement: string | null;
  meet_count: number;
  pitch: string | null;
  owner_id: string | null;
  bio_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  owner?: PlannerMember | null;
  entries?: PlannerContactEntry[];
};

export type PlannerContactEntry = {
  id: string;
  contact_id: string;
  kind: PlannerEntryKind;
  body: string;
  scheduled_at: string | null;
  created_by: string;
  created_at: string;
  creator?: PlannerMember | null;
};

export type PlannerMeeting = {
  id: string;
  title: string;
  notes: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  attendee_ids: string[];
};

export type PlannerPostImage = {
  id: string;
  post_id: string;
  url: string;
  label: string | null;
  sort_order: number;
};

export type PlannerPost = {
  id: string;
  author_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  author?: PlannerMember | null;
  images: PlannerPostImage[];
};

export type PlannerNoteImage = {
  id: string;
  note_id: string;
  url: string;
  label: string | null;
  sort_order: number;
};

export type PlannerNote = {
  id: string;
  member_id: string;
  author_id: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
  author?: PlannerMember | null;
  images: PlannerNoteImage[];
};

export function isPlannerTaskStatus(v: unknown): v is PlannerTaskStatus {
  return PLANNER_TASK_STATUSES.includes(v as PlannerTaskStatus);
}

export function isPlannerContactStatus(v: unknown): v is PlannerContactStatus {
  return PLANNER_CONTACT_STATUSES.includes(v as PlannerContactStatus);
}

export function isPlannerEntryKind(v: unknown): v is PlannerEntryKind {
  return PLANNER_ENTRY_KINDS.includes(v as PlannerEntryKind);
}

export function plannerTaskStatusLabel(s: PlannerTaskStatus) {
  switch (s) {
    case "open":
      return "Open";
    case "doing":
      return "Doing";
    case "done":
      return "Done";
    case "blocked":
      return "Blocked";
  }
}

export function plannerContactStatusLabel(s: PlannerContactStatus) {
  switch (s) {
    case "new":
      return "New";
    case "contacted":
      return "Contacted";
    case "active":
      return "Active";
    case "won":
      return "Signed";
    case "lost":
      return "Lost";
    case "paused":
      return "Paused";
  }
}

export function plannerMeetCount(entries: { kind: string }[] | undefined) {
  return (entries ?? []).filter((entry) => (PLANNER_MEET_KINDS as readonly string[]).includes(entry.kind)).length;
}

export function plannerEntryKindLabel(k: PlannerEntryKind) {
  switch (k) {
    case "meet":
      return "Meet";
    case "contacted":
      return "Contacted";
    case "outcome":
      return "What happened";
    case "next":
      return "Next step";
    case "requirement":
      return "Requirement";
    case "pitch":
      return "Pitch";
    case "note":
      return "Note";
    case "scheduled":
      return "Scheduled";
    case "ask":
      return "They asked";
  }
}

export type PlannerNavItem = {
  href: string;
  label: string;
  hint?: string;
  /** Hide from agents who are not core. */
  coreOnly?: boolean;
};

export const PLANNER_NAV: { id: string; label: string; items: PlannerNavItem[] }[] = [
  {
    id: "home",
    label: "Home",
    items: [{ href: "/planner/tasks", label: "Planner", hint: "Todos and deadlines" }],
  },
  {
    id: "work",
    label: "Work",
    items: [
      { href: "/planner/follow-ups", label: "Follow ups", hint: "Calls" },
      { href: "/planner/follow-ups/contacts", label: "Contacts", hint: "People we know" },
      { href: "/planner/people", label: "People", hint: "Tasks by person" },
    ],
  },
  {
    id: "ops",
    label: "Ops",
    items: [
      { href: "/planner/directory", label: "Directory", hint: "Links we keep" },
      { href: "/planner/finances", label: "Finances", hint: "Money in and out", coreOnly: true },
    ],
  },
  {
    id: "talk",
    label: "Talk",
    items: [{ href: "/planner/feed", label: "Feed", hint: "What the team is saying" }],
  },
];

export const PLANNER_DIRECTORY_KINDS = ["drive", "instagram", "website", "doc", "other"] as const;
export type PlannerDirectoryKind = (typeof PLANNER_DIRECTORY_KINDS)[number];

export const PLANNER_PAYMENT_METHODS = ["upi", "bank"] as const;
export type PlannerPaymentMethod = (typeof PLANNER_PAYMENT_METHODS)[number];

export const PLANNER_FINANCE_KINDS = ["expense", "revenue"] as const;
export type PlannerFinanceKind = (typeof PLANNER_FINANCE_KINDS)[number];

export type PlannerDirectoryItem = {
  id: string;
  title: string;
  blurb: string | null;
  kind: PlannerDirectoryKind;
  url: string;
  label: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: PlannerMember | null;
};

export type PlannerFinanceEntry = {
  id: string;
  kind: PlannerFinanceKind;
  amount: number;
  currency: string;
  title: string;
  party: string;
  payment_method: PlannerPaymentMethod;
  notes: string | null;
  paid_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: PlannerMember | null;
};

export function isPlannerDirectoryKind(v: unknown): v is PlannerDirectoryKind {
  return PLANNER_DIRECTORY_KINDS.includes(v as PlannerDirectoryKind);
}

export function isPlannerPaymentMethod(v: unknown): v is PlannerPaymentMethod {
  return PLANNER_PAYMENT_METHODS.includes(v as PlannerPaymentMethod);
}

export function isPlannerFinanceKind(v: unknown): v is PlannerFinanceKind {
  return PLANNER_FINANCE_KINDS.includes(v as PlannerFinanceKind);
}

export function plannerDirectoryKindLabel(kind: PlannerDirectoryKind) {
  switch (kind) {
    case "drive":
      return "Drive";
    case "instagram":
      return "Instagram";
    case "website":
      return "Website";
    case "doc":
      return "Doc";
    case "other":
      return "Other";
  }
}

export function plannerPaymentMethodLabel(method: PlannerPaymentMethod) {
  switch (method) {
    case "upi":
      return "UPI";
    case "bank":
      return "Bank Transfer";
  }
}

export function plannerFinanceKindLabel(kind: PlannerFinanceKind) {
  switch (kind) {
    case "expense":
      return "Expense";
    case "revenue":
      return "Revenue";
  }
}

export function formatPlannerMoney(amount: number, currency = "INR") {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

export function plannerNavActive(pathname: string, item: PlannerNavItem) {
  if (item.href === "/planner/feed") {
    return pathname === "/planner/feed" || pathname.startsWith("/planner/post");
  }
  if (item.href === "/planner/follow-ups" && pathname.startsWith("/planner/follow-ups/contacts")) return false;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function plannerPageMeta(pathname: string) {
  for (const group of PLANNER_NAV) {
    for (const item of group.items) {
      if (plannerNavActive(pathname, item)) {
        return { group: group.label, title: item.label, hint: item.hint ?? "" };
      }
    }
  }
  if (pathname.startsWith("/planner/people/")) {
    return { group: "People", title: "Person", hint: "Tasks, posts, notes" };
  }
  if (pathname.startsWith("/planner/follow-ups/contacts")) {
    return { group: "Work", title: "Contacts", hint: "People we know" };
  }
  if (pathname.startsWith("/planner/follow-ups/")) {
    return { group: "Work", title: "Contact", hint: "Follow up log" };
  }
  if (pathname.startsWith("/planner/directory")) {
    return { group: "Ops", title: "Directory", hint: "Links we keep" };
  }
  if (pathname.startsWith("/planner/finances")) {
    return { group: "Ops", title: "Finances", hint: "Money in and out" };
  }
  return { group: "Planner", title: "Studio", hint: "" };
}

export type PlannerBio = {
  id: string;
  slug: string;
  full_name: string;
  preferred_name: string | null;
  pronouns: string | null;
  company: string | null;
  role_title: string | null;
  department: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  linkedin: string | null;
  instagram: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  languages: string | null;
  category: PlannerBioCategory;
  label: string | null;
  relationship: string | null;
  source: string | null;
  introduced_by: string | null;
  birthday: string | null;
  bio: string | null;
  notes: string | null;
  owner_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  owner?: PlannerMember | null;
};

export type PlannerBioSuggestions = {
  pronouns: string[];
  company: string[];
  role_title: string[];
  department: string[];
  city: string[];
  country: string[];
  industry: string[];
  languages: string[];
  relationship: string[];
  source: string[];
  introduced_by: string[];
  misc_label: string[];
};

export type PlannerBioCategory = "lead" | "sponsor" | "misc";

export const PLANNER_LEAD_LABELS = ["Warm", "Hot", "Cold", "Client"];
export const PLANNER_SPONSOR_LABELS = ["Big", "Small", "Medium"];

export const PLANNER_BIO_CATEGORY_COLOR: Record<PlannerBioCategory, string> = {
  lead: "#f5a524",
  sponsor: "#c084fc",
  misc: "#5b8cff",
};

export function plannerBioCategory(value: unknown): PlannerBioCategory {
  const text = String(value ?? "").trim().toLowerCase();
  if (text === "lead" || text === "sponsor" || text === "misc") return text;
  return "misc";
}

export function plannerBioLabel(category: PlannerBioCategory, value: unknown): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const set = category === "lead" ? PLANNER_LEAD_LABELS : category === "sponsor" ? PLANNER_SPONSOR_LABELS : null;
  if (!set) return text;
  return set.find((item) => item.toLowerCase() === text.toLowerCase()) ?? null;
}

export function plannerBioBanner(category: PlannerBioCategory, label: string | null) {
  if (category === "lead") {
    if (!label) return "Lead";
    if (label.toLowerCase() === "client") return "Client";
    return `${label} lead`;
  }
  if (category === "sponsor") return label ? `${label} sponsor` : "Sponsor";
  return label?.trim() || "Misc";
}

export const PLANNER_BIO_RELATIONSHIPS = ["Client", "Press", "Vendor", "Talent", "Partner", "Friend", "Studio"];
export const PLANNER_BIO_SOURCES = ["Referral", "Event", "Email", "Instagram", "On set", "Cold call"];
export const PLANNER_BIO_PRONOUNS = ["She", "He", "They"];

const BIO_SUGGEST_KEYS = [
  "pronouns",
  "company",
  "role_title",
  "department",
  "city",
  "country",
  "industry",
  "languages",
  "relationship",
  "source",
  "introduced_by",
] as const;

export function plannerBioSuggestions(rows: PlannerBio[]): PlannerBioSuggestions {
  const starters: Partial<Record<(typeof BIO_SUGGEST_KEYS)[number], string[]>> = {
    pronouns: PLANNER_BIO_PRONOUNS,
    relationship: PLANNER_BIO_RELATIONSHIPS,
    source: PLANNER_BIO_SOURCES,
  };
  const out = {} as PlannerBioSuggestions;
  for (const key of BIO_SUGGEST_KEYS) {
    const set = new Set<string>(starters[key] ?? []);
    for (const row of rows) {
      const value = row[key];
      if (typeof value === "string" && value.trim()) set.add(value.trim());
    }
    out[key] = [...set].sort((a, b) => a.localeCompare(b));
  }
  const misc = new Set<string>();
  for (const row of rows) {
    if (row.category === "misc" && row.label?.trim()) misc.add(row.label.trim());
  }
  out.misc_label = [...misc].sort((a, b) => a.localeCompare(b));
  return out;
}

export function draftFromBio(bio: PlannerBio) {
  return {
    full_name: bio.full_name,
    preferred_name: bio.preferred_name ?? "",
    pronouns: bio.pronouns ?? "",
    company: bio.company ?? "",
    role_title: bio.role_title ?? "",
    department: bio.department ?? "",
    industry: bio.industry ?? "",
    email: bio.email ?? "",
    phone: bio.phone ?? "",
    whatsapp: bio.whatsapp ?? "",
    website: bio.website ?? "",
    linkedin: bio.linkedin ?? "",
    instagram: bio.instagram ?? "",
    city: bio.city ?? "",
    country: bio.country ?? "",
    languages: bio.languages ?? "",
    category: bio.category ?? "misc",
    label: bio.label ?? "",
    relationship: bio.relationship ?? "",
    source: bio.source ?? "",
    introduced_by: bio.introduced_by ?? "",
    birthday: bio.birthday ?? "",
    bio: bio.bio ?? "",
    notes: bio.notes ?? "",
    owner_id: bio.owner_id ?? "",
  };
}

export function slugifyPlannerName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "member";
}
