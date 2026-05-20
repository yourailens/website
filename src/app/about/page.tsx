import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "About | YourAILens Studios",
  description:
    "We build an applied AI ecosystem for modern media — ads, films, visuals, and workflows that ship fast and perform.",
  openGraph: {
    title: "About | YourAILens Studios",
    description:
      "The next decade is about applying AI. YourAILens builds an applied AI ecosystem — focused on media.",
    url: "/about",
  },
};

function HexMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      className={className ?? "h-5 w-5"}
      aria-hidden
    >
      <path
        d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{
          transformOrigin: "9px 9px",
          animation: "hexSpin 10s linear infinite",
        }}
      />
      <circle cx="9" cy="9" r="3" fill="currentColor" />
    </svg>
  );
}

function Pill({
  label,
  desc,
}: {
  label: string;
  desc: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 backdrop-blur-md">
      <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55">
        {label}
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-white/80">{desc}</p>
    </div>
  );
}

function Stat({
  value,
  label,
  hint,
}: {
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 backdrop-blur-md">
      <div className="pointer-events-none absolute -inset-10 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 blur-2xl" aria-hidden />
      <div className="relative">
        <p className="font-heading text-4xl font-black tracking-tight text-white">{value}</p>
        <p className="mt-1 text-sm font-semibold text-white/80">{label}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/60">{hint}</p>
      </div>
    </div>
  );
}

function TimelineCard({
  tag,
  title,
  desc,
  accent,
}: {
  tag: string;
  title: string;
  desc: string;
  accent: "blue" | "violet";
}) {
  const accentClass =
    accent === "blue"
      ? "from-blue-500/25 to-cyan-500/10"
      : "from-violet-500/25 to-blue-500/10";
  const dot = accent === "blue" ? "bg-cyan-300" : "bg-violet-300";
  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 ring-1 ring-white/10 backdrop-blur-md`}>
      <div className={`pointer-events-none absolute -inset-10 bg-gradient-to-br ${accentClass} blur-2xl`} aria-hidden />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">{tag}</p>
        <h3 className="mt-3 font-heading text-2xl font-black text-white">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-white/65">{desc}</p>
        <div className="mt-6 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden />
          Signal → Output
        </div>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0c] text-white">
      {/* Ambient grid + glow */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(59,130,246,0.95) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 20% 12%, rgba(59,130,246,0.22), transparent 60%), radial-gradient(880px 520px at 78% 14%, rgba(99,102,241,0.22), transparent 62%), radial-gradient(780px 520px at 50% 72%, rgba(6,182,212,0.14), transparent 58%)",
        }}
        aria-hidden
      />

      <Navbar />

      {/* HERO */}
      <header className="relative overflow-hidden pb-12 pt-14 sm:pt-16 lg:pb-16 lg:pt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 backdrop-blur-md">
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/70">
                The applied AI decade
              </span>
              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden />
              <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-white/50">
                YourAILens Studios
              </span>
            </div>

            <h1
              className="mt-8 max-w-4xl font-heading font-black leading-[0.92] tracking-tight text-white"
              style={{ fontSize: "clamp(2.8rem, 7.2vw, 5.8rem)", letterSpacing: "-0.04em" }}
            >
              The next decade
              <br />
              <span
                style={{
                  WebkitTextStroke: "2px rgba(255,255,255,0.55)",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                applies AI.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-white/70 sm:text-base">
              The last decade built the engines. This decade ships the outcomes.
              We’re building an <span className="font-semibold text-white/90">Applied AI ecosystem</span>{" "}
              — focused on media — so brands can create, iterate, and scale faster than ever.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-3 rounded-full bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
              >
                <span>Build with us</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/15">
                  →
                </span>
              </Link>
              <Link
                href="/films"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3 text-sm font-bold text-white/90 shadow-sm backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                See films
              </Link>
              <Link
                href="/images"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3 text-sm font-bold text-white/90 shadow-sm backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                See visuals
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* THE THESIS (infographic) */}
      <section className="relative pb-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-8 flex flex-col items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">Thesis</p>
            <h2 className="mt-4 max-w-4xl font-heading text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-tight text-white">
              Build the engines → Apply them everywhere.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/65">
              We’re not here to “demo AI.” We’re here to operationalize it: systems, pipelines, and repeatable creative output.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
            <TimelineCard
              tag="Last decade"
              title="AI was built."
              desc="Models got smarter, faster, and more capable. The world focused on training, research, and breakthroughs."
              accent="violet"
            />
            <TimelineCard
              tag="Next decade"
              title="AI gets applied."
              desc="The advantage shifts to teams who can turn capability into outcomes — with craft, taste, and iteration loops."
              accent="blue"
            />
          </div>
        </div>
      </section>

      {/* MANIFESTO STRIP */}
      <section className="relative pb-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
            <Pill
              label="Mission"
              desc="Turn AI capability into real-world output: campaigns, films, and visuals that perform."
            />
            <Pill
              label="Vision"
              desc="An applied AI ecosystem where media production becomes faster, smarter, and endlessly scalable."
            />
            <Pill
              label="Promise"
              desc="Studio-grade craft, fast iteration, and measurable impact — without the old production constraints."
            />
          </div>
        </div>
      </section>

      {/* METRICS BAND */}
      <section className="relative border-t border-white/10 pb-16 pt-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">What changes</p>
            <h2 className="mt-4 font-heading text-[clamp(1.8rem,4vw,2.8rem)] font-black tracking-tight text-white">
              Applied AI makes media compounding.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Instead of a one-time production, you get a system that keeps generating better creatives.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat value="48–72h" label="Turnaround" hint="From brief to first set of deliverables, fast." />
            <Stat value="10×" label="Iteration velocity" hint="More variants, more learning, more wins." />
            <Stat value="70%" label="Lower cost curve" hint="Scale output without scaling spend linearly." />
            <Stat value="∞" label="Creative surface area" hint="New hooks, new angles, new formats—on demand." />
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="relative border-t border-white/10 pb-16 pt-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">
              Ecosystem
            </p>
            <h2 className="mt-4 font-heading text-[clamp(1.9rem,4vw,3rem)] font-black tracking-tight text-white">
              Applied AI is a pipeline — not a prompt.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              We design systems that move from intention to assets to performance loops. The result:
              production that compounds over time.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 ring-1 ring-white/10 backdrop-blur-md">
                <div className="pointer-events-none absolute -inset-10 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 blur-2xl" aria-hidden />

                <div className="relative grid gap-5 sm:grid-cols-2">
                  {[
                    {
                      t: "Strategy + Brief",
                      d: "Audience, offer, hooks, and formats — engineered for attention and conversion.",
                    },
                    {
                      t: "Creative Systems",
                      d: "Reusable templates, brand styles, and shot grammars that keep output consistent.",
                    },
                    {
                      t: "Production",
                      d: "AI-generated films + visuals stitched with human taste, pacing, and story.",
                    },
                    {
                      t: "Performance Loop",
                      d: "A/B iterations, rapid variants, and data-driven creative improvements.",
                    },
                  ].map((x) => (
                    <div key={x.t} className="rounded-2xl border border-white/10 bg-black/30 p-5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                          <HexMark className="h-5 w-5 text-white" />
                        </span>
                        <h3 className="font-heading text-lg font-black text-white">{x.t}</h3>
                      </div>
                      <p className="mt-3 text-sm leading-relaxed text-white/65">{x.d}</p>
                    </div>
                  ))}
                </div>

                <div className="relative mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/20 via-white/5 to-cyan-500/15 p-5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                    The point
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">
                    Applied AI isn’t “one great output.” It’s a machine that keeps generating better output.
                    We build the machine for your brand.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="sticky top-24 space-y-4">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 ring-1 ring-white/10 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">
                    Focus
                  </p>
                  <h3 className="mt-4 font-heading text-2xl font-black text-white">Media-first.</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    We’re building applied AI across many applications, but our obsession is media:
                    storytelling, visuals, pacing, and attention economics.
                  </p>

                  <div className="mt-6 space-y-3">
                    {[
                      { k: "Ads", v: "Performance creatives & high-iteration variants" },
                      { k: "Films", v: "Cinematic shorts, reels, product narratives" },
                      { k: "Visuals", v: "Stills, product shots, editorial-grade images" },
                      { k: "Workflows", v: "Pipelines that your team can keep using" },
                    ].map((r) => (
                      <div key={r.k} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-black/25 p-4">
                        <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" aria-hidden />
                        <div>
                          <p className="text-sm font-semibold text-white/90">{r.k}</p>
                          <p className="text-sm text-white/60">{r.v}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 ring-1 ring-white/10 backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">
                    If you care about
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {[
                      "Speed",
                      "Consistency",
                      "Scale",
                      "Story",
                      "Iteration",
                      "Performance",
                    ].map((x) => (
                      <div
                        key={x}
                        className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center text-[12px] font-semibold text-white/75"
                      >
                        {x}
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/65">
                    You’re already thinking in applied AI terms. Let’s make it real.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW WE APPLY AI (steps) */}
      <section className="relative border-t border-white/10 pb-16 pt-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/55">Method</p>
            <h2 className="mt-4 font-heading text-[clamp(1.9rem,4vw,3rem)] font-black tracking-tight text-white">
              A studio workflow that ships.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/65">
              Applied AI works when there’s a repeatable process behind it. Here’s ours.
            </p>
          </div>

          <ol className="mt-10 grid gap-5 lg:grid-cols-12">
            {[
              {
                n: "01",
                t: "Define outcomes",
                d: "What should this creative do? Attention, clicks, signups, sales — pick the signal.",
              },
              {
                n: "02",
                t: "Design the system",
                d: "Brand rules, formats, shot grammar, and templates — so output stays consistent.",
              },
              {
                n: "03",
                t: "Generate + craft",
                d: "AI generates; humans curate, pace, and refine. Taste is the differentiator.",
              },
              {
                n: "04",
                t: "Loop performance",
                d: "Ship, measure, iterate. The system gets stronger with every cycle.",
              },
            ].map((s, i) => (
              <li
                key={s.n}
                className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 ring-1 ring-white/10 backdrop-blur-md ${
                  i === 0 ? "lg:col-span-6" : i === 1 ? "lg:col-span-6" : i === 2 ? "lg:col-span-6" : "lg:col-span-6"
                }`}
              >
                <div className="pointer-events-none absolute -inset-10 bg-gradient-to-br from-blue-500/10 via-transparent to-violet-500/10 blur-2xl" aria-hidden />
                <div className="relative flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/10">
                    <span className="font-heading text-lg font-black text-white">{s.n}</span>
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-black text-white">{s.t}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{s.d}</p>
                  </div>
                </div>
                <div className="relative mt-6 h-px w-full bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
                <div className="mt-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                  <HexMark className="h-5 w-5 text-white/80" />
                  Applied AI
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="relative border-t border-white/10 bg-black/30 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="relative overflow-hidden rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-blue-600/20 via-white/5 to-cyan-500/15 p-8 ring-1 ring-white/10 sm:p-10">
            <div className="pointer-events-none absolute -inset-12 bg-gradient-to-r from-blue-500/15 via-transparent to-violet-500/12 blur-2xl" aria-hidden />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/60">Ready</p>
                <h3 className="mt-3 font-heading text-3xl font-black text-white sm:text-4xl">
                  Let’s build your applied AI engine.
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70">
                  We’ll map your pipeline, define your creative system, and ship a first set of assets fast — then iterate.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-black/30 transition hover:bg-slate-100"
                >
                  Book a call
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/10">
                    →
                  </span>
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-7 py-3 text-sm font-bold text-white/90 shadow-sm backdrop-blur-md transition hover:border-white/25 hover:bg-white/[0.06]"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

