"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Are these fixed prices or estimates?",
    a: "They are clear starting packages. We scope every project in a free call. If your needs sit between tiers, we quote a custom bridge. You never get surprise invoices.",
  },
  {
    q: "What does “from” include?",
    a: "Each tier lists the core deliverables we commit to in writing: asset count, revision rounds, and delivery window. Anything beyond that is quoted before we start.",
  },
  {
    q: "How fast can we start?",
    a: "Most projects kick off within 24 to 48 hours of contract and first payment. Rush slots exist for Spark and Momentum at an add on rate when capacity allows.",
  },
  {
    q: "Do you work with startups only?",
    a: "We work with lean startups and established brands. The tiers scale by output volume and strategic depth, not company size.",
  },
  {
    q: "Can I mix AI and traditional production?",
    a: "Yes. Our workflows blend generative pipelines with human art direction, sound, and brand governance, whatever the story demands.",
  },
];

export default function PricingFaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/60 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
              aria-expanded={isOpen}
            >
              <span className="font-heading text-base font-bold text-slate-900 sm:text-lg">{item.q}</span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-current">
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="border-t border-slate-100 px-5 pb-5 pt-0 text-sm leading-relaxed text-slate-600 sm:px-6 sm:pb-6">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
