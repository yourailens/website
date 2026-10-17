"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import PricingAlaCarte from "@/components/pricing/PricingAlaCarte";
import PricingAiMenu from "@/components/pricing/PricingAiMenu";

/**
 * A la carte (1 min): 480p ₹5k · 720p ₹10k · 1080p ₹20k.
 * Packages: same film counts at each quality, 15 / 20 / 25% below that minute rate.
 * Weekly 5 · Monthly 20 · 3 months 60 · all 1 min each.
 */
type Quality = "480p" | "720p" | "1080p";

const QUALITIES: { id: Quality; label: string; rate: number; note: string }[] = [
  { id: "480p", label: "480p", rate: 5_000, note: "₹5k / min" },
  { id: "720p", label: "720p", rate: 10_000, note: "₹10k / min" },
  { id: "1080p", label: "1080p", rate: 20_000, note: "₹20k / min" },
];

const PLAN_META = [
  {
    id: "weekly",
    fare: "01",
    name: "Weekly",
    cadence: "per week",
    films: 5,
    cutPct: 0.15,
    cutLabel: "15 percent",
    featured: false,
    weeks: 1,
  },
  {
    id: "monthly",
    fare: "02",
    name: "Monthly",
    cadence: "per month",
    films: 20,
    cutPct: 0.2,
    cutLabel: "20 percent",
    featured: true,
    weeks: 4,
  },
  {
    id: "quarterly",
    fare: "03",
    name: "3 months",
    cadence: "per 3 months",
    films: 60,
    cutPct: 0.25,
    cutLabel: "25 percent",
    featured: false,
    weeks: 12,
  },
] as const;

function money(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function moneyShort(amount: number) {
  if (amount >= 100_000) {
    const lakhs = amount / 100_000;
    const text = Number.isInteger(lakhs) ? String(lakhs) : lakhs.toFixed(1).replace(/\.0$/, "");
    return `₹${text}L`;
  }
  if (amount >= 1_000) {
    const k = amount / 1_000;
    const text = Number.isInteger(k) ? String(k) : k.toFixed(1).replace(/\.0$/, "");
    return `₹${text}k`;
  }
  return money(amount);
}

function buildPlans(quality: Quality) {
  const rate = QUALITIES.find((q) => q.id === quality)?.rate ?? 10_000;
  const weekly = PLAN_META[0];
  const monthly = PLAN_META[1];

  return PLAN_META.map((meta) => {
    const market = rate * meta.films;
    const fare = Math.round(market * (1 - meta.cutPct));
    const cut = market - fare;
    const perFilm = Math.round(fare / meta.films);
    const weeklyFare = Math.round(rate * weekly.films * (1 - weekly.cutPct));
    const monthlyFare = Math.round(rate * monthly.films * (1 - monthly.cutPct));

    let effective: string | null = null;
    let save: string | null = null;
    let list: string | null = null;
    let blurb = "";

    if (meta.id === "weekly") {
      blurb = `The base unit. One week. Five films at ${quality}. Fifteen percent below a la carte.`;
    } else if (meta.id === "monthly") {
      effective = `${money(Math.round(fare / 4))} / week`;
      const billedWeekly = weeklyFare * 4;
      save = `Save ${money(billedWeekly - fare)}`;
      list = `${money(billedWeekly)} if billed weekly`;
      blurb = `Four weeks locked. Twenty percent below a la carte.`;
    } else {
      effective = `${money(Math.round(fare / 3))} / month`;
      const billedMonthly = monthlyFare * 3;
      save = `Save ${money(billedMonthly - fare)}`;
      list = `${money(billedMonthly)} if billed monthly`;
      blurb = `Twelve weeks. Twenty five percent below a la carte.`;
    }

    return {
      ...meta,
      filmsLabel: `${meta.films} films`,
      length: "1 min each",
      quality,
      market: money(market),
      marketPerFilm: money(rate),
      price: moneyShort(fare),
      priceFull: money(fare),
      cut: money(cut),
      cutPct: meta.cutLabel,
      perFilm: money(perFilm),
      effective,
      save,
      list,
      blurb,
      fareAmount: fare,
      perFilmAmount: perFilm,
      marketAmount: market,
    };
  });
}

const WEEKLY_TAKES = Array.from({ length: 5 }, (_, i) => String(i + 1).padStart(2, "0"));

export default function PricingExperience() {
  const [quality, setQuality] = useState<Quality>("720p");
  const plans = useMemo(() => buildPlans(quality), [quality]);
  const rate = QUALITIES.find((q) => q.id === quality)?.rate ?? 10_000;
  const weekly = plans[0];

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
          A la carte is ₹5k, ₹10k, or ₹20k a minute by quality. Pick a resolution, then lock a weekly, monthly, or 3 month package below that rate.
        </p>
      </section>

      <section className="relative border-y border-white/10">
        <div className="mx-auto max-w-[90rem] px-5 py-6 sm:px-8 lg:px-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/40">PACKAGE QUALITY</p>
              <p className="mt-2 text-sm font-light text-white/55">Same film counts. The fare follows the resolution.</p>
            </div>
            <div className="grid w-full grid-cols-3 gap-1.5 sm:w-auto sm:min-w-[22rem]">
              {QUALITIES.map((tier) => {
                const on = quality === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setQuality(tier.id)}
                    className={`flex min-h-[4.25rem] flex-col items-center justify-center rounded-xl border px-3 py-2 transition ${
                      on
                        ? "border-blue-400 bg-blue-500/20 text-white"
                        : "border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30"
                    }`}
                  >
                    <span className="text-[15px] font-semibold leading-none">{tier.label}</span>
                    <span className={`mt-1.5 text-[11px] font-light ${on ? "text-blue-200" : "text-white/40"}`}>
                      {tier.note}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-b border-white/10">
        <div className="mx-auto grid max-w-[90rem] sm:grid-cols-4">
          {[
            { k: "QUALITY", v: quality },
            { k: "WEEKLY", v: "5 × 1 min" },
            { k: "A LA CARTE", v: `${money(rate)} / min` },
            { k: "OUR FARE", v: `${weekly.perFilm} / film` },
          ].map((row) => (
            <div
              key={row.k}
              className="border-b border-white/10 px-5 py-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 sm:px-8"
            >
              <p className="font-mono text-[10px] tracking-[0.22em] text-white/40">{row.k}</p>
              <p
                className={`mt-1.5 font-heading text-xl leading-none sm:text-2xl ${
                  row.k === "A LA CARTE" ? "text-white/35 line-through decoration-white/40" : ""
                }`}
              >
                {row.v}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="relative scroll-mt-24">
        <div className="mx-auto grid max-w-[90rem] lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.id}
              id={plan.id}
              className={`relative flex flex-col border-b border-white/10 px-5 py-12 sm:px-8 sm:py-14 lg:border-b-0 lg:border-r lg:last:border-r-0 lg:px-10 ${
                plan.featured ? "bg-white/[0.04]" : ""
              }`}
            >
              {plan.featured ? (
                <p className="absolute right-5 top-5 font-mono text-[10px] tracking-[0.2em] text-blue-400 sm:right-8 sm:top-8">
                  20% BELOW A LA CARTE
                </p>
              ) : null}

              <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">
                FARE {plan.fare} · {plan.name.toUpperCase()} · {quality}
              </p>
              <h2 className="mt-3 font-heading text-[clamp(2rem,4vw,2.8rem)] leading-none">{plan.name}</h2>
              <p className="mt-3 text-sm font-light text-white/55">{plan.blurb}</p>

              <div className="mt-8">
                <p className="font-mono text-[10px] tracking-[0.2em] text-white/35">A LA CARTE</p>
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
                  <span className="font-semibold text-white">{plan.cut}</span> below a la carte.{" "}
                  <span className="text-blue-300">{plan.cutPct} less than buying each film alone.</span>
                </p>
              </div>

              <dl className="mt-8 flex-1 space-y-0 divide-y divide-white/10 border-y border-white/10">
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">Films</dt>
                  <dd className="font-heading text-xl leading-none">{plan.filmsLabel}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">Quality</dt>
                  <dd className="text-sm font-medium text-white">{plan.quality}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">Length</dt>
                  <dd className="text-sm font-medium text-white">{plan.length}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 py-3.5">
                  <dt className="text-sm text-white/50">A la carte / min</dt>
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
                <p className="mt-5 text-[12px] font-light text-white/40">Entry fare. Fifteen percent below a la carte.</p>
              )}

              <ul className="mt-6 space-y-2 text-sm font-light text-white/65">
                <li>{quality} deliverables</li>
                <li>AI generated sound & music</li>
                <li>Commercial license to post</li>
                <li>Same 1 minute format every week</li>
              </ul>

              <Link
                href="/contact"
                className={`mt-8 inline-flex w-fit px-5 py-2.5 text-sm font-semibold ${
                  plan.featured
                    ? "bg-[#fafafa] text-black hover:bg-blue-100"
                    : "border border-white/25 text-white/90 hover:border-white/50 hover:text-white"
                }`}
              >
                Book {plan.name.toLowerCase()} · {quality}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="relative border-t border-white/10">
        <div className="mx-auto max-w-[90rem] px-5 py-12 sm:px-8 lg:grid lg:grid-cols-[1fr_1.2fr] lg:gap-16 lg:px-16 lg:py-16">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">THE MATH · {quality}</p>
            <h2 className="mt-3 font-heading text-[clamp(1.8rem,4vw,2.6rem)] leading-none">
              A la carte is the ceiling.
              <br />
              Commit cuts the fare.
            </h2>
          </div>
          <div className="mt-8 space-y-0 divide-y divide-white/10 border-y border-white/10 lg:mt-0">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-3 py-4 sm:grid-cols-[7rem_1fr_auto]"
              >
                <p className="font-mono text-[10px] tracking-[0.18em] text-white/40">
                  {plan.id === "quarterly" ? "3 MO" : plan.name.toUpperCase()}
                </p>
                <p className="text-sm text-white/70">
                  Ala carte {plan.market}. {plan.cutPct} below.
                </p>
                <p
                  className={`font-heading text-lg leading-none ${
                    plan.id === "weekly" ? "" : "text-blue-300"
                  }`}
                >
                  {plan.perFilm}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-[90rem] px-5 py-14 sm:px-8 lg:px-16" aria-hidden>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-white/40">TAKE SHEET</p>
            <p className="mt-2 font-heading text-2xl leading-none sm:text-3xl">Five slots. Every week.</p>
          </div>
          <p className="hidden font-mono text-[10px] tracking-[0.2em] text-white/35 sm:block">
            01 to 05 · {quality}
          </p>
        </div>
        <div className="mt-8 grid grid-cols-5 gap-2 sm:gap-3">
          {WEEKLY_TAKES.map((n) => (
            <div
              key={n}
              className="flex aspect-[3/4] flex-col border border-white/15 bg-gradient-to-b from-white/[0.07] to-transparent p-1.5 sm:p-2"
            >
              <span className="font-heading text-sm leading-none text-white/80 sm:text-base">{n}</span>
              <span className="mt-auto font-mono text-[8px] tracking-wider text-white/30 sm:text-[9px]">1 min</span>
            </div>
          ))}
        </div>
      </section>

      <PricingAlaCarte tone="ott" />
      <PricingAiMenu />
    </div>
  );
}
