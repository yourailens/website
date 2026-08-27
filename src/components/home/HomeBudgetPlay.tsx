"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const GRID_PAPER = {
  backgroundImage:
    "linear-gradient(rgba(59,130,246,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.09) 1px, transparent 1px)",
  backgroundSize: "18px 18px",
} as const;

const USD_PER_INR = 84;

const LADDER = [
  { ads: 1, price: 12_000, days: 5 },
  { ads: 2, price: 22_000, days: 6 },
  { ads: 3, price: 30_000, days: 7 },
  { ads: 4, price: 42_000, days: 9 },
  { ads: 5, price: 55_000, days: 10 },
  { ads: 6, price: 68_000, days: 11 },
  { ads: 7, price: 82_000, days: 13 },
  { ads: 8, price: 95_000, days: 14 },
] as const;

function formatInr(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatUsd(amountInr: number) {
  return `$${Math.round(amountInr / USD_PER_INR).toLocaleString("en-US")}`;
}

function quote(ads: number, rush: number) {
  const row = LADDER[ads - 1] ?? LADDER[2];
  const t = rush / 100;
  const days = Math.max(3, Math.round(row.days * (1 - t * 0.5)));
  const price = Math.round((row.price * (1 + t * 0.5)) / 500) * 500;
  const traditional = row.price * 4;
  const traditionalWeeks = Math.max(4, ads * 2);
  const pace = t < 0.34 ? "Standard" : t < 0.7 ? "Faster" : "Rush";
  return { days, price, traditional, traditionalWeeks, perAd: Math.round(price / ads), pace };
}

function RangeSlider({
  id,
  min,
  max,
  value,
  onChange,
  label,
}: {
  id: string;
  min: number;
  max: number;
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
      value={value}
      aria-label={label}
      onChange={(event) => onChange(Number(event.target.value))}
      className="home-budget-range h-2 w-full cursor-pointer appearance-none rounded-full"
      style={{
        background: `linear-gradient(to right, #2563eb ${pct}%, #dbeafe ${pct}%)`,
      }}
    />
  );
}

export default function HomeBudgetPlay({ showPackagesLink = true }: { showPackagesLink?: boolean }) {
  const [ads, setAds] = useState(3);
  const [rush, setRush] = useState(0);
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");

  const q = useMemo(() => quote(ads, rush), [ads, rush]);
  const money = currency === "INR" ? formatInr : formatUsd;
  const filmsLabel = ads === 1 ? "1 film" : `${ads} films`;

  return (
    <div className="mt-8 overflow-hidden border border-blue-200 bg-white">
      <style>{`
        .home-budget-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 999px;
          background: #1d4ed8;
          border: 2px solid white;
          box-shadow: 0 0 0 1px #93c5fd, 0 4px 10px rgba(37, 99, 235, 0.35);
          cursor: pointer;
        }
        .home-budget-range::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 999px;
          background: #1d4ed8;
          border: 2px solid white;
          box-shadow: 0 0 0 1px #93c5fd;
          cursor: pointer;
        }
      `}</style>

      <div className="relative border-b border-blue-100 px-5 py-3.5 sm:px-7">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={GRID_PAPER} aria-hidden />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-blue-600">The meter</p>
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
        <div className="space-y-8 border-b border-blue-100 px-5 py-8 sm:px-7 lg:border-b-0 lg:border-r">
          <div>
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="ads-slider" className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                How many ads
              </label>
              <p className="text-sm font-light text-slate-900">
                {filmsLabel} <span className="text-slate-400">· 40 to 45s</span>
              </p>
            </div>
            <div className="mt-4">
              <RangeSlider id="ads-slider" min={1} max={8} value={ads} onChange={setAds} label="Number of ads" />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.16em] text-slate-400">
              <span>1</span>
              <span>3 starter</span>
              <span>8</span>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <label htmlFor="rush-slider" className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                How fast
              </label>
              <p className="text-sm font-light text-slate-900">
                {q.pace} <span className="text-slate-400">· {q.days} days</span>
              </p>
            </div>
            <div className="mt-4">
              <RangeSlider id="rush-slider" min={0} max={100} value={rush} onChange={setRush} label="How fast you need it" />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[9px] tracking-[0.16em] text-slate-400">
              <span>Standard</span>
              <span>Faster</span>
              <span>Rush</span>
            </div>
            <p className="mt-3 text-[11px] font-light text-slate-500">
              Need it sooner? Time compresses. A rush premium steps in.
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
              {money(q.price)}
            </p>
            <p className="mt-2 text-sm font-light text-slate-500">
              {filmsLabel} · {q.days} days · {money(q.perAd)} / ad
            </p>
            <p className="mt-1 text-[11px] font-light text-slate-400">
              {currency === "INR" ? `${formatUsd(q.price)} USD` : `${formatInr(q.price)} INR`}
            </p>
          </div>

          <div className="relative mt-8 border-t border-blue-100 pt-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-slate-400">Standard benchmark</p>
            <div className="mt-3 space-y-2 text-sm font-light">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-slate-500">Typical house</span>
                <span className="text-slate-700">
                  {money(q.traditional)} · {q.traditionalWeeks} weeks
                </span>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-blue-700">YourAILens</span>
                <span className="font-medium text-blue-700">
                  {money(q.price)} · {q.days} days
                </span>
              </div>
            </div>
            <p className="mt-4 text-[11px] font-light leading-relaxed text-slate-500">
              Same brief. About {money(q.traditional - q.price)} less, and weeks back on the calendar.
            </p>
            {showPackagesLink ? (
              <Link
                href="/pricing"
                className="mt-5 inline-flex text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-700"
              >
                Full packages →
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
