/** Shared site navigation — navbar Browse mega + footer */

export const NAV_LABELS = {
  explore: "Browse",
  aiVerse: "AI Verse",
  worldOfAi: "World of AI",
  aiFilmmaking: "AI Filmmaking",
  aiAds: "AI Ads",
  vault: "YAIL Vault",
  pricing: "Pricing",
  team: "Team",
  portfolio: "Portfolio",
  channels: "Channels",
} as const;

/** Desktop / mobile World of AI dropdown */
export const WORLD_OF_AI_NAV_LINKS = [
  {
    href: "/ai-verse",
    label: "AI Verse",
    description: "The essay: what AI content is, and how to look through it.",
    image: "/images/img3.jpeg",
  },
  {
    href: "/ai-filmmaking",
    label: "AI Filmmaking",
    description: "Longer stories, returning characters, worlds that hold.",
    image: "/images/img2.jpeg",
  },
  {
    href: "/ai-ads",
    label: "AI Ads",
    description: "Product commercials and launch films that feel shot.",
    image: "/images/img1.jpeg",
  },
] as const;

/** Flat Browse sections — Portfolio, Talent, Channels sit side by side (no nest). */
export const BROWSE_SECTIONS = [
  {
    id: "portfolio" as const,
    label: NAV_LABELS.portfolio,
    items: [
      {
        href: "/ai-filmmaking",
        label: "AI Filmmaking",
        description: "Longer stories, returning characters, worlds that hold.",
        image: "/images/img2.jpeg",
      },
      {
        href: "/ai-ads",
        label: "AI Ads",
        description: "Product commercials and launch films that feel shot.",
        image: "/images/img1.jpeg",
      },
      {
        href: "/images",
        label: "Stills & visuals",
        description: "Campaign imagery, product shots, and key art.",
        image: "/images/img1.jpeg",
      },
      {
        href: "/films",
        label: "Films & motion",
        description: "Launch films, ads, and motion-led stories.",
        image: "/images/img2.jpeg",
      },
    ],
  },
  {
    id: "channels" as const,
    label: NAV_LABELS.channels,
    items: [
      {
        href: "/instagram",
        label: "Instagram",
        description: "Reels, stills, and behind the scenes.",
        image: "/images/otshirt1.png",
      },
      {
        href: "/youtube",
        label: "YouTube",
        description: "Long-form films and breakdowns.",
        image: "/images/img3.jpeg",
      },
    ],
  },
] as const;

export const WORLD_OF_AI_FOOTER_LINKS = [
  { href: "/vault", label: "YAIL Vault" },
  { href: "/ai-verse", label: "AI Verse" },
  { href: "/ai-filmmaking", label: "AI Filmmaking" },
  { href: "/ai-ads", label: "AI Ads" },
] as const;
