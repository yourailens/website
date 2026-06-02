"use client";

import { useEffect, useRef, useState } from "react";

const BANNER_WORDS = ["Ads", "Campaigns", "Videos", "Creatives", "Branding"];
const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#!?*%$";

function CharReel({ char, trigger, duration }: { char: string; trigger: number; duration: number }) {
  const REEL_SIZE = 14;
  const [reelChars, setReelChars] = useState<string[]>([char]);
  const [offset, setOffset] = useState(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (trigger === 0 || char === "." || char === " " || char === ",") return;
    cancelAnimationFrame(rafRef.current);

    const reel: string[] = [];
    for (let i = 0; i < REEL_SIZE; i++) {
      reel.push(SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]);
    }
    reel.push(char);

    setReelChars(reel);
    setOffset(0);

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = requestAnimationFrame(() => {
        setOffset(-(reel.length - 1));
      });
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, char]);

  if (char === "." || char === " " || char === ",") {
    return <span style={{ display: "inline-block" }}>{char}</span>;
  }

  return (
    <span style={{ display: "inline-block", position: "relative", lineHeight: 1 }}>
      <span style={{ visibility: "hidden", userSelect: "none", lineHeight: 1 }}>{char}</span>
      <span style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
        <span
          style={{
            display: "block",
            transform: `translateY(${offset}em)`,
            transition:
              offset === 0 ? "none" : `transform ${duration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
          }}
        >
          {reelChars.map((c, i) => (
            <span key={i} style={{ display: "block", lineHeight: 1, height: "1em" }}>
              {c}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}

export default function HomeHeroBanner() {
  const [bannerWordIdx, setBannerWordIdx] = useState(0);
  const [bannerSpinTrigger, setBannerSpinTrigger] = useState(0);
  const bannerCycleRef = useRef(0);

  useEffect(() => {
    bannerCycleRef.current = 0;
    setBannerWordIdx(0);
    const timer = setInterval(() => {
      bannerCycleRef.current = (bannerCycleRef.current + 1) % BANNER_WORDS.length;
      setBannerWordIdx(bannerCycleRef.current);
      setBannerSpinTrigger((t) => t + 1);
    }, 2200);
    return () => clearInterval(timer);
  }, []);

  const word = BANNER_WORDS[bannerWordIdx % BANNER_WORDS.length];

  return (
    <div
      className="relative z-10 flex items-center justify-center gap-4 overflow-hidden py-5"
      style={{
        background: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 60%, #2563eb 80%, #1d4ed8 100%)",
        backgroundSize: "300% auto",
        animation: "bannerShimmer 6s linear infinite",
      }}
    >
      <div className="relative flex items-center justify-center">
        <span
          className="absolute rounded-full border border-white/40"
          style={{ width: 44, height: 44, animation: "ringExpand 2s ease-out infinite" }}
        />
        <span
          className="absolute rounded-full border border-white/25"
          style={{ width: 44, height: 44, animation: "ringExpand 2s ease-out 0.75s infinite" }}
        />
        <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
          <svg width="22" height="22" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path
              d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
              fill="white"
              fillOpacity="0.15"
              stroke="white"
              strokeWidth="1.5"
              style={{ transformOrigin: "9px 9px", animation: "hexSpin 6s linear infinite" }}
            />
            <circle
              cx="9"
              cy="9"
              r="3"
              fill="white"
              style={{ transformOrigin: "9px 9px", animation: "corePulse 2s ease-in-out infinite" }}
            />
          </svg>
        </div>
      </div>

      <div
        className="flex items-baseline gap-2 font-black tracking-tight text-white"
        style={{ fontSize: "clamp(1.3rem, 3.2vw, 1.9rem)", letterSpacing: "-0.02em" }}
      >
        <span style={{ color: "rgba(255,255,255,0.55)" }}>AI</span>
        <span style={{ lineHeight: 1 }}>
          {Array.from(word).map((char, i) => (
            <CharReel
              key={`${bannerWordIdx}-${i}`}
              char={char}
              trigger={bannerSpinTrigger}
              duration={380 + i * 45}
            />
          ))}
        </span>
      </div>
    </div>
  );
}
