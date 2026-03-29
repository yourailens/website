"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How does AI enhance your creative process?",
    a: "We use AI to accelerate ideation, generate concepts, and optimize campaigns—while maintaining human oversight for strategy and brand voice.",
  },
  {
    q: "What's the typical timeline for a project?",
    a: "Most brand projects take 4-8 weeks. Campaigns can launch in 2-4 weeks. We'll provide a tailored timeline after our discovery call.",
  },
  {
    q: "Do you work with startups or only established brands?",
    a: "Both. We love helping startups define their identity from day one, and we partner with established brands to evolve and scale.",
  },
  {
    q: "What's included in a typical engagement?",
    a: "Strategy, creative direction, design, and production. We can also handle media buying, analytics, and ongoing optimization.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-white/10 transition-colors hover:border-white/20"
        >
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="font-medium text-white">{item.q}</span>
            <span
              className={`ml-4 text-white/60 transition-transform ${
                openIndex === i ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
          <div
            className={`grid transition-all duration-300 ease-in-out ${
              openIndex === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <p className="border-t border-white/10 px-5 py-4 text-sm text-white/60">
                {item.a}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
