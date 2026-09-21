"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";

type MenuItem = {
  id: string;
  label: string;
  note: string;
  priceInr: number;
};

const MENU: MenuItem[] = [
  {
    id: "logo-2d",
    label: "2D logo design",
    note: "Logo mark and color versions",
    priceInr: 2_500,
  },
  {
    id: "logo-3d-intro",
    label: "3D logo intro video",
    note: "10 to 15 seconds",
    priceInr: 4_500,
  },
  {
    id: "brand-kit",
    label: "Brand colors and fonts",
    note: "Colors, fonts, and basic brand rules",
    priceInr: 3_500,
  },
  {
    id: "product-stills",
    label: "Product photos",
    note: "10 images of your product",
    priceInr: 3_000,
  },
  {
    id: "campaign-stills",
    label: "Lifestyle photos",
    note: "10 images for ads and social",
    priceInr: 3_500,
  },
  {
    id: "character-sheet",
    label: "AI character faces",
    note: "Same person from 3 angles",
    priceInr: 2_500,
  },
  {
    id: "location-sheet",
    label: "AI location images",
    note: "9 images of one place",
    priceInr: 2_500,
  },
  {
    id: "hook-cut",
    label: "Short hook video",
    note: "5 to 10 seconds",
    priceInr: 3_000,
  },
  {
    id: "product-spin",
    label: "Product spin video",
    note: "8 to 12 seconds",
    priceInr: 3_500,
  },
  {
    id: "cover-set",
    label: "Thumbnails and covers",
    note: "5 images for YouTube or social",
    priceInr: 2_000,
  },
];

function money(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function PricingAiMenu() {
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const picked = useMemo(() => MENU.filter((item) => selected[item.id]), [selected]);
  const total = useMemo(() => picked.reduce((sum, item) => sum + item.priceInr, 0), [picked]);
  const count = picked.length;

  function toggle(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function clearAll() {
    setSelected({});
  }

  const mailto = useMemo(() => {
    const lines = [
      "Hi, I want an estimate from the AI menu.",
      "",
      ...picked.map((item) => `• ${item.label}: ${money(item.priceInr)}`),
      "",
      `Total: ${money(total)}`,
      `Items: ${count}`,
    ];
    return `mailto:${SITE_CONTACT_EMAIL}?subject=${encodeURIComponent("AI menu estimate")}&body=${encodeURIComponent(lines.join("\n"))}`;
  }, [picked, total, count]);

  return (
    <section id="ai-menu" className="scroll-mt-24 border-t border-white/10 py-16 lg:py-20">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">FARE 03</p>
            <h2 className="mt-3 font-heading text-[clamp(2.2rem,5vw,3.6rem)] leading-none">AI menu</h2>
            <p className="mt-3 max-w-lg text-sm font-light text-white/60">
              Pick what you need. See the total on the right.
            </p>
          </div>
          {count > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45 hover:text-white"
            >
              Clear all
            </button>
          ) : null}
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.65fr)] lg:items-start">
          <ul className="divide-y divide-white/10 border border-white/15 bg-white/[0.03]">
            {MENU.map((item, index) => {
              const on = Boolean(selected[item.id]);
              const n = String(index + 1).padStart(2, "0");
              return (
                <li key={item.id}>
                  <label
                    className={`flex cursor-pointer items-start gap-4 px-4 py-4 transition sm:gap-5 sm:px-6 sm:py-5 ${
                      on ? "bg-blue-500/10" : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggle(item.id)}
                      className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer accent-blue-500"
                    />
                    <span className="mt-0.5 hidden font-mono text-[10px] tracking-[0.16em] text-white/25 sm:block">
                      {n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-medium leading-snug text-white sm:text-lg">{item.label}</span>
                      <span className="mt-1.5 block text-sm font-light text-white/50">{item.note}</span>
                    </span>
                    <span
                      className={`shrink-0 pt-0.5 text-base font-medium leading-none sm:text-lg ${
                        on ? "text-blue-300" : "text-white/70"
                      }`}
                      style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                      {money(item.priceInr)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <aside className="border border-white/15 bg-white/[0.03] lg:sticky lg:top-24">
            <div className="border-b border-white/10 px-5 py-4">
              <p className="font-mono text-[10px] tracking-[0.22em] text-blue-400">ESTIMATE</p>
              <p
                className="mt-3 font-heading text-[clamp(2.4rem,5vw,3.2rem)] leading-none text-[#fafafa]"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {money(total)}
              </p>
              <p className="mt-2 text-sm font-light text-white/50">
                {count === 0 ? "Nothing selected yet" : count === 1 ? "1 item" : `${count} items`}
              </p>
            </div>

            <div className="max-h-56 space-y-0 overflow-y-auto px-5 py-3">
              {count === 0 ? (
                <p className="py-2 text-sm font-light text-white/40">Select items on the left.</p>
              ) : (
                picked.map((item) => (
                  <div key={item.id} className="flex items-baseline justify-between gap-3 border-b border-white/5 py-2.5 last:border-b-0">
                    <span className="text-sm text-white/70">{item.label}</span>
                    <span className="shrink-0 text-sm text-white/90" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {money(item.priceInr)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-white/10 px-5 py-5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-white/50">Total</span>
                <span className="font-heading text-xl leading-none text-blue-300" style={{ fontVariantNumeric: "tabular-nums" }}>
                  {money(total)}
                </span>
              </div>
              <div className="mt-5 flex flex-col gap-2.5">
                <a
                  href={count > 0 ? mailto : undefined}
                  aria-disabled={count === 0}
                  className={`inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold ${
                    count > 0
                      ? "bg-[#fafafa] text-black hover:bg-blue-100"
                      : "cursor-not-allowed bg-white/10 text-white/35"
                  }`}
                  onClick={(event) => {
                    if (count === 0) event.preventDefault();
                  }}
                >
                  Book this estimate
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center border border-white/25 px-5 py-2.5 text-sm font-semibold text-white/85 hover:border-white/50 hover:text-white"
                >
                  Talk first
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
