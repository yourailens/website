import Image from "next/image";
import Navbar from "@/components/Navbar";
import HomeHero from "@/components/home/HomeHero";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import HomeStudioStory from "@/components/home/HomeStudioStory";

const AI_MODELS = [
  { name: "Higgsfield", logo: "/images/logos/higgsfield.png" },
  { name: "Kling AI", logo: "/images/logos/kling.png" },
  { name: "Seedance", logo: "/images/logos/bytedance-icon.png" },
  { name: "Claude", logo: "/images/logos/anthropic.png" },
  { name: "Gemini", logo: "/images/logos/gemini-star.svg" },
  { name: "Veo", logo: "/images/logos/veo.svg" },
  { name: "OpenAI", logo: "/images/logos/openai.png" },
  { name: "Eleven Labs", logo: "/images/logos/elevenlabs.png" },
  { name: "Minimax", logo: "/images/logos/minimax.svg", dark: true },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-body">
      <Navbar />
      <HomeHero />

      <HomeBlueTint className="overflow-hidden border-t border-blue-100/70 py-7">
        <p className="mb-4 text-center text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/70">
          Powered by
        </p>
        <div className="flex animate-marquee gap-5 pr-5">
          {[...AI_MODELS, ...AI_MODELS].map((model, index) => (
            <div
              key={`${model.name}-${index}`}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-blue-100/80 bg-white/90 px-4 py-2.5 shadow-sm shadow-blue-100/30"
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${
                  model.dark ? "bg-slate-800" : ""
                }`}
              >
                <Image
                  src={model.logo}
                  alt={model.name}
                  width={18}
                  height={18}
                  className="h-4 w-4 object-contain"
                  loading="lazy"
                />
              </div>
              <span className="text-[12px] font-semibold text-slate-700">{model.name}</span>
            </div>
          ))}
        </div>
      </HomeBlueTint>

      <HomeStudioStory />
    </div>
  );
}
