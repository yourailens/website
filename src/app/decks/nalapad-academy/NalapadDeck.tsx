"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const SLIDES = 6;

function Marks() {
  return (
    <>
      {/* YAIL mark, large and quiet, behind the content */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.07] mix-blend-screen"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/yail-wordmark.png"
        alt="YourAILens Studios"
        className="pointer-events-none absolute left-[4.6%] top-[10.8%] w-[13%] select-none"
      />
    </>
  );
}

function Kicker({ children }: { children: string }) {
  return (
    <p className="font-mono text-[clamp(9px,1.05cqw,13px)] tracking-[0.32em] text-blue-300">{children}</p>
  );
}

function Title({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-[1.4%] max-w-[18ch] font-body text-[clamp(1.55rem,3.5cqw,3.15rem)] font-semibold leading-[1.08] tracking-tight text-white">
      {children}
    </h2>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-[1.6%] max-w-[62ch] text-[clamp(13px,1.35cqw,18px)] font-light leading-relaxed text-white/72">
      {children}
    </p>
  );
}

const PDF_W = 13.333;
const PDF_H = 7.5;

type PdfDoc = {
  addPage: () => void;
  addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void;
  save: (name: string) => void;
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } };
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load PDF tools"));
    document.body.appendChild(script);
  });
}

function loadDomToJpeg() {
  type DomToJpeg = (node: HTMLElement, options?: Record<string, unknown>) => Promise<string>;
  const w = window as Window & { __domToJpeg?: DomToJpeg };
  if (w.__domToJpeg) return Promise.resolve(w.__domToJpeg);
  return new Promise<DomToJpeg>((resolve, reject) => {
    const ready = () => {
      window.removeEventListener("deck-pdf-lib", ready);
      if (w.__domToJpeg) resolve(w.__domToJpeg);
      else reject(new Error("Could not load PDF tools"));
    };
    window.addEventListener("deck-pdf-lib", ready);
    const script = document.createElement("script");
    script.type = "module";
    script.textContent =
      'import { domToJpeg } from "/vendor/modern-screenshot.mjs"; window.__domToJpeg = domToJpeg; window.dispatchEvent(new Event("deck-pdf-lib"));';
    script.onerror = () => reject(new Error("Could not load PDF tools"));
    document.head.appendChild(script);
  });
}

function SlideStage({ index }: { index: number }) {
  return (
    <div
      data-pdf-slide
      className="relative h-full w-full overflow-hidden bg-[#07090e]"
      style={{ containerType: "inline-size" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 55% 45% at 12% 0%, rgba(37,99,235,0.28), transparent 58%)",
        }}
        aria-hidden
      />
      <Marks />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[6.5%] pb-[5%] pt-[18.6%]">
        {index === 0 ? <SlideCover /> : null}
        {index === 1 ? <SlideProblem /> : null}
        {index === 2 ? <SlidePlan /> : null}
        {index === 3 ? <SlideMake /> : null}
        {index === 4 ? <SlideNinety /> : null}
        {index === 5 ? <SlideClose /> : null}
      </div>
    </div>
  );
}

export default function NalapadDeck() {
  const [i, setI] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const boardRef = useRef<HTMLDivElement>(null);
  const saveLock = useRef(false);

  const go = useCallback((n: number) => {
    setI(Math.max(0, Math.min(SLIDES - 1, n)));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(i + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(i - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(SLIDES - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, i]);

  useEffect(() => {
    if (!saving || saveLock.current) return;
    saveLock.current = true;
    (async () => {
      try {
        const domToJpeg = await loadDomToJpeg();
        await loadScript("/vendor/jspdf.umd.min.js");
        const JsPDF = (window as unknown as { jspdf?: { jsPDF: new (opts: object) => PdfDoc } }).jspdf?.jsPDF;
        const nodes = boardRef.current?.querySelectorAll<HTMLElement>("[data-pdf-slide]");
        if (!JsPDF || !nodes || nodes.length !== SLIDES) throw new Error("Could not build the PDF");
        await new Promise((resolve) => setTimeout(resolve, 400));
        const pdf = new JsPDF({ unit: "in", format: [PDF_W, PDF_H], orientation: "landscape", compress: true });
        for (let n = 0; n < nodes.length; n += 1) {
          const url = await domToJpeg(nodes[n], {
            scale: 2,
            quality: 1,
            backgroundColor: "#07090e",
          });
          if (n > 0) pdf.addPage();
          pdf.addImage(url, "JPEG", 0, 0, PDF_W, PDF_H);
        }
        pdf.save("Nalapad-Academy-Admissions-Plan-4K.pdf");
        setSaveError("");
      } catch {
        setSaveError("Could not build the PDF. Try again.");
      } finally {
        saveLock.current = false;
        setSaving(false);
      }
    })();
  }, [saving]);

  return (
    <div className="flex h-[100svh] flex-col bg-black text-white">
      <div className="flex min-h-0 flex-1 items-center justify-center px-3 py-3 sm:px-6">
        <div className="relative aspect-video w-full max-w-[min(100%,calc((100svh-5.5rem)*16/9))] overflow-hidden bg-[#07090e] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <SlideStage index={i} />

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(i - 1)}
            disabled={i === 0}
            className="absolute inset-y-0 left-0 z-20 w-[8%] disabled:cursor-default"
          />
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(i + 1)}
            disabled={i === SLIDES - 1}
            className="absolute inset-y-0 right-0 z-20 w-[8%] disabled:cursor-default"
          />
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 pb-4">
        <button
          type="button"
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25"
        >
          PREV
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: SLIDES }, (_, n) => (
            <button
              key={n}
              type="button"
              aria-label={`Slide ${n + 1}`}
              onClick={() => go(n)}
              className={`h-1.5 transition-all ${n === i ? "w-8 bg-blue-400" : "w-1.5 bg-white/30"}`}
            />
          ))}
        </div>
        <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/40">
          {String(i + 1).padStart(2, "0")} / 06
        </p>
        <button
          type="button"
          onClick={() => go(i + 1)}
          disabled={i === SLIDES - 1}
          className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25"
        >
          NEXT
        </button>
        <a href="/decks/nalapad-academy/full" className="font-mono text-[10px] tracking-[0.2em] text-white/45">
          FULL
        </a>
        <a href="/decks/nalapad-academy/phone" className="font-mono text-[10px] tracking-[0.2em] text-white/45">
          PHONE
        </a>
        <button
          type="button"
          onClick={() => {
            setSaveError("");
            setSaving(true);
          }}
          disabled={saving}
          className="font-mono text-[10px] tracking-[0.2em] text-blue-300 disabled:opacity-40"
        >
          {saving ? "SAVING" : "DOWNLOAD PDF"}
        </button>
      </div>
      {saveError ? <p className="pb-3 text-center font-mono text-[10px] tracking-[0.14em] text-red-300">{saveError}</p> : null}
      {saving ? (
        <div ref={boardRef} aria-hidden className="pointer-events-none fixed top-0" style={{ left: -12000 }}>
          {Array.from({ length: SLIDES }, (_, n) => (
            <div key={n} className="h-[1080px] w-[1920px]">
              <SlideStage index={n} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Split({ copy, visual, className = "h-full" }: { copy: ReactNode; visual: ReactNode; className?: string }) {
  return (
    <div className={`grid min-h-0 grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] items-stretch gap-[4%] ${className}`}>
      <div className="flex min-h-0 flex-col justify-center">{copy}</div>
      <div className="flex min-h-0 items-stretch py-[1%]">{visual}</div>
    </div>
  );
}

function Viz({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 80% 60% at 70% 30%, rgba(37,99,235,0.2), transparent 62%)" }}
        aria-hidden
      />
      <p className="relative font-mono text-[clamp(8px,0.72cqw,11px)] tracking-[0.28em] text-blue-300/90">{label}</p>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  );
}

function GlowDefs({ id }: { id: string }) {
  return (
    <defs>
      <filter id={id} x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.4" result="b" />
        <feMerge>
          <feMergeNode in="b" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

function SlideCover() {
  const stops = [
    { x: 78, y: 42, t: "See the film", s: "On the phone" },
    { x: 188, y: 108, t: "Save it", s: "Show a partner" },
    { x: 70, y: 186, t: "Book the tour", s: "A real date" },
    { x: 168, y: 258, t: "Take the seat", s: "Admissions" },
  ];
  return (
    <Split
      copy={
        <>
          <Kicker>PREPARED FOR NALAPAD ACADEMY</Kicker>
          <h1 className="mt-[2%] max-w-[14ch] font-body text-[clamp(1.7rem,3.6cqw,3.5rem)] font-semibold leading-[0.98] tracking-tight">
            More seats.
            <span className="block font-light text-white/80">Same school. Seen better.</span>
          </h1>
          <p className="mt-[3%] max-w-[36ch] text-[clamp(13px,1.25cqw,18px)] font-light leading-relaxed text-white/70">
            A GenAI film plan so Bangalore parents meet Nalapad on their phone, and then book the campus tour.
          </p>
          <div className="mt-[5%] flex flex-col gap-2 font-mono text-[clamp(9px,0.85cqw,12px)] tracking-[0.16em] text-white/45">
            <span>ADMISSIONS 2026 / 27</span>
            <span>INDIRANAGAR · CAMBRIDGE</span>
          </div>
        </>
      }
      visual={
        <Viz label="HOW A SEAT STARTS">
          <svg viewBox="0 0 260 310" className="h-full w-full" role="img" aria-label="Path from a film on the phone to a seat">
            <GlowDefs id="glow-cover" />
            <path
              d="M78 42 C 150 48, 210 78, 188 108 S 40 160, 70 186 S 210 230, 168 258"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.6"
              strokeDasharray="3 5"
              filter="url(#glow-cover)"
            />
            {stops.map((p, i) => (
              <g key={p.t}>
                <circle cx={p.x} cy={p.y} r="16" fill="#07090e" stroke="#60a5fa" strokeWidth="1.4" />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#dbeafe" fontSize="11" fontFamily="ui-sans-serif, system-ui">
                  {i + 1}
                </text>
                <text x={p.x < 130 ? p.x + 24 : p.x - 24} y={p.y - 2} textAnchor={p.x < 130 ? "start" : "end"} fill="white" fontSize="12" fontFamily="ui-sans-serif, system-ui">
                  {p.t}
                </text>
                <text x={p.x < 130 ? p.x + 24 : p.x - 24} y={p.y + 14} textAnchor={p.x < 130 ? "start" : "end"} fill="#93c5fd" fontSize="9" fontFamily="ui-monospace, monospace">
                  {p.s}
                </text>
              </g>
            ))}
          </svg>
        </Viz>
      }
    />
  );
}

function SlideProblem() {
  const ring = 2 * Math.PI * 46;
  return (
    <Split
      copy={
        <>
          <Kicker>01 · THE GAP</Kicker>
          <Title>Parents decide on the phone. Then they visit.</Title>
          <Lead>
            The campus is already strong. Cambridge, STEM, mentors, Apple smart rooms. What is thin is the weekly story parents see before they ever walk in.
          </Lead>
        </>
      }
      visual={
        <Viz label="WHERE THE DECISION HAPPENS">
          <svg viewBox="0 0 280 300" className="h-full w-full" role="img" aria-label="Parents look online first, and the weekly story is thin">
            <GlowDefs id="glow-gap" />
            <circle cx="92" cy="88" r="46" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="92"
              cy="88"
              r="46"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${ring * 0.72} ${ring}`}
              transform="rotate(-90 92 88)"
              filter="url(#glow-gap)"
            />
            <text x="92" y="86" textAnchor="middle" fill="white" fontSize="20" fontFamily="ui-sans-serif, system-ui">70%+</text>
            <text x="92" y="104" textAnchor="middle" fill="#93c5fd" fontSize="8" fontFamily="ui-monospace, monospace">LOOK ONLINE</text>
            <circle cx="210" cy="88" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
            <circle
              cx="210"
              cy="88"
              r="34"
              fill="none"
              stroke="#bfdbfe"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34 * 0.28} ${2 * Math.PI * 34}`}
              transform="rotate(-90 210 88)"
            />
            <text x="210" y="86" textAnchor="middle" fill="white" fontSize="13" fontFamily="ui-sans-serif, system-ui">3 to 7</text>
            <text x="210" y="102" textAnchor="middle" fill="#93c5fd" fontSize="8" fontFamily="ui-monospace, monospace">SECONDS</text>
            <text x="20" y="176" fill="#93c5fd" fontSize="9" fontFamily="ui-monospace, monospace">THIS WEEK, WITHOUT US</text>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <circle key={`a${d}`} cx={28 + d * 34} cy="204" r="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.16)" />
            ))}
            <text x="20" y="242" fill="#93c5fd" fontSize="9" fontFamily="ui-monospace, monospace">THIS WEEK, WITH A FILM</text>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => (
              <circle key={`b${d}`} cx={28 + d * 34} cy="270" r="8" fill={d === 2 ? "#60a5fa" : "rgba(255,255,255,0.06)"} stroke={d === 2 ? "#bfdbfe" : "rgba(255,255,255,0.16)"} filter={d === 2 ? "url(#glow-gap)" : undefined} />
            ))}
          </svg>
        </Viz>
      }
    />
  );
}

function SlidePlan() {
  const pillars = [
    ["01", "Proof", "Cambridge and STEM, shown as real class moments, not a brochure line."],
    ["02", "People", "Teachers and children parents start to recognise, week after week."],
    ["03", "Place", "The Indiranagar campus, so the school feels close and real."],
    ["04", "Next step", "A clear ask: visit, call, or apply. Soft. Never pushy."],
  ];
  return (
    <Split
      copy={
        <>
          <Kicker>02 · THE PLAN</Kicker>
          <Title>Show the school like a film. Every week.</Title>
          <div className="mt-[4%] flex flex-col gap-[3.5%]">
            {pillars.map(([n, t, b]) => (
              <p key={n} className="text-[clamp(12px,1.1cqw,15px)] font-light leading-snug text-white/70">
                <span className="mr-2 font-mono text-blue-300">{n}</span>
                <span className="font-semibold text-white">{t}. </span>
                {b}
              </p>
            ))}
          </div>
        </>
      }
      visual={
        <Viz label="THE WEEKLY LOOP">
          <svg viewBox="0 0 280 280" className="h-full w-full" role="img" aria-label="Proof, people, place, and next step, every week">
            <GlowDefs id="glow-plan" />
            <circle cx="140" cy="140" r="78" fill="none" stroke="rgba(96,165,250,0.45)" strokeWidth="1.2" strokeDasharray="2 6" />
            <circle cx="140" cy="140" r="36" fill="rgba(37,99,235,0.16)" stroke="#60a5fa" strokeWidth="1" />
            <text x="140" y="136" textAnchor="middle" fill="white" fontSize="11" fontFamily="ui-sans-serif, system-ui">EVERY</text>
            <text x="140" y="152" textAnchor="middle" fill="#93c5fd" fontSize="11" fontFamily="ui-sans-serif, system-ui">WEEK</text>
            {[
              [140, 52, "Proof"],
              [228, 140, "People"],
              [140, 228, "Place"],
              [52, 140, "Next"],
            ].map(([x, y, t]) => (
              <g key={String(t)} filter="url(#glow-plan)">
                <circle cx={Number(x)} cy={Number(y)} r="28" fill="#07090e" stroke="#60a5fa" strokeWidth="1.4" />
                <text x={Number(x)} y={Number(y) + 4} textAnchor="middle" fill="white" fontSize="11" fontFamily="ui-sans-serif, system-ui">
                  {t}
                </text>
              </g>
            ))}
          </svg>
        </Viz>
      }
    />
  );
}

function SlideMake() {
  const slices = [
    ["Campus films", "30 to 45 sec", "#2563eb"],
    ["A day at school", "15 to 25 sec", "#3b82f6"],
    ["STEM and robotics", "Class proof", "#60a5fa"],
    ["Parent trust", "Tour dates", "#93c5fd"],
  ];
  return (
    <Split
      copy={
        <>
          <Kicker>03 · WHAT WE MAKE</Kicker>
          <Title>Eight films a month. Built with GenAI.</Title>
          <Lead>
            They look like proper films. Warm, safe for children, clearly Nalapad. Not cartoon AI. Posted on Instagram, YouTube Shorts, and parent WhatsApp.
          </Lead>
          <div className="mt-[6%] flex gap-[6%] font-mono text-[clamp(9px,0.85cqw,12px)] tracking-[0.14em] text-white/45">
            <span>INSTAGRAM</span>
            <span>YOUTUBE</span>
            <span>WHATSAPP</span>
          </div>
        </>
      }
      visual={
        <Viz label="EIGHT FRAMES A MONTH">
          <svg viewBox="0 0 280 250" className="h-full w-full" role="img" aria-label="Eight films, two of each kind">
            <rect x="6" y="8" width="268" height="108" fill="#05070c" stroke="rgba(191,219,254,0.35)" />
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={`s${i}`} x={14 + i * 18} y="14" width="8" height="7" fill="#07090e" stroke="rgba(147,197,253,0.7)" />
            ))}
            {Array.from({ length: 14 }, (_, i) => (
              <rect key={`u${i}`} x={14 + i * 18} y="103" width="8" height="7" fill="#07090e" stroke="rgba(147,197,253,0.7)" />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <rect key={`f${i}`} x={16 + i * 32} y="28" width="26" height="68" fill={slices[Math.floor(i / 2)][2]} opacity={i % 2 === 0 ? 1 : 0.62} />
            ))}
            {slices.map(([name, note, color], i) => (
              <g key={name} transform={`translate(${12 + (i % 2) * 136}, ${138 + Math.floor(i / 2) * 52})`}>
                <rect width="8" height="28" fill={color} />
                <text x="16" y="12" fill="white" fontSize="12" fontFamily="ui-sans-serif, system-ui">{name}</text>
                <text x="16" y="26" fill="#93c5fd" fontSize="9" fontFamily="ui-monospace, monospace">{note}</text>
              </g>
            ))}
          </svg>
        </Viz>
      }
    />
  );
}

function SlideNinety() {
  const phases = [
    ["Days 1 to 30", "Start", "6 films live", "Brand rules, faces, and campus look locked."],
    ["Days 31 to 60", "Rhythm", "1 film a week", "Robotics, languages, mentors, open day."],
    ["Days 61 to 90", "Admissions", "Push the winners", "Seat dates, tour invites, paid boost on saves."],
  ];
  return (
    <Split
      copy={
        <>
          <Kicker>04 · 90 DAYS</Kicker>
          <Title>From first film to a full admissions push.</Title>
          <div className="mt-[5%] flex flex-col gap-[5%]">
            {phases.map(([when, name, outcome]) => (
              <div key={when} className="border-t border-white/15 pt-[3%]">
                <p className="font-mono text-[clamp(9px,0.8cqw,11px)] tracking-[0.16em] text-blue-300">{when}</p>
                <p className="mt-1 text-[clamp(13px,1.2cqw,16px)] font-semibold">
                  {name}
                  <span className="ml-2 font-normal text-blue-200">{outcome}</span>
                </p>
              </div>
            ))}
          </div>
        </>
      }
      visual={
        <Viz label="FILMS SHIPPED">
          <svg viewBox="0 0 280 260" className="h-full w-full" role="img" aria-label="Six films in month one, then eight a month">
            <defs>
              <linearGradient id="rise" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            <GlowDefs id="glow-rise" />
            <path d="M24 190 C 80 186, 100 120, 140 108 S 210 62, 256 48 L 256 200 L 24 200 Z" fill="url(#rise)" />
            <path d="M24 190 C 80 186, 100 120, 140 108 S 210 62, 256 48" fill="none" stroke="#93c5fd" strokeWidth="2.2" filter="url(#glow-rise)" />
            {[
              [24, 190, "Day 1", "0"],
              [140, 108, "Day 30", "6"],
              [256, 48, "Day 90", "22"],
            ].map(([x, y, label, n]) => (
              <g key={String(label)}>
                <circle cx={Number(x)} cy={Number(y)} r="5" fill="#07090e" stroke="#bfdbfe" strokeWidth="1.6" />
                <text x={Number(x)} y={Number(y) - 14} textAnchor="middle" fill="white" fontSize="13" fontFamily="ui-sans-serif, system-ui">{n}</text>
                <text x={Number(x)} y="228" textAnchor="middle" fill="#93c5fd" fontSize="9" fontFamily="ui-monospace, monospace">{label}</text>
              </g>
            ))}
          </svg>
        </Viz>
      }
    />
  );
}

function SlideClose() {
  const steps = [
    ["90 min", "Kickoff", "Voice, what to do, what to avoid, first heroes"],
    ["3 weeks", "Pilot", "6 films, stills, and a posting guide"],
    ["Day 30", "Review", "Keep the films parents save"],
    ["Day 90", "Continue", "Monthly plan, if the numbers hold"],
  ];
  const reads = [
    ["Visits", 0.82],
    ["Tours", 0.64],
    ["Seats", 0.48],
  ];
  return (
    <Split
      copy={
        <div className="flex h-full flex-col">
          <Kicker>05 · NEXT STEP</Kicker>
          <Title>A small start. Then we scale what works.</Title>
          <div className="mt-[4%] grid grid-cols-2 gap-x-[6%] gap-y-[5%]">
            {steps.map(([v, l, n]) => (
              <div key={l}>
                <p className="font-body text-[clamp(1rem,1.45cqw,1.3rem)] font-semibold text-blue-200">{v}</p>
                <p className="text-[clamp(12px,1.05cqw,14px)] font-semibold">{l}</p>
                <p className="mt-0.5 text-[clamp(10px,0.9cqw,12px)] font-light leading-snug text-white/50">{n}</p>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-[4%]">
            <p className="font-mono text-[clamp(9px,0.8cqw,11px)] tracking-[0.22em] text-white/40">FIND US</p>
            <p className="mt-1 text-[clamp(12px,1.05cqw,15px)] text-white/80">yourailensstudios.com</p>
            <p className="text-[clamp(12px,1.05cqw,15px)] text-white/80">Instagram · @yourailens</p>
          </div>
        </div>
      }
      visual={
        <Viz label="WHAT WE READ ON DAY 90">
          <svg viewBox="0 0 280 250" className="h-full w-full" role="img" aria-label="Profile visits, tour forms, and admissions, all moving up">
            <GlowDefs id="glow-close" />
            {reads.map(([label, amount], i) => {
              const cx = 50 + i * 90;
              const r = 34;
              const c = 2 * Math.PI * r;
              return (
                <g key={String(label)}>
                  <circle cx={cx} cy="78" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
                  <circle
                    cx={cx}
                    cy="78"
                    r={r}
                    fill="none"
                    stroke={i === 0 ? "#93c5fd" : i === 1 ? "#60a5fa" : "#2563eb"}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${c * Number(amount)} ${c}`}
                    transform={`rotate(-90 ${cx} 78)`}
                    filter="url(#glow-close)"
                  />
                  <text x={cx} y="74" textAnchor="middle" fill="white" fontSize="11" fontFamily="ui-sans-serif, system-ui">UP</text>
                  <text x={cx} y="138" textAnchor="middle" fill="white" fontSize="12" fontFamily="ui-sans-serif, system-ui">{label}</text>
                </g>
              );
            })}
            <text x="140" y="190" textAnchor="middle" fill="#93c5fd" fontSize="11" fontFamily="ui-sans-serif, system-ui">
              A film in the last two weeks
            </text>
            <text x="140" y="214" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="10" fontFamily="ui-sans-serif, system-ui">
              YourAILens Studios, Bangalore
            </text>
          </svg>
        </Viz>
      }
    />
  );
}
