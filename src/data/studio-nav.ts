/** Shared site navigation — navbar mega menus + footer */

export const NAV_LABELS = {
  industries: "Industries",
  creations: "Creations",
  studio: "Studio",
  pricing: "Pricing",
} as const;

export const MODULES_NAV_CATEGORIES = [
  {
    label: "Browse",
    items: [
      { href: "/modules/prompt-playbooks", label: "Prompt Playbooks" },
      { href: "/modules/client-showcases", label: "Client Showcases" },
      { href: "/modules/subjects-visuals", label: "Subjects & Visuals" },
    ],
  },
] as const;

export const RESOURCES_NAV_CATEGORIES = [
  {
    label: "Characters & style",
    items: [
      { href: "/character-sheets", label: "Models" },
      { href: "/outfits", label: "Outfit Sheets" },
      { href: "/props", label: "Props Library" },
    ],
  },
  {
    label: "Scenes & world",
    items: [
      { href: "/scenarios", label: "Reference Scenarios" },
      { href: "/locations", label: "Locations" },
      { href: "/mood-boards", label: "Mood Boards" },
    ],
  },
  {
    label: "Production",
    items: [
      { href: "/prompts", label: "Workflows" },
      { href: "/lighting-presets", label: "Lighting Presets" },
      { href: "/color-grades", label: "Color Grading" },
    ],
  },
] as const;

export type CreationsMegaSection = "portfolio" | "talent" | "channels" | "future";

export const CREATIONS_MEGA_SIDEBAR: { id: CreationsMegaSection; label: string }[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "talent", label: "AI talent & events" },
  { id: "channels", label: "Channels" },
  { id: "future", label: "The Future" },
];

export const CREATIONS_FUTURE_LINKS = [
  {
    href: "/world-of-ai",
    label: "World of AI",
    description: "Interpretations, craft, and how the medium really works.",
  },
  {
    href: "/the-future/science-technology",
    label: "Science & Technology",
    description: "Research, systems, and what comes next.",
  },
  {
    href: "/the-future/arts",
    label: "Arts",
    description: "Culture, craft, and creative futures.",
  },
  {
    href: "/the-future/law",
    label: "Law",
    description: "Rights, governance, and civic imagination.",
  },
  {
    href: "/the-future",
    label: "All fields",
    description: "Browse every broad field in The Future.",
  },
] as const;

export const CREATIONS_PORTFOLIO_LINKS = [
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
] as const;

export const CREATIONS_TALENT_LINKS = [
  {
    href: "/avatars",
    label: "AI avatars",
    description: "Consistent on-camera talent for any brief.",
    image: "/images/ai_avatar1.jpeg",
  },
  {
    href: "/events",
    label: "Events",
    description: "Workshops, launches, and studio gatherings.",
    image: "/images/img4.jpeg",
  },
] as const;

export const CREATIONS_CHANNEL_LINKS = [
  {
    href: "/instagram",
    label: "Instagram",
    description: "Reels, stills, and behind the scenes.",
    icon: "instagram" as const,
    image: "/images/otshirt1.png",
  },
  {
    href: "/youtube",
    label: "YouTube",
    description: "Long-form films and breakdowns.",
    icon: "youtube" as const,
    image: "/images/img3.jpeg",
  },
] as const;

/** Hero visuals for desktop mega menus (section keys match sidebar ids). */
export const NAV_MEGA_VISUALS = {
  creations: {
    portfolio: {
      src: "/images/b3.jpeg",
      alt: "Campaign stills and motion from YourAILens",
      caption: "Portfolio",
    },
    talent: {
      src: "/images/ai_avatar1.jpeg",
      alt: "AI avatar talent",
      caption: "AI talent & events",
    },
    channels: {
      src: "/images/c1.png",
      alt: "Social and channel content",
      caption: "Channels",
    },
    future: {
      src: "/images/f1.png",
      alt: "The Future — broad fields and possibilities",
      caption: "The Future",
    },
  },
  industries: {
    "property-commerce": {
      src: "/images/r1.png",
      alt: "Property and lifestyle brand imagery",
      caption: "Property & Lifestyle",
    },
    "commerce-tech": {
      src: "/images/i2.png",
      alt: "Commerce and technology brand imagery",
      caption: "Commerce & tech",
    },
    "brands-services": {
      src: "/images/i3.png",
      alt: "Brands and services imagery",
      caption: "Brands & services",
    },
  },
  studio: {
    modules: {
      src: "/images/shoe.png",
      alt: "Studio modules gallery",
      caption: "Modules",
    },
    libraries: {
      src: "/images/ws3.png",
      alt: "Reference libraries for production",
      caption: "Reference libraries",
    },
  },
} as const;

export type IndustryMegaSection = "property-commerce" | "commerce-tech" | "brands-services";

export const INDUSTRY_MEGA_SIDEBAR: { id: IndustryMegaSection; label: string }[] = [
  { id: "commerce-tech", label: "Commerce & tech" },
  { id: "brands-services", label: "Brands & services" },
  { id: "property-commerce", label: "Property & Lifestyle" },
];

/** Which third of the sorted industry list each section owned before the sidebar reorder */
export const INDUSTRY_MEGA_LEGACY_SLICE: Record<IndustryMegaSection, number> = {
  "property-commerce": 0,
  "commerce-tech": 1,
  "brands-services": 2,
};

export type StudioMegaSection = "modules" | "libraries";

export const STUDIO_MEGA_SIDEBAR: { id: StudioMegaSection; label: string }[] = [
  { id: "modules", label: "Modules" },
  { id: "libraries", label: "Reference libraries" },
];

/** Mobile + footer — hub links only (no deep library lists in nav) */
export const CREATIONS_MOBILE_LINKS = [
  { href: "/images", label: "Stills & visuals" },
  { href: "/films", label: "Films & motion" },
  { href: "/avatars", label: "AI avatars" },
  { href: "/events", label: "Events" },
  { href: "/world-of-ai", label: "World of AI" },
  { href: "/the-future", label: "The Future" },
  { href: "/instagram", label: "Instagram" },
  { href: "/youtube", label: "YouTube" },
] as const;

export const STUDIO_MOBILE_LINKS = [
  { href: "/modules", label: "Modules" },
  { href: "/resources", label: "Reference library" },
] as const;

export const EXPLORE_GALLERY_LINKS = [
  { href: "/images", label: "Images" },
  { href: "/films", label: "Films" },
] as const;

export const EXPLORE_FOOTER_LINKS = [
  { href: "/industries", label: "Industries" },
  { href: "/world-of-ai", label: "World of AI" },
  { href: "/the-future", label: "The Future" },
  { href: "/images", label: "Stills" },
  { href: "/films", label: "Films" },
  { href: "/avatars", label: "Avatars" },
  { href: "/events", label: "Events" },
  { href: "/instagram", label: "Instagram" },
  { href: "/youtube", label: "YouTube" },
] as const;
