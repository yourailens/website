"use client";

const VIDEO_SRC = "/videos/india-in-olympics.mp4";
const POSTER_SRC = "/videos/india-in-olympics-poster.jpg";

export default function HomeIndiaOlympicsStory() {
  return (
    <section aria-label="India in Olympics — special story" className="relative">
      <div className={PAGE_INNER}>
        <div className="mb-2 flex items-center gap-2">
          <div className="h-px w-6 bg-blue-400/80" />
          <span className="text-[10px] font-light uppercase tracking-[0.28em] text-blue-600/80">
            Special story
          </span>
        </div>

        <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_1.15fr] lg:gap-12">
          <div className="max-w-md">
            <h2
              className="text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.2] font-light text-slate-900"
              style={{ letterSpacing: "-0.02em" }}
            >
              India in{" "}
              <span className="font-semibold text-blue-700">Olympics</span>
            </h2>
            <p className="mt-4 text-sm font-light leading-relaxed text-slate-600">
              A storytelling film built with our AI pipeline — narrative pacing, grade, and sound
              designed for brand moments that need to feel human, not generated.
            </p>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-3 rounded-[1.35rem] bg-gradient-to-br from-blue-400/25 via-cyan-300/15 to-indigo-400/20 blur-md"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-2xl border border-blue-200/70 bg-white/90 p-2 shadow-lg shadow-blue-200/30 ring-1 ring-blue-100/80">
              <div className="relative aspect-video overflow-hidden rounded-xl bg-slate-950 ring-1 ring-blue-900/20">
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  poster={POSTER_SRC}
                  className="h-full w-full object-cover"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  <source src={VIDEO_SRC} type="video/mp4" />
                </video>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-950/30 via-transparent to-transparent" />
              </div>
              <div className="flex items-center justify-between gap-3 px-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">India in Olympics</p>
                  <p className="text-xs font-light italic text-blue-600/80">Storytelling film</p>
                </div>
                <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-medium tracking-wider text-blue-700 uppercase">
                  Special
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const PAGE_INNER = "mx-auto max-w-7xl px-6 lg:px-10";
