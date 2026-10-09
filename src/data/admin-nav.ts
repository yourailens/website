/** Admin desk navigation — shared by the shell sidebar. */

export type AdminNavItem = {
  href: string;
  label: string;
  hint?: string;
  /** Match only the exact path (for the desk home). */
  exact?: boolean;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  items: AdminNavItem[];
};

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    id: "stage",
    label: "Stage",
    items: [
      { href: "/admin", label: "Desk", hint: "Heroes & OTT cuts", exact: true },
      { href: "/admin/manage", label: "Gallery", hint: "Reorder & delete" },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    items: [
      { href: "/admin/team", label: "Team", hint: "People & portraits" },
      { href: "/admin/services", label: "Pricing", hint: "Packages" },
      { href: "/admin/events", label: "Events", hint: "Meetups & shows" },
      { href: "/admin/workshops", label: "Workshops", hint: "Bookings" },
    ],
  },
  {
    id: "lab",
    label: "Lab",
    items: [
      { href: "/admin/vault", label: "YAIL Vault", hint: "GenAI labs & notes" },
      { href: "/admin/the-future", label: "The Future", hint: "Fields & modules" },
    ],
  },
];

export const ADMIN_QUICK_ACTIONS: {
  href: string;
  label: string;
  kicker: string;
  blurb: string;
}[] = [
  {
    href: "/admin/vault",
    label: "YAIL Vault",
    kicker: "01",
    blurb: "GenAI labs — filmmaking, ads, notes.",
  },
  {
    href: "/admin",
    label: "OTT cuts",
    kicker: "02",
    blurb: "Hero slots, ads, films, community.",
  },
  {
    href: "/admin/manage",
    label: "Gallery",
    kicker: "03",
    blurb: "Reorder stills and films. Delete bad cuts.",
  },
  {
    href: "/admin/events",
    label: "Events",
    kicker: "04",
    blurb: "Publish meetups and showtimes.",
  },
  {
    href: "/admin/services",
    label: "Pricing",
    kicker: "05",
    blurb: "Weekly, monthly, and custom packages.",
  },
  {
    href: "/admin/team",
    label: "Team",
    kicker: "06",
    blurb: "Profiles for the public team page.",
  },
];

export function adminNavActive(pathname: string, item: AdminNavItem) {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function adminPageMeta(pathname: string) {
  for (const group of ADMIN_NAV) {
    for (const item of group.items) {
      if (adminNavActive(pathname, item)) {
        return { group: group.label, title: item.label, hint: item.hint ?? "" };
      }
    }
  }
  if (pathname.startsWith("/admin")) {
    return { group: "Desk", title: "Admin", hint: "" };
  }
  return { group: "", title: "", hint: "" };
}
