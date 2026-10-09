import Navbar from "@/components/Navbar";
import HomeBelowHero from "@/components/home/HomeBelowHero";
import HomeHero from "@/components/home/HomeHero";
import HomeSoundHero from "@/components/home/HomeSoundHero";
import HomeStudioStory from "@/components/home/HomeStudioStory";
import { SceneRail } from "@/components/home/LensChrome";
import { HERO_SLOTS, ottCutYoutubeId } from "@/data/ott-cuts";
import { getHomepageHeroSlots } from "@/lib/ott-cuts/load";

export const dynamic = "force-dynamic";

export default async function Home() {
  const heroes = await getHomepageHeroSlots();

  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      <Navbar />
      <SceneRail />
      <HomeSoundHero
        lead={
          heroes[0]
            ? {
                label: HERO_SLOTS.find((slot) => slot.id === heroes[0].hero_slot)?.label ?? "Hero",
                title: heroes[0].caption,
                src:
                  !ottCutYoutubeId(heroes[0].media_url) && heroes[0].media_type === "video"
                    ? heroes[0].media_url
                    : null,
                poster: heroes[0].poster_url ?? (heroes[0].media_type === "image" ? heroes[0].media_url : null),
                youtubeId: ottCutYoutubeId(heroes[0].media_url),
              }
            : null
        }
      />
      {heroes.slice(1).map((hero) => {
        const youtubeId = ottCutYoutubeId(hero.media_url);
        return (
          <HomeBelowHero
            key={hero.id}
            label={HERO_SLOTS.find((slot) => slot.id === hero.hero_slot)?.label ?? "Hero"}
            title={hero.caption}
            src={!youtubeId && hero.media_type === "video" ? hero.media_url : null}
            poster={hero.poster_url ?? (hero.media_type === "image" ? hero.media_url : null)}
            youtubeId={youtubeId}
          />
        );
      })}
      {heroes[0] ? <HomeHero /> : null}
      <HomeStudioStory />
    </div>
  );
}
