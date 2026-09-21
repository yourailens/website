import Navbar from "@/components/Navbar";
import HomeHero from "@/components/home/HomeHero";
import HomeStudioStory from "@/components/home/HomeStudioStory";
import { SceneRail } from "@/components/home/LensChrome";

export default function Home() {
  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      <Navbar />
      <SceneRail />
      <HomeHero />
      <HomeStudioStory />
    </div>
  );
}
