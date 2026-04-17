"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import FAQAccordion from "@/components/FAQAccordion";
import Navbar from "@/components/Navbar";

const AI_MODELS = [
  { name: "Higgsfield", version: "Studio 2.0", logo: "/images/logos/higgsfield.png" },
  { name: "Kling AI", version: "3.0", logo: "/images/logos/kling.png" },
  { name: "Seedance", version: "2.0", logo: "/images/logos/bytedance-icon.png" },
  { name: "Claude", version: "3.5", logo: "/images/logos/anthropic.png" },
  { name: "NanoBanana Pro", version: "Gemini 2.0", logo: "/images/logos/gemini-star.svg" },
  { name: "Grok", version: "3.0", logo: "/images/logos/grok-official.jpg" },
  { name: "Veo", version: "3.0", logo: "/images/logos/veo.svg" },
  { name: "OpenAI", version: "GPT-4o", logo: "/images/logos/openai.png" },
  { name: "Eleven Labs", version: "v3", logo: "/images/logos/elevenlabs.png" },
  { name: "Minimax", version: "M2.5", logo: "/images/logos/minimax.svg", logoBg: "bg-slate-800" },
];

const STATS = [
  { value: "10×", label: "Faster production" },
  { value: "70%", label: "Cost reduction" },
  { value: "3×", label: "Higher engagement" },
  { value: "100+", label: "Campaigns delivered" },
];

const HOW_STEPS = [
  {
    num: "01",
    tag: "Discovery",
    title: "Schedule a call",
    brief: "15 minutes. That's all it takes.",
    desc: "Book a free strategy call with our team. We'll learn about your brand, your audience, your goals and show you exactly what's possible with AI. No jargon, no hard sell.",
    details: ["Free 15 min strategy call", "Brand + goal alignment", "Platform & format guidance", "Instant availability, book online"],
    color: "from-blue-500 to-blue-700",
    glow: "shadow-blue-200",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M4 12h24" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 4v4M22 4v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M11 26c0-2.761 2.239-3 5-3s5 .239 5 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    accent: "text-blue-500",
    accentBg: "bg-blue-50",
    accentBorder: "border-blue-200",
  },
  {
    num: "02",
    tag: "Strategy",
    title: "Pick your package",
    brief: "Transparent pricing. Zero surprises.",
    desc: "We walk you through our packages live on the call. From single campaign sprints to full monthly retainers. Every plan is fixed price, fully scoped, and ready to kick off in 24 hours.",
    details: ["Fixed price packages from ₹50K", "Custom scope if needed", "Contract signed same day", "Kickoff within 24 hrs of payment"],
    color: "from-violet-500 to-blue-600",
    glow: "shadow-violet-200",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4l3.09 6.26L26 11.27l-5 4.87 1.18 6.88L16 19.77l-6.18 3.25L11 16.14 6 11.27l6.91-1.01L16 4z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M6 27h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    accent: "text-cyan-600",
    accentBg: "bg-cyan-50",
    accentBorder: "border-cyan-200",
  },
  {
    num: "03",
    tag: "Production",
    title: "Your private dashboard goes live",
    brief: "Track everything, in real time.",
    desc: "The moment we start, your custom client portal is activated. Watch your visuals being built, leave feedback inline, approve deliverables, and track campaign performance, all in one place.",
    details: ["Live production tracking", "Inline feedback & revision rounds", "Asset delivery by format & platform", "Performance dashboard post launch"],
    color: "from-cyan-500 to-blue-500",
    glow: "shadow-cyan-200",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" className="h-8 w-8" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="5" width="26" height="18" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M10 23v4M22 23v4M7 27h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M8 14l4 4 4-5 4 3 4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: "text-blue-600",
    accentBg: "bg-blue-50",
    accentBorder: "border-blue-200",
  },
];

const WHY_POINTS = [
  { icon: "⚡", title: "Production in days, not months", desc: "Traditional shoots take 4 to 8 weeks. AI powered production delivers polished content in 48 to 72 hours." },
  { icon: "💰", title: "Fraction of the cost", desc: "No studio. No crew. No travel. Just world class creative output at up to 70% less than traditional agencies." },
  { icon: "📈", title: "Data driven creative", desc: "Every piece of content is informed by performance data. We A/B test at scale and optimize continuously." },
  { icon: "🎯", title: "On brand, always", desc: "Our AI is trained on your brand voice and visual identity. You get consistent, recognizable output every time." },
  { icon: "🌐", title: "Infinitely scalable", desc: "Need 10 variations? 100? No problem. AI scales with your ambition without linear cost increases." },
  { icon: "🔄", title: "Rapid iteration", desc: "Change direction in hours, not weeks. Test new ideas, new markets, new messages. Fast." },
];

const WORK_IMAGES = [
  "/images/img1.jpeg",
  "/images/img2.jpeg",
  "/images/img3.jpeg",
  "/images/img4.jpeg",
  "/images/img5.jpeg",
  "/images/img6.png",
  "/images/img7.png",
];

const TESTIMONIALS = [
  { quote: "YourAILens cut our campaign production time from 6 weeks to 4 days. The quality blew us away.", name: "Priya Sharma", role: "CMO, D2C Brand" },
  { quote: "We saved over ₹15 lakhs on our last product launch. The AI generated videos outperformed our traditional ads.", name: "Arjun Mehta", role: "Founder, Tech Startup" },
  { quote: "The team gets brand identity like no one else. Every piece felt completely us. Just 10x better.", name: "Riya Kapoor", role: "Marketing Director, Fortune 500" },
];

const BANNER_WORDS = ["Marketing", "Branding", "Campaigns", "Films", "Ads"];

function SliderCTA() {
  const THUMB = 56;
  const PAD = 4;
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [completed, setCompleted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startClientX = useRef(0);
  const startDragX = useRef(0);
  const dragActiveRef = useRef(false);

  useEffect(() => {
    const resetSlider = () => {
      dragActiveRef.current = false;
      setCompleted(false);
      setIsDragging(false);
      setDragX(0);
    };

    const onPageShow = () => resetSlider();
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") resetSlider();
    };
    const onFocus = () => resetSlider();

    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const maxTravel = () => (containerRef.current?.offsetWidth ?? 320) - THUMB - PAD * 2;
  const progress = Math.min(dragX / Math.max(maxTravel(), 1), 1);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (completed) return;
    e.preventDefault();
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const max = maxTravel();
    const thumbLeft = PAD + dragX;
    const thumbRight = thumbLeft + THUMB;
    let baseDragX = dragX;
    if (x < thumbLeft || x > thumbRight) {
      baseDragX = Math.max(0, Math.min(x - PAD - THUMB / 2, max));
    }
    dragActiveRef.current = true;
    setIsDragging(true);
    startClientX.current = e.clientX;
    startDragX.current = baseDragX;
    if (baseDragX !== dragX) setDragX(baseDragX);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActiveRef.current) return;
    const max = maxTravel();
    const newX = Math.max(0, Math.min(startDragX.current + e.clientX - startClientX.current, max));
    setDragX(newX);
    if (newX >= max * 0.92) {
      dragActiveRef.current = false;
      setCompleted(true);
      setIsDragging(false);
      setTimeout(() => { window.location.href = "/contact"; }, 600);
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragActiveRef.current) return;
    dragActiveRef.current = false;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    if (!completed) setDragX(0);
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[64px] w-full max-w-[380px] select-none overflow-hidden rounded-full"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.14)",
        backdropFilter: "blur(12px)",
        touchAction: "none",
        cursor: completed ? "default" : isDragging ? "grabbing" : "grab",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onLostPointerCapture={() => {
        if (dragActiveRef.current && !completed) {
          dragActiveRef.current = false;
          setIsDragging(false);
          setDragX(0);
        }
      }}
    >
      {/* Fill track — let presses pass through to the container */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full"
        style={{
          width: dragX + THUMB + PAD * 2,
          background: "linear-gradient(90deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%)",
          transition: isDragging ? "none" : "width 0.45s cubic-bezier(0.23,1,0.32,1)",
          boxShadow: progress > 0.1 ? "4px 0 20px rgba(37,99,235,0.5)" : "none",
        }}
      />

      {/* Chevron hints */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 pointer-events-none">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="text-white/20 text-[11px] font-bold transition-opacity duration-300"
            style={{ opacity: Math.max(0, 0.5 - progress * 1.5) - i * 0.12 }}
          >
            ›
          </span>
        ))}
      </div>

      {/* Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-[13px] font-semibold tracking-wide text-white transition-opacity duration-200"
          style={{ opacity: completed ? 0 : Math.max(0, 1 - progress * 2) }}
        >
          Slide to book a call
        </span>
        <span
          className="absolute text-[13px] font-semibold text-white transition-opacity duration-300"
          style={{ opacity: completed ? 1 : Math.max(0, progress * 2 - 0.9) }}
        >
          {completed ? "Connecting…" : "Slide to the end"}
        </span>
      </div>

      {/* Thumb */}
      <div
        className="pointer-events-none absolute inset-y-0 flex items-center"
        style={{
          left: PAD + dragX,
          transition: isDragging ? "none" : "left 0.45s cubic-bezier(0.23,1,0.32,1)",
        }}
      >
        <div
          className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-white transition-transform duration-150"
          style={{
            boxShadow: "0 2px 16px rgba(37,99,235,0.45), 0 1px 0 rgba(255,255,255,0.8) inset",
            transform: isDragging ? "scale(0.94)" : "scale(1)",
          }}
        >
          <svg
            width="20" height="20" viewBox="0 0 20 20" fill="none"
            style={{ transform: `translateX(${Math.min(progress * 3, 2)}px)`, transition: "transform 0.1s" }}
          >
            <path d="M4 10h12M11 5l5 5-5 5" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
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
    /* Outer span sized by the invisible target char — width never jumps */
    <span style={{ display: "inline-block", position: "relative", lineHeight: 1 }}>
      {/* Invisible sizer: always the target char, sets natural width */}
      <span style={{ visibility: "hidden", userSelect: "none", lineHeight: 1 }}>
        {char}
      </span>
      {/* Reel: absolutely overlays the sizer, clips overflow */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
        }}
      >
        <span
          style={{
            display: "block",
            transform: `translateY(${offset}em)`,
            transition:
              offset === 0
                ? "none"
                : `transform ${duration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
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

export default function Home() {
  const [audioCardMuted, setAudioCardMuted] = useState(true);
  const [bannerWordIdx, setBannerWordIdx] = useState(0);
  const [bannerSpinTrigger, setBannerSpinTrigger] = useState(0);
  const bannerCycleRef = useRef(0);
  const audioCardVideoRef = useRef<HTMLVideoElement>(null);
  const audioCardCanvasRef = useRef<HTMLCanvasElement>(null);
  const whyBgVideoRef = useRef<HTMLVideoElement>(null);
  const whyBgCanvasRef = useRef<HTMLCanvasElement>(null);
  const whyFgVideoRef = useRef<HTMLVideoElement>(null);
  const whyFgCanvasRef = useRef<HTMLCanvasElement>(null);
  const whyC2BgVideoRef = useRef<HTMLVideoElement>(null);
  const whyC2BgCanvasRef = useRef<HTMLCanvasElement>(null);
  const whyC2FgVideoRef = useRef<HTMLVideoElement>(null);
  const whyC2FgCanvasRef = useRef<HTMLCanvasElement>(null);
  const syncVideoRef = useRef<HTMLVideoElement>(null);
  const syncCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroBgVideoRef = useRef<HTMLVideoElement>(null);
  const heroBgCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const heroCanvasRef = useRef<HTMLCanvasElement>(null);
  const showcaseVideoRef = useRef<HTMLVideoElement>(null);
  const showcaseCanvasRef = useRef<HTMLCanvasElement>(null);
  const cs2VideoRef = useRef<HTMLVideoElement>(null);
  const cs2CanvasRef = useRef<HTMLCanvasElement>(null);
  const comparisonRef = useRef<HTMLDivElement>(null);
  const [compInView, setCompInView] = useState(false);

  useEffect(() => {
    const el = comparisonRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCompInView(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);


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


  // Canvas renderer — draws video frames into a canvas element.
  // Canvas keeps its pixel buffer in CPU memory, so it NEVER flashes
  // white when macOS discards the GPU compositing layer on window switch.
  const startCanvasRenderer = (
    vid: HTMLVideoElement,
    canvas: HTMLCanvasElement
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return () => {};

    let rafId: number;

    const syncSize = () => {
      const p = canvas.parentElement;
      if (p) { canvas.width = p.clientWidth; canvas.height = p.clientHeight; }
    };

    const draw = () => {
      if (vid.readyState >= 2 && canvas.width && canvas.height) {
        const vw = vid.videoWidth, vh = vid.videoHeight;
        const cw = canvas.width, ch = canvas.height;
        if (vw && vh) {
          // Replicate object-fit: cover
          const vR = vw / vh, cR = cw / ch;
          let sx = 0, sy = 0, sw = vw, sh = vh;
          if (vR > cR) { sw = vh * cR; sx = (vw - sw) / 2; }
          else         { sh = vw / cR; sy = (vh - sh) / 2; }
          ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, cw, ch);
        }
      }
      rafId = requestAnimationFrame(draw);
    };

    const ensurePlaying = () => { if (vid.paused) vid.play().catch(() => {}); };
    const onVisibility = () => { if (document.visibilityState === "visible") ensurePlaying(); };

    syncSize();
    window.addEventListener("resize", syncSize);
    vid.addEventListener("pause", ensurePlaying);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", ensurePlaying);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", syncSize);
      vid.removeEventListener("pause", ensurePlaying);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", ensurePlaying);
    };
  };

  useEffect(() => {
    const vid = heroBgVideoRef.current;
    const canvas = heroBgCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  useEffect(() => {
    const vid = heroVideoRef.current;
    const canvas = heroCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  useEffect(() => {
    const vid = showcaseVideoRef.current;
    const canvas = showcaseCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  useEffect(() => {
    const vid = cs2VideoRef.current;
    const canvas = cs2CanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  // Why AI section — Card 1 blurred background
  useEffect(() => {
    const vid = whyBgVideoRef.current;
    const canvas = whyBgCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  // Why AI section — Card 1 sharp foreground
  useEffect(() => {
    const vid = whyFgVideoRef.current;
    const canvas = whyFgCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  // Why AI section — Card 2 blurred background
  useEffect(() => {
    const vid = whyC2BgVideoRef.current;
    const canvas = whyC2BgCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  // Why AI section — Card 2 sharp foreground
  useEffect(() => {
    const vid = whyC2FgVideoRef.current;
    const canvas = whyC2FgCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  // Why AI section — Card 3 audio (visual only; audio comes from hidden video)
  useEffect(() => {
    const vid = audioCardVideoRef.current;
    const canvas = audioCardCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  // Why AI — "next frontier" card (sync1.mov)
  useEffect(() => {
    const vid = syncVideoRef.current;
    const canvas = syncCanvasRef.current;
    if (!vid || !canvas) return;
    return startCanvasRenderer(vid, canvas);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── LOGO BANNER ──────────────────────────────────────────── */}
      <div
        className="relative flex items-center justify-center gap-4 overflow-hidden py-5"
        style={{
          background: "linear-gradient(90deg, #1d4ed8 0%, #2563eb 40%, #3b82f6 60%, #2563eb 80%, #1d4ed8 100%)",
          backgroundSize: "300% auto",
          animation: "bannerShimmer 6s linear infinite",
        }}
      >
        {/* Animated logo mark */}
        <div className="relative flex items-center justify-center">
          {/* Radar ring 1 */}
          <span
            className="absolute rounded-full border border-white/40"
          style={{
              width: 44, height: 44,
              animation: "ringExpand 2s ease-out infinite",
            }}
          />
          {/* Radar ring 2 */}
          <span
            className="absolute rounded-full border border-white/25"
            style={{
              width: 44, height: 44,
              animation: "ringExpand 2s ease-out 0.75s infinite",
            }}
          />
          {/* Logo container */}
          <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
            <svg width="22" height="22" viewBox="0 0 18 18" fill="none">
              {/* Spinning hexagon */}
              <path
                d="M9 1L16 5V13L9 17L2 13V5L9 1Z"
                fill="white"
                fillOpacity="0.15"
                stroke="white"
                strokeWidth="1.5"
                style={{
                  transformOrigin: "9px 9px",
                  animation: "hexSpin 6s linear infinite",
                }}
              />
              {/* Pulsing core dot */}
              <circle
                cx="9" cy="9" r="3"
                fill="white"
                style={{
                  transformOrigin: "9px 9px",
                  animation: "corePulse 2s ease-in-out infinite",
                }}
              />
            </svg>
          </div>
        </div>

        {/* Cycling word */}
        <div className="flex items-baseline gap-2 font-heading font-black tracking-tight text-white"
          style={{ fontSize: "clamp(1.3rem, 3.2vw, 1.9rem)", letterSpacing: "-0.02em" }}
        >
          <span style={{ color: "rgba(255,255,255,0.55)" }}>AI</span>
          <span style={{ lineHeight: 1 }}>
            {Array.from(BANNER_WORDS[bannerWordIdx % BANNER_WORDS.length]).map((char, i) => (
              <CharReel
                key={i}
                char={char}
                trigger={bannerSpinTrigger}
                duration={380 + i * 45}
              />
            ))}
            </span>
        </div>
      </div>

      {/* ── EDITORIAL BANNER ─────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-black">
        {/* Full-bleed image */}
        <div className="relative h-[70vh] w-full lg:h-[88vh]">
          <Image
            src="/images/hr1.png"
            alt="AI Creative Studio"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Bottom fade into hero */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          {/* Subtle side vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

          {/* Editorial text overlay */}
          <div className="absolute inset-0 flex flex-col items-start justify-end px-8 pb-12 lg:px-16 lg:pb-16">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/50">
              Where creativity meets AI
            </p>
            <h2
              className="font-heading font-black leading-none text-white"
              style={{ fontSize: "clamp(2.8rem, 7vw, 7rem)", letterSpacing: "-0.03em" }}
            >
              Human vision.
              <br />
              <span
                style={{
                  WebkitTextStroke: "1.5px rgba(255,255,255,0.5)",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                AI execution.
                </span>
            </h2>
          </div>
        </div>
      </section>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[94vh] flex-col overflow-hidden lg:min-h-screen">

        {/* Background canvas — visible but softened */}
        <video ref={heroBgVideoRef} autoPlay muted loop playsInline preload="auto"
          style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
          <source src="/videos/sd1.mp4" type="video/mp4" />
        </video>
        <canvas ref={heroBgCanvasRef} className="absolute inset-0 h-full w-full"
          style={{ display: "block", filter: "blur(10px) brightness(0.6) saturate(1.4)", transform: "scale(1.08)" }} />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-950/30 via-transparent to-transparent" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.4) 100%)" }} />

        {/* ── 2-column layout ── */}
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center gap-10 px-6 pb-10 pt-20 lg:flex-row lg:items-center lg:gap-12 lg:px-12 lg:pt-24">

          {/* ── LEFT column ── */}
          <div className="flex w-full flex-col items-center text-center lg:w-[52%] lg:items-start lg:text-left">

            {/* Proof badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.07] px-4 py-1.5 backdrop-blur-md">
              <svg width="13" height="13" viewBox="0 0 18 18" fill="none" className="shrink-0">
                <path d="M9 1L16 5V13L9 17L2 13V5L9 1Z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5"/>
                <circle cx="9" cy="9" r="3" fill="white"/>
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">Built for modern brands</span>
            </div>

            {/* Headline */}
            <h1
              className="font-heading font-black text-white"
              style={{ fontSize: "clamp(3.2rem,7vw,7rem)", letterSpacing: "-0.03em", lineHeight: 0.92 }}
            >
              Campaigns
              <br />
              <span
                style={{
                  WebkitTextStroke: "2px rgba(255,255,255,0.55)",
                  WebkitTextFillColor: "transparent",
                  color: "transparent",
                }}
              >
                that convert.
            </span>
          </h1>

            {/* Value proposition */}
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65 lg:text-base">
              Production level AI creatives built for every brand, delivered with human precision.
            </p>

            {/* Price + time */}
            <div className="mt-6 inline-flex items-center gap-0 overflow-hidden rounded-2xl border border-white/15 backdrop-blur-md">
              <div className="flex flex-col items-center px-7 py-4">
                <span className="font-heading font-black leading-none text-white" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>
                  ₹10,000
                </span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">Starting from</span>
              </div>
              <div className="h-12 w-px bg-white/10" />
              <div className="flex flex-col items-center px-7 py-4">
                <span className="font-heading font-black leading-none text-white" style={{ fontSize: "clamp(1.8rem,3.5vw,2.6rem)" }}>
                  48 hrs
              </span>
                <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/45">Delivery guaranteed</span>
          </div>
        </div>

            {/* Slider CTA */}
            <div className="mt-6 flex w-full flex-col items-center gap-3 lg:items-start">
              <SliderCTA />
              <Link href="/pricing" className="text-[12px] font-medium text-white/40 underline underline-offset-4 transition-colors hover:text-white/65">
                See pricing
              </Link>
            </div>

            {/* Testimonial */}
            <div className="mt-6 flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur-sm">
              <svg width="13" height="10" viewBox="0 0 16 12" fill="none" className="shrink-0 opacity-35">
                <path d="M0 12V7.2C0 3.2 2.4 1 7.2 0L8 1.6C5.867 2.133 4.667 3.2 4.4 4.8H7.2V12H0ZM8.8 12V7.2C8.8 3.2 11.2 1 16 0L16.8 1.6C14.667 2.133 13.467 3.2 13.2 4.8H16V12H8.8Z" fill="white"/>
              </svg>
              <p className="flex-1 text-[11px] leading-snug text-white/55">
                AI is not just making it easier, it&apos;s making things <span className="font-semibold text-white/85">more entertaining.</span>
              </p>
              <span className="shrink-0 text-[10px] text-white/30">— Sandeep Reddy, Founder</span>
            </div>
          </div>

          {/* ── RIGHT column — video ── */}
          <div className="w-full lg:w-[48%]">
            <div className="relative overflow-hidden rounded-[1.5rem] shadow-2xl shadow-black/60 ring-1 ring-white/10 lg:rounded-[2rem]"
              style={{ backgroundColor: "#0f172a" }}>
              <video ref={heroVideoRef} autoPlay muted loop playsInline preload="auto"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
              <source src="/videos/sd1.mp4" type="video/mp4" />
            </video>
              <canvas ref={heroCanvasRef} className="aspect-[4/3] w-full lg:aspect-[4/5]"
                style={{ display: "block" }} />
              <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/50 to-transparent" />
          </div>
        </div>

        </div>

      </section>

      {/* ── POWERED BY ───────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-slate-700">
            Powered by the world&apos;s most advanced AI
          </p>
        </div>
        <div className="overflow-hidden">
          <div className="flex animate-marquee gap-6 pr-6">
            {[...AI_MODELS, ...AI_MODELS].map((model, i) => (
              <div key={`${model.name}-${i}`} className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-5 py-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${model.logoBg ?? ""}`}>
                  <Image src={model.logo} alt={model.name} width={28} height={28} className="h-6 w-6 object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{model.name}</p>
                  <p className="text-xs text-slate-700">{model.version}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORK SHOWCASE ────────────────────────────────────────── */}
      <section id="images" className="overflow-hidden bg-white py-16 lg:py-20 scroll-mt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-10 flex flex-col items-start gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">Our Work</span>
              <h2 className="font-heading text-[clamp(1.8rem,4vw,3rem)] font-black text-slate-900" style={{ letterSpacing: "-0.03em" }}>
                Real brands. Real results.
              </h2>
            </div>
            <p className="max-w-xs text-sm text-slate-700 lg:text-right">
              AI generated ads and creatives, produced for our clients.
            </p>
          </div>
        </div>

        {/* Row 1 — 5 landscape cards */}
        <div className="mb-5 flex gap-5 overflow-x-auto px-6 scrollbar-hide lg:px-10">
          {[
            "/images/ai_avatar1.jpeg",
            "/images/ws3.png",
            "/images/otshirt1.png",
            "/images/otshirt2.png",
            "/images/ws1.png",
          ].map((src, i) => (
            <div key={i} className="relative h-56 w-80 shrink-0 overflow-hidden rounded-2xl shadow-lg lg:h-64 lg:w-[420px]">
              <Image src={src} alt={`Work ${i + 1}`} fill className="object-cover" sizes="420px" />
            </div>
          ))}
        </div>

        {/* Row 2 — video + 4 image cards */}
        <div id="films" className="flex gap-5 overflow-x-auto px-6 scrollbar-hide scroll-mt-24 lg:px-10">
          {/* Video card — canvas rendering, immune to macOS GPU flush */}
          <div className="relative h-56 w-80 shrink-0 overflow-hidden rounded-2xl shadow-lg lg:h-64 lg:w-[420px]">
            {/* Static blurred bg image — never flashes */}
            <Image src="/images/ai_avatar1.jpeg" alt="" fill className="object-cover"
              style={{ filter: "blur(12px) brightness(0.6) saturate(1.2)", transform: "scale(1.08)" }} />
            {/* Hidden video feeds the canvas */}
            <video
              ref={showcaseVideoRef}
              autoPlay muted loop playsInline preload="auto"
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
            >
              <source src="/videos/v04.mp4" type="video/mp4" />
            </video>
            {/* Canvas draws from CPU memory — zero flash */}
            <canvas ref={showcaseCanvasRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />
          </div>
          {/* 2nd item — cologne.png, right next to first video */}
          <div className="relative h-56 w-80 shrink-0 overflow-hidden rounded-2xl shadow-lg lg:h-64 lg:w-[420px]">
            <Image src="/images/cologne.png" alt="Work" fill className="object-cover" sizes="500px" />
          </div>

          {/* 3rd item — cs2.mp4, canvas-rendered (no flash) */}
          <div className="relative h-56 w-80 shrink-0 overflow-hidden rounded-2xl shadow-lg lg:h-64 lg:w-[420px]">
            <Image src="/images/shoe.png" alt="" fill className="object-cover"
              style={{ filter: "blur(12px) brightness(0.6)", transform: "scale(1.08)" }} />
            <video ref={cs2VideoRef} autoPlay muted loop playsInline preload="auto"
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
              <source src="/videos/cs2.mp4" type="video/mp4" />
            </video>
            <canvas ref={cs2CanvasRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />
          </div>

          {/* Remaining image cards */}
          {[
            "/images/shoe.png",
            "/images/w2.png",
          ].map((src, i) => (
            <div key={i} className="relative h-56 w-80 shrink-0 overflow-hidden rounded-2xl shadow-lg lg:h-64 lg:w-[420px]">
              <Image src={src} alt={`Work ${i + 1}`} fill className="object-cover" sizes="500px" />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <Link
            href="/images"
            className="group inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-bold text-slate-700 shadow-sm transition-all hover:border-blue-300 hover:text-blue-600 hover:shadow-blue-100"
          >
            <span>View full gallery</span>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>

      {/* ── AI VS CONVENTIONAL ───────────────────────────────── */}
      <section className="overflow-hidden py-20 lg:py-28" style={{ background: "linear-gradient(150deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)" }}>
        <div ref={comparisonRef} className="mx-auto max-w-7xl px-6 lg:px-10">

          {/* Header */}
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">The Numbers Don&apos;t Lie</span>
            <h2 className="font-heading text-[clamp(2rem,5vw,3.8rem)] font-black text-slate-900" style={{ letterSpacing: "-0.03em" }}>
              AI production vs{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">conventional methods</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base text-slate-700">
              Cumulative spend across 6 campaigns. VFX studios, model shoots and post production vs AI.
            </p>
          </div>

          {/* Graph card — full width */}
          <div className="rounded-3xl border border-blue-100 bg-white px-4 py-8 shadow-lg shadow-blue-100 lg:px-10 lg:py-10">
            {/* Mobile: fixed-height clip so the zoom animation is cinematic */}
            {/* Desktop: natural height, no clip */}
            <div className="h-[230px] overflow-hidden rounded-2xl lg:h-auto lg:overflow-visible">
            <svg viewBox="0 0 900 420" className="graph-zoom w-full" aria-label="Cost comparison line graph">
              <defs>
                <linearGradient id="aiLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="areaFillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.01" />
                </linearGradient>
                <filter id="aiGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>

              {/* — Y axis: ₹0 to ₹25,00,000 (25 lakhs) in steps of 5L —
                  Plot area: x=[90,820], y=[30,350] → height=320
                  Y(v_in_lakhs) = 350 - (v/25)*320                           */}
              {([[0,350],[5,286],[10,222],[15,158],[20,94],[25,30]] as [number,number][]).map(([val,y]) => (
                <g key={val}>
                  <line x1="90" y1={y} x2="820" y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray={val === 0 ? "0" : "4 3"} />
                  <text x="82" y={y + 4} textAnchor="end" fontSize="12" fill="#475569" fontFamily="system-ui,sans-serif">
                    {val === 0 ? "₹0" : `₹${val}L`}
                  </text>
                </g>
              ))}

              {/* X axis campaign labels
                  6 points: x = 90 + i*146, spacing = (820-90)/5 = 146            */}
              {[1,2,3,4,5,6].map((n,i) => (
                <text key={n} x={90 + i * 146} y="375" textAnchor="middle" fontSize="12" fill="#475569" fontFamily="system-ui,sans-serif">
                  Campaign {n}
                </text>
              ))}

              {/* Axis lines */}
              <line x1="90" y1="350" x2="820" y2="350" stroke="#cbd5e1" strokeWidth="1.5" />
              <line x1="90" y1="30"  x2="90"  y2="350" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Axis titles */}
              <text x="455" y="405" textAnchor="middle" fontSize="12" fill="#475569" fontFamily="system-ui,sans-serif">Number of campaigns</text>
              <text x="18" y="190" textAnchor="middle" fontSize="12" fill="#475569" fontFamily="system-ui,sans-serif" transform="rotate(-90,18,190)">Cumulative cost (₹)</text>

              {/* — Data points —
                  Traditional per campaign: ₹4L → cumulative: 4,8,12,16,20,24L
                    Y: 350-(4/25)*320=299.2, 350-(8/25)*320=248.4, 350-(12/25)*320=197.6, 350-(16/25)*320=146.8, 350-(20/25)*320=96, 350-(24/25)*320=45.2
                  AI per campaign: ₹40K = ₹0.4L → cumulative: 0.4,0.8,1.2,1.6,2.0,2.4L
                    Y: 350-(0.4/25)*320=344.9, 350-(0.8/25)*320=339.7, 350-(1.2/25)*320=334.6, 350-(1.6/25)*320=329.5, 350-(2.0/25)*320=324.4, 350-(2.4/25)*320=319.3
              */}

              {/* Savings area fill */}
              <path
                d="M 90,299 L 236,248 L 382,198 L 528,147 L 674,96 L 820,45 L 820,319 L 674,324 L 528,330 L 382,335 L 236,340 L 90,345 Z"
                fill="url(#areaFillGrad)"
                opacity={compInView ? 1 : 0}
                style={{ transition: "opacity 1.5s ease-out 1.2s" }}
              />

              {/* Traditional line */}
              <path
                d="M 90,299 L 236,248 L 382,198 L 528,147 L 674,96 L 820,45"
                stroke="#94a3b8"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={compInView ? 0 : 1}
                style={{ transition: "stroke-dashoffset 2s ease-out 0.2s" }}
              />

              {/* AI line — with glow */}
              <path
                d="M 90,345 L 236,340 L 382,335 L 528,330 L 674,324 L 820,319"
                stroke="url(#aiLineGrad)"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#aiGlow)"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset={compInView ? 0 : 1}
                style={{ transition: "stroke-dashoffset 2s ease-out 0.6s" }}
              />

              {/* Traditional dots */}
              {([[90,299],[236,248],[382,198],[528,147],[674,96],[820,45]] as [number,number][]).map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r={compInView ? 5 : 0} fill="#475569" stroke="white" strokeWidth="2"
                  style={{ transition: `r 0.4s ease-out ${0.2 + i*0.12}s` }} />
              ))}

              {/* AI dots */}
              {([[90,345],[236,340],[382,335],[528,330],[674,324],[820,319]] as [number,number][]).map(([x,y],i) => (
                <circle key={i} cx={x} cy={y} r={compInView ? 6 : 0} fill="#2563eb" stroke="white" strokeWidth="2.5"
                  style={{ transition: `r 0.4s ease-out ${0.6 + i*0.12}s` }} />
              ))}

              {/* Cost callout labels on dots — Traditional */}
              {(["₹4L","₹8L","₹12L","₹16L","₹20L","₹24L"] as string[]).map((label,i) => (
                <text key={i} x={90 + i*146} y={299 - i*51 - 12} textAnchor="middle" fontSize="11" fill="#64748b" fontWeight="600" fontFamily="system-ui,sans-serif"
                  opacity={compInView ? 1 : 0} style={{ transition: `opacity 0.5s ease-out ${0.4 + i*0.12}s` }}>{label}</text>
              ))}

              {/* Cost callout labels on dots — AI */}
              {(["₹40K","₹80K","₹1.2L","₹1.6L","₹2L","₹2.4L"] as string[]).map((label,i) => (
                <text key={i} x={90 + i*146} y={345 - i*5 + 18} textAnchor="middle" fontSize="11" fill="#2563eb" fontWeight="700" fontFamily="system-ui,sans-serif"
                  opacity={compInView ? 1 : 0} style={{ transition: `opacity 0.5s ease-out ${0.8 + i*0.12}s` }}>{label}</text>
              ))}

              {/* Dashed bracket at campaign 6 */}
              <line x1="820" y1="51" x2="820" y2="313" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="5 3"
                opacity={compInView ? 1 : 0} style={{ transition: "opacity 0.8s ease-out 2s" }} />
              <line x1="812" y1="51" x2="820" y2="51" stroke="#cbd5e1" strokeWidth="1.5"
                opacity={compInView ? 1 : 0} style={{ transition: "opacity 0.8s ease-out 2s" }} />
              <line x1="812" y1="313" x2="820" y2="313" stroke="#cbd5e1" strokeWidth="1.5"
                opacity={compInView ? 1 : 0} style={{ transition: "opacity 0.8s ease-out 2s" }} />

              {/* Savings callout pill */}
              <rect x="828" y="162" width="62" height="38" rx="10" fill="#2563eb"
                opacity={compInView ? 1 : 0} style={{ transition: "opacity 0.8s ease-out 2.3s" }} />
              <text x="859" y="177" textAnchor="middle" fontSize="12" fill="white" fontWeight="800" fontFamily="system-ui,sans-serif"
                opacity={compInView ? 1 : 0} style={{ transition: "opacity 0.8s ease-out 2.3s" }}>₹21.6L</text>
              <text x="859" y="192" textAnchor="middle" fontSize="10" fill="rgba(255,255,255,0.75)" fontFamily="system-ui,sans-serif"
                opacity={compInView ? 1 : 0} style={{ transition: "opacity 0.8s ease-out 2.3s" }}>saved</text>
            </svg>

            </div>{/* end mobile clip wrapper */}

            {/* Legend */}
            <div className="mt-5 flex flex-wrap justify-center gap-10">
              <div className="flex items-center gap-2.5">
                <div className="h-0.5 w-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
                <span className="text-sm font-medium text-slate-800">AI Production (YourAILens)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-0.5 w-8 rounded-full bg-slate-400" />
                <span className="text-sm font-medium text-slate-700">Conventional / Agency</span>
              </div>
            </div>
          </div>

          {/* 3 stat pills */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { value: "87%", label: "Average cost reduction", color: "from-blue-600 to-blue-800" },
              { value: "15×", label: "Faster turnaround", color: "from-cyan-600 to-blue-600" },
              { value: "12×", label: "More content volume", color: "from-blue-600 to-indigo-700" },
            ].map((s) => (
              <div key={s.label} className="overflow-hidden rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm">
                <div className={`mb-1 bg-gradient-to-r ${s.color} bg-clip-text font-heading text-4xl font-black text-transparent`}>{s.value}</div>
                <p className="text-sm font-medium text-slate-700">{s.label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── WHY AI PRODUCTION ────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 lg:py-28" style={{ background: "linear-gradient(155deg, #EFF6FF 0%, #DBEAFE 45%, #E0F2FE 100%)" }}>

        {/* Background decorative elements */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-blue-200/40 blur-[80px]" />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-200/30 blur-[70px]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/50 blur-[60px]" />
        {/* Dot grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{ backgroundImage: "radial-gradient(circle, #3B82F6 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10">

          {/* Header */}
          <div className="mb-12 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">Why it matters now</span>
              <h2 className="font-heading text-[clamp(1.9rem,4vw,3.4rem)] font-black leading-tight text-slate-900" style={{ letterSpacing: "-0.03em" }}>
                AI isn&apos;t just a tool.<br />
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">It&apos;s a creative revolution.</span>
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-slate-700 lg:text-right">
              The most significant shift in content creation since the camera. Brands that move now will define their industries tomorrow.
            </p>
          </div>

          {/* Top row — 2 tall vertical cards, cinematic style */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Card 1 — Cinematic Video */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-blue-200">
              {/* Hidden source video — blurred bg */}
              <video ref={whyBgVideoRef} autoPlay muted loop playsInline preload="auto"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
                <source src="/videos/v2.mov" type="video/mp4" />
              </video>
              {/* Canvas renders frames — never flashes on window switch */}
              <canvas
                ref={whyBgCanvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ filter: "blur(14px) brightness(0.4) saturate(1.3)", transform: "scale(1.07)", display: "block" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="relative flex flex-col px-6 pb-0 pt-7 lg:px-8">
                <div className="w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
                  {/* Hidden source video — sharp foreground */}
                  <video ref={whyFgVideoRef} autoPlay muted loop playsInline preload="auto"
                    style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
                    <source src="/videos/v2.mov" type="video/mp4" />
                  </video>
                  <div className="relative aspect-video w-full">
                    <canvas ref={whyFgCanvasRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />
                  </div>
                </div>
              </div>
              <div className="relative p-6 lg:p-8">
                <span className="mb-2 inline-block rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-sm">AI Video</span>
                <h3 className="mb-2 font-heading text-2xl font-black leading-tight text-white lg:text-3xl">Cinematic content,<br />generated on demand.</h3>
                <p className="text-sm leading-relaxed text-white/65">Brand films, reels, product demos. From brief to delivery in 48 hours. Quality that used to cost ₹10 lakhs, now under ₹50K.</p>
                <div className="mt-4 flex gap-5">
                  {[{ v: "10×", l: "Faster" }, { v: "70%", l: "Less cost" }, { v: "48hr", l: "Delivery" }].map((s) => (
                    <div key={s.l} className="flex items-baseline gap-1">
                      <span className="font-heading text-lg font-black text-cyan-300">{s.v}</span>
                      <span className="text-[11px] text-white/45">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 2 — Visuals (ws3.mp4) */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-blue-100">
              {/* Hidden source — blurred bg */}
              <video ref={whyC2BgVideoRef} autoPlay muted loop playsInline preload="auto"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
                <source src="/videos/ws3.mp4" type="video/mp4" />
              </video>
              <canvas
                ref={whyC2BgCanvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ filter: "blur(14px) brightness(0.4) saturate(1.2)", transform: "scale(1.07)", display: "block" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="relative flex flex-col px-6 pb-0 pt-7 lg:px-8">
                <div className="w-full overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
                  {/* Hidden source — sharp foreground */}
                  <video ref={whyC2FgVideoRef} autoPlay muted loop playsInline preload="auto"
                    style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
                    <source src="/videos/ws3.mp4" type="video/mp4" />
                  </video>
                  <div className="relative aspect-video w-full">
                    <canvas ref={whyC2FgCanvasRef} className="absolute inset-0 h-full w-full" style={{ display: "block" }} />
                  </div>
                </div>
              </div>
              <div className="relative p-6 lg:p-8">
                <span className="mb-2 inline-block rounded-full border border-blue-400/40 bg-blue-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-300 backdrop-blur-sm">Visuals</span>
                <h3 className="mb-2 font-heading text-2xl font-black leading-tight text-white lg:text-3xl">Photorealistic<br />images & stills</h3>
                <p className="text-sm leading-relaxed text-white/65">Product shots, lifestyle campaigns, brand visuals, generated at studio quality in seconds. No photographer. No shoot day.</p>
                <div className="mt-4 h-px w-full bg-white/10" />
                <p className="mt-3 text-[11px] text-white/35">Generated with Midjourney · Firefly · FLUX</p>
              </div>
            </div>
          </div>

          {/* Bottom row — 2 vertical portrait cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* Card 3 — Audio */}
            {/* Card 3 — Audio (full-cover video) */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl" style={{ minHeight: 420 }}>
              {/* Hidden video — source of frames AND audio */}
              <video
                ref={audioCardVideoRef}
                autoPlay
                muted={audioCardMuted}
                loop
                playsInline
                preload="auto"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              >
                <source src="/videos/cs3.mov" type="video/mp4" />
              </video>
              {/* Canvas renders frames — never flashes on window switch */}
              <canvas
                ref={audioCardCanvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ display: "block" }}
              />

              {/* Dark gradient behind text */}
              <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/60 to-transparent" />

              {/* ── Mute / unmute button — prominent, centered top ── */}
              <div className="absolute inset-x-0 top-5 z-10 flex flex-col items-center gap-2">
                <button
                  onClick={() => {
                    const newMuted = !audioCardMuted;
                    setAudioCardMuted(newMuted);
                    if (audioCardVideoRef.current) {
                      audioCardVideoRef.current.muted = newMuted;
                      if (!newMuted) audioCardVideoRef.current.play().catch(() => {});
                    }
                  }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/60 bg-white/20 shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 hover:bg-white/30 active:scale-95"
                  aria-label={audioCardMuted ? "Unmute" : "Mute"}
                >
                  {audioCardMuted ? (
                    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white" />
                      <line x1="23" y1="9" x2="17" y2="15" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                      <line x1="17" y1="9" x2="23" y2="15" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 5L6 9H2v6h4l5 4V5z" fill="white" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                  )}
                </button>
                {/* Hint label */}
                <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                  {audioCardMuted ? "Tap to listen" : "Tap to mute"}
                </span>
              </div>

              {/* ── Waveform animation (no background, video shows through) ── */}
              <div className="absolute inset-x-0 bottom-28 z-10 flex items-end justify-center gap-[3px] px-8 lg:bottom-32">
                {[
                  "wave-bar-1","wave-bar-2","wave-bar-3","wave-bar-4","wave-bar-5",
                  "wave-bar-6","wave-bar-7","wave-bar-8","wave-bar-9","wave-bar-10",
                  "wave-bar-9","wave-bar-8","wave-bar-7","wave-bar-6","wave-bar-5",
                  "wave-bar-4","wave-bar-3","wave-bar-2","wave-bar-1","wave-bar-10",
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`w-[3px] rounded-full ${cls} ${audioCardMuted ? "wave-bar-paused" : ""}`}
                    style={{
                      height: 6,
                      background: "linear-gradient(to top, rgba(129,140,248,0.9), rgba(99,179,237,0.7))",
                      boxShadow: "0 0 6px rgba(129,140,248,0.6)",
                    }}
                  />
                ))}
              </div>

              {/* Text overlay */}
              <div className="absolute inset-x-0 bottom-0 p-6 lg:p-7">
                <span className="mb-2 inline-block rounded-full border border-indigo-400/40 bg-indigo-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-300 backdrop-blur-sm">Audio</span>
                <h3 className="mb-1.5 font-heading text-xl font-black text-white lg:text-2xl">Voice & sound design</h3>
                <p className="text-xs leading-relaxed text-white/60">AI voiceovers, multilingual dubbing, background scores and sound branding, aligned to your tone, instantly.</p>
              </div>
            </div>

            {/* Card 4 — Beyond */}
            <div className="relative overflow-hidden rounded-3xl shadow-xl" style={{ backgroundColor: "#0f172a" }}>
              {/* Blurred video background */}
              <video ref={syncVideoRef} autoPlay muted loop playsInline preload="auto"
                style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}>
                <source src="/videos/sync1.mov" type="video/mp4" />
              </video>
              <canvas
                ref={syncCanvasRef}
                className="absolute inset-0 h-full w-full"
                style={{ display: "block", filter: "brightness(0.45) saturate(1.2)", objectFit: "cover" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {/* Portrait video card */}
              <div className="relative flex flex-col px-5 pb-0 pt-5 lg:px-6">
                <div className="mx-auto w-3/4 overflow-hidden rounded-2xl shadow-2xl shadow-black/60 sm:w-2/3">
                  <div className="relative" style={{ aspectRatio: "9/16" }}>
                    <video autoPlay muted loop playsInline preload="auto" className="h-full w-full object-cover">
                      <source src="/videos/sync1.mov" type="video/mp4" />
                    </video>
                  </div>
                </div>
              </div>

              <div className="relative p-6 lg:p-7">
                <span className="mb-2 inline-block rounded-full border border-cyan-400/40 bg-cyan-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-cyan-300 backdrop-blur-sm">Beyond</span>
                <h3 className="mb-1.5 font-heading text-xl font-black text-white lg:text-2xl">The next frontier</h3>
                <p className="text-xs leading-relaxed text-white/60">3D environments, AI avatars, interactive ads, real time personalization. The boundary shifts every week.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── HOW WE WORK ──────────────────────────────────────────── */}
      <section id="how" className="py-20 lg:py-28" style={{ background: "linear-gradient(150deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">

          {/* Header */}
          <div className="mb-12 flex flex-col items-start gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500">Our Process</span>
              <h2 className="font-heading text-[clamp(1.8rem,4vw,3.2rem)] font-black text-slate-900" style={{ letterSpacing: "-0.03em" }}>
                From zero to live in{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">3 steps.</span>
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-700 lg:text-right">
              No complexity. No endless back and forth.<br />Just a clear, fast track to your campaign.
            </p>
          </div>

          {/* Step cards — 3-column grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {HOW_STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col rounded-3xl border border-blue-100 bg-white p-9 shadow-md shadow-blue-100">

                {/* Top — number + icon + tag */}
                <div className="mb-7 flex items-start justify-between">
                  {/* Number with icon overlaid */}
                  <div className="relative">
                    <span className={`font-heading text-[6.5rem] font-black leading-none select-none ${
                      i === 0 ? "text-blue-400" :
                      i === 1 ? "text-cyan-400" :
                      "text-blue-500"
                    }`}>
                      {step.num}
                    </span>
                    {/* Icon badge floating bottom-right of the number */}
                    <div className={`absolute -bottom-1 -right-3 flex h-11 w-11 items-center justify-center rounded-2xl border shadow-md ${step.accentBorder} ${step.accentBg} ${step.accent}`}>
                      {step.icon}
                    </div>
                  </div>
                  <span className={`mt-3 rounded-full border px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest ${step.accentBorder} ${step.accentBg} ${step.accent}`}>
                    {step.tag}
                  </span>
                </div>

                {/* Hook */}
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-blue-400">{step.brief}</p>

                {/* Title */}
                <h3 className="mb-4 font-heading text-2xl font-black text-slate-900 lg:text-3xl" style={{ letterSpacing: "-0.02em" }}>{step.title}</h3>

                {/* Description */}
                <p className="mb-8 text-[15px] leading-relaxed text-slate-800">{step.desc}</p>

                {/* Divider */}
                <div className="mb-6 h-px w-full bg-blue-50" />

                {/* Bullet details */}
                <ul className="mt-auto space-y-3">
                  {step.details.map((d, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm font-medium text-slate-700">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        i === 0 ? "bg-blue-400" : i === 1 ? "bg-cyan-500" : "bg-blue-500"
                      }`} />
                      {d}
                    </li>
                  ))}
                </ul>

                {/* Arrow connector between cards — desktop */}
                {i < HOW_STEPS.length - 1 && (
                  <div className="pointer-events-none absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:flex">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-blue-200 bg-white text-sm text-blue-400 shadow-md">›</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center">
            <Link
              href="/contact"
              className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:scale-105 hover:bg-blue-700"
            >
              Schedule your free call →
            </Link>
            <span className="text-sm text-slate-700">15 min · Free · No commitment</span>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <Link href="/" className="font-heading text-xl font-bold text-slate-900">
              YourAI<span className="text-blue-600">Lens</span>
              <span className="ml-2 text-xs font-normal text-slate-700">Studios</span>
            </Link>
            <a
              href="https://instagram.com/yourailens"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-700 transition-colors hover:text-slate-900"
            >
              @yourailens
            </a>
            <p className="text-xs text-slate-700">© 2026 YourAILens Studios</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
