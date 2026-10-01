import Navbar from "@/components/Navbar";
import HomeHero from "@/components/home/HomeHero";
import HomeMattress from "@/components/home/HomeMattress";
import HomeStudioStory from "@/components/home/HomeStudioStory";
import { SceneRail } from "@/components/home/LensChrome";
import MobileHomeApp from "@/components/home/mobile/MobileHomeApp";
import { loadMobileHomeData } from "@/components/home/mobile/load-mobile-home";
import { ottCutYoutubeId } from "@/data/ott-cuts";
import { getMattressAdOttCut } from "@/lib/ott-cuts/load";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [mobile, mattress] = await Promise.all([loadMobileHomeData(), getMattressAdOttCut()]);
  const mattressYoutube = mattress ? ottCutYoutubeId(mattress.media_url) : null;

  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      {/* Same logo / search / menu as laptop — both breakpoints */}
      <Navbar />

      <div className="hidden md:block">
        <SceneRail />
        {mattress ? (
          <HomeMattress
            src={!mattressYoutube && mattress.media_type === "video" ? mattress.media_url : null}
            poster={mattress.poster_url ?? (mattress.media_type === "image" ? mattress.media_url : null)}
            youtubeId={mattressYoutube}
          />
        ) : null}
        <HomeHero />
        <HomeStudioStory />
      </div>

      <div className="md:hidden">
        <MobileHomeApp data={mobile} />
      </div>
    </div>
  );
}
