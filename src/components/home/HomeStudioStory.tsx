import Image from "next/image";
import Link from "next/link";
import BrandedIntroVideo from "@/components/home/BrandedIntroVideo";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import HomeConfusedChoice from "@/components/home/HomeConfusedChoice";
import PricingAlaCarte from "@/components/pricing/PricingAlaCarte";
import { DeferredVideo } from "@/components/media/DeferredVideo";

const MADE = [
  {
    no: "01",
    title: "Done & Dusted",
    kind: "Product commercial",
    video: "/videos/d&d.mp4",
    poster: "/videos/dnd-poster.jpg",
  },
  {
    no: "02",
    title: "The Teaser",
    kind: "Launch film",
    video: "/videos/hero3.mp4",
    poster: "/videos/hero3-poster.jpg",
  },
  {
    no: "03",
    title: "Fine Sugar",
    kind: "Campaign film",
    video: "/videos/hero2.mp4",
    poster: "/videos/hero2-poster.jpg",
  },
  {
    no: "04",
    title: "Earbuds",
    kind: "Product commercial",
    video: "/videos/hero5.mp4",
    poster: "/videos/hero5-poster.jpg",
  },
] as const;

const YOU_BRING = [
  {
    no: "01",
    label: "A brief",
    detail: "One conversation. Product, story, or campaign.",
  },
  {
    no: "02",
    label: "A budget",
    detail: "Stills from ₹15,000. Films from ₹30,000.",
  },
  {
    no: "03",
    label: "A date",
    detail: "Stills in 5–8 days. Films in 7–14.",
  },
] as const;

const NEXT_BEATS = [
  { no: "01", title: "Longer stories", detail: "Not a 45-second ad. A film." },
  { no: "02", title: "Characters who return", detail: "Same faces. New chapters." },
  { no: "03", title: "Worlds you can enter", detail: "Sets held in continuity." },
] as const;

const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";

const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

type MadeFilm = (typeof MADE)[number];

function SprocketRow() {
  return (
    <div className="flex justify-center gap-[6px] overflow-hidden py-1.5 sm:gap-[8px] sm:py-2" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <span key={i} className="h-[8px] w-[10px] shrink-0 rounded-[1.5px] bg-white/35 sm:h-[9px] sm:w-[12px]" />
      ))}
    </div>
  );
}

function CropMarks() {
  return (
    <>
      <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-blue-400" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-blue-400" aria-hidden />
    </>
  );
}

function FilmGate({ film }: { film: MadeFilm }) {
  return (
    <article className="relative min-w-0">
      <div className="relative aspect-video overflow-hidden bg-black">
        <DeferredVideo
          src={film.video}
          poster={film.poster}
          rootMargin="1800px"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/15" aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />
        <p className="pointer-events-none absolute left-2 top-2 font-mono text-[9px] tracking-[0.22em] text-white/90 sm:left-2.5 sm:top-2.5">
          {film.no}
        </p>
        <p className="pointer-events-none absolute bottom-2 left-2 max-w-[80%] truncate text-[10px] font-light tracking-wide text-white sm:bottom-2.5 sm:left-2.5 sm:text-[11px]">
          {film.title}
        </p>
      </div>
    </article>
  );
}

export default function HomeStudioStory() {
  return (
    <>
      <HomeBlueTint className="border-t border-blue-100/60 pt-8 lg:pt-10">
        <div className={PAGE}>
          <div className="mx-auto max-w-5xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
              <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">Who we are</p>
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
            </div>

            <h2
              className="text-[clamp(2.35rem,6vw,5.25rem)] font-light leading-[1.08] text-slate-900"
              style={{ letterSpacing: "-0.04em" }}
            >
              An applied AI studio for{" "}
              <span className="relative my-2 inline-block rotate-[-1deg] whitespace-nowrap border border-blue-200/80 bg-white px-[0.22em] py-[0.08em] shadow-[0_12px_30px_-16px_rgba(37,99,235,0.55)]">
                <span
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(59,130,246,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.1) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                  aria-hidden
                />
                <span className="relative z-[1] inline-flex items-baseline gap-[0.18em]">
                  <span className="font-light tracking-[-0.055em] text-slate-900">cinematic</span>
                  <span className="font-bold tracking-[-0.055em] text-blue-700">
                    media<span className="text-blue-400">.</span>
                  </span>
                </span>
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-sm font-light leading-[1.85] text-slate-600 sm:text-[15px]">
              YourAILens Studios unifies creative direction, generative systems and post-production into one
              integrated media practice.
            </p>

            <p className="mt-6 text-[9px] font-medium uppercase tracking-[0.24em] text-slate-400 sm:text-[10px]">
              Direction&nbsp;&nbsp;·&nbsp;&nbsp; Worldbuilding&nbsp;&nbsp;·&nbsp;&nbsp;
              Synthesis&nbsp;&nbsp;·&nbsp;&nbsp; Finishing
            </p>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-blue-200/80 bg-gradient-to-br from-white via-blue-50/70 to-slate-100 p-2 shadow-[0_28px_70px_-32px_rgba(37,99,235,0.45)] ring-1 ring-blue-100/70 sm:p-3">
            <div className="flex items-center justify-between gap-4 px-3 pb-2 pt-1 sm:px-4 sm:pb-3">
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.7)]" aria-hidden />
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-700 sm:text-[10px]">
                  YourAILens Studios
                </p>
                <span className="hidden h-3 w-px bg-slate-300 sm:block" aria-hidden />
                <p className="hidden text-[9px] font-light uppercase tracking-[0.2em] text-slate-400 sm:block">
                  Introduction film
                </p>
              </div>
              <p className="text-[8px] font-medium uppercase tracking-[0.2em] text-blue-600/70 sm:text-[9px]">
                Applied AI Media
              </p>
            </div>

            <div className="mb-2 flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white/90 px-4 py-2.5 shadow-sm sm:mb-3 sm:px-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-[8px] font-bold uppercase tracking-[0.12em] text-blue-700">
                  AI
                </span>
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-700 sm:text-[11px]">
                  Niharika <span className="mx-1.5 text-blue-300">/</span>
                  <span className="font-medium text-blue-600">AI-generated avatar</span>
                </p>
              </div>
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.65)]" aria-hidden />
                <span className="text-[8px] font-medium uppercase tracking-[0.2em] text-slate-400">
                  Synthetic talent
                </span>
              </div>
            </div>

            <BrandedIntroVideo />
          </div>
        </div>

        <div className="mt-10 grid w-full grid-cols-2 lg:h-[700px] lg:grid-cols-12 lg:grid-rows-2">
          <div className="relative col-span-2 aspect-video overflow-hidden bg-slate-100 lg:col-span-5 lg:aspect-auto">
            <Image
              src="/images/yaili1.png"
              alt="YourAILens purple cinematic portrait"
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
              priority={false}
            />
          </div>

          <div className="relative col-span-2 aspect-video overflow-hidden bg-slate-100 lg:col-span-4 lg:aspect-auto">
            <Image
              src="/images/yaili2.png"
              alt="YourAILens purple motion portrait"
              fill
              sizes="(min-width: 1024px) 34vw, 100vw"
              className="object-cover"
            />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 lg:col-span-3 lg:row-span-2 lg:aspect-auto">
            <Image
              src="/images/img1.jpeg"
              alt="Futuristic fashion campaign portrait"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover object-top"
            />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 lg:col-span-3 lg:aspect-auto">
            <Image
              src="/images/cologne.png"
              alt="Luxury fragrance campaign visual"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 lg:col-span-3 lg:aspect-auto">
            <Image
              src="/images/shoe.png"
              alt="Futuristic footwear campaign visual"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>

          <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 lg:col-span-3 lg:aspect-auto">
            <Image
              src="/images/w2.png"
              alt="Luxury watch campaign visual"
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </HomeBlueTint>

      <section className="border-t border-blue-100/60 bg-white py-16 lg:py-24">
        <div className={PAGE}>
          <div className="grid items-end gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-blue-400/80" aria-hidden />
                <p className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600/80">
                  Photorealism study / C01
                </p>
              </div>
              <h2
                className="max-w-3xl text-[clamp(2rem,4.8vw,3.8rem)] font-light leading-[1.13] text-slate-900"
                style={{ letterSpacing: "-0.035em" }}
              >
                How real can AI look? <span className="font-semibold text-blue-700">This real.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm font-light leading-[1.85] text-slate-600 lg:pb-1">
              A controlled study in skin texture, micro-expression, optical depth and physically coherent light.
            </p>
          </div>

          <div className="mt-11 overflow-hidden border border-slate-200 bg-slate-950 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.7)] lg:grid lg:grid-cols-[1fr_76px]">
            <BrandedIntroVideo src="/videos/yailc01.mp4" muteButtonPosition="left" rounded={false} />

            <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-slate-900 px-4 py-3 text-white lg:flex-col lg:border-l lg:border-t-0 lg:px-0 lg:py-5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-blue-300 lg:[writing-mode:vertical-rl]">
                Synthetic human study
              </p>
              <span className="h-px flex-1 bg-white/10 lg:h-auto lg:w-px" aria-hidden />
              <p className="font-mono text-[9px] tracking-[0.2em] text-white/45 lg:[writing-mode:vertical-rl]">
                YAIL·C01
              </p>
            </div>
          </div>

          <div className="grid gap-px border-x border-b border-slate-200 bg-slate-200 sm:grid-cols-4">
            {[
              "Dermal detail",
              "Micro-expression",
              "Optical depth",
              "Coherent light",
            ].map((signal, index) => (
              <div key={signal} className="flex items-center gap-3 bg-white px-4 py-3.5">
                <span className="font-mono text-[8px] text-blue-500">0{index + 1}</span>
                <span className="text-[9px] font-medium uppercase tracking-[0.17em] text-slate-500">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeBlueTint className="border-t border-blue-100/60 py-16 lg:py-24">
        <div className={PAGE}>
          <div className="grid items-end gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-px w-6 bg-blue-400/80" aria-hidden />
                <p className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600/80">
                  Cinematography study / CM
                </p>
              </div>
              <h2
                className="max-w-3xl text-[clamp(2rem,4.8vw,3.8rem)] font-light leading-[1.13] text-slate-900"
                style={{ letterSpacing: "-0.035em" }}
              >
                How cinematic can it get? <span className="font-semibold text-blue-700">This cinematic.</span>
              </h2>
            </div>
            <p className="max-w-md text-sm font-light leading-[1.85] text-slate-600 lg:pb-1">
              Color grade, lens language, camera movement and the finish that makes a frame feel like cinema — not a clip.
            </p>
          </div>

          <div className="mt-11 overflow-hidden border border-slate-200 bg-slate-950 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.7)] lg:grid lg:grid-cols-[76px_1fr]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900 px-4 py-3 text-white lg:flex-col lg:border-b-0 lg:border-r lg:px-0 lg:py-5">
              <p className="text-[8px] font-semibold uppercase tracking-[0.26em] text-blue-300 lg:[writing-mode:vertical-rl]">
                Color & camera study
              </p>
              <span className="h-px flex-1 bg-white/10 lg:h-auto lg:w-px" aria-hidden />
              <p className="font-mono text-[9px] tracking-[0.2em] text-white/45 lg:[writing-mode:vertical-rl]">
                YAIL·CM
              </p>
            </div>

            <BrandedIntroVideo src="/videos/yailcm.mp4" muteButtonPosition="right" rounded={false} />
          </div>

          <div className="grid gap-px border-x border-b border-slate-200 bg-slate-200 sm:grid-cols-4">
            {[
              "Color grade",
              "Lens language",
              "Camera move",
              "Print finish",
            ].map((signal, index) => (
              <div key={signal} className="flex items-center gap-3 bg-white px-4 py-3.5">
                <span className="font-mono text-[8px] text-blue-500">0{index + 1}</span>
                <span className="text-[9px] font-medium uppercase tracking-[0.17em] text-slate-500">{signal}</span>
              </div>
            ))}
          </div>
        </div>
      </HomeBlueTint>

      <section className="border-t border-blue-100/60 bg-white py-16 lg:py-24">
        <div className={PAGE}>
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
              <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">
                Why we exist
              </p>
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
            </div>
            <h2
              className="text-[clamp(2.1rem,5vw,4.2rem)] font-light leading-[1.1] text-slate-900"
              style={{ letterSpacing: "-0.04em" }}
            >
              Big ideas get stuck in slow production.{" "}
              <span className="font-semibold text-blue-700">We fix that.</span>
            </h2>
          </div>

          <div className="mt-12 overflow-hidden border border-blue-200 bg-[#fcfdff] shadow-[0_24px_65px_-38px_rgba(37,99,235,0.45)]">
            <svg
              viewBox="0 0 1200 720"
              className="hidden h-auto w-full sm:block"
              role="img"
              aria-label="Sketch showing an idea moving through YourAILens into films, images and campaigns for brand teams, founders, creative teams and agencies"
            >
              <defs>
                <pattern id="purpose-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M24 0H0V24" fill="none" stroke="#dbeafe" strokeWidth="1" />
                </pattern>
                <marker id="purpose-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 10 5 0 10 2.5 5Z" fill="#2563eb" />
                </marker>
              </defs>
              <rect width="1200" height="720" fill="#fcfdff" />
              <rect width="1200" height="720" fill="url(#purpose-grid)" opacity="0.78" />

              <g fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round">
                <path d="M69 187C34 151 72 113 126 125 150 78 225 94 231 137 286 126 314 175 280 205 303 248 244 270 211 247 180 285 111 268 109 231 58 234 35 207 69 187Z" strokeWidth="3" />
                <path d="M73 191C42 159 79 120 128 131 155 87 218 101 225 143 275 133 299 175 272 203 292 239 239 261 209 239 177 276 119 260 115 225 68 229 44 207 73 191Z" strokeWidth="1.2" opacity="0.45" />

                <path d="M315 188C386 120 429 119 480 165" strokeWidth="4" markerEnd="url(#purpose-arrow)" />
                <path d="M318 197C389 135 430 131 474 170" strokeWidth="1.4" opacity="0.4" />

                <ellipse cx="600" cy="186" rx="128" ry="91" strokeWidth="4" />
                <ellipse cx="603" cy="188" rx="136" ry="97" strokeWidth="1.4" opacity="0.45" />
                <path d="M505 246C545 276 661 280 706 239" strokeWidth="2" strokeDasharray="7 8" />

                <path d="M731 180C798 116 850 120 888 164" strokeWidth="4" markerEnd="url(#purpose-arrow)" />
                <path d="M735 190C797 132 847 132 882 170" strokeWidth="1.4" opacity="0.4" />

                <rect x="902" y="94" width="214" height="74" rx="6" strokeWidth="3" transform="rotate(-2 1009 131)" />
                <rect x="927" y="178" width="204" height="74" rx="6" strokeWidth="3" transform="rotate(2 1029 215)" />
                <rect x="895" y="264" width="226" height="74" rx="6" strokeWidth="3" transform="rotate(-1 1008 301)" />

                <path d="M600 287C600 340 600 362 600 391" strokeWidth="4" markerEnd="url(#purpose-arrow)" />
                <path d="M594 291C592 340 593 362 594 385" strokeWidth="1.3" opacity="0.45" />

                <path d="M600 430C474 417 313 443 218 507" strokeWidth="2.8" />
                <path d="M600 430C525 471 468 510 430 557" strokeWidth="2.8" />
                <path d="M600 430C675 470 731 510 770 557" strokeWidth="2.8" />
                <path d="M600 430C727 417 885 443 982 507" strokeWidth="2.8" />

                <ellipse cx="190" cy="557" rx="126" ry="55" strokeWidth="3" transform="rotate(-3 190 557)" />
                <ellipse cx="420" cy="604" rx="122" ry="55" strokeWidth="3" transform="rotate(2 420 604)" />
                <ellipse cx="780" cy="604" rx="132" ry="55" strokeWidth="3" transform="rotate(-2 780 604)" />
                <ellipse cx="1010" cy="557" rx="118" ry="55" strokeWidth="3" transform="rotate(3 1010 557)" />

                <path d="M73 646C323 678 871 677 1120 644" strokeWidth="3" />
                <path d="M82 653C338 689 867 686 1110 652" strokeWidth="1.3" opacity="0.45" />
                <path d="m108 78 11 13 16-20M1094 371l12 13 16-21M330 343c18-11 36-11 54 0" strokeWidth="3" />
              </g>

              <g
                fill="#0f172a"
                textAnchor="middle"
                style={{ fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" }}
              >
                <text x="178" y="176" fontSize="31">your big idea</text>
                <text x="178" y="210" fontSize="19" fill="#64748b">product · story · campaign</text>
                <text x="600" y="178" fontSize="36" fontWeight="700" fill="#1d4ed8">YourAILens</text>
                <text x="600" y="214" fontSize="21" fill="#475569">AI production</text>
                <text x="1009" y="140" fontSize="26">FILMS</text>
                <text x="1029" y="224" fontSize="26">IMAGES</text>
                <text x="1008" y="310" fontSize="26">CAMPAIGNS</text>
                <text x="600" y="421" fontSize="25" fill="#2563eb">built for...</text>
                <text x="190" y="565" fontSize="25">brand teams</text>
                <text x="420" y="612" fontSize="25">founders</text>
                <text x="780" y="612" fontSize="25">creative teams</text>
                <text x="1010" y="565" fontSize="25">agencies</text>
              </g>
              <g
                fill="#2563eb"
                style={{ fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" }}
              >
                <text x="330" y="110" fontSize="20" transform="rotate(-7 330 110)">we take this...</text>
                <text x="805" y="89" fontSize="20" transform="rotate(5 805 89)">...and make all this!</text>
                <text x="910" y="690" fontSize="20" transform="rotate(-3 910 690)">more output. same vision.</text>
              </g>
            </svg>

            <svg
              viewBox="0 0 420 900"
              className="h-auto w-full sm:hidden"
              role="img"
              aria-label="Sketch showing an idea moving through YourAILens into media for brands, founders, creative teams and agencies"
            >
              <defs>
                <pattern id="purpose-grid-mobile" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M20 0H0V20" fill="none" stroke="#dbeafe" strokeWidth="1" />
                </pattern>
                <marker id="purpose-arrow-mobile" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
                  <path d="M0 0 10 5 0 10 2.5 5Z" fill="#2563eb" />
                </marker>
              </defs>
              <rect width="420" height="900" fill="#fcfdff" />
              <rect width="420" height="900" fill="url(#purpose-grid-mobile)" opacity="0.8" />
              <g fill="none" stroke="#2563eb" strokeLinecap="round" strokeLinejoin="round">
                <path d="M85 112C58 87 85 56 123 66 141 32 192 44 196 75 235 66 255 102 230 124 248 155 208 173 181 156 158 183 110 170 108 144 73 147 57 128 85 112Z" strokeWidth="3" />
                <path d="M158 180C145 220 157 245 190 267" strokeWidth="4" markerEnd="url(#purpose-arrow-mobile)" />
                <ellipse cx="210" cy="342" rx="112" ry="76" strokeWidth="4" />
                <ellipse cx="212" cy="344" rx="119" ry="82" strokeWidth="1.2" opacity="0.45" />
                <path d="M210 426C212 459 212 475 212 497" strokeWidth="4" markerEnd="url(#purpose-arrow-mobile)" />
                <rect x="65" y="519" width="290" height="62" rx="5" strokeWidth="3" transform="rotate(-1 210 550)" />
                <rect x="78" y="588" width="264" height="62" rx="5" strokeWidth="3" transform="rotate(1 210 619)" />
                <rect x="58" y="658" width="304" height="62" rx="5" strokeWidth="3" />
                <path d="M210 727C210 754 210 762 210 778" strokeWidth="3" markerEnd="url(#purpose-arrow-mobile)" />
                <ellipse cx="106" cy="814" rx="77" ry="34" strokeWidth="2.5" />
                <ellipse cx="314" cy="814" rx="71" ry="34" strokeWidth="2.5" />
                <ellipse cx="111" cy="865" rx="84" ry="31" strokeWidth="2.5" />
                <ellipse cx="309" cy="865" rx="70" ry="31" strokeWidth="2.5" />
              </g>
              <g
                fill="#0f172a"
                textAnchor="middle"
                style={{ fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" }}
              >
                <text x="154" y="111" fontSize="24">your big idea</text>
                <text x="210" y="335" fontSize="31" fontWeight="700" fill="#1d4ed8">YourAILens</text>
                <text x="210" y="370" fontSize="18" fill="#475569">AI production</text>
                <text x="210" y="558" fontSize="23">FILMS</text>
                <text x="210" y="627" fontSize="23">IMAGES</text>
                <text x="210" y="697" fontSize="23">CAMPAIGNS</text>
                <text x="106" y="821" fontSize="17">brand teams</text>
                <text x="314" y="821" fontSize="17">founders</text>
                <text x="111" y="871" fontSize="15">creative teams</text>
                <text x="309" y="871" fontSize="17">agencies</text>
              </g>
              <g fill="#2563eb" style={{ fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" }}>
                <text x="244" y="211" fontSize="17" transform="rotate(5 244 211)">we make it real ↓</text>
                <text x="50" y="480" fontSize="17" transform="rotate(-4 50 480)">ready to use!</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      <HomeBlueTint className="border-t border-blue-100/60 py-16 lg:py-24">
        <div className={PAGE}>
          <div className="relative pb-8 lg:pb-28">
            <div className="relative aspect-video overflow-hidden rounded-[1.75rem] bg-slate-950 shadow-[0_32px_80px_-42px_rgba(15,23,42,0.7)] lg:ml-[12%] lg:w-[88%]">
              <DeferredVideo
                src="/videos/india-in-olympics.mp4"
                poster="/videos/india-in-olympics-poster.jpg"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-950/18 via-transparent to-transparent" aria-hidden />
            </div>

            <div className="relative z-10 mx-4 -mt-8 overflow-hidden border border-blue-200/80 bg-white px-6 py-7 shadow-[0_24px_65px_-30px_rgba(37,99,235,0.5)] sm:mx-8 sm:-mt-12 sm:px-9 sm:py-9 lg:absolute lg:bottom-0 lg:left-0 lg:m-0 lg:w-[48%] lg:px-10 lg:py-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(59,130,246,0.075) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.075) 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
                aria-hidden
              />
              <div className="relative">
                <div className="flex items-center gap-2">
                  <span className="h-px w-7 bg-blue-500" aria-hidden />
                  <p className="text-[9px] font-medium uppercase tracking-[0.27em] text-blue-600">
                    Featured narrative
                  </p>
                </div>
                <h2 className="mt-4 text-[clamp(1.65rem,3.2vw,2.65rem)] font-light leading-[1.18] text-slate-900">
                  Technology is the medium.{" "}
                  <span className="font-semibold text-blue-700">Emotion is the outcome.</span>
                </h2>
                <p className="mt-5 max-w-md text-xs font-light leading-[1.8] text-slate-600 sm:text-sm">
                  India at the Olympics, a synthetic cinematic study in memory, aspiration and national scale.
                </p>
                <Link
                  href="/films"
                  className="mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700"
                >
                  View more films <span aria-hidden>→</span>
                </Link>
              </div>
            </div>

            <p
              className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-[58%] rotate-90 text-[8px] font-medium uppercase tracking-[0.34em] text-slate-400 xl:block"
              aria-hidden
            >
              YAIL narrative · India 01
            </p>
          </div>
        </div>
      </HomeBlueTint>

      <section className="border-t border-blue-100/60 bg-white py-16 lg:py-24">
        <div className={PAGE}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
              <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">The reel so far</p>
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
            </div>
            <h2
              className="text-[clamp(2.1rem,5vw,4.2rem)] font-light leading-[1.1] text-slate-900"
              style={{ letterSpacing: "-0.04em" }}
            >
              What we have made <span className="font-semibold text-blue-700">so far?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-slate-600">
              Four proofs. Same gate. Same standard.
            </p>
          </div>

          <div className="relative mt-12">
            <p
              className="pointer-events-none absolute -top-3 right-4 z-10 rotate-[8deg] text-[15px] text-blue-600 sm:right-8 sm:text-base"
              style={{ fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" }}
              aria-hidden
            >
              four gates. no hero.
            </p>

            <div className="overflow-hidden border border-blue-200 bg-white shadow-[0_24px_65px_-38px_rgba(37,99,235,0.45)]">
              <div className="relative border-b border-blue-100 px-5 py-4 sm:px-8">
                <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
                <div className="relative flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-600">YAIL · Contact sheet</p>
                  <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">4-UP · EQUAL GATES</p>
                </div>
              </div>

              <div className="relative bg-slate-950 px-3 py-3 sm:px-4 sm:py-4">
                <CropMarks />
                <SprocketRow />
                <div className="relative grid grid-cols-1 gap-[3px] sm:grid-cols-2 sm:gap-1">
                  {MADE.map((film) => (
                    <FilmGate key={film.no} film={film} />
                  ))}
                  <div
                    className="pointer-events-none absolute left-1/2 top-1/2 z-10 hidden h-5 w-5 -translate-x-1/2 -translate-y-1/2 sm:block"
                    aria-hidden
                  >
                    <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-blue-400" />
                    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-blue-400" />
                  </div>
                </div>
                <SprocketRow />
              </div>

              <div className="relative border-t border-blue-100">
                <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {MADE.map((film, index) => (
                    <div
                      key={film.no}
                      className={`flex items-baseline justify-between gap-3 px-5 py-4 ${
                        index > 0 ? "border-t border-blue-100" : ""
                      } ${index % 2 === 1 ? "sm:border-l" : ""} ${
                        index >= 2 ? "sm:border-t" : "sm:border-t-0"
                      } ${index > 0 ? "lg:border-l" : ""} lg:border-t-0`}
                    >
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.2em] text-blue-500">{film.no}</p>
                        <h3 className="mt-1 text-sm font-light text-slate-900">{film.title}</h3>
                      </div>
                      <p className="hidden text-[9px] font-medium uppercase tracking-[0.16em] text-slate-400 sm:block">
                        {film.kind}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/films"
              className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-700"
            >
              The rest of the reel <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <HomeBlueTint className="border-t border-blue-100/60 py-16 lg:py-24">
        <div className={PAGE}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
              <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">
                Production ticket
              </p>
              <span className="h-px w-8 bg-blue-400/80" aria-hidden />
            </div>
            <h2
              className="text-[clamp(2.1rem,5vw,4.2rem)] font-light leading-[1.1] text-slate-900"
              style={{ letterSpacing: "-0.04em" }}
            >
              What&apos;s <span className="font-semibold text-blue-700">required?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-slate-600">
              No crew. No location. No shoot day. Three things. That&apos;s the whole form.
            </p>
          </div>

          <div className="mt-12 overflow-hidden border border-blue-200 bg-white shadow-[0_24px_65px_-38px_rgba(37,99,235,0.45)]">
            <div className="relative border-b border-blue-100 px-5 py-4 sm:px-8">
              <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
              <div className="relative flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-blue-600">YAIL · Call sheet</p>
                <p className="font-mono text-[10px] tracking-[0.2em] text-slate-400">PROD · 001</p>
              </div>
            </div>

            <div className="relative px-5 py-10 sm:px-8 sm:py-12">
              <div className="pointer-events-none absolute inset-0 opacity-55" style={GRID_PAPER} aria-hidden />

              <div className="relative flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                {["BRIEF", "BUDGET", "TIME"].map((item, index) => (
                  <div key={item} className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`border border-blue-600 bg-white px-5 py-3 shadow-sm sm:px-7 sm:py-4 ${
                        index === 1 ? "rotate-[-2deg]" : index === 2 ? "rotate-[1.5deg]" : "rotate-[-1deg]"
                      }`}
                    >
                      <p
                        className="text-xl font-light tracking-tight text-slate-900 sm:text-2xl"
                        style={{ fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" }}
                      >
                        {item}
                      </p>
                    </div>
                    <span className="text-2xl font-light text-blue-500" aria-hidden>
                      {index < 2 ? "+" : "="}
                    </span>
                  </div>
                ))}
                <div className="rotate-[2deg] border-2 border-blue-700 bg-blue-600 px-5 py-3 shadow-sm sm:px-7 sm:py-4">
                  <p
                    className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
                    style={{ fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" }}
                  >
                    FILM
                  </p>
                </div>
              </div>
            </div>

            <div className="grid border-t border-blue-100 lg:grid-cols-3">
              {YOU_BRING.map((item) => (
                <div key={item.no} className="border-t border-blue-100 bg-white px-6 py-7 first:border-t-0 lg:border-t-0 lg:border-l lg:first:border-l-0">
                  <p className="font-mono text-[9px] tracking-[0.22em] text-blue-500">{item.no}</p>
                  <h3 className="mt-3 text-2xl font-light text-slate-900">{item.label}</h3>
                  <p className="mt-2 max-w-[16rem] text-sm font-light leading-relaxed text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <PricingAlaCarte embedded idPrefix="home-ala" />
          <HomeConfusedChoice />
        </div>
      </HomeBlueTint>

      <section className="border-t border-blue-100/60 bg-slate-950 py-16 text-white lg:py-24">
        <div className={PAGE}>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-blue-400/70" aria-hidden />
              <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-300/80">Coming from the studio</p>
              <span className="h-px w-8 bg-blue-400/70" aria-hidden />
            </div>
            <h2
              className="text-[clamp(2.1rem,5vw,4.2rem)] font-light leading-[1.1] text-white"
              style={{ letterSpacing: "-0.04em" }}
            >
              What we plan to do next?{" "}
              <Link href="/ai-filmmaking" className="font-semibold text-blue-300 transition hover:text-blue-200">
                AI Films.
              </Link>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-relaxed text-white/65">
              Commercials were the proof. Next we make cinema — longer stories, returning characters, worlds you can walk into.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/ai-filmmaking"
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-300 transition hover:text-white"
              >
                AI Filmmaking →
              </Link>
              <Link
                href="/ai-ads"
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/55 transition hover:text-white"
              >
                AI Ads →
              </Link>
            </div>
          </div>

          <div className="relative mt-12 pb-8 lg:pb-24">
            <div className="relative aspect-video overflow-hidden border border-white/10 bg-black shadow-[0_32px_80px_-42px_rgba(0,0,0,0.85)] lg:ml-[10%] lg:w-[90%]">
              <DeferredVideo src="/videos/d&d.mp4" className="absolute inset-0 h-full w-full object-cover" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950/30 via-transparent to-transparent" aria-hidden />
            </div>

            <div className="relative z-10 mx-4 -mt-10 overflow-hidden border border-white/15 bg-slate-950/90 px-6 py-7 shadow-[0_24px_65px_-30px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:mx-8 sm:-mt-14 sm:px-9 sm:py-9 lg:absolute lg:bottom-0 lg:left-0 lg:m-0 lg:w-[46%] lg:px-10 lg:py-10">
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-blue-300">Scene 01 · Now in production</p>
              <p
                className="mt-4 text-[clamp(2.2rem,4.5vw,4.4rem)] font-light leading-[0.92] text-white"
                style={{ letterSpacing: "-0.05em" }}
              >
                AI
                <span className="font-semibold text-blue-300"> FILMS</span>
              </p>
              <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-white/65">
                Same visual standard. New runtime. Characters who persist. Worlds that hold.
              </p>
            </div>
          </div>

          <div className="grid border border-white/10 lg:grid-cols-3">
            {NEXT_BEATS.map((beat) => (
              <div
                key={beat.no}
                className="border-t border-white/10 px-6 py-7 first:border-t-0 lg:border-l lg:border-t-0 lg:first:border-l-0"
              >
                <p className="font-mono text-[9px] tracking-[0.22em] text-blue-300">{beat.no}</p>
                <h3 className="mt-3 text-xl font-light text-white">{beat.title}</h3>
                <p className="mt-2 text-sm font-light text-white/55">{beat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-blue-100 bg-white py-20 lg:py-28">
        <div className={`${PAGE} text-center`}>
          <div className="mx-auto flex max-w-2xl items-center justify-center gap-3">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent to-blue-300" aria-hidden />
            <p className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600">Start a production</p>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent to-blue-300" aria-hidden />
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl text-[clamp(2rem,4.8vw,3.6rem)] font-light leading-[1.18] text-slate-900">
            Bring us the brief. <span className="font-semibold text-blue-700">We&apos;ll build the world.</span>
          </h2>
          <Link
            href="/contact"
            className="mt-9 inline-flex rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700"
          >
            Start a project →
          </Link>
        </div>
      </section>
    </>
  );
}
