import Navbar from "@/components/Navbar";
import HomeHero from "@/components/home/HomeHero";
import HomeStudioStory from "@/components/home/HomeStudioStory";
import { SceneRail } from "@/components/home/LensChrome";
import { getHomepageFeatureOttCut } from "@/lib/ott-cuts/load";
import { ottCutYoutubeId } from "@/data/ott-cuts";

export default async function Home() {
  const featured = await getHomepageFeatureOttCut();
  const youtubeId = featured ? ottCutYoutubeId(featured.media_url) : null;

  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      <Navbar />
      <SceneRail />
      <HomeHero
        feature={
          featured
            ? {
                slug: featured.slug,
                caption: featured.caption,
                mediaUrl: featured.media_url,
                posterUrl: featured.poster_url,
                youtubeId,
                href: `/ai-filmmaking#${featured.slug}`,
              }
            : null
        }
      />
      <HomeStudioStory />
    </div>
  );
}
