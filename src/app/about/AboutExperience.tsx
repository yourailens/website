import Link from "next/link";
import Navbar from "@/components/Navbar";

const MODELS = [
  {
    name: "Seedance",
    maker: "ByteDance",
    use: "Action video, continuity, and the 15s beats we build campaigns on.",
    logo: "/images/logos/bytedance-icon.svg",
  },
  {
    name: "Kling AI",
    maker: "Kuaishou",
    use: "Long form motion, camera moves, and realism when the shot has to travel.",
    logo: "/images/logos/kling.png",
  },
  {
    name: "Google Veo",
    maker: "Google DeepMind",
    use: "Cinematic video. Camera grammar, lighting, and motion that hold a shot.",
    logo: "/images/logos/veo.svg",
  },
  {
    name: "Wan",
    maker: "Alibaba",
    use: "High fidelity video for campaigns that need scale without losing finish.",
    logo: "/images/logos/wan.svg",
  },
  {
    name: "Grok",
    maker: "xAI",
    use: "Image and video passes with a harder, more physical look.",
    logo: "/images/logos/grok.svg",
  },
  {
    name: "MiniMax",
    maker: "MiniMax",
    use: "Audio, voice, and motion when the soundtrack has to ship with the picture.",
    logo: "/images/logos/minimax.svg",
  },
  {
    name: "Seedream",
    maker: "ByteDance",
    use: "Still art, keyframes, and look development before the cut moves.",
    logo: "/images/logos/seedream.svg",
  },
  {
    name: "Nano Banana",
    maker: "Google",
    use: "Still generation and product frames when the picture has to lock fast.",
    logo: "/images/logos/nanobanana.svg",
  },
  {
    name: "Gemini",
    maker: "Google",
    use: "Direction, scripts, shot lists, and iteration loops on every brief.",
    logo: "/images/logos/gemini-star.svg",
  },
] as const;

const DESK = [
  { code: "01", title: "Ads", body: "Product commercials, launch films, and format packs that already live in the world." },
  { code: "02", title: "Films", body: "Longer pictures. Returning characters. A 45 minute clock when the brief asks for it." },
  { code: "03", title: "Stills", body: "Campaign imagery, product shots, and key art that match the motion." },
  { code: "04", title: "Web", body: "Full stack sites with the same applied AI methods we use on picture." },
] as const;

export default function AboutExperience() {
  return (
    <div className="ott-home relative min-h-screen overflow-x-hidden bg-black font-body text-white">
      <Navbar />

      <section className="relative overflow-hidden">
        <div className="about-hero-fx pointer-events-none absolute inset-0" aria-hidden>
          <span className="about-hero-fx__mesh" />
          <span className="about-hero-fx__shimmer" />
          <span className="about-hero-fx__orb about-hero-fx__orb--left" />
          <span className="about-hero-fx__orb about-hero-fx__orb--right" />
          <span className="about-hero-fx__scan" />
          <span className="about-hero-fx__grain" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo_transparent.png"
            alt=""
            className="about-hero-fx__mark"
          />
        </div>

        <div className="relative mx-auto max-w-[90rem] px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:px-16">
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CHANNEL · STUDIO</p>
          <h1 className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3">
            <span className="sr-only">About YAIL Studios</span>
            <span className="font-body text-[clamp(2.4rem,8vw,5.2rem)] font-semibold leading-none tracking-tight">
              About
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo_yail.png"
              alt=""
              className="h-[clamp(2.8rem,10vw,6rem)] w-auto select-none drop-shadow-[0_0_28px_rgba(59,130,246,0.45)]"
              aria-hidden
            />
            <span className="font-body text-[clamp(2.4rem,8vw,5.2rem)] font-semibold leading-none tracking-tight">
              Studios
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
            YourAILens Studios is an applied AI production desk. Ads, films, stills, and websites
            built on the latest models, finished like a studio, shipped on a compressed clock.
          </p>
          <div className="mt-8">
            <Link
              href="/contact"
              className="relative inline-flex shrink-0 items-center whitespace-nowrap rounded-md border border-blue-400/55 bg-transparent px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300 shadow-[inset_0_1px_0_rgba(96,165,250,0.25)] backdrop-blur-md transition hover:border-blue-300 hover:text-blue-200"
            >
              Book a call
            </Link>
          </div>
        </div>
      </section>

      <section className="relative border-y border-white/10">
        <div className="mx-auto grid max-w-[90rem] sm:grid-cols-2 lg:grid-cols-4">
          {DESK.map((row) => (
            <div
              key={row.code}
              className="border-b border-white/10 px-5 py-7 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-8"
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-blue-400">{row.code}</p>
              <p className="mt-2 font-body text-lg font-semibold leading-none tracking-tight">{row.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{row.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">DESK MODELS</p>
        <h2 className="mt-3 font-body text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-none tracking-tight">
          The latest stack. In production.
        </h2>
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/55">
          We do not lock to one engine. Each brief picks the model that holds the look. Video,
          stills, voice, and direction. Current generation, used on real jobs.
        </p>

        <ul className="mt-10 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {MODELS.map((model) => (
            <li
              key={model.name}
              className="flex flex-col border border-white/12 bg-white/[0.02] px-5 py-6"
            >
              <div className="flex h-12 items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={model.logo}
                  alt=""
                  className="h-8 w-auto max-w-[7.5rem] object-contain object-left"
                />
              </div>
              <p className="mt-5 font-body text-lg font-semibold leading-none tracking-tight">{model.name}</p>
              <p className="mt-1.5 font-mono text-[10px] tracking-[0.18em] text-blue-300">{model.maker}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/55">{model.use}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="relative border-t border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-20 lg:px-16">
          <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">METHOD</p>
          <h2 className="mt-3 font-body text-[clamp(1.6rem,3.4vw,2.6rem)] font-semibold leading-none tracking-tight">
            Applied AI. Not a demo.
          </h2>
          <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-white/55">
            Models are the cameras. Taste, continuity, and a tight production loop are the studio.
            That is why our work looks finished and why it ships faster than market style.
          </p>
          <ol className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", title: "Pick the model", body: "Seedance, Kling AI, Veo, Wan, Grok. Whichever holds the world of the brief." },
              { n: "02", title: "Direct the pass", body: "Lens, blocking, continuity, sound. Prompted like a shot list, not a lottery." },
              { n: "03", title: "Finish and loop", body: "Edit, grade, iterate. The next variant comes from the last one that worked." },
            ].map((step) => (
              <li key={step.n}>
                <p className="font-mono text-[10px] tracking-[0.22em] text-blue-300">{step.n}</p>
                <p className="mt-2 font-body text-lg font-semibold leading-none tracking-tight">{step.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative mx-auto max-w-[90rem] px-5 py-16 sm:px-8 sm:py-24 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">NEXT</p>
        <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-none tracking-tight">
          Brief the desk. We will pick the stack and ship the picture.
        </h2>
        <Link
          href="/contact"
          className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-white"
        >
          <span className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" aria-hidden />
          Book a call
        </Link>
      </section>
    </div>
  );
}
