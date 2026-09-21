export type HomeWatchRail = "ads" | "films" | "community";

export type HomeWatchTitle = {
  slug: string;
  title: string;
  tag: string;
  rail: HomeWatchRail;
  railLabel: string;
  railHref: string;
  description: string;
  video?: string;
  poster?: string;
  youtubeId?: string;
  watchUrl?: string;
  watchLabel?: string;
  featured?: boolean;
  aspect?: "wide" | "poster";
};

export const HOME_WATCH_TITLES: HomeWatchTitle[] = [
  {
    slug: "headphones",
    title: "Headphones",
    tag: "Product",
    rail: "ads",
    railLabel: "AI ads",
    railHref: "/#ads",
    description: "Close on the product. The room goes quiet.",
    video: "/videos/yailhp.mp4",
    poster: "/videos/yailhp-poster.jpg",
  },
  {
    slug: "areal",
    title: "Areal",
    tag: "Food",
    rail: "ads",
    railLabel: "AI ads",
    railHref: "/#ads",
    description: "Food lit like a set. Steam, gloss, hold.",
    video: "/videos/yailar02.mp4",
    poster: "/videos/yailar02-poster.jpg",
  },
  {
    slug: "done-and-dusted",
    title: "Done & Dusted",
    tag: "Product",
    rail: "ads",
    railLabel: "AI ads",
    railHref: "/#ads",
    description: "Wipe the mess. Keep the shine.",
    video: "/videos/d&d.mp4",
    poster: "/videos/dnd-poster.jpg",
  },
  {
    slug: "the-teaser",
    title: "The Teaser",
    tag: "Launch",
    rail: "ads",
    railLabel: "AI ads",
    railHref: "/#ads",
    description: "A launch that starts already mid-scene.",
    video: "/videos/hero3.mp4",
    poster: "/videos/hero3-poster.jpg",
  },
  {
    slug: "fine-sugar",
    title: "Fine Sugar",
    tag: "Campaign",
    rail: "ads",
    railLabel: "AI ads",
    railHref: "/#ads",
    description: "Campaign pace. Stills that refuse to sit still.",
    video: "/videos/hero2.mp4",
    poster: "/videos/hero2-poster.jpg",
  },
  {
    slug: "earbuds",
    title: "Earbuds",
    tag: "Product",
    rail: "ads",
    railLabel: "AI ads",
    railHref: "/#ads",
    description: "A small object. A bigger room.",
    video: "/videos/hero5.mp4",
    poster: "/videos/hero5-poster.jpg",
  },
  {
    slug: "india-at-the-olympics",
    title: "India at the Olympics",
    tag: "Narrative",
    rail: "ads",
    railLabel: "AI ads",
    railHref: "/#ads",
    description: "A country, a stage, one held breath.",
    video: "/videos/india-in-olympics.mp4",
    poster: "/videos/india-in-olympics-poster.jpg",
  },
  {
    slug: "ai-films-trailer",
    title: "Our first 45 min AI film",
    tag: "45 min",
    rail: "films",
    railLabel: "AI films",
    railHref: "/#films",
    description: "Our first AI feature. Forty-five minutes, made on a limited clock.",
    youtubeId: "BENYHYceK6g",
    watchUrl: "https://www.youtube.com/watch?v=BENYHYceK6g",
    watchLabel: "Watch on YouTube",
    featured: true,
  },
  {
    slug: "vfx",
    title: "VFX",
    tag: "Video",
    rail: "films",
    railLabel: "AI films",
    railHref: "/#films",
    description: "The cut where the world gets rewritten.",
    video: "/videos/aiss.mp4",
    poster: "/videos/aiss-poster.jpg",
  },
  {
    slug: "from-the-feed",
    title: "From the feed",
    tag: "Instagram",
    rail: "community",
    railLabel: "AI community",
    railHref: "/ai-verse",
    description: "What the floor posted. Uncorrected.",
    video: "/videos/ig-ddgVpJnTemc.mp4",
    poster: "/videos/ig-ddgVpJnTemc-poster.jpg",
    watchUrl: "https://www.instagram.com/p/DdgVpJnTemc/",
    watchLabel: "Watch on Instagram",
    aspect: "poster",
  },
  {
    slug: "studio-floor",
    title: "Studio floor",
    tag: "Video",
    rail: "community",
    railLabel: "AI community",
    railHref: "/ai-verse",
    description: "Cameras rolling. Nobody posing.",
    video: "/videos/cs1.mp4",
    poster: "/videos/cs1-poster.jpg",
  },
];

export function getHomeWatch(slug: string) {
  return HOME_WATCH_TITLES.find((t) => t.slug === slug) ?? null;
}

export function homeWatchReel(slug: string) {
  const current = getHomeWatch(slug);
  if (!current) return { index: 0, reel: [] as typeof HOME_WATCH_TITLES };
  const reel = HOME_WATCH_TITLES.filter((t) => t.rail === current.rail);
  return { index: Math.max(0, reel.findIndex((t) => t.slug === slug)), reel };
}

export function homeWatchMore(slug: string) {
  return homeWatchReel(slug).reel.filter((t) => t.slug !== slug);
}
