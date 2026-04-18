import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";
import PricingFaqAccordion from "./PricingFaqAccordion";
import PricingTierCompare from "./PricingTierCompare";

const TITLE = "Pricing | YourAILens Studios";

export const metadata: Metadata = {
  title: TITLE,
  description:
    "Premium AI powered creative packages from ₹30,000. Spark, Momentum, and Signature tiers. Transparent scope, human led direction, fast delivery.",
  openGraph: {
    title: TITLE,
    description: "Campaign ready AI creative. Three clear tiers. No guesswork.",
    url: "/pricing",
  },
};

const TIERS = [
  {
    id: "spark",
    name: "Spark",
    tag: "Enter",
    price: "₹30,000",
    from: true,
    pitch: "Perfect when you need a tight campaign or hero asset set without the overhead of a full studio retainer.",
    features: [
      "Discovery + creative brief alignment",
      "1 primary campaign direction (AI + art direction)",
      "Up to 3 core deliverables (e.g. hero film, key stills, copy hooks)",
      "1 structured revision round",
      "Standard delivery timeline",
    ],
    accent: "border-amber-200/80 bg-gradient-to-b from-amber-50/90 to-white shadow-amber-100/40",
    ring: "ring-amber-200/60",
    btn: "border border-amber-300/80 bg-amber-500 text-white hover:bg-amber-600",
    featured: false,
  },
  {
    id: "momentum",
    name: "Momentum",
    tag: "Most chosen",
    price: "₹55,000",
    from: true,
    featured: true,
    pitch: "For brands ready to show up everywhere, with consistent voice, look, and motion across channels.",
    features: [
      "Everything in Spark, expanded",
      "Multi asset pack (video + static + social variants)",
      "2 revision rounds + channel specific crops",
      "Priority scheduling in our production queue",
      "Lightweight brand consistency pass across assets",
    ],
    accent: "border-blue-400/90 bg-gradient-to-b from-blue-50/95 via-white to-slate-50/80 shadow-blue-200/50",
    ring: "ring-2 ring-blue-500/80",
    btn: "bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700",
  },
  {
    id: "signature",
    name: "Signature",
    tag: "Flagship",
    price: "₹80,000",
    from: true,
    pitch: "The full treatment: narrative depth, campaign architecture, and white glove delivery for launches that can’t miss.",
    features: [
      "Strategic narrative + campaign architecture",
      "Full funnel asset suite (awareness through conversion)",
      "3 revision rounds + senior creative review",
      "White glove delivery + launch week support window",
      "Optional stakeholder walkthrough (recorded)",
    ],
    accent: "border-violet-200/80 bg-gradient-to-b from-violet-50/90 to-white shadow-violet-100/40",
    ring: "ring-violet-200/50",
    btn: "border border-violet-300 bg-violet-700 text-white hover:bg-violet-800",
    featured: false,
  },
] as const;

const PROCESS = [
  {
    step: "01",
    title: "Align",
    body: "We unpack goals, audience, and success metrics, so creative is not decoration. It is leverage.",
  },
  {
    step: "02",
    title: "Design",
    body: "Human led direction meets AI velocity: prompts, pipelines, and polish where it matters.",
  },
  {
    step: "03",
    title: "Refine",
    body: "Structured revisions. Clear feedback loops. No endless back and forth.",
  },
  {
    step: "04",
    title: "Ship",
    body: "Delivery ready files, named exports, and channel guidance so your team can publish fast.",
  },
];

const ADDONS = [
  { name: "Rush delivery window", detail: "When the calendar won’t wait", price: "from +₹12,000" },
  { name: "Extra revision sprint", detail: "One focused round, scoped", price: "+₹8,000" },
  { name: "Brand voice & messaging pass", detail: "Headlines, hooks, CTA set", price: "+₹18,000" },
  { name: "Extended social cuts", detail: "Platform native ratios and lengths", price: "from +₹15,000" },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-slate-900">
      <Navbar />

      {/* Hero: editorial, premium */}
      <header className="relative overflow-hidden border-b border-slate-200/80">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            background:
              "radial-gradient(ellipse 90% 70% at 10% 20%, rgba(30,58,138,0.18), transparent 50%), radial-gradient(ellipse 60% 50% at 90% 0%, rgba(180,83,9,0.12), transparent 45%), radial-gradient(ellipse 50% 40% at 50% 100%, rgba(15,23,42,0.08), transparent 55%)",
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "180px 180px",
          }}
          aria-hidden
        />

        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-500">Invest in output, not overhead</p>
              <h1
                className="mt-4 font-heading text-[clamp(2.25rem,5.5vw,4rem)] font-black leading-[0.95] tracking-tight text-slate-950"
                style={{ letterSpacing: "-0.04em" }}
              >
                Pricing that respects
                <br />
                <span className="bg-gradient-to-r from-blue-800 via-blue-600 to-amber-700 bg-clip-text text-transparent">
                  ambition and clarity.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 lg:text-lg">
                Three deliberate tiers: ₹30,000, ₹55,000, and ₹80,000 starting points. You always know what “yes” includes before we
                touch a timeline.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white/70 p-6 shadow-lg shadow-slate-200/40 backdrop-blur-md lg:max-w-xs">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">At a glance</p>
              <ul className="space-y-2.5 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Fixed package anchors, scope in writing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Human creative direction on every tier
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Kickoff within days, not weeks
                </li>
              </ul>
              <Link
                href="/contact"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Book a free 15 minute fit call
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Tier cards */}
      <section className="relative z-[1] -mt-8 px-6 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-5 lg:items-stretch">
            {TIERS.map((tier) => (
              <article
                key={tier.id}
                className={`group relative flex flex-col rounded-[1.75rem] border p-8 shadow-xl transition duration-500 hover:-translate-y-1 hover:shadow-2xl lg:p-9 ${
                  tier.featured ? `${tier.accent} ${tier.ring} scale-[1.02] lg:-mt-2 lg:mb-2` : `${tier.accent}`
                }`}
              >
                {tier.featured ? (
                  <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg">
                    {tier.tag}
                  </span>
                ) : (
                  <span className="mb-3 inline-flex w-fit rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    {tier.tag}
                  </span>
                )}
                <h2 className="font-heading text-2xl font-black text-slate-950">{tier.name}</h2>
                <div className="mt-5 flex flex-wrap items-baseline gap-1.5">
                  {tier.from ? (
                    <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">From</span>
                  ) : null}
                  <span className="font-heading text-4xl font-black tracking-tight text-slate-900 lg:text-[2.75rem]">{tier.price}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{tier.pitch}</p>
                <ul className="mt-8 flex-1 space-y-3.5 border-t border-slate-200/60 pt-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex gap-3 text-sm leading-snug text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-900/5 text-[11px] font-bold text-slate-700">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className={`mt-10 block rounded-2xl py-4 text-center text-sm font-black uppercase tracking-wide transition ${tier.btn}`}
                >
                  Start with {tier.name}
                </Link>
              </article>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-slate-500">
            Final investment depends on exact scope after your call. Tiers are our shared starting language, not a ceiling.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="mt-24 border-y border-slate-200/80 bg-white/50 py-20 lg:mt-28 lg:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">How we work</p>
            <h2 className="mt-3 font-heading text-[clamp(1.75rem,3.5vw,2.75rem)] font-black text-slate-950">From brief to broadcast ready</h2>
            <p className="mt-4 text-slate-600">No black boxes, just a rhythm you can plan around.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((p, i) => (
              <div
                key={p.step}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 p-6 shadow-md transition hover:border-blue-200 hover:shadow-lg"
              >
                <span className="font-mono text-3xl font-black tabular-nums text-slate-200 transition group-hover:text-blue-200">
                  {p.step}
                </span>
                <h3 className="mt-2 font-heading text-lg font-bold text-slate-900">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.body}</p>
                {i < PROCESS.length - 1 ? (
                  <div
                    className="pointer-events-none absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-full bg-gradient-to-r from-slate-300 to-transparent lg:block"
                    aria-hidden
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive compare */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Compare</p>
            <h2 className="mt-3 font-heading text-[clamp(1.75rem,3.5vw,2.5rem)] font-black text-slate-950">See how tiers stack</h2>
            <p className="mt-3 text-slate-600">
              Tap a tier to highlight that column. Useful when you are sharing your screen with your team.
            </p>
          </div>
          <div className="mt-12">
            <PricingTierCompare />
          </div>
        </div>
      </section>

      {/* Add ons */}
      <section className="border-t border-slate-200/80 bg-gradient-to-b from-slate-100/50 to-[#faf9f6] py-20 lg:py-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          <div className="flex flex-col gap-4 text-center lg:flex-row lg:items-end lg:justify-between lg:text-left">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Extensions</p>
              <h2 className="mt-2 font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-black text-slate-950">Add ons</h2>
              <p className="mt-2 max-w-md text-slate-600">Bolt on only what your launch needs, quoted before we commit.</p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {ADDONS.map((a) => (
              <div
                key={a.name}
                className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:border-amber-200/80 hover:shadow-md sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-heading font-bold text-slate-900">{a.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{a.detail}</p>
                </div>
                <span className="shrink-0 font-mono text-sm font-bold text-amber-800">{a.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="text-center">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Questions</p>
            <h2 className="mt-3 font-heading text-[clamp(1.75rem,3vw,2.5rem)] font-black text-slate-950">Straight answers</h2>
          </div>
          <div className="mt-10">
            <PricingFaqAccordion />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-slate-200/80 py-20 lg:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background: "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(59,130,246,0.35), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-2xl px-6 text-center lg:px-10">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-200/80">Next step</p>
          <h2 className="mt-4 font-heading text-[clamp(1.85rem,4vw,3rem)] font-black text-white">Not sure which tier fits?</h2>
          <p className="mt-4 text-lg text-blue-100/85">
            Tell us what you&apos;re launching. We&apos;ll map the leanest path. No pitch deck required.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="inline-flex rounded-full bg-white px-10 py-4 text-sm font-black uppercase tracking-wide text-slate-900 shadow-xl transition hover:bg-blue-50"
            >
              Book a free call
            </Link>
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}`}
              className="text-sm font-semibold text-blue-200/90 underline-offset-4 transition hover:text-white hover:underline"
            >
              {SITE_CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
