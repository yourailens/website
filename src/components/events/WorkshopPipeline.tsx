import type { GalleryFilm, GalleryImage } from "@/data/gallery";

function videoType(src: string) {
  return src.endsWith(".mov") ? "video/quicktime" : "video/mp4";
}

const noDl = {
  controlsList: "nodownload noplaybackrate" as const,
  disablePictureInPicture: true,
};

function pickSteps(images: GalleryImage[], count: number): GalleryImage[] {
  if (images.length === 0 || count <= 0) return [];
  const out: GalleryImage[] = [];
  for (let i = 0; i < count; i++) {
    out.push(images[i % images.length]);
  }
  return out;
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 56 32" fill="none" aria-hidden>
      <path
        d="M4 16c12-6 24-6 36 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M44 10l10 6-10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 48" fill="none" aria-hidden>
      <path
        d="M16 6c6 10 6 20 0 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M10 34l6 10 6-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ArrowDownLong({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 64" fill="none" aria-hidden>
      <path
        d="M20 4v44"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="4 6"
      />
      <path d="M12 44l8 12 8-12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function StepCard({
  step,
  index,
  image,
  accent,
}: {
  step: { title: string; blurb: string };
  index: number;
  image: GalleryImage;
  accent: "blue" | "violet";
}) {
  const ring = accent === "blue" ? "ring-blue-400/40" : "ring-fuchsia-400/40";
  const badge =
    accent === "blue"
      ? "border-sky-400/50 bg-sky-500/15 text-sky-100"
      : "border-fuchsia-400/50 bg-fuchsia-500/15 text-fuchsia-100";

  return (
    <div
      className={`relative flex w-full max-w-[200px] flex-col overflow-hidden rounded-2xl bg-slate-900 shadow-lg ring-2 ${ring} sm:max-w-[220px]`}
    >
      <span
        className={`absolute left-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-black ${badge}`}
      >
        {index + 1}
      </span>
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image.src} alt="" className="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
      </div>
      <div className="border-t border-white/10 bg-slate-950/95 px-3 py-3">
        <p className="font-heading text-[13px] font-bold leading-snug text-white">{step.title}</p>
        <p className="mt-1 text-[11px] leading-snug text-slate-400">{step.blurb}</p>
      </div>
    </div>
  );
}

function FinalVideoCard({
  film,
  label,
  accent,
  badge,
}: {
  film: GalleryFilm;
  label: string;
  accent: "blue" | "violet";
  badge: string;
}) {
  const ring = accent === "blue" ? "ring-cyan-400/50" : "ring-pink-400/50";
  const glow = accent === "blue" ? "shadow-cyan-500/20" : "shadow-fuchsia-500/25";

  return (
    <div
      className={`relative w-full max-w-[min(100%,380px)] overflow-hidden rounded-2xl bg-black shadow-2xl ring-2 ${ring} ${glow} sm:max-w-[400px]`}
    >
      <div className="absolute left-2 top-2 z-10 rounded-full border border-white/20 bg-black/55 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
        {badge}
      </div>
      <div className="relative aspect-video w-full">
        <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" {...noDl}>
          <source src={film.src} type={videoType(film.src)} />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
        <p className="absolute bottom-3 left-3 right-3 text-center font-heading text-sm font-bold text-white drop-shadow">{label}</p>
      </div>
    </div>
  );
}

export type WorkshopPipelineStep = { title: string; blurb: string };

type Steps3 = readonly [WorkshopPipelineStep, WorkshopPipelineStep, WorkshopPipelineStep];
type Steps5 = readonly [
  WorkshopPipelineStep,
  WorkshopPipelineStep,
  WorkshopPipelineStep,
  WorkshopPipelineStep,
  WorkshopPipelineStep,
];

export default function WorkshopPipeline({
  steps,
  images,
  film,
  accent,
  finalLabel,
  finalBadge = "Final output",
}: {
  steps: Steps3 | Steps5;
  images: GalleryImage[];
  film: GalleryFilm | null;
  accent: "blue" | "violet";
  finalLabel: string;
  finalBadge?: string;
}) {
  const n = steps.length;
  const picked = pickSteps(images, n);
  const arrowColor = accent === "blue" ? "text-sky-500/90" : "text-fuchsia-500/90";

  if (picked.length < n || !film) {
    return (
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Pipeline preview needs gallery images and at least one film in your admin library.
      </p>
    );
  }

  const stageWord = n === 3 ? "Three" : "Five";

  return (
    <div className="my-10">
      <div className="mb-6 text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">Pipeline</p>
        <h2 className="mt-2 font-heading text-xl font-black text-slate-900 sm:text-2xl">How the work flows</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          {stageWord} linked stages: each builds on the last, ending in a finished piece you can read as a whole story, not scattered
          clips.
        </p>
      </div>

      {/* Mobile */}
      <div className={`flex flex-col items-center gap-1 md:hidden ${arrowColor}`}>
        {steps.map((s, i) => (
          <div key={s.title} className="flex w-full flex-col items-center">
            <StepCard step={s} index={i} image={picked[i]!} accent={accent} />
            {i < n - 1 ? <ArrowDownLong className="h-14 w-10 shrink-0 opacity-90" /> : null}
          </div>
        ))}
        <ArrowDownLong className="h-14 w-10 shrink-0 opacity-90" />
        <FinalVideoCard film={film} label={finalLabel} accent={accent} badge={finalBadge} />
      </div>

      {/* Desktop: 3 steps + video, one row */}
      {n === 3 ? (
        <div className={`hidden flex-wrap items-end justify-center gap-1 md:flex lg:gap-2 ${arrowColor}`}>
          <StepCard step={steps[0]!} index={0} image={picked[0]!} accent={accent} />
          <div className="flex h-[120px] w-12 shrink-0 items-center justify-center lg:w-16">
            <ArrowRight className="h-8 w-14 opacity-90" />
          </div>
          <StepCard step={steps[1]!} index={1} image={picked[1]!} accent={accent} />
          <div className="flex h-[120px] w-12 shrink-0 items-center justify-center lg:w-16">
            <ArrowRight className="h-8 w-14 opacity-90" />
          </div>
          <StepCard step={steps[2]!} index={2} image={picked[2]!} accent={accent} />
          <div className="flex h-[120px] w-12 shrink-0 items-center justify-center lg:w-16">
            <ArrowRight className="h-8 w-14 opacity-90" />
          </div>
          <FinalVideoCard film={film} label={finalLabel} accent={accent} badge={finalBadge} />
        </div>
      ) : (
        /* Desktop: 5 steps, two rows */
        <div className={`hidden md:block ${arrowColor}`}>
          <div className="flex flex-wrap items-end justify-center gap-1 lg:gap-2">
            <StepCard step={steps[0]!} index={0} image={picked[0]!} accent={accent} />
            <div className="flex h-[120px] w-12 shrink-0 items-center justify-center lg:w-16">
              <ArrowRight className="h-8 w-14 opacity-90" />
            </div>
            <StepCard step={steps[1]!} index={1} image={picked[1]!} accent={accent} />
            <div className="flex h-[120px] w-12 shrink-0 items-center justify-center lg:w-16">
              <ArrowRight className="h-8 w-14 opacity-90" />
            </div>
            <StepCard step={steps[2]!} index={2} image={picked[2]!} accent={accent} />
          </div>

          <div className="flex justify-center py-1">
            <div className="flex flex-col items-center">
              <ArrowDown className="h-12 w-10 opacity-90" />
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-center gap-1 lg:gap-2">
            <StepCard step={steps[3]!} index={3} image={picked[3]!} accent={accent} />
            <div className="flex h-[120px] w-12 shrink-0 items-center justify-center lg:w-16">
              <ArrowRight className="h-8 w-14 opacity-90" />
            </div>
            <StepCard step={steps[4]!} index={4} image={picked[4]!} accent={accent} />
            <div className="flex h-[120px] w-12 shrink-0 items-center justify-center lg:w-16">
              <ArrowRight className="h-8 w-14 opacity-90" />
            </div>
            <FinalVideoCard film={film} label={finalLabel} accent={accent} badge={finalBadge} />
          </div>
        </div>
      )}
    </div>
  );
}
