import { DeferredVideo } from "@/components/media/DeferredVideo";

const HERO_VIDEOS = ["/videos/yailhp.mp4", "/videos/yailar02.mp4"] as const;

export default function HomeHero() {
  return (
    <section aria-label="Hero videos" className="w-full overflow-hidden bg-black">
      <div className="border-y border-blue-100 bg-white px-6 py-5 text-center sm:py-7">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 sm:gap-7">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-300" aria-hidden />
          <div>
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.34em] text-blue-500 sm:text-[10px]">
              YourAILens Originals
            </p>
            <h1 className="text-[clamp(1.25rem,3vw,2.8rem)] font-light leading-none tracking-[-0.035em] text-slate-900">
              Any world.{" "}
              <span className="font-semibold italic text-blue-600">One cinematic vision.</span>
            </h1>
          </div>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-300" aria-hidden />
        </div>
      </div>

      <div className="grid w-full grid-cols-2">
        {HERO_VIDEOS.map((src) => (
          <DeferredVideo
            key={src}
            src={src}
            eager
            className="block aspect-video h-full w-full object-cover"
          />
        ))}
      </div>
    </section>
  );
}
