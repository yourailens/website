import type { Metadata } from "next";
import YailiansHub from "@/components/yailians/YailiansHub";
import { ottCutYoutubeId } from "@/data/ott-cuts";
import {
  getPublishedScreenings,
  getPublishedVoices,
  getPublishedWorld,
  getYailiansSite,
} from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getYailiansSite();
  const yt = site.trailer_url ? ottCutYoutubeId(site.trailer_url) : null;
  const ogImage =
    site.hero_image_url ||
    site.trailer_poster ||
    (yt ? `https://i.ytimg.com/vi/${yt}/maxresdefault.jpg` : null);
  return {
    title: `${site.title} · YAIL`,
    description: site.tagline || "Our first 45 min AI film.",
    openGraph: {
      title: site.title,
      description: site.tagline || "Our first 45 min AI film.",
      url: "/yailians",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  };
}

export default async function YailiansPage() {
  const [site, voices, screenings, world] = await Promise.all([
    getYailiansSite(),
    getPublishedVoices({ featuredOnly: true }),
    getPublishedScreenings({ featuredOnly: true }),
    getPublishedWorld({ featuredOnly: true }),
  ]);

  // If nothing featured yet, fall back to latest published so the hub isn’t empty.
  const [voicesAll, screeningsAll, worldAll] = await Promise.all([
    voices.length ? Promise.resolve(voices) : getPublishedVoices(),
    screenings.length ? Promise.resolve(screenings) : getPublishedScreenings(),
    world.length ? Promise.resolve(world) : getPublishedWorld(),
  ]);

  return (
    <YailiansHub
      site={site}
      voices={voicesAll.slice(0, 4)}
      screenings={screeningsAll.slice(0, 3)}
      world={worldAll.slice(0, 8)}
    />
  );
}
