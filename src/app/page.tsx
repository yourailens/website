import Navbar from "@/components/Navbar";
import HomeHero from "@/components/home/HomeHero";
import HomeStudioStory from "@/components/home/HomeStudioStory";
import { SceneRail } from "@/components/home/LensChrome";
import MobileHomeApp from "@/components/home/mobile/MobileHomeApp";
import { loadMobileHomeData } from "@/components/home/mobile/load-mobile-home";

export const dynamic = "force-dynamic";

export default async function Home() {
  const mobile = await loadMobileHomeData();

  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      {/* Same logo / search / menu as laptop — both breakpoints */}
      <Navbar />

      <div className="hidden md:block">
        <SceneRail />
        <HomeHero />
        <HomeStudioStory />
      </div>

      <div className="md:hidden">
        <MobileHomeApp data={mobile} />
      </div>
    </div>
  );
}
