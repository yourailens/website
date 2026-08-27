"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import { money, type Currency } from "@/components/pricing/studioPackages";
import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";

const PAGE = "mx-auto max-w-7xl px-6 lg:px-10";
const HAND = { fontFamily: "'Bradley Hand', 'Segoe Print', 'Comic Sans MS', cursive" } as const;
const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

/** 10s = ₹1,500. Each +5s = +₹750. */
const SEC_MIN = 10;
const SEC_MAX = 600;
const SEC_STEP = 5;
const BASE_AT_MIN = 1_500;
const PER_STEP = 750;

const COUNT_MIN = 1;
const COUNT_MAX = 20;

const HOURS_MIN = 5;
const HOURS_MAX = 168;
const HOURS_STANDARD = 48;

function pricePerVideo(seconds: number) {
  const steps = Math.max(0, Math.round((seconds - SEC_MIN) / SEC_STEP));
  return BASE_AT_MIN + steps * PER_STEP;
}

function deliveryFactor(hours: number) {
  if (hours <= HOURS_STANDARD) {
    const t = (HOURS_STANDARD - hours) / (HOURS_STANDARD - HOURS_MIN);
    return 1 + t * 0.75;
  }
  const t = (hours - HOURS_STANDARD) / (HOURS_MAX - HOURS_STANDARD);
  return 1 - t * 0.1;
}

function roundFare(amount: number) {
  return Math.round(amount / 500) * 500;
}

function formatSeconds(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return m === 1 ? "1 min" : `${m} min`;
  return `${m}m ${s}s`;
}

function formatDelivery(hours: number) {
  if (hours < 24) return hours === 1 ? "1 hour" : `${hours} hours`;
  const days = hours / 24;
  if (Number.isInteger(days)) {
    if (days === 1) return "1 day";
    if (days === 7) return "1 week";
    return `${days} days`;
  }
  const whole = Math.floor(days);
  const rem = hours % 24;
  return `${whole}d ${rem}h`;
}

function deliveryLabel(hours: number) {
  if (hours <= 8) return "Rush";
  if (hours < HOURS_STANDARD) return "Faster";
  if (hours === HOURS_STANDARD) return "Standard";
  if (hours >= 144) return "Patient";
  return "Relaxed";
}

function RangeSlider({
  id,
  min,
  max,
  step,
  value,
  onChange,
  label,
}: {
  id: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (next: number) => void;
  label: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <input
      id={id}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      aria-label={label}
      onChange={(event) => onChange(Number(event.target.value))}
      className="ala-carte-range h-2 w-full cursor-pointer appearance-none rounded-full"
      style={{
        background: `linear-gradient(to right, #2563eb ${pct}%, #dbeafe ${pct}%)`,
      }}
    />
  );
}

export default function PricingAlaCarte({
  embedded = false,
  idPrefix = "ala",
}: {
  /** Homepage: card only, no full page section chrome */
  embedded?: boolean;
  idPrefix?: string;
}) {
  const [seconds, setSeconds] = useState(40);
  const [count, setCount] = useState(1);
  const [hours, setHours] = useState(HOURS_STANDARD);
  const [currency, setCurrency] = useState<Currency>("INR");

  const quote = useMemo(() => {
    const unit = pricePerVideo(seconds);
    const base = unit * count;
    const factor = deliveryFactor(hours);
    const total = roundFare(base * factor);
    const rush = Math.max(0, total - roundFare(base));
    const save = Math.max(0, roundFare(base) - total);
    return {
      unit,
      base: roundFare(base),
      total,
      rush,
      save,
      perVideo: Math.round(total / count),
      label: deliveryLabel(hours),
    };
  }, [seconds, count, hours]);

  const mailto = useMemo(() => {
    const body = [
      "Hi, I want an a la carte quote.",
      "",
      `Length: ${formatSeconds(seconds)} each`,
      `Videos: ${count}`,
      `Delivery: ${formatDelivery(hours)} (${quote.label})`,
      `Fare: ${money(quote.total, "INR")}`,
    ].join("\n");
    return `mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent("A la carte quote")}&body=${encodeURIComponent(body)}`;
  }, [seconds, count, hours, quote.total, quote.label]);

  const meter = (
    <div className={`overflow-hidden border border-blue-200 bg-white ${embedded ? "mt-8" : "mt-10"}`}>
      <style>{`
        .ala-carte-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #2563eb;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #93c5fd, 0 4px 10px rgba(37, 99, 235, 0.35);
        }
        .ala-carte-range::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #2563eb;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #93c5fd;
        }
      `}</style>

      <div className="relative border-b border-blue-100 px-5 py-3.5 sm:px-7">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-blue-600">
            {embedded ? "A la carte" : "YAIL · Build your own"}
          </p>
          <div className="flex rounded-full border border-blue-200 bg-white p-0.5">
            {(["INR", "USD"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setCurrency(code)}
                aria-pressed={currency === code}
                className={`min-w-[3.25rem] rounded-full px-3 py-1 text-[10px] font-semibold tracking-[0.14em] transition ${
                  currency === code ? "bg-blue-600 text-white" : "text-slate-500 hover:text-blue-700"
                }`}
              >
                {code === "INR" ? "₹ INR" : "$ USD"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-9 border-b border-blue-100 px-5 py-8 sm:px-7 lg:border-b-0 lg:border-r">
          <div>
            <div className="flex items-end justify-between gap-3">
              <label
                htmlFor={`${idPrefix}-seconds`}
                className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500"
              >
                How many seconds
              </label>
              <p className="text-sm font-light text-slate-900">
                {formatSeconds(seconds)}{" "}
                <span className="text-slate-400">· {money(quote.unit, currency)} / film</span>
              </p>
            </div>
            <div className="mt-4">
              <RangeSlider
                id={`${idPrefix}-seconds`}
                min={SEC_MIN}
                max={SEC_MAX}
                step={SEC_STEP}
                value={seconds}
                onChange={setSeconds}
                label="Video length in seconds"
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.16em] text-slate-400">
              <span>10s</span>
              <span>₹1.5k start · +₹750 / 5s</span>
              <span>10 min</span>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <label
                htmlFor={`${idPrefix}-count`}
                className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500"
              >
                How many videos
              </label>
              <p className="text-sm font-light text-slate-900">
                {count === 1 ? "1 video" : `${count} videos`}
              </p>
            </div>
            <div className="mt-4">
              <RangeSlider
                id={`${idPrefix}-count`}
                min={COUNT_MIN}
                max={COUNT_MAX}
                step={1}
                value={count}
                onChange={setCount}
                label="Number of videos"
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.16em] text-slate-400">
              <span>1</span>
              <span>Same unit × count</span>
              <span>20</span>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <label
                htmlFor={`${idPrefix}-delivery`}
                className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500"
              >
                Delivery time
              </label>
              <p className="text-sm font-light text-slate-900">
                {formatDelivery(hours)} <span className="text-slate-400">· {quote.label}</span>
              </p>
            </div>
            <div className="mt-4">
              <RangeSlider
                id={`${idPrefix}-delivery`}
                min={HOURS_MIN}
                max={HOURS_MAX}
                step={1}
                value={hours}
                onChange={setHours}
                label="Delivery time"
              />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.16em] text-slate-400">
              <span>5 hrs</span>
              <span>2 days standard</span>
              <span>1 week</span>
            </div>
            <p className="mt-3 text-[11px] font-light text-slate-500">
              Faster than 2 days adds a rush. Slower than 2 days eases the fare a little.
            </p>
          </div>
        </div>

        <div className="relative flex flex-col justify-between px-5 py-8 sm:px-7">
          <div className="pointer-events-none absolute inset-0 opacity-40" style={GRID_PAPER} aria-hidden />
          <div className="relative">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-blue-600">Your fare</p>
            <p
              className="mt-3 text-[clamp(2.4rem,5vw,3.6rem)] font-light leading-none tracking-tight text-slate-900"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {money(quote.total, currency)}
            </p>
            <p className="mt-2 text-sm font-light text-slate-500">
              {count === 1 ? "1 film" : `${count} films`} · {formatSeconds(seconds)} · {formatDelivery(hours)}
            </p>
            <p className="mt-1 text-[11px] font-light text-slate-400">
              {money(quote.perVideo, currency)} each after delivery
            </p>
          </div>

          <div className="relative mt-8 space-y-2 border-t border-blue-100 pt-6 text-sm font-light">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-slate-500">Length × count</span>
              <span className="text-slate-700">{money(quote.base, currency)}</span>
            </div>
            {quote.rush > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-500">Rush</span>
                <span className="text-blue-700">+{money(quote.rush, currency)}</span>
              </div>
            ) : null}
            {quote.save > 0 ? (
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-500">Patient pace</span>
                <span className="text-blue-700">−{money(quote.save, currency)}</span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-3 border-t border-blue-100 pt-2">
              <span className="text-slate-900">Total</span>
              <span className="font-medium text-blue-700">{money(quote.total, currency)}</span>
            </div>
          </div>

          <div className="relative mt-8 flex flex-wrap gap-3">
            <a
              href={mailto}
              className="inline-block rotate-[-1.5deg] border-2 border-blue-700 bg-blue-600 px-5 py-2.5 text-lg font-light text-white shadow-sm transition hover:bg-blue-700"
              style={HAND}
            >
              Book this fare
            </a>
            {embedded ? (
              <Link
                href="/pricing#alacarte"
                className="border border-blue-300 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-800 hover:border-blue-600"
              >
                Full pricing →
              </Link>
            ) : (
              <Link
                href="/contact"
                className="border border-blue-300 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-800 hover:border-blue-600"
              >
                Talk first
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div id="home-alacarte" className="scroll-mt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">No package. Just math.</p>
          <h3
            className="mt-3 text-[clamp(2rem,5vw,3.4rem)] font-light text-slate-900"
            style={{ ...HAND, letterSpacing: "-0.03em" }}
          >
            A la carte
          </h3>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            Pick the seconds. Pick how many. Pick how fast. The fare moves with you.
          </p>
        </div>
        {meter}
      </div>
    );
  }

  return (
    <HomeBlueTint id="alacarte" className="scroll-mt-28 border-t border-blue-100/60 py-16 lg:py-24">
      <div className={PAGE}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-light uppercase tracking-[0.3em] text-blue-600/80">No package. Just math.</p>
          <h2
            className="mt-3 text-[clamp(2rem,5vw,3.8rem)] font-light text-slate-900"
            style={{ ...HAND, letterSpacing: "-0.03em" }}
          >
            A la carte
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            Pick the seconds. Pick how many. Pick how fast. The fare moves with you.
          </p>
        </div>
        {meter}
      </div>
    </HomeBlueTint>
  );
}
