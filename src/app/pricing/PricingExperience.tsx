"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import PricingAlaCarte from "@/components/pricing/PricingAlaCarte";
import PricingAiMenu from "@/components/pricing/PricingAiMenu";

/**
 * Market benchmark: ₹5,000 per 45s film.
 * Weekly   15% below → ₹38,250 · 9 films · ₹4,250 / film
 * Monthly  20% below → ₹1,44,000 · 36 films · ₹4,000 / film
 * 3 months 25% below → ₹4,05,000 · 108 films · ₹3,750 / film
 */
const PLANS = [
  {
    id: "weekly",
    fare: "01",
    name: "Weekly",
    cadence: "per week",
    price: "₹38.3k",
    priceFull: "₹38,250",
    market: "₹45,000",
    marketPerFilm: "₹5,000",
    cut: "₹6,750",
    cutPct: "15 percent",
    films: 9,
    filmsLabel: "9 films",
    length: "45s each",
    perFilm: "₹4,250",
    effective: null as string | null,
    save: null as string | null,
    list: null as string | null,
    featured: false,
    blurb: "The base unit. One week. Nine films. Fifteen percent below market.",
  },
  {
    id: "monthly",
    fare: "02",
    name: "Monthly",
    cadence: "per month",
    price: "₹1.44L",
    priceFull: "₹1,44,000",
    market: "₹1,80,000",
    marketPerFilm: "₹5,000",
    cut: "₹36,000",
    cutPct: "20 percent",
    films: 36,
    filmsLabel: "36 films",
    length: "45s each",
    perFilm: "₹4,000",
    effective: "₹36,000 / week",
    save: "Save ₹9,000",
    list: "₹1,53,000 if billed weekly",
    featured: true,
    blurb: "Four weeks locked. Twenty percent below market.",
  },
  {
    id: "quarterly",
    fare: "03",
    name: "3 months",
    cadence: "per 3 months",
    price: "₹4.05L",
    priceFull: "₹4,05,000",
    market: "₹5,40,000",
    marketPerFilm: "₹5,000",
    cut: "₹1,35,000",
    cutPct: "25 percent",
    films: 108,
    filmsLabel: "108 films",
    length: "45s each",
    perFilm: "₹3,750",
    effective: "₹1,35,000 / month",
    save: "Save ₹27,000",
    list: "₹4,32,000 if billed monthly",
    featured: false,
    blurb: "Twelve weeks. Twenty five percent below market.",
  },
] as const;

const WEEKLY_TAKES = Array.from({ length: 9 }, (_, i) => String(i + 1).padStart(2, "0"));

export default function PricingExperience() {
  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      <Navbar />

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 55% 50% at 12% 0%, rgba(37,99,235,0.28), transparent 55%), radial-gradient(ellipse 40% 30% at 88% 10%, rgba(29,78,216,0.14), transparent 50%)",
        }}
        aria-hidden
      />

      <section className="relative mx-auto max-w-[90rem] px-5 pb-8 pt-10 sm:px-8 sm:pt-14 lg:px-16">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">CHANNEL · FARE</p>
        <h1 className="mt-3 font-heading text-[clamp(3rem,9vw,6.5rem)] leading-none tracking-tight">Pricing</h1>
        <p className="mt-5 max-w-2xl text-base font-light text-white/65 sm:text-lg">
          Market rate is ₹5,000 a film. We sit 15 to 25 percent below that. Longer the commit, sharper the fare.
        </p>
      </section>

      {/* Unit math strip */}
      <section className="relative border-y border-white/10">
        <div className="mx-auto grid max-w-[90rem] sm:grid-cols-4">
          {[
            { k: "BASE UNIT", v: "Weekly reel" },
            { k: "FILMS", v: "9 × 45s" },
            { k: "MARKET", v: "₹5,000 / film" },
            { k: "OUR FARE", v: "₹4,250 / film" },
          ].map((row) => (
            <div
              key={row.k}
              className="border-b border-white/10 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-8"
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/40">{row.k}</p>
              <p
                className={`mt-1.5 font-heading text-xl leading-none sm:text-2xl ${
                  row.k === "MARKET" ? "text-white/35 line-through decoration-white/40" : ""
                }`}
              >
                {row.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Three plans */}
      <section id="plans" className="relative scroll-mt-24">
        <div className="mx-auto grid max-w-[90rem] lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.id}
              id={plan.id}
              className={`relative flex flex-col border-b border-white/10 px-5 py-12 sm:px-8 sm:py-14 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:px-10 ${
                plan.featured ? "bg-white/[0.04]" : ""
              }`}
            >
              {plan.featured ? (
                <p className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.2em] text-blue-400 sm:right-8 sm:top-8">
                  20% BELOW MARKET
                </p>
              ) : null}

              <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">
                FARE {plan.fare} · {plan.name.toUpperCase()}
              </p>
              <h2 className="mt-3 font-heading text-[clamp(2rem,4vw,2.8rem)] leading-none">{plan.name}</h2>
              <p className="mt-3 text-sm font-light text-white/55">{plan.blurb}</p>

              <div className="mt-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-white/35">MARKET RATE</p>
                <p
                  className="mt-1 font-heading text-2xl leading-none text-white/30 line-through decoration-white/40 sm:text-3xl"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {plan.market}
                </p>
                <p
                  className="mt-3 font-heading text-[clamp(3rem,7vw,4.5rem)] leading-none text-[#fafafa]"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                >
                  {plan.price}
                </p>
                <p className="mt-2 text-sm text-white/45">
                  {plan.priceFull} <span className="text-white/30">·</span> {plan.cadence}
                </p>
                <p className="mt-4 border border-blue-400/30 bg-blue-500/10 px-3 py-2.5 text-sm font-light text-blue-100">
                  <span className="font-semibold text-white">{plan.cut}</span> below market.{" "}
                  <span className="text-blue-300">{plan.cutPct} less than the usual fare.</span>
                </p>
              </div>

              <dl className="mt-8 flex-1 space-y-0 divide-y divide-white/10 border-y border-white/10">
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">Films</dt>
                  <dd className="font-heading text-xl leading-none">{plan.filmsLabel}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">Length</dt>
                  <dd className="text-sm font-medium text-white">{plan.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">Market / film</dt>
                  <dd className="text-sm text-white/35 line-through decoration-white/40">{plan.marketPerFilm}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">Our / film</dt>
                  <dd className="font-heading text-xl leading-none text-blue-300">{plan.perFilm}</dd>
                </div>
                {plan.effective ? (
                  <div className="flex items-baseline justify-between gap-3 py-3.5">
                    <dt className="text-sm text-white/50">Effective</dt>
                    <dd className="text-sm font-medium text-white">{plan.effective}</dd>
                  </div>
                ) : null}
              </dl>

              {plan.save && plan.list ? (
                <p className="mt-5 text-[12px] font-light text-white/50">
                  <span className="font-medium text-blue-300">{plan.save}</span>
                  <span className="text-white/30"> · </span>
                  {plan.list}
                </p>
              ) : (
                <p className="mt-5 text-[12px] font-light text-white/40">Entry fare. Fifteen percent below market.</p>
              )}

              <ul className="mt-6 space-y-2 text-sm font-light text-white/65">
                <li>AI generated sound & music</li>
                <li>Commercial license to post</li>
                <li>Same 45s reel format every week</li>
              </ul>

              <Link
                href="/contact"
                className={`mt-8 inline-flex w-fit px-5 py-2.5 text-sm font-semibold ${
                  plan.featured
                    ? "bg-[#fafafa] text-black hover:bg-blue-100"
                    : "border border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                }`}
              >
                Book {plan.name.toLowerCase()}
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Ladder explainer */}
      <section className="relative border-t border-white/10">
        <div className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:px-16 lg:py-16">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">THE MATH</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4vw,2.6rem)] leading-none">
              Market is the ceiling.
              <br />
              Commit cuts the fare.
            </h2>
          </div>
          <div className="mt-8 space-y-0 divide-y divide-white/10 border-y border-white/10 lg:mt-0">
            <div className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-3 py-4 sm:grid-cols-[7rem_1fr_auto]">
              <p className="font-mono text-[10px] tracking-[0.18em] text-white/40">WEEKLY</p>
              <p className="text-sm text-white/70">Market ₹45k. Fifteen percent below.</p>
              <p className="font-heading text-lg leading-none">₹4,250</p>
            </div>
            <div className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-3 py-4 sm:grid-cols-[7rem_1fr_auto]">
              <p className="font-mono text-[10px] tracking-[0.18em] text-white/40">MONTHLY</p>
              <p className="text-sm text-white/70">Market ₹1.8L. Twenty percent below.</p>
              <p className="font-heading text-lg leading-none text-blue-300">₹4,000</p>
            </div>
            <div className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-3 py-4 sm:grid-cols-[7rem_1fr_auto]">
              <p className="font-mono text-[10px] tracking-[0.18em] text-white/40">3 MO</p>
              <p className="text-sm text-white/70">Market ₹5.4L. Twenty five percent below.</p>
              <p className="font-heading text-lg leading-none text-blue-300">₹3,750</p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly take sheet */}
      <section className="relative mx-auto max-w-[90rem] px-5 py-14 sm:px-8 lg:px-16" aria-hidden>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">TAKE SHEET</p>
            <p className="mt-2 font-heading text-2xl leading-none sm:text-3xl">Nine slots. Every week.</p>
          </div>
          <p className="hidden font-mono text-[10px] tracking-[0.2em] text-white/35 sm:block">01 to 09</p>
        </div>
        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-9">
          {WEEKLY_TAKES.map((n) => (
            <div
              key={n}
              className="flex aspect-[3/4] flex-col border border-white/15 bg-gradient-to-b from-white/[0.07] to-transparent p-1.5 sm:p-2"
            >
              <span className="font-heading text-sm leading-none text-white/80 sm:text-base">{n}</span>
              <span className="mt-auto font-mono text-[8px] tracking-wider text-white/30 sm:text-[9px]">45s</span>
            </div>
          ))}
        </div>
      </section>

      <PricingAlaCarte tone="ott" />
      <PricingAiMenu />
    </div>
  );
}
