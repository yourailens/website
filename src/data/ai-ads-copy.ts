/** Editorial copy for /ai-ads */

export const AI_ADS = {
  hero: {
    eyebrow: "Studio practice",
    title: "AI",
    accent: "Ads",
    body: "Product commercials, launch films, and campaign packs that look directed — not generated. Fast enough for marketing. Sharp enough for brand.",
  },
  promise: {
    eyebrow: "What this is",
    title: "Ads that feel",
    accent: "shot.",
    body: "YourAILens Studios builds commercial work with cinematic craft: clear product, clean continuity, and finishing that holds on a big screen or a phone.",
  },
  pillars: [
    {
      no: "01",
      title: "Product clarity",
      detail: "The hero stays readable. Packaging, form, and benefit land in seconds.",
    },
    {
      no: "02",
      title: "Campaign pace",
      detail: "Stills in days. Films in one to two weeks. Built for real launch calendars.",
    },
    {
      no: "03",
      title: "Visual consistency",
      detail: "One look across spots, cutdowns, and stills — not a different tool every frame.",
    },
  ],
  craft: {
    eyebrow: "Craft",
    title: "Commercial direction, AI production",
    body: "We treat generative systems like a camera unit. Creative direction, art direction, and post still decide what ships.",
    items: [
      {
        title: "Brief to look",
        detail: "References, brand rules, and a locked visual system before the first frame.",
      },
      {
        title: "Hero product",
        detail: "Accurate materials, scale, and logo integrity across every shot.",
      },
      {
        title: "Talent & sets",
        detail: "AI avatars or environments that match the campaign world.",
      },
      {
        title: "Cutdowns & stills",
        detail: "Masters, social crops, and key frames from one production.",
      },
    ],
  },
  process: {
    eyebrow: "Process",
    title: "From brief to delivery",
    steps: [
      { no: "01", label: "Brief", detail: "Product, audience, platforms, and the one feeling that must land." },
      { no: "02", label: "Look lock", detail: "Mood, lighting, casting, and shot list — approved before synthesis." },
      { no: "03", label: "Produce", detail: "Directed generation for hero shots, action, and supporting scenes." },
      { no: "04", label: "Finish", detail: "Edit, grade, sound, captions, and platform-ready exports." },
    ],
  },
  reel: {
    eyebrow: "Selected work",
    title: "Commercials in the reel",
    body: "Launch films and product spots already shipping for brands and founders.",
  },
  formats: {
    eyebrow: "Formats",
    title: "What we can deliver",
    items: [
      { title: "Product commercials", detail: "Fifteen to sixty seconds. Hero product, clear story." },
      { title: "Launch films", detail: "Teasers and announce spots for drops and campaigns." },
      { title: "Social cutdowns", detail: "Vertical and square packs from the same master." },
      { title: "Still campaigns", detail: "Key art, carousels, and product grids that match the film." },
    ],
  },
  youBring: [
    { no: "01", label: "A brief", detail: "One conversation. Product, story, or campaign." },
    { no: "02", label: "A budget", detail: "Stills from ₹15,000. Films from ₹30,000." },
    { no: "03", label: "A date", detail: "Stills in 5–8 days. Films in 7–14." },
  ],
  cta: {
    eyebrow: "Start a campaign",
    title: "Bring us the product.",
    accent: "We'll build the ad.",
  },
} as const;

export const AI_ADS_REEL = [
  {
    no: "01",
    title: "Done & Dusted",
    kind: "Product commercial",
    video: "/videos/d&d.mp4",
    poster: "/videos/dnd-poster.jpg",
  },
  {
    no: "02",
    title: "Earbuds",
    kind: "Product commercial",
    video: "/videos/hero5.mp4",
    poster: "/videos/hero5-poster.jpg",
  },
  {
    no: "03",
    title: "Fine Sugar",
    kind: "Campaign film",
    video: "/videos/hero2.mp4",
    poster: "/videos/hero2-poster.jpg",
  },
  {
    no: "04",
    title: "The Teaser",
    kind: "Launch film",
    video: "/videos/hero3.mp4",
    poster: "/videos/hero3-poster.jpg",
  },
] as const;
