export type OttSearchKind = "Channel" | "Film" | "Still" | "Page";

export type OttSearchHit = {
  href: string;
  title: string;
  kind: OttSearchKind;
  image?: string | null;
  subtitle?: string;
};

export const OTT_SEARCH_HINTS = ["vault", "ads", "films", "community", "events", "team"];

export const OTT_SEARCH_CHIPS: { label: string; query: string }[] = [
  { label: "Vault", query: "vault" },
  { label: "Ads", query: "ads" },
  { label: "Films", query: "films" },
  { label: "Community", query: "community" },
  { label: "Events", query: "events" },
  { label: "Pricing", query: "pricing" },
];

export const OTT_SEARCH_CATALOG: OttSearchHit[] = [
  {
    href: "/vault",
    title: "YAIL Vault",
    kind: "Channel",
    subtitle: "GenAI labs for filmmaking and ads",
  },
  {
    href: "/about",
    title: "About",
    kind: "Page",
    subtitle: "The desk, the models, the method",
  },
  {
    href: "/ai-ads",
    title: "AI Ads",
    kind: "Channel",
    image: "/images/img1.jpeg",
    subtitle: "Product commercials and launch films",
  },
  {
    href: "/ai-filmmaking",
    title: "AI Films",
    kind: "Channel",
    image: "/images/img2.jpeg",
    subtitle: "Longer stories, returning characters",
  },
  {
    href: "/ai-verse",
    title: "AI Community",
    kind: "Channel",
    image: "/images/img3.jpeg",
    subtitle: "Stills and cuts from the studio",
  },
  {
    href: "/team",
    title: "Team",
    kind: "Page",
    image: "/images/img4.jpeg",
    subtitle: "Faces behind the work",
  },
  {
    href: "/pricing",
    title: "Pricing",
    kind: "Page",
    subtitle: "Packages, briefs, and call sheets",
  },
  {
    href: "/events",
    title: "Events",
    kind: "Page",
    image: "/images/img4.jpeg",
    subtitle: "Workshops and studio gatherings",
  },
  {
    href: "/web-dev",
    title: "Web Dev",
    kind: "Page",
    subtitle: "Full stack sites with AI integration",
  },
  {
    href: "/contact",
    title: "Contact",
    kind: "Page",
    subtitle: "Commission a world",
  },
  {
    href: "/images",
    title: "Stills & visuals",
    kind: "Still",
    image: "/images/img1.jpeg",
    subtitle: "Campaign imagery and key art",
  },
  {
    href: "/films",
    title: "Films & motion",
    kind: "Film",
    image: "/images/img2.jpeg",
    subtitle: "Launch films and motion-led stories",
  },
  {
    href: "/instagram",
    title: "Instagram",
    kind: "Channel",
    image: "/images/otshirt1.png",
    subtitle: "Reels, stills, behind the scenes",
  },
  {
    href: "/youtube",
    title: "YouTube",
    kind: "Channel",
    image: "/images/img3.jpeg",
    subtitle: "Long-form films and breakdowns",
  },
  { href: "/events", title: "YAIL 01: AI Creators Meetup", kind: "Page", subtitle: "The Theatre Showcase" },
  { href: "/events/ai-creator-workshop", title: "AI Creator Workshop", kind: "Page", subtitle: "Hands-on studio session" },
];

const KIND_ORDER: OttSearchKind[] = ["Channel", "Film", "Still", "Page"];

export function matchOttSearch(hits: OttSearchHit[], query: string): OttSearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = hits
    .map((hit) => {
      const title = hit.title.toLowerCase();
      const sub = (hit.subtitle ?? "").toLowerCase();
      const kind = hit.kind.toLowerCase();
      let score = 0;
      if (title === q) score = 100;
      else if (title.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else if (sub.includes(q) || kind.includes(q)) score = 30;
      else return null;
      return { hit, score };
    })
    .filter((row): row is { hit: OttSearchHit; score: number } => row !== null)
    .sort((a, b) => b.score - a.score || KIND_ORDER.indexOf(a.hit.kind) - KIND_ORDER.indexOf(b.hit.kind));
  return scored.map((row) => row.hit);
}

export function groupOttSearch(hits: OttSearchHit[]): { kind: OttSearchKind; items: OttSearchHit[] }[] {
  const map = new Map<OttSearchKind, OttSearchHit[]>();
  for (const hit of hits) {
    const list = map.get(hit.kind) ?? [];
    list.push(hit);
    map.set(hit.kind, list);
  }
  return KIND_ORDER.filter((kind) => map.has(kind)).map((kind) => ({ kind, items: map.get(kind)! }));
}
