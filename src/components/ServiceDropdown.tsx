"use client";

import { useState, useEffect } from "react";

const SERVICES = [
  {
    label: "Brand Design",
    desc: "Identity & strategy",
    icon: "◈",
    detail:
      "Logo design, brand guidelines, visual identity systems, and strategic positioning. We create brands that resonate and stand out in a crowded market.",
  },
  {
    label: "Web Design",
    desc: "Digital experiences",
    icon: "⬡",
    detail:
      "Responsive websites, landing pages, and web apps. We build fast, beautiful, and conversion-focused digital experiences that work across every device.",
  },
  {
    label: "AI-Powered Ads",
    desc: "Campaigns that scale",
    icon: "◎",
    detail:
      "Data-driven creative, audience targeting, and performance optimization. We combine AI with human creativity for maximum impact and ROI.",
  },
  {
    label: "Video & Motion",
    desc: "Cinematic content",
    icon: "▶",
    detail:
      "AI-generated video ads, reels, and brand films. From concept to delivery, we produce cinematic content that stops the scroll and drives action.",
  },
  {
    label: "Social Media",
    desc: "Content that converts",
    icon: "◉",
    detail:
      "Strategy, content calendars, and AI-powered post creation across Instagram, TikTok, LinkedIn and more. We grow your audience and turn followers into customers.",
  },
  {
    label: "AI Avatars & Voiceover",
    desc: "Scalable spokespersons",
    icon: "⟡",
    detail:
      "Photorealistic AI avatars and multilingual voiceovers for ads, explainers, and product demos. Create consistent, on-brand video content at scale without a camera.",
  },
];

export default function ServiceDropdown() {
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = active !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {SERVICES.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setActive(i)}
            className="group flex flex-col gap-1 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition-all hover:border-white/25 hover:bg-white/10"
          >
            <span className="text-lg text-white/50 group-hover:text-white/80 transition-colors">{s.icon}</span>
            <p className="text-sm font-semibold text-white">{s.label}</p>
            <p className="text-xs text-white/45">{s.desc}</p>
          </button>
        ))}
      </div>

      {/* Popup overlay */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setActive(null)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl border border-white/15 bg-[#0a0a0a] p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/50 transition-colors hover:border-white/30 hover:text-white"
            >
              ✕
            </button>
            <span className="text-3xl text-white/30">{SERVICES[active].icon}</span>
            <h3 className="mt-3 text-xl font-semibold text-white">{SERVICES[active].label}</h3>
            <p className="mt-1 text-sm text-white/50">{SERVICES[active].desc}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">{SERVICES[active].detail}</p>
          </div>
        </div>
      )}
    </>
  );
}
