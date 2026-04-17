"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "How much faster is AI powered marketing production?",
    a: "On average, we deliver campaigns 10x faster than traditional agencies. A typical ad shoot and edit takes 3 to 4 weeks traditionally. We do it in 2 to 4 days.",
  },
  {
    q: "How does AI reduce marketing costs?",
    a: "AI eliminates expensive shoots, large crews, and lengthy post production. Most clients see 50 to 70% cost savings while maintaining or improving quality.",
  },
  {
    q: "Do you work with startups or only established brands?",
    a: "Both. We love helping startups define their identity from day one, and we partner with established brands to scale faster and smarter.",
  },
  {
    q: "What's the typical timeline for a project?",
    a: "Brand projects take 4 to 8 weeks. Campaigns launch in 2 to 4 weeks. AI video content can be turned around in 48 to 72 hours.",
  },
  {
    q: "Will the AI content look generic or off-brand?",
    a: "Never. We train our workflows on your brand identity — colors, tone, aesthetic. Every output is uniquely yours, reviewed by our creative team before delivery.",
  },
  {
    q: "What's included in a typical engagement?",
    a: "Strategy, creative direction, AI production, and delivery. We can also handle media buying, analytics, and ongoing content creation.",
  },
];

export default function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i}>
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between py-5 text-left"
          >
            <span className="pr-6 font-medium text-slate-900">{item.q}</span>
            <span className={`shrink-0 text-blue-500 transition-transform duration-200 ${openIndex === i ? "rotate-180" : ""}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
          <div className={`grid transition-all duration-300 ease-in-out ${openIndex === i ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <p className="text-sm leading-relaxed text-slate-700">{item.a}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
