import { HOME_WATCH_TITLES, type HomeWatchTitle } from "@/data/home-watch";
import { ottCutYoutubeId, type OttCut } from "@/data/ott-cuts";
import { getHomepageFeatureOttCut, getPublishedOttCuts } from "@/lib/ott-cuts/load";
import type { MobileClip, MobileHomeData } from "./types";

const LOCAL_POSTER_ALIASES: Record<string, string> = {
  "/videos/d&d.mp4": "/videos/dnd-poster.jpg",
};

/** Map a local video path to its poster URL (string only — no fs, so Vercel won't pack videos into the function). */
function localPosterGuess(src?: string | null): string | undefined {
  if (!src?.startsWith("/videos/")) return undefined;
  const path = src.split("#")[0]?.split("?")[0] ?? "";
  if (LOCAL_POSTER_ALIASES[path]) return LOCAL_POSTER_ALIASES[path];
  if (!/\.(mp4|mov|webm)$/i.test(path)) return undefined;
  return path.replace(/\.(mp4|mov|webm)$/i, "-poster.jpg");
}

function ottPoster(slug: string): string {
  return `/videos/ott-posters/${slug}-poster.jpg`;
}

function fromWatch(item: HomeWatchTitle, section: string): MobileClip {
  return {
    id: item.slug,
    title: item.title,
    tag: item.tag,
    section,
    href: item.watchUrl ?? `/watch/${item.slug}`,
    poster:
      item.poster ||
      (item.youtubeId ? `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg` : undefined) ||
      localPosterGuess(item.video),
    video: item.video,
    youtubeId: item.youtubeId ?? null,
    portrait: item.aspect === "poster",
  };
}

function fromCut(cut: OttCut, path: string, section: string): MobileClip {
  const yt = ottCutYoutubeId(cut.media_url);
  return {
    id: cut.id,
    title: cut.caption,
    tag: cut.aspect_ratio === "natural" ? undefined : cut.aspect_ratio.toUpperCase(),
    section,
    href: `${path}#${cut.slug}`,
    poster:
      cut.poster_url ||
      (yt ? `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` : undefined) ||
      (cut.media_type === "image" ? cut.media_url : undefined) ||
      ottPoster(cut.slug) ||
      localPosterGuess(cut.media_url),
    video: !yt && cut.media_type === "video" ? cut.media_url : null,
    youtubeId: yt,
    portrait: cut.aspect_ratio === "story" || cut.aspect_ratio === "portrait",
  };
}

export async function loadMobileHomeData(): Promise<MobileHomeData> {
  const [adsCuts, filmCuts, homepageFeature] = await Promise.all([
    getPublishedOttCuts("ads"),
    getPublishedOttCuts("films"),
    getHomepageFeatureOttCut(),
  ]);

  const landed = [...adsCuts]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 12)
    .map((cut) => fromCut(cut, "/ai-ads", "Just landed"));

  const formats = HOME_WATCH_TITLES.filter((t) => t.rail === "ads").map((t) => fromWatch(t, "Any format"));

  const feature = homepageFeature ? fromCut(homepageFeature, "/ai-filmmaking", "Feature") : null;

  const lot = [...filmCuts]
    .filter((cut) => !cut.homepage_feature)
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 12)
    .map((cut) => fromCut(cut, "/ai-filmmaking", "On the lot"));

  const community = HOME_WATCH_TITLES.filter((t) => t.rail === "community").map((t) =>
    fromWatch(t, "Community")
  );

  return {
    hero: {
      id: "hero-opening",
      title: "YourAILens Studios",
      tag: "OPENING",
      section: "Int. Lens",
      href: "#ads",
      poster: "/videos/hero_new-poster.jpg",
      video: "/videos/hero_new.mp4",
    },
    landed,
    formats,
    feature,
    lot,
    community,
    pricing: [
      { title: "Weekly", tag: "₹38,250 · 9 films", href: "/pricing#weekly" },
      { title: "Monthly", tag: "₹1,44,000 · 36 films", href: "/pricing#monthly" },
      { title: "3 months", tag: "₹4,05,000 · 108 films", href: "/pricing#quarterly" },
      { title: "A la carte", tag: "Build the fare", href: "/pricing#alacarte" },
      { title: "AI menu", tag: "Logo, stills, more", href: "/pricing#ai-menu" },
    ],
  };
}
