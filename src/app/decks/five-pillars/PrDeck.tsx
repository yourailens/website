"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const DECK = [Cover, QuerySlide, ScreensSlide, SearchWhy, SearchWay, SearchHelp, SearchExample, NetworkSlide, ReturnSlide, EcosystemWhy, EcosystemWay, EcosystemHelp, EcosystemExample, RadiusSlide, DoorsSlide, OfflineWhy, OfflineWay, OfflineHelp, OfflineExample, PlaySlide, CitySlide, PlayWhy, PlayWay, PlayHelp, PlayExample, SeenSlide, MethodSlide, CampusWhy, CampusWay, CampusHelp, CampusExample];
const SLIDES = DECK.length;

const PILLARS = [
  {
    n: "01",
    title: "Search and visibility",
    note: "Optimization",
    items: ["SEO", "AEO", "Meta Ads", "Theatre Ads", "OTT and YouTube ads"],
  },
  {
    n: "02",
    title: "Existing ecosystem",
    note: "People already ours",
    items: ["Community referrals", "Alumni talks", "AI DIY workshops", "Merchandise", "Music videos"],
  },
  {
    n: "03",
    title: "Offline penetration",
    note: "5 km radius sweep",
    items: ["Apartments", "Doctors", "Relocation desks", "Influential mothers", "Barter deals"],
  },
  {
    n: "04",
    title: "Guerrilla marketing",
    note: "The unexpected",
    items: ["Toys and kits", "Competitions", "Arcade play zones", "Citywide scavenger hunts", "One minute challenges"],
  },
  {
    n: "05",
    title: "Advanced methodologies",
    note: "The campus itself",
    items: ["Content creation lab", "Robotics infra", "Daycare camera access", "Food and attendance system", "Interactive installations"],
  },
] as const;

const PLANTS = [
  {
    k: "WEBSITE",
    title: "Our own pages",
    line: "Needed. Not enough on their own.",
  },
  {
    k: "MEDIUM",
    title: "Top 10 schools in Indiranagar",
    line: "Nalapad sits on the list.",
  },
  {
    k: "LINKEDIN",
    title: "More posts, same campus",
    line: "Another place an AI can cite.",
  },
  {
    k: "ROUNDUPS",
    title: "Top 10 academies",
    line: "Generic posts parents already open.",
  },
] as const;

const PDF_W = 13.333;
const PDF_H = 7.5;
const PDF_NAME = "Nalapad-Academy-PR-Strategy-4K.pdf";

type PdfDoc = {
  addPage: () => void;
  addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void;
  save: (name: string) => void;
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
  const w = window as Window & { __domToJpeg?: (node: HTMLElement, options?: Record<string, unknown>) => Promise<string> };
  if (w.__domToJpeg) return Promise.resolve(w.__domToJpeg);
  return new Promise<NonNullable<typeof w.__domToJpeg>>((resolve, reject) => {
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

export default function PrDeck() {
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
      }
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
        await document.fonts.ready;
        await new Promise((resolve) => setTimeout(resolve, 600));
        const pdf = new JsPDF({ unit: "in", format: [PDF_W, PDF_H], orientation: "landscape", compress: true });
        for (let n = 0; n < nodes.length; n += 1) {
          const url = await domToJpeg(nodes[n], {
            scale: 2,
            quality: 1,
            backgroundColor: "#e7f3fc",
          });
          if (n > 0) pdf.addPage();
          pdf.addImage(url, "JPEG", 0, 0, PDF_W, PDF_H);
        }
        pdf.save(PDF_NAME);
        setSaveError("");
      } catch (err) {
        console.error(err);
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
        <style>{`
          html.ott-theme .pr-light { background-color: #e7f3fc !important; color: #12263a !important; }
          html.ott-theme .pr-light .font-light { font-weight: 500 !important; }
          html.ott-theme .pr-light img[src="/images/yail-wordmark.png"] { filter: brightness(0) !important; }
          html.ott-theme .pr-light img[src="/images/logo_yail.png"] { filter: brightness(0) !important; }
          html.ott-theme .pr-light .bg-\\[\\#07090e\\] { background-color: #e7f3fc !important; }
          html.ott-theme .pr-light .bg-\\[\\#0b0d12\\],
          html.ott-theme .pr-light .bg-\\[\\#0b1220\\],
          html.ott-theme .pr-light .bg-\\[\\#0c1018\\],
          html.ott-theme .pr-light .bg-\\[\\#0d1219\\],
          html.ott-theme .pr-light .bg-\\[\\#10141c\\],
          html.ott-theme .pr-light .bg-\\[\\#101820\\],
          html.ott-theme .pr-light .bg-\\[\\#12151c\\],
          html.ott-theme .pr-light .bg-\\[\\#121820\\],
          html.ott-theme .pr-light .bg-\\[\\#141820\\],
          html.ott-theme .pr-light .bg-black:not(.text-white) { background-color: #f4f9fe !important; }
          html.ott-theme .pr-light .bg-white\\/\\[0\\.03\\],
          html.ott-theme .pr-light .bg-\\[\\#efeae2\\],
          html.ott-theme .pr-light .bg-\\[\\#f4efe6\\] { background-color: #d4ebf8 !important; }
          html.ott-theme .pr-light .bg-blue-400\\/10 { background-color: #cfe6f8 !important; }
          html.ott-theme .pr-light .bg-\\[\\#2a1214\\] { background-color: #fde8e8 !important; }
          html.ott-theme .pr-light .bg-\\[\\#102218\\] { background-color: #e5f6ea !important; }
          html.ott-theme .pr-light .text-white { color: #12263a !important; }
          html.ott-theme .pr-light .text-white\\/88,
          html.ott-theme .pr-light .text-white\\/80,
          html.ott-theme .pr-light .text-white\\/78,
          html.ott-theme .pr-light .text-white\\/75,
          html.ott-theme .pr-light .text-white\\/70,
          html.ott-theme .pr-light .text-white\\/68,
          html.ott-theme .pr-light .text-\\[\\#3f3a34\\],
          html.ott-theme .pr-light .text-\\[\\#44403c\\] { color: #1c3348 !important; }
          html.ott-theme .pr-light .text-white\\/55,
          html.ott-theme .pr-light .text-white\\/50,
          html.ott-theme .pr-light .text-white\\/45,
          html.ott-theme .pr-light .text-white\\/40 { color: #3d5166 !important; }
          html.ott-theme .pr-light .text-blue-300,
          html.ott-theme .pr-light .text-blue-200,
          html.ott-theme .pr-light .text-blue-200\\/80,
          html.ott-theme .pr-light .text-blue-100 { color: #1d4ed8 !important; }
          html.ott-theme .pr-light .text-\\[\\#fee2e2\\],
          html.ott-theme .pr-light .text-\\[\\#fca5a5\\],
          html.ott-theme .pr-light .text-\\[\\#f87171\\],
          html.ott-theme .pr-light .text-\\[\\#9f1239\\] { color: #9f1239 !important; }
          html.ott-theme .pr-light .text-\\[\\#dcfce7\\],
          html.ott-theme .pr-light .text-\\[\\#86efac\\],
          html.ott-theme .pr-light .text-\\[\\#4ade80\\] { color: #166534 !important; }
          html.ott-theme .pr-light .bg-\\[\\#1a73e8\\].text-white,
          html.ott-theme .pr-light .bg-\\[\\#2563eb\\],
          html.ott-theme .pr-light .bg-\\[\\#0a66c2\\],
          html.ott-theme .pr-light .bg-\\[\\#c2410c\\],
          html.ott-theme .pr-light .bg-\\[\\#7f1d1d\\],
          html.ott-theme .pr-light .bg-\\[\\#14532d\\],
          html.ott-theme .pr-light .bg-black.text-white { color: #ffffff !important; }
          html.ott-theme .pr-light .bg-black.text-white { background-color: #1c1917 !important; }
          html.ott-theme .pr-light .border-white\\/12,
          html.ott-theme .pr-light .border-white\\/15,
          html.ott-theme .pr-light .border-white\\/10 { border-color: #b7d4ee !important; }
          html.ott-theme .pr-light .border-blue-300\\/25,
          html.ott-theme .pr-light .border-blue-300\\/30,
          html.ott-theme .pr-light .border-blue-300\\/35,
          html.ott-theme .pr-light .border-blue-300\\/40 { border-color: #8ebfe6 !important; }
        `}</style>
        <div className="pr-light relative aspect-video w-full max-w-[min(100%,calc((100svh-5.5rem)*16/9))] overflow-hidden bg-[#e7f3fc] text-[#12263a] shadow-[0_30px_80px_rgba(20,60,110,0.22)]">
          {(() => {
            const Slide = DECK[i];
            return <Slide />;
          })()}
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="absolute inset-y-0 left-0 z-20 w-[7%] disabled:cursor-default" />
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="absolute inset-y-0 right-0 z-20 w-[7%] disabled:cursor-default" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pb-4">
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">PREV</button>
        <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/40">
          {String(i + 1).padStart(2, "0")} / {String(SLIDES).padStart(2, "0")}
        </p>
        <button type="button" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">NEXT</button>
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
          {DECK.map((Slide, n) => (
            <div key={n} className="h-[1080px] w-[1920px]">
              <div data-pdf-slide className="pr-light h-full w-full">
                <Slide />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Cover() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07090e]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 58% 50% at 10% 0%, rgba(56,160,230,0.28), transparent 64%)" }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[42%] w-[30%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.06] mix-blend-multiply"
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[3.6%] pb-[3%] pt-[3%]">
        <div className="flex shrink-0 items-center justify-between gap-[4%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/yail-wordmark.png" alt="YourAILens Studios" className="w-[11%] select-none" />
          <p className="font-mono text-[clamp(12px,1.12cqw,17px)] tracking-[0.14em] text-blue-300">PREPARED FOR NALAPAD ACADEMY</p>
        </div>

        <div className="mt-[1.8%] grid shrink-0 grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] items-end gap-[3%]">
          <div>
            <h1 className="font-body text-[clamp(2.7rem,5.4cqw,5rem)] font-semibold leading-[0.9] tracking-tight">PR Strategy</h1>
            <p className="mt-[1.4%] max-w-[36ch] text-[clamp(18px,1.45cqw,24px)] font-medium leading-snug text-[#3f3a34]">
              A 5 pillar strategy for heavier footfall in October and November.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-[3.5%]">
            <Month name="October" />
            <Month name="November" />
          </div>
        </div>

        <div className="mt-[2.2%] grid min-h-0 flex-1 grid-cols-5 gap-[1%]">
          {PILLARS.map((pillar) => (
            <article key={pillar.n} className="flex min-h-0 flex-col border border-blue-300/25 bg-white/[0.03] px-[5%] py-[4%]">
              <p className="font-mono text-[clamp(14px,1.13cqw,18px)] leading-none text-blue-300">{pillar.n}</p>
              <h2 className="mt-[3%] font-body text-[clamp(16px,1.25cqw,21px)] font-semibold leading-[1.08]">{pillar.title}</h2>
              <p className="mt-[2%] font-mono text-[clamp(11px,0.82cqw,14px)] tracking-[0.08em] text-blue-200/80">{pillar.note.toUpperCase()}</p>
              <ul className="mt-[3%] flex min-h-0 flex-1 flex-col">
                {pillar.items.map((item) => (
                  <li key={item} className="flex flex-1 items-center border-t border-white/12 text-[clamp(16px,1.22cqw,20px)] font-medium leading-tight text-white/88">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuerySlide() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07090e]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 52% 46% at 16% 0%, rgba(56,160,230,0.24), transparent 64%)" }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-[28%] top-[62%] w-[22%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.05] mix-blend-multiply"
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[3.6%] pb-[2.8%] pt-[2.8%]">
        <div className="flex shrink-0 items-center justify-between gap-[4%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/yail-wordmark.png" alt="YourAILens Studios" className="w-[11%] select-none" />
          <p className="font-mono text-[clamp(12px,1.03cqw,15px)] tracking-[0.14em] text-blue-300">01 · SEARCH AND VISIBILITY</p>
        </div>
        <div className="mt-[1.6%] flex shrink-0 items-end justify-between gap-[3%]">
          <h2 className="min-w-0 font-body text-[clamp(1.9rem,3.2cqw,3rem)] font-semibold leading-[1.02]">
            A general query. Nalapad in the answer.
          </h2>
          <p className="max-w-[26ch] shrink-0 pb-[0.2%] text-right text-[clamp(16px,1.2cqw,20px)] font-medium leading-snug text-white/70">
            Gemini sits on top and reads the articles already on the web.
          </p>
        </div>

        <div className="mt-[2.2%] grid min-h-0 flex-1 grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)] gap-[1.4%]">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[1cqw] bg-[#f7f8fa] text-[#202124] shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-[2.4%] px-[3.2%] pt-[3.2%]">
              <GoogleMark />
              <div className="flex min-w-0 flex-1 items-center rounded-full border border-black/10 bg-[#ffffff] px-[3%] py-[1.35%] shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
                <p className="truncate text-[clamp(17px,1.32cqw,22px)] text-[#202124]">best schools in Indiranagar</p>
                <SearchIcon />
              </div>
            </div>

            <div className="mx-[3.2%] mt-[2.6%] flex min-h-0 flex-1 flex-col rounded-[0.7cqw] border border-[#e4e6ea] bg-[#ffffff] px-[3.2%] py-[2.6%]">
              <div className="flex items-center gap-[1.6%]">
                <Spark />
                <p className="text-[clamp(17px,1.26cqw,22px)] font-semibold text-[#1a73e8]">Gemini</p>
                <p className="ml-auto font-mono text-[clamp(11px,0.82cqw,15px)] tracking-[0.14em] text-[#5f6368]">AI OVERVIEW</p>
              </div>
              <p className="mt-[1.8%] text-[clamp(18px,1.36cqw,22px)] font-medium leading-snug text-[#202124]">
                Nalapad Academy is named among schools in Indiranagar for robotics, daycare, and a campus built around making. The parent never typed the school name.
              </p>
              <div className="mt-[2.2%] grid min-h-0 flex-1 grid-cols-2 grid-rows-2 gap-[2%]">
                <SourceChip mark="M" markClass="bg-black text-white" name="Medium" title="Top 10 schools in Indiranagar" line="Nalapad Academy is written onto the list." />
                <SourceChip mark="in" markClass="bg-[#0a66c2] text-white" name="LinkedIn" title="A post worth citing" line="The campus is named in the text." />
                <SourceChip mark="10" markClass="bg-[#c2410c] text-white" name="Roundup" title="Top 10 academies" line="Generic posts parents already open." />
                <SourceChip mark="N" markClass="bg-[#1a73e8] text-white" name="Our site" title="Nalapad Academy" line="Still ours. No longer the only source." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-[4%] px-[3.2%] py-[2.2%] opacity-70">
              <div>
                <p className="text-[clamp(15px,1.14cqw,19px)] font-medium text-[#1a0dab]">Schools in Indiranagar</p>
                <p className="text-[clamp(14px,0.92cqw,17px)] text-[#4d5156]">A directory page. The school is easy to miss here.</p>
              </div>
              <div>
                <p className="text-[clamp(15px,1.14cqw,19px)] font-medium text-[#1a0dab]">Visit a campus this week</p>
                <p className="text-[clamp(14px,0.92cqw,17px)] text-[#4d5156]">Another result, further down the page.</p>
              </div>
            </div>
          </div>

          <section className="flex min-h-0 flex-col border border-blue-300/25 bg-white/[0.03] px-[5%] py-[3.6%]">
            <p className="font-mono text-[clamp(12px,0.92cqw,15px)] tracking-[0.18em] text-blue-300">WRITE WHAT IT CAN QUOTE</p>
            <div className="mt-[3%] flex min-h-0 flex-1 flex-col justify-between">
              {PLANTS.map((item) => (
                <div key={item.k} className="border-t border-white/12 py-[2.8%]">
                  <p className="font-mono text-[clamp(12px,0.9cqw,15px)] tracking-[0.14em] text-blue-200/80">{item.k}</p>
                  <p className="mt-[1%] text-[clamp(18px,1.32cqw,22px)] font-semibold leading-tight">{item.title}</p>
                  <p className="mt-[0.4%] text-[clamp(15px,1.08cqw,19px)] leading-snug text-white/68">{item.line}</p>
                </div>
              ))}
            </div>
            <p className="mt-[2%] border-t border-blue-300/30 pt-[3%] text-[clamp(15px,1.14cqw,19px)] font-medium leading-snug text-blue-100">
              GPT and other AI read those same pages. A random query still puts the school in front of them.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function ScreensSlide() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07090e]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 54% 46% at 82% 100%, rgba(56,160,230,0.22), transparent 64%)" }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] w-[26%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.05] mix-blend-multiply"
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[3.6%] pb-[2.8%] pt-[2.8%]">
        <div className="flex shrink-0 items-center justify-between gap-[4%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/yail-wordmark.png" alt="YourAILens Studios" className="w-[11%] select-none" />
          <p className="font-mono text-[clamp(12px,1.03cqw,15px)] tracking-[0.14em] text-blue-300">01 · SEARCH AND VISIBILITY</p>
        </div>
        <div className="mt-[1.6%] flex shrink-0 items-end justify-between gap-[3%]">
          <h2 className="min-w-0 font-body text-[clamp(1.9rem,3.2cqw,3rem)] font-semibold leading-[1.02]">
            Then the film finds them.
          </h2>
          <p className="max-w-[28ch] shrink-0 pb-[0.2%] text-right text-[clamp(16px,1.2cqw,20px)] font-medium leading-snug text-white/70">
            Same campus film, cut for YouTube, OTT, Meta, and the theatre.
          </p>
        </div>

        <div className="mt-[2.2%] grid min-h-0 flex-1 grid-cols-2 gap-[1.4%]">
          <article className="flex min-h-0 flex-col overflow-hidden border border-white/15 bg-black">
            <div className="relative min-h-0 flex-1 bg-[#12151c]">
              <p className="absolute left-[5%] top-[6%] font-mono text-[clamp(12px,0.92cqw,15px)] tracking-[0.2em] text-white/70">YOUTUBE · PRE ROLL</p>
              <div className="absolute left-1/2 top-1/2 flex h-[18%] w-[10%] -translate-x-1/2 -translate-y-[70%] items-center justify-center rounded-full border border-[#7eb6e0] bg-[#ffffff] text-[#202124] shadow-[0_8px_24px_rgba(30,90,150,0.18)]">
                <PlayIcon />
              </div>
              <div className="absolute inset-x-0 bottom-0 px-[4.5%] pb-[4%] pt-[12%]">
                <p className="font-mono text-[clamp(12px,0.9cqw,15px)] tracking-[0.16em] text-red-400">AD · NALAPAD ACADEMY</p>
                <p className="mt-[1%] font-body text-[clamp(22px,2.16cqw,36px)] font-semibold leading-none">One minute on campus</p>
                <div className="mt-[3%] h-[0.45cqw] w-full bg-white/20">
                  <div className="h-full w-[18%] bg-red-500" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-[4.5%] py-[2.6%]">
              <p className="text-[clamp(15px,1.16cqw,19px)] font-medium text-white/80">Playing while they were about to watch something else.</p>
              <p className="font-mono text-[clamp(12px,0.9cqw,15px)] tracking-[0.12em] text-white/45">SKIP LATER</p>
            </div>
          </article>

          <article className="flex min-h-0 flex-col overflow-hidden border border-blue-300/25 bg-[#0c1018]">
            <div className="relative min-h-0 flex-1 bg-[#0c1018]">
              <div className="absolute inset-x-0 top-0 h-[14%] bg-black" />
              <div className="absolute inset-x-0 bottom-0 h-[14%] bg-black" />
              <p className="absolute left-[5%] top-[18%] font-mono text-[clamp(12px,0.92cqw,15px)] tracking-[0.2em] text-blue-200">OTT · BEFORE THE EPISODE</p>
              <div className="absolute left-[5%] right-[8%] top-1/2 flex -translate-y-1/2 items-center justify-between gap-[6%]">
                <div>
                  <p className="font-mono text-[clamp(14px,0.98cqw,17px)] tracking-[0.18em] text-white/55">NOW PLAYING</p>
                  <p className="mt-[2%] font-body text-[clamp(31px,2.88cqw,47px)] font-semibold leading-[0.95]">The campus, full frame.</p>
                </div>
                <div className="grid h-[4.6cqw] w-[4.6cqw] shrink-0 place-items-center rounded-full border border-[#7eb6e0] bg-[#ffffff]">
                  <PlayIcon />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 border-t border-white/10">
              <div className="border-r border-white/10 px-[4.5%] py-[3%]">
                <p className="font-mono text-[clamp(12px,0.87cqw,15px)] tracking-[0.16em] text-blue-200">META</p>
                <p className="mt-[1.5%] text-[clamp(17px,1.16cqw,20px)] font-semibold leading-tight">Families a short drive away</p>
              </div>
              <div className="px-[4.5%] py-[3%]">
                <p className="font-mono text-[clamp(12px,0.87cqw,15px)] tracking-[0.16em] text-blue-200">THEATRE</p>
                <p className="mt-[1.5%] text-[clamp(17px,1.16cqw,20px)] font-semibold leading-tight">On screen before the trailers</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  const letters: [string, string][] = [
    ["G", "#4285F4"],
    ["o", "#EA4335"],
    ["o", "#FBBC05"],
    ["g", "#4285F4"],
    ["l", "#34A853"],
    ["e", "#EA4335"],
  ];
  return (
    <p className="font-body text-[clamp(22px,2.04cqw,34px)] font-semibold leading-none tracking-tight" aria-label="Google">
      {letters.map(([letter, color], index) => (
        <span key={`${letter}-${index}`} style={{ color }}>
          {letter}
        </span>
      ))}
    </p>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ml-auto h-[1.15em] w-[1.15em] shrink-0" aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#4285F4" strokeWidth="2.4" />
      <path d="M15.2 15.2 L20 20" stroke="#4285F4" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function Spark() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.15em] w-[1.15em]" aria-hidden>
      <path d="M12 2 L13.8 9.2 L21 11 L13.8 12.8 L12 20 L10.2 12.8 L3 11 L10.2 9.2 Z" fill="#1a73e8" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ml-[8%] h-[42%] w-[42%]" aria-hidden>
      <path d="M8 5 L19 12 L8 19 Z" fill="#202124" />
    </svg>
  );
}

function SourceChip({
  mark,
  markClass,
  name,
  title,
  line,
}: {
  mark: string;
  markClass: string;
  name: string;
  title: string;
  line: string;
}) {
  return (
    <div className="flex min-h-0 min-w-0 flex-col justify-center rounded-[0.4cqw] border border-[#e4e6ea] bg-[#f8f9fa] px-[6%] py-[5%]">
      <span className="flex items-center gap-[6%]">
        <span className={`grid h-[1.35em] w-[1.35em] shrink-0 place-items-center rounded-[0.25em] font-mono text-[0.55em] font-semibold ${markClass}`}>
          {mark}
        </span>
        <span className="font-mono text-[clamp(12px,0.82cqw,15px)] tracking-[0.12em] text-[#5f6368]">{name.toUpperCase()}</span>
      </span>
      <span className="mt-[6%] block text-[clamp(15px,1.14cqw,19px)] font-semibold leading-tight text-[#202124]">{title}</span>
      <span className="mt-[3%] block text-[clamp(15px,0.98cqw,17px)] leading-snug text-[#3c4043]">{line}</span>
    </div>
  );
}

function SlideFrame({
  kicker,
  title,
  aside,
  glow = "14% 0%",
  children,
}: {
  kicker: string;
  title: string;
  aside: string;
  glow?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#07090e]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(ellipse 52% 46% at ${glow}, rgba(56,160,230,0.22), transparent 64%)` }}
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[58%] w-[24%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.045] mix-blend-multiply"
      />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[3.6%] pb-[2.8%] pt-[2.8%]">
        <div className="flex shrink-0 items-center justify-between gap-[4%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/yail-wordmark.png" alt="YourAILens Studios" className="w-[11%] select-none" />
          <p className="font-mono text-[clamp(12px,1.03cqw,15px)] tracking-[0.14em] text-blue-300">{kicker}</p>
        </div>
        <div className="mt-[1.5%] flex shrink-0 items-end justify-between gap-[3%]">
          <h2 className="min-w-0 font-body text-[clamp(1.9rem,3.15cqw,2.95rem)] font-semibold leading-[1.02]">{title}</h2>
          <p className="max-w-[26ch] shrink-0 pb-[0.15%] text-right text-[clamp(16px,1.2cqw,20px)] font-medium leading-snug text-white/70">{aside}</p>
        </div>
        <div className="mt-[1.8%] min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

function WhySlide({
  kicker,
  title,
  aside,
  rows,
}: {
  kicker: string;
  title: string;
  aside: string;
  rows: readonly (readonly [string, string])[];
}) {
  return (
    <SlideFrame kicker={kicker} title={title} aside={aside}>
      <div className="grid h-full grid-cols-2 gap-[1.2%]">
        <div className="flex min-h-0 flex-col bg-[#2a1214] px-[5%] py-[4%]">
          <p className="flex items-center gap-[3%] font-mono text-[clamp(15px,1.13cqw,19px)] tracking-[0.16em] text-[#fca5a5]">
            <span className="grid h-[1.6em] w-[1.6em] place-items-center rounded-full bg-[#7f1d1d] text-[1.05em] font-semibold leading-none text-[#fecaca]">✕</span>
            DOES NOT WORK
          </p>
          <ul className="mt-[3%] flex min-h-0 flex-1 flex-col">
            {rows.map(([bad]) => (
              <li key={bad} className="flex flex-1 items-center gap-[4%] border-t border-[#fca5a5]/25">
                <span className="text-[clamp(22px,1.76cqw,29px)] font-semibold leading-none text-[#f87171]">✕</span>
                <span className="text-[clamp(18px,1.32cqw,22px)] font-medium leading-snug text-[#fee2e2]">{bad}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-h-0 flex-col bg-[#102218] px-[5%] py-[4%]">
          <p className="flex items-center gap-[3%] font-mono text-[clamp(15px,1.13cqw,19px)] tracking-[0.16em] text-[#86efac]">
            <span className="grid h-[1.6em] w-[1.6em] place-items-center rounded-full bg-[#14532d] text-[1.05em] font-semibold leading-none text-[#bbf7d0]">✓</span>
            THIS WORKS
          </p>
          <ul className="mt-[3%] flex min-h-0 flex-1 flex-col">
            {rows.map(([, good]) => (
              <li key={good} className="flex flex-1 items-center gap-[4%] border-t border-[#86efac]/25">
                <span className="text-[clamp(22px,1.76cqw,29px)] font-semibold leading-none text-[#4ade80]">✓</span>
                <span className="text-[clamp(18px,1.32cqw,22px)] font-medium leading-snug text-[#dcfce7]">{good}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SlideFrame>
  );
}

function SearchWhy() {
  return (
    <WhySlide
      kicker="01 · SEARCH AND VISIBILITY"
      title="Why the name has to be in the answer."
      aside="A parent who never types Nalapad still has to meet it."
      rows={[
        ["She has to already know the school name.", "She searches for schools in Indiranagar. Nalapad is in the answer."],
        ["The only page is a PDF nothing can quote.", "Medium, LinkedIn, and a top 10 list say the same facts."],
        ["The ad ends, and nothing is left to cite.", "The film and the Saturday visit sit on a page Gemini can open."],
        ["The website waits for someone who already decided.", "The query she did type is what brings her to the tour."],
      ]}
    />
  );
}

function EcosystemWhy() {
  return (
    <WhySlide
      kicker="02 · EXISTING ECOSYSTEM"
      title="Why a person beats an ad."
      aside="These families already trust someone. The school should arrive with that person."
      rows={[
        ["Buying attention from people a parent could have told.", "Anjali sends one minute, and Kiara gets a seat."],
        ["A long talk that never leaves the room.", "The film is short enough to forward the same night."],
        ["A workshop poster with no child and no seat.", "Saturday 11:00 is held in Aarav's name."],
        ["A visit that feels like meeting a stranger.", "October is a return. The song and the kit are already in the house."],
      ]}
    />
  );
}

function OfflineWhy() {
  return (
    <WhySlide
      kicker="03 · OFFLINE PENETRATION"
      title="Why the walk stays inside 5 km."
      aside="The family is already on these streets. The object has to meet them there."
      rows={[
        ["One flyer, handed to every door.", "The lift, the clinic, the desk, the table, and the window each get a different thing."],
        ["A hoarding on a road they do not walk.", "The notice is in the lift they use every morning."],
        ["A pack that stays paper and dies in a folder.", "The Kapoor page already names Rehan and Sara."],
        ["A citywide shout at people who just moved.", "The relocation desk hands a link while the address is still new."],
      ]}
    />
  );
}

function PlayWhy() {
  return (
    <WhySlide
      kicker="04 · GUERRILLA MARKETING"
      title="Why play has to end at the gate."
      aside="If the last stop is not the campus, it was only a game."
      rows={[
        ["Another post they can scroll past.", "A kit on the kitchen table that has to come back."],
        ["A prize that never brings them to the campus.", "The competition ends as a seat in the next workshop."],
        ["A hunt that finishes at a shop.", "Kabir's film stays locked until the gate."],
        ["An arcade score that forgets the school.", "Saturday play ends as a visit, with the name still on the screen."],
      ]}
    />
  );
}

function CampusWhy() {
  return (
    <WhySlide
      kicker="05 · ADVANCED METHODOLOGIES"
      title="Why the morning has to answer."
      aside="A parent should not have to wait until pickup to know the day."
      rows={[
        ["She hears about lunch only when she arrives.", "Meera writes at 7:42. Campus lunch is on before school."],
        ["A brochure of rooms she has not stood in.", "She can see the robotics floor before she drives."],
        ["A camera, a meal, and a gate that never meet.", "Aanya arrives at 8:06. The kitchen marks the meal at 12:18."],
        ["A building that looks like any other school from the road.", "A child can touch the wall. That is the reason the family stays."],
      ]}
    />
  );
}

function WaySlide({
  kicker,
  title,
  aside,
  usual,
  ours,
  stops,
  lands,
}: {
  kicker: string;
  title: string;
  aside: string;
  usual: readonly string[];
  ours: readonly string[];
  stops: string;
  lands: readonly [string, string];
}) {
  return (
    <SlideFrame kicker={kicker} title={title} aside={aside} glow="70% 80%">
      <div className="grid h-full grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] gap-[1.2%]">
        <article className="flex min-h-0 flex-col bg-[#efeae2] px-[6%] py-[5%] text-[#44403c]">
          <p className="font-mono text-[clamp(15px,1.06cqw,18px)] tracking-[0.18em] text-[#9f1239]">CONVENTIONAL</p>
          <ul className="mt-[4%] flex min-h-0 flex-1 flex-col">
            {usual.map((line, index) => (
              <li key={line} className="flex flex-1 items-center gap-[4%] border-t border-[#1c1917]/15">
                <span className="font-mono text-[clamp(15px,1.12cqw,19px)] font-medium text-[#44403c]">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[clamp(19px,1.39cqw,22px)] font-medium leading-snug line-through decoration-[#e11d48] decoration-[2px]">{line}</span>
              </li>
            ))}
          </ul>
          <p className="mt-[3%] border-t border-[#e11d48]/40 pt-[4%] text-[clamp(18px,1.26cqw,22px)] font-semibold leading-snug text-[#9f1239]">Stops. {stops}</p>
        </article>
        <article className="flex min-h-0 flex-col bg-[#101820]">
          <div className="flex min-h-0 flex-1 flex-col px-[6%] py-[5%]">
            <p className="font-mono text-[clamp(15px,1.06cqw,18px)] tracking-[0.18em] text-blue-300">OUR WAY</p>
            <ol className="relative mt-[3%] flex min-h-0 flex-1 flex-col">
              <span className="absolute bottom-[8%] left-[0.72rem] top-[8%] w-[2px] bg-blue-400/50" aria-hidden />
              {ours.map((line, index) => (
                <li key={line} className="relative flex flex-1 items-center gap-[5%] pl-[2.6rem]">
                  <span className="absolute left-0 grid h-[1.55rem] w-[1.55rem] place-items-center rounded-full bg-[#2563eb] font-mono text-[0.85rem] text-white">{index + 1}</span>
                  <span className="text-[clamp(20px,1.51cqw,22px)] font-semibold leading-snug">{line}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mx-[4%] mb-[4%] bg-[#ffffff] px-[5%] py-[4%] text-[#202124]">
            <p className="font-mono text-[clamp(14px,0.92cqw,15px)] tracking-[0.16em] text-[#1a73e8]">LANDS ON</p>
            <p className="mt-[2%] font-body text-[clamp(22px,2.04cqw,34px)] font-semibold leading-none">{lands[0]}</p>
            <p className="mt-[2%] text-[clamp(18px,1.26cqw,22px)] font-medium text-[#3c4043]">{lands[1]}</p>
          </div>
        </article>
      </div>
    </SlideFrame>
  );
}

function SearchWay() {
  return (
    <WaySlide
      kicker="01 · SEARCH AND VISIBILITY"
      title="The usual search, and ours."
      aside="One plan waits for the name. Ours puts the name in the answer."
      usual={["Bid on the word Nalapad.", "Polish the homepage and wait.", "Hope she types the school."]}
      ours={["Publish the lists she already opens.", "Say the same facts on LinkedIn and the site.", "Leave the film and the Saturday visit on that page."]}
      stops="She still has to know the name before anything starts."
      lands={["Meera Shah", "Saturday 10:30 for Aanya, 4. She searched for schools in Indiranagar."]}
    />
  );
}

function EcosystemWay() {
  return (
    <WaySlide
      kicker="02 · EXISTING ECOSYSTEM"
      title="The usual invite, and ours."
      aside="One plan talks at the room. Ours gives a parent something to send."
      usual={["An ad aimed at the same parents.", "A long evening nobody forwards.", "A poster with a date and no names."]}
      ours={["Cut Thursday down to one minute.", "Anjali sends it into the parent group.", "The seat is held before the night ends."]}
      stops="The school keeps introducing itself to people who already know a parent."
      lands={["Aarav, 6 and Kiara, 3", "Saturday 11:00. Held from Anjali's message at 8:14 pm."]}
    />
  );
}

function OfflineWay() {
  return (
    <WaySlide
      kicker="03 · OFFLINE PENETRATION"
      title="The usual flyer, and ours."
      aside="One plan prints a city. Ours walks the streets they already use."
      usual={["One line for the whole city.", "The same sheet at every door.", "Hope the paper survives the folder."]}
      ours={["Walk only inside 5 km.", "A different object at each door.", "The pack opens as a page with their children on it."]}
      stops="A family that just moved never meets a school that already knows them."
      lands={["The Kapoor family", "Rehan, 8 and Sara, 5. Saturday 10:30, from the relocation desk."]}
    />
  );
}

function PlayWay() {
  return (
    <WaySlide
      kicker="04 · GUERRILLA MARKETING"
      title="The usual contest, and ours."
      aside="One plan ends on a screen. Ours does not count until the gate."
      usual={["A post, a prize, a like.", "The game finishes online.", "The campus is a visit for later."]}
      ours={["The kit on the table has to come back.", "Every stop is recorded on the phone.", "The film plays only when they reach the gate."]}
      stops="They played. The school was never the last stop."
      lands={["Kabir Menon, 8", "Score 3 at the cafe. The gate is still locked until he arrives."]}
    />
  );
}

function CampusWay() {
  return (
    <WaySlide
      kicker="05 · ADVANCED METHODOLOGIES"
      title="The usual prospectus, and ours."
      aside="One plan explains the building. Ours lets the morning answer."
      usual={["A brochure of rooms she has not seen.", "A tour, if she remembers to call.", "The day, told when she arrives to collect."]}
      ours={["She writes the teacher before school.", "The campus arranges the meal the same morning.", "Arrival and lunch sit on one record."]}
      stops="She finds out about the day only when she is already there."
      lands={["Meera, 7:42", "Campus lunch for Aanya. She ate it at 12:18."]}
    />
  );
}

function NetworkSlide() {
  return (
    <SlideFrame kicker="02 · EXISTING ECOSYSTEM" title="The name travels without an ad." aside="A parent already inside is the channel.">
      <div className="grid h-full grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-[1.4%]">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1cqw] border border-white/15 bg-[#121820] p-[1.1%]">
          <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[0.75cqw] bg-[#ffffff] text-[#202124]">
            <div className="flex items-center justify-between border-b border-[#e4e6ea] px-[5%] py-[3.2%]">
              <p className="text-[clamp(18px,1.32cqw,22px)] font-semibold">Parent circle</p>
              <p className="font-mono text-[clamp(12px,0.87cqw,15px)] tracking-[0.14em] text-[#5f6368]">INDIRANAGAR</p>
            </div>
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-[3.5%] px-[5%] py-[4%]">
              <Bubble side="in" text="Anyone know a school nearby with robotics and daycare?" />
              <Bubble side="out" text="Nalapad. Our child goes there. Happy to show you the campus." />
              <Bubble side="in" text="The alumni talk is Thursday. Come for an hour." />
            </div>
          </div>
        </div>
        <div className="grid h-full min-h-0 grid-rows-2 gap-[3%]">
          <Story kicker="COMMUNITY REFERRALS" title="One parent tells three." line="Those three already trust the person speaking. The school does not have to introduce itself." />
          <Story kicker="ALUMNI TALKS" title="Someone who learned here stands in the room." line="The hour is the proof. The campus is the set." />
        </div>
      </div>
    </SlideFrame>
  );
}

function ReturnSlide() {
  return (
    <SlideFrame kicker="02 · EXISTING ECOSYSTEM" title="A reason to come back." aside="A ticket, an object, a film they can send." glow="80% 100%">
      <div className="grid h-full grid-cols-3 gap-[1.4%]">
        <article className="flex h-full flex-col justify-between bg-[#ffffff] px-[8%] py-[7%] text-[#202124]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-[#1a73e8]">WORKSHOP</p>
            <p className="font-mono text-[clamp(14px,0.9cqw,15px)] tracking-[0.12em] text-[#5f6368]">ONE SEAT</p>
          </div>
          <div>
            <h3 className="font-body text-[clamp(31px,2.64cqw,45px)] font-semibold leading-[0.98]">Thursday. Parent and child.</h3>
            <p className="mt-[4%] text-[clamp(18px,1.26cqw,22px)] leading-snug text-[#3c4043]">One table. One hour. They leave with a film they made.</p>
          </div>
          <p className="border-t border-dashed border-[#c4c7cc] pt-[5%] font-mono text-[clamp(15px,1.12cqw,19px)] tracking-[0.12em]">NALAPAD · HOLD THIS</p>
        </article>
        <article className="flex h-full flex-col justify-between bg-[#141820] px-[8%] py-[7%]">
          <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-blue-300">MERCHANDISE</p>
          <div>
            {["Shirt", "Kit", "Bag"].map((item) => (
              <p key={item} className="border-t border-white/15 py-[4%] font-body text-[clamp(22px,1.92cqw,34px)] font-semibold leading-none">{item}</p>
            ))}
          </div>
          <p className="text-[clamp(18px,1.26cqw,22px)] font-medium leading-snug text-white/75">The name stays in the house.</p>
        </article>
        <article className="flex h-full flex-col justify-between bg-[#ffffff] px-[8%] py-[7%] text-[#202124]">
          <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-[#1a73e8]">MUSIC VIDEO</p>
          <div>
            <p className="font-mono text-[clamp(15px,1.06cqw,18px)] tracking-[0.14em] text-[#5f6368]">END CARD</p>
            <h3 className="mt-[4%] font-body text-[clamp(31px,2.64cqw,45px)] font-semibold leading-[0.98]">The class made the song.</h3>
          </div>
          <p className="text-[clamp(18px,1.26cqw,22px)] leading-snug text-[#3c4043]">A parent sends the film. The school arrives with it.</p>
        </article>
      </div>
    </SlideFrame>
  );
}

const DOORS = [
  { n: "01", k: "APARTMENTS", t: "A notice in the lift.", d: "Saturday, the campus is open.", chip: "SATURDAY", chipLine: "Come see the rooms." },
  { n: "02", k: "DOCTORS", t: "A card in the waiting room.", d: "Beside the magazines. Robotics. Daycare.", chip: "THE CARD", chipLine: "Ask about the campus." },
  { n: "03", k: "RELOCATION DESKS", t: "A pack for a new family.", d: "They just moved. The school is already in the folder.", chip: "THE PACK", chipLine: "A school for the new address." },
  { n: "04", k: "INFLUENTIAL MOTHERS", t: "One conversation.", d: "Many kitchens hear the same name.", chip: "THE TABLE", chipLine: "She tells the others." },
  { n: "05", k: "BARTER DEALS", t: "A workshop for a window.", d: "We teach an hour. They give the school a place to be seen.", chip: "THE TRADE", chipLine: "One hour. One window." },
] as const;

function RadiusSlide() {
  const pins = [
    { t: "Apartments", x: "50%", y: "16%" },
    { t: "Doctors", x: "82%", y: "38%" },
    { t: "Relocation", x: "74%", y: "78%" },
    { t: "Mothers", x: "22%", y: "74%" },
    { t: "Barter", x: "16%", y: "36%" },
  ];
  return (
    <SlideFrame kicker="03 · OFFLINE PENETRATION" title="The 5 km sweep." aside="Five doors. One radius around the campus.">
      <div className="grid h-full grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-[1.4%]">
        <div className="relative flex h-full items-center justify-center overflow-hidden border border-blue-300/25 bg-[#0b1220]">
          <div className="relative aspect-square h-[94%]">
            <div className="absolute left-1/2 top-1/2 h-[86%] w-[86%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/20" />
            <div className="absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-300/30" />
            <div className="absolute left-1/2 top-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-200/50 bg-blue-500/10" />
            <p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-mono text-[clamp(12px,0.92cqw,15px)] tracking-[0.16em] text-blue-100">NALAPAD</p>
            {pins.map((pin) => (
              <p
                key={pin.t}
                className="absolute -translate-x-1/2 -translate-y-1/2 border border-blue-300/40 bg-[#07090e] px-[3%] py-[1.4%] font-mono text-[clamp(12px,0.9cqw,15px)] tracking-[0.12em] text-blue-100"
                style={{ left: pin.x, top: pin.y }}
              >
                {pin.t.toUpperCase()}
              </p>
            ))}
          </div>
        </div>
        <div className="flex h-full min-h-0 flex-col justify-between border border-blue-300/25 bg-[#0d1219] px-[6%] py-[4%]">
          <p className="font-mono text-[clamp(12px,0.92cqw,15px)] tracking-[0.18em] text-blue-300">WHO WE WALK TO</p>
          {["Apartments within the radius.", "Doctors who already see the child.", "Relocation desks for families moving in.", "Influential mothers in the neighbourhood.", "Barter deals that trade a visit for a place."].map((line) => (
            <p key={line} className="border-t border-white/12 py-[2.4%] text-[clamp(18px,1.29cqw,22px)] font-semibold leading-snug">{line}</p>
          ))}
        </div>
      </div>
    </SlideFrame>
  );
}

function DoorsSlide() {
  return (
    <SlideFrame kicker="03 · OFFLINE PENETRATION" title="A different object at every door." aside="The radius only works if each stop has something to hand over." glow="70% 80%">
      <div className="grid h-full grid-cols-5 gap-[1.15%]">
        {DOORS.map((door) => (
          <article key={door.n} className="flex min-h-0 flex-col border border-blue-300/25 bg-[#0d1219] px-[8%] py-[7%]">
            <p className="font-mono text-[clamp(15px,1.26cqw,20px)] text-blue-300">{door.n}</p>
            <p className="mt-[8%] font-mono text-[clamp(11px,0.82cqw,15px)] tracking-[0.1em] text-blue-200/80">{door.k}</p>
            <h3 className="mt-[6%] font-body text-[clamp(19px,1.45cqw,22px)] font-semibold leading-[1.08]">{door.t}</h3>
            <p className="mt-[4%] text-[clamp(15px,1.08cqw,18px)] font-medium leading-snug text-white/75">{door.d}</p>
            <div className="mt-[6%] flex min-h-0 flex-1 flex-col justify-end bg-[#f4efe6] px-[8%] py-[8%] text-[#1c1917]">
              <p className="font-mono text-[clamp(12px,0.87cqw,15px)] tracking-[0.14em] text-[#1d4ed8]">{door.chip}</p>
              <p className="font-body text-[clamp(19px,1.45cqw,22px)] font-semibold leading-tight">{door.chipLine}</p>
            </div>
          </article>
        ))}
      </div>
    </SlideFrame>
  );
}

function PlaySlide() {
  return (
    <SlideFrame kicker="04 · GUERRILLA MARKETING" title="They meet the school by playing." aside="An object in the hand. Not a banner on a wall.">
      <div className="grid h-full grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-[1.4%]">
        <div className="flex h-full min-h-0 flex-col justify-between bg-[#f4efe6] px-[7%] py-[6%] text-[#1c1917]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.99cqw,17px)] tracking-[0.2em]">NALAPAD</p>
            <p className="font-mono text-[clamp(14px,0.99cqw,17px)] tracking-[0.16em] text-[#1d4ed8]">KIT 01</p>
          </div>
          <div>
            <p className="font-mono text-[clamp(14px,0.95cqw,15px)] tracking-[0.18em] text-[#1d4ed8]">TOYS AND KITS</p>
            <h3 className="mt-[2%] font-body text-[clamp(34px,3.14cqw,54px)] font-semibold leading-[0.95]">Build it at home.</h3>
            <p className="mt-[3%] max-w-[22ch] text-[clamp(19px,1.45cqw,22px)] font-medium leading-snug">Then bring it back to the campus and show what you made.</p>
          </div>
          <div className="grid grid-cols-4 gap-[3%]">
            {["PARTS", "A CARD", "A FILM", "A DATE"].map((bit) => (
              <p key={bit} className="border-t border-[#1c1917]/20 pt-[8%] font-mono text-[clamp(12px,0.9cqw,15px)] tracking-[0.12em]">{bit}</p>
            ))}
          </div>
        </div>
        <div className="grid h-full min-h-0 grid-rows-2 gap-[3%]">
          <Story kicker="COMPETITIONS" title="A prize worth leaving the house for." line="The child wants the challenge. The parent drives." />
          <Story kicker="ONE MINUTE CHALLENGES" title="Short enough to film on the spot." line="One minute. A crowd. The school name at the end of the clip." />
        </div>
      </div>
    </SlideFrame>
  );
}

const STOPS = ["Toy shop", "Park", "Cafe", "Bookshop", "Campus"] as const;

function CitySlide() {
  return (
    <SlideFrame kicker="04 · GUERRILLA MARKETING" title="The city becomes the campus." aside="A machine on Saturday. A hunt that ends at the gate." glow="88% 20%">
      <div className="grid h-full grid-cols-2 gap-[1.4%]">
        <article className="flex min-h-0 flex-col justify-between bg-[#10141c] px-[7%] py-[6%]">
          <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.18em] text-blue-300">ARCADE · SATURDAY</p>
          <div>
            <p className="font-mono text-[clamp(15px,1.13cqw,20px)] tracking-[0.2em] text-white/40">SCORE</p>
            <p className="mt-[2%] font-body text-[clamp(47px,4.48cqw,81px)] font-semibold leading-none">00:42</p>
            <h3 className="mt-[6%] font-body text-[clamp(26px,2.16cqw,36px)] font-semibold leading-tight">Play ends at the campus.</h3>
          </div>
          <p className="border-t border-white/15 pt-[4%] text-[clamp(18px,1.26cqw,22px)] font-medium text-white/75">The last frame is an invitation.</p>
        </article>
        <article className="flex min-h-0 flex-col border border-blue-300/25 bg-[#0d1219] px-[6%] py-[5%]">
          <p className="font-mono text-[clamp(12px,0.92cqw,15px)] tracking-[0.18em] text-blue-300">CITYWIDE SCAVENGER HUNT</p>
          <h3 className="mt-[3%] font-body text-[clamp(22px,2.04cqw,34px)] font-semibold leading-[1.05]">Five stops. The last one is the gate.</h3>
          <ol className="mt-[4%] flex min-h-0 flex-1 flex-col justify-between">
            {STOPS.map((stop, index) => (
              <li key={stop} className="flex items-center gap-[4%] border-t border-white/12 py-[2.6%]">
                <span className="font-mono text-[clamp(15px,1.13cqw,20px)] text-blue-300">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[clamp(20px,1.51cqw,26px)] font-semibold">{stop}</span>
                {index === STOPS.length - 1 ? <span className="ml-auto font-mono text-[clamp(12px,0.87cqw,15px)] tracking-[0.14em] text-blue-200">THE GATE</span> : null}
              </li>
            ))}
          </ol>
        </article>
      </div>
    </SlideFrame>
  );
}

function SeenSlide() {
  return (
    <SlideFrame kicker="05 · ADVANCED METHODOLOGIES" title="The parent already knows the day." aside="The campus answers before anyone has to ask.">
      <div className="grid h-full grid-cols-2 gap-[1.4%]">
        <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-[1.4cqw] border-[0.7cqw] border-[#1c1c1c] bg-[#0b0d12]">
          <div className="flex items-center justify-between px-[6%] pt-[5%]">
            <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.18em] text-red-400">LIVE</p>
            <p className="font-mono text-[clamp(14px,0.9cqw,15px)] tracking-[0.14em] text-white/50">DAYCARE</p>
          </div>
          <div className="mx-[6%] mt-[4%] flex min-h-0 flex-1 flex-col justify-between border border-white/10 bg-[#141820] px-[6%] py-[6%]">
            <p className="font-mono text-[clamp(15px,1.06cqw,18px)] tracking-[0.16em] text-white/45">ROOM 2</p>
            <p className="font-body text-[clamp(34px,2.88cqw,49px)] font-semibold leading-none">Quiet</p>
            <p className="font-mono text-[clamp(15px,1.12cqw,19px)] tracking-[0.14em] text-white/50">09:14</p>
          </div>
          <div className="px-[6%] py-[5%]">
            <h3 className="font-body text-[clamp(26px,2.16cqw,36px)] font-semibold leading-tight">The room, on their phone.</h3>
            <p className="mt-[3%] text-[clamp(17px,1.16cqw,20px)] leading-snug text-white/70">No waiting until pickup.</p>
          </div>
        </div>
        <div className="flex h-full min-h-0 flex-col justify-between bg-[#ffffff] px-[7%] py-[6%] text-[#202124]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.18em] text-[#1a73e8]">TODAY</p>
            <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.14em] text-[#5f6368]">FOOD AND ATTENDANCE</p>
          </div>
          <div>
            {[
              ["Arrived", "The morning is already on the phone."],
              ["Ate", "Lunch is marked before the car ride home."],
              ["Still here", "A parent looking at a meeting knows the day."],
            ].map(([name, line]) => (
              <div key={name} className="border-t border-[#e4e6ea] py-[3.2%]">
                <p className="text-[clamp(22px,1.76cqw,29px)] font-semibold leading-none">{name}</p>
                <p className="mt-[1.5%] text-[clamp(17px,1.13cqw,20px)] leading-snug text-[#3c4043]">{line}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

function MethodSlide() {
  const rooms = [
    ["01", "Content lab", "Films get made on the campus. Parents come to see finished work."],
    ["02", "Robotics floor", "Machines are in the room. The visit is to watch one move."],
    ["03", "The wall", "A child touches it. That is the moment a parent stays."],
  ] as const;
  return (
    <SlideFrame kicker="05 · ADVANCED METHODOLOGIES" title="The building is the reason to visit." aside="Three rooms. Each one is a reason to walk in." glow="50% 100%">
      <div className="grid h-full grid-cols-3 gap-[1.4%]">
        {rooms.map(([n, title, line]) => (
          <article key={n} className="flex min-h-0 flex-col justify-between border border-blue-300/25 bg-[#0d1219] px-[8%] py-[7%]">
            <p className="font-mono text-[clamp(15px,1.26cqw,20px)] text-blue-300">{n}</p>
            <h3 className="font-body text-[clamp(29px,2.4cqw,40px)] font-semibold leading-[1.02]">{title}</h3>
            <p className="text-[clamp(18px,1.26cqw,22px)] font-medium leading-snug text-white/75">{line}</p>
          </article>
        ))}
      </div>
    </SlideFrame>
  );
}

function Bubble({ side, text }: { side: "in" | "out"; text: string }) {
  const out = side === "out";
  return (
    <p className={`max-w-[86%] px-[4.5%] py-[3.2%] text-[clamp(17px,1.16cqw,20px)] font-medium leading-snug ${out ? "ml-auto bg-[#d3e3fd] text-[#174ea6]" : "bg-[#f1f3f4] text-[#202124]"}`}>
      {text}
    </p>
  );
}

function Story({ kicker, title, line }: { kicker: string; title: string; line: string }) {
  return (
    <article className="flex min-h-0 flex-col border border-blue-300/25 bg-[#0d1219] px-[6%] py-[5%]">
      <p className="font-mono text-[clamp(12px,0.9cqw,15px)] tracking-[0.16em] text-blue-300">{kicker}</p>
      <h3 className="mt-[5%] font-body text-[clamp(22px,2.04cqw,36px)] font-semibold leading-[1.05]">{title}</h3>
      <p className="mt-[4%] text-[clamp(18px,1.26cqw,22px)] font-medium leading-snug text-white/75">{line}</p>
    </article>
  );
}

function SearchHelp() {
  return (
    <SlideFrame kicker="01 · SEARCH AND VISIBILITY" title="YourAILens writes what gets quoted." aside="The line is ours. The page that carries it is ours.">
      <div className="grid h-full grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-[1.4%]">
        <article className="flex h-full flex-col bg-[#ffffff] px-[6%] py-[5%] text-[#202124]">
          <p className="font-mono text-[clamp(14px,0.92cqw,15px)] tracking-[0.16em] text-[#5f6368]">THE ARTICLE</p>
          <h3 className="mt-[4%] font-body text-[clamp(29px,2.4cqw,40px)] font-semibold leading-[1.02]">Best schools in Indiranagar</h3>
          <p className="mt-[4%] text-[clamp(19px,1.39cqw,22px)] leading-snug">
            <span className="bg-[#fff3bf] px-[0.2em]">Nalapad Academy</span> is named for robotics, daycare, and a campus built around making.
          </p>
          <p className="mt-auto border-t border-[#e4e6ea] pt-[4%] text-[clamp(18px,1.16cqw,20px)] text-[#3c4043]">Medium. LinkedIn. A top 10 list. The parent never typed the school name.</p>
        </article>
        <div className="grid h-full grid-rows-2 gap-[3%]">
          <Desk kicker="PICTURE DESK" title="The films and the stills." lines={["YouTube, OTT, Meta, theatre.", "The same frames inside the article."]} />
          <Desk kicker="ENGINEERING DESK" title="The page, and the read." lines={["A site Gemini can open.", "Queries, map taps, tour clicks."]} />
        </div>
      </div>
    </SlideFrame>
  );
}

function EcosystemHelp() {
  return (
    <SlideFrame kicker="02 · EXISTING ECOSYSTEM" title="YourAILens makes what they pass on." aside="A film short enough to send. A page that holds the seat." glow="12% 100%">
      <div className="grid h-full grid-cols-2 gap-[1.4%]">
        <article className="flex h-full flex-col justify-between bg-[#141820] px-[7%] py-[6%]">
          <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-blue-300">PICTURE DESK</p>
          {[["Alumni talk", "Cut to one shareable minute."], ["The class song", "A music video a parent forwards."], ["The workshop", "The hour, filmed at the table."]].map(([title, line]) => (
            <div key={title} className="border-t border-white/12 py-[3%]">
              <p className="text-[clamp(22px,1.76cqw,29px)] font-semibold leading-none">{title}</p>
              <p className="mt-[2%] text-[clamp(17px,1.16cqw,20px)] text-white/70">{line}</p>
            </div>
          ))}
        </article>
        <article className="flex h-full flex-col justify-between bg-[#ffffff] px-[7%] py-[6%] text-[#202124]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-[#1a73e8]">ENGINEERING DESK</p>
            <p className="font-mono text-[clamp(14px,0.87cqw,15px)] tracking-[0.12em] text-[#5f6368]">CONFIRMED</p>
          </div>
          <div>
            <h3 className="font-body text-[clamp(31px,2.64cqw,45px)] font-semibold leading-[0.98]">Seat held.</h3>
            <p className="mt-[4%] text-[clamp(20px,1.45cqw,22px)] leading-snug text-[#3c4043]">Thursday. Parent and child. One hour on the campus.</p>
          </div>
          <p className="bg-[#1a73e8] px-[6%] py-[4%] text-center text-[clamp(18px,1.26cqw,22px)] font-semibold text-white">The booking page is the build.</p>
        </article>
      </div>
    </SlideFrame>
  );
}

const HAND = [
  ["Lift", "Saturday. The campus is open."],
  ["Clinic", "Robotics. Daycare. Beside the magazines."],
  ["Desk", "A link for a family that just moved."],
  ["Table", "One conversation. Many kitchens."],
  ["Window", "One hour of teaching. One shop window."],
] as const;

function OfflineHelp() {
  return (
    <SlideFrame kicker="03 · OFFLINE PENETRATION" title="YourAILens makes the thing in the hand." aside="Print from the picture desk. The page inside, from engineering." glow="80% 10%">
      <div className="grid h-full grid-cols-5 gap-[1.15%]">
        {HAND.map(([title, line], index) => (
          <article key={title} className={`flex min-h-0 flex-col justify-between px-[8%] py-[7%] ${index % 2 ? "bg-[#ffffff] text-[#202124]" : "bg-[#141820]"}`}>
            <p className={`font-mono text-[clamp(15px,1.12cqw,18px)] ${index % 2 ? "text-[#1a73e8]" : "text-blue-300"}`}>{String(index + 1).padStart(2, "0")}</p>
            <h3 className="font-body text-[clamp(26px,2.16cqw,36px)] font-semibold leading-none">{title}</h3>
            <p className={`text-[clamp(17px,1.13cqw,20px)] font-medium leading-snug ${index % 2 ? "text-[#3c4043]" : "text-white/75"}`}>{line}</p>
          </article>
        ))}
      </div>
    </SlideFrame>
  );
}

function PlayHelp() {
  return (
    <SlideFrame kicker="04 · GUERRILLA MARKETING" title="YourAILens builds the play." aside="The kit and the film. The hunt, running on a phone.">
      <div className="grid h-full grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-[1.4%]">
        <article className="flex h-full flex-col justify-between bg-[#f4efe6] px-[8%] py-[7%] text-[#1c1917]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(15px,1.06cqw,18px)] tracking-[0.18em]">KIT 01</p>
            <p className="font-mono text-[clamp(15px,1.06cqw,18px)] tracking-[0.14em] text-[#1d4ed8]">PICTURE DESK</p>
          </div>
          <h3 className="font-body text-[clamp(34px,2.88cqw,49px)] font-semibold leading-[0.95]">Build it. Bring it back.</h3>
          <div className="grid grid-cols-4 gap-[4%]">
            {["Parts", "A card", "A film", "A date"].map((bit) => (
              <p key={bit} className="border-t border-[#1c1917]/25 pt-[10%] font-mono text-[clamp(15px,1.06cqw,18px)] tracking-[0.08em]">{bit.toUpperCase()}</p>
            ))}
          </div>
        </article>
        <article className="flex h-full flex-col justify-between bg-[#ffffff] px-[7%] py-[6%] text-[#202124]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-[#1a73e8]">ENGINEERING DESK</p>
            <p className="font-mono text-[clamp(14px,0.9cqw,15px)] tracking-[0.12em] text-[#5f6368]">THE HUNT</p>
          </div>
          <ol className="flex flex-col">
            {["Toy shop", "Park", "Cafe", "Bookshop", "The gate"].map((stop, index) => (
              <li key={stop} className="flex items-center gap-[3%] border-t border-[#e4e6ea] py-[2.2%]">
                <span className="font-mono text-[clamp(17px,1.16cqw,20px)] text-[#1a73e8]">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-[clamp(20px,1.51cqw,26px)] font-semibold">{stop}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </SlideFrame>
  );
}

function CampusHelp() {
  return (
    <SlideFrame kicker="05 · ADVANCED METHODOLOGIES" title="YourAILens makes the campus a film." aside="The picture desk shoots the rooms. Engineering runs the morning." glow="70% 0%">
      <div className="grid h-full grid-cols-2 gap-[1.4%]">
        <article className="flex h-full flex-col bg-[#141820] px-[7%] py-[6%]">
          <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-blue-300">PICTURE DESK · SHOT LIST</p>
          {[["01", "Content lab", "A film made on the campus."], ["02", "Robotics", "The floor, before the visit."], ["03", "The wall", "What plays when a child touches it."]].map(([n, title, line]) => (
            <div key={n} className="mt-[3%] grid grid-cols-[auto_1fr] gap-x-[4%] border-t border-white/12 py-[3%]">
              <p className="font-mono text-[clamp(18px,1.26cqw,22px)] text-blue-300">{n}</p>
              <div>
                <p className="text-[clamp(22px,1.7cqw,29px)] font-semibold leading-none">{title}</p>
                <p className="mt-[2%] text-[clamp(17px,1.13cqw,20px)] text-white/70">{line}</p>
              </div>
            </div>
          ))}
        </article>
        <article className="flex h-full flex-col justify-between bg-[#ffffff] px-[7%] py-[6%] text-[#202124]">
          <p className="font-mono text-[clamp(14px,0.95cqw,17px)] tracking-[0.16em] text-[#1a73e8]">ENGINEERING DESK · THE MORNING</p>
          {[["Camera", "The room is on the phone."], ["Meal", "Lunch is marked before pickup."], ["Attendance", "A parent in a meeting already knows."]].map(([title, line]) => (
            <div key={title} className="border-t border-[#e4e6ea] py-[3%]">
              <p className="text-[clamp(22px,1.89cqw,34px)] font-semibold leading-none">{title}</p>
              <p className="mt-[2%] text-[clamp(18px,1.26cqw,22px)] text-[#3c4043]">{line}</p>
            </div>
          ))}
        </article>
      </div>
    </SlideFrame>
  );
}

function SearchExample() {
  return (
    <SlideFrame kicker="01 · SEARCH AND VISIBILITY" title="What Meera reads on Saturday night." aside="She searched for schools in Indiranagar. She is booking a visit for Aanya." glow="12% 80%">
      <div className="grid h-full grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] gap-[1.4%]">
        <article className="flex h-full min-h-0 flex-col bg-[#ffffff] px-[5%] py-[4%] text-[#202124]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.9cqw,15px)] tracking-[0.12em] text-[#5f6368]">best schools in Indiranagar</p>
            <p className="font-mono text-[clamp(14px,0.87cqw,15px)] text-[#5f6368]">9:40 pm</p>
          </div>
          <h3 className="mt-[3%] font-body text-[clamp(22px,2.04cqw,36px)] font-semibold leading-[1.05]">10 schools in Indiranagar worth a Saturday.</h3>
          <p className="mt-[3%] text-[clamp(18px,1.26cqw,22px)] leading-snug">
            <span className="bg-[#fff3bf] px-[0.15em] font-semibold">Nalapad Academy</span> keeps robotics and daycare on one campus. Parents who want both, a short drive from Indiranagar, start here.
          </p>
          <p className="mt-[2.5%] text-[clamp(17px,1.16cqw,20px)] leading-snug text-[#3c4043]">The daycare is on the same grounds as the robotics floor. A parent can see both in one morning.</p>
          <p className="mt-auto bg-[#eef3fd] px-[4%] py-[3%] text-[clamp(17px,1.16cqw,20px)] font-semibold text-[#174ea6]">Book a Saturday for Aanya, age 4</p>
        </article>
        <article className="flex h-full min-h-0 flex-col justify-between bg-[#ffffff] px-[6%] py-[5%] text-[#202124]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.9cqw,15px)] tracking-[0.14em] text-[#1a73e8]">VISIT REQUEST</p>
            <p className="font-mono text-[clamp(14px,0.87cqw,15px)] text-[#188038]">HELD</p>
          </div>
          {[
            ["Parent", "Meera Shah"],
            ["Child", "Aanya, 4"],
            ["She wants", "Daycare and robotics"],
            ["When", "Saturday, 10:30"],
            ["She typed", "best schools in Indiranagar"],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-[#e4e6ea] py-[2.4%]">
              <p className="font-mono text-[clamp(12px,0.84cqw,15px)] tracking-[0.12em] text-[#5f6368]">{label.toUpperCase()}</p>
              <p className="mt-[1.5%] text-[clamp(19px,1.39cqw,22px)] font-semibold leading-none">{value}</p>
            </div>
          ))}
        </article>
      </div>
    </SlideFrame>
  );
}

function EcosystemExample() {
  return (
    <SlideFrame kicker="02 · EXISTING ECOSYSTEM" title="What Anjali sends the group." aside="A minute of Thursday. Then a seat with both children named.">
      <div className="grid h-full grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-[1.4%]">
        <article className="flex h-full min-h-0 flex-col bg-[#ffffff] text-[#202124]">
          <div className="flex items-center justify-between border-b border-[#e4e6ea] px-[5%] py-[3%]">
            <p className="text-[clamp(18px,1.26cqw,22px)] font-semibold">Indiranagar parents</p>
            <p className="font-mono text-[clamp(14px,0.9cqw,15px)] text-[#5f6368]">8:14 pm</p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-[3%] px-[5%] py-[4%]">
            <Bubble side="out" text="Took Aarav on Thursday. He is still talking about the robot arm." />
            <Bubble side="out" text="This film is one minute. Four seats left this Saturday if you want to bring Kiara too." />
            <div className="ml-auto w-[70%] bg-[#d3e3fd] px-[5%] py-[4%] text-[#174ea6]">
              <p className="font-mono text-[clamp(14px,0.87cqw,15px)] tracking-[0.12em]">ALUMNI TALK · 0:60</p>
              <p className="mt-[3%] text-[clamp(18px,1.26cqw,22px)] font-semibold leading-snug">Thursday on the campus. Aarav at the robotics table.</p>
            </div>
          </div>
        </article>
        <article className="flex h-full min-h-0 flex-col justify-between bg-[#ffffff] px-[6%] py-[5%] text-[#202124]">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[clamp(14px,0.9cqw,15px)] tracking-[0.14em] text-[#1a73e8]">SEAT HELD</p>
            <p className="font-mono text-[clamp(14px,0.87cqw,15px)] text-[#5f6368]">4 WERE LEFT</p>
          </div>
          {[
            ["From", "Anjali Rao"],
            ["Children", "Aarav, 6 and Kiara, 3"],
            ["When", "Saturday, 11:00"],
            ["What", "The workshop hour"],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-[#e4e6ea] py-[3%]">
              <p className="font-mono text-[clamp(12px,0.84cqw,15px)] tracking-[0.12em] text-[#5f6368]">{label.toUpperCase()}</p>
              <p className="mt-[2%] text-[clamp(20px,1.45cqw,22px)] font-semibold leading-tight">{value}</p>
            </div>
          ))}
        </article>
      </div>
    </SlideFrame>
  );
}

function OfflineExample() {
  return (
    <SlideFrame kicker="03 · OFFLINE PENETRATION" title="What the Kapoor family opens." aside="The relocation desk handed them a link. The page already has their children." glow="80% 90%">
      <div className="grid h-full grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-[1.4%]">
        <article className="flex h-full min-h-0 flex-col bg-[#ffffff] text-[#202124]">
          <div className="flex items-center justify-between border-b border-[#e4e6ea] px-[5%] py-[3%]">
            <p className="text-[clamp(18px,1.26cqw,22px)] font-semibold">Hello, Kapoor family</p>
            <p className="font-mono text-[clamp(14px,0.87cqw,15px)] tracking-[0.12em] text-[#1a73e8]">FROM THE DESK</p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-between px-[6%] py-[5%]">
            <div>
              <p className="text-[clamp(19px,1.32cqw,22px)] leading-snug text-[#3c4043]">You moved to Indiranagar this week. Nalapad is a short drive from the new address. Saturday morning is held for both children.</p>
              <div className="mt-[4%] grid grid-cols-2 gap-[3%]">
                {[
                  ["Rehan", "8 years · robotics"],
                  ["Sara", "5 years · daycare"],
                ].map(([name, line]) => (
                  <div key={name} className="border border-[#e4e6ea] px-[6%] py-[6%]">
                    <p className="text-[clamp(20px,1.45cqw,22px)] font-semibold">{name}</p>
                    <p className="mt-[2%] text-[clamp(17px,1.16cqw,19px)] text-[#3c4043]">{line}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between bg-[#eef3fd] px-[4%] py-[3.5%]">
              <div>
                <p className="font-mono text-[clamp(14px,0.87cqw,15px)] tracking-[0.12em] text-[#174ea6]">SATURDAY · 10:30</p>
                <p className="mt-[2%] text-[clamp(18px,1.26cqw,22px)] font-semibold text-[#174ea6]">Visit held. Gate and robotics floor.</p>
              </div>
              <p className="font-mono text-[clamp(15px,1.03cqw,18px)] text-[#174ea6]">0:45 FILM</p>
            </div>
          </div>
        </article>
        <article className="flex h-full min-h-0 flex-col justify-between bg-[#10141c] px-[8%] py-[7%]">
          <p className="font-mono text-[clamp(14px,0.92cqw,15px)] tracking-[0.16em] text-blue-300">ON THEIR PHONE</p>
          {[
            ["Where you are", "New address, Indiranagar"],
            ["Campus", "Inside a short drive"],
            ["Who is coming", "Both parents, two children"],
            ["Asked by", "The relocation desk"],
          ].map(([label, value]) => (
            <div key={label} className="border-t border-white/12 py-[3%]">
              <p className="font-mono text-[clamp(14px,0.87cqw,15px)] tracking-[0.12em] text-white/45">{label.toUpperCase()}</p>
              <p className="mt-[2%] text-[clamp(19px,1.32cqw,22px)] font-semibold leading-tight">{value}</p>
            </div>
          ))}
        </article>
      </div>
    </SlideFrame>
  );
}

function CampusExample() {
  return (
    <SlideFrame kicker="05 · ADVANCED METHODOLOGIES" title="What Meera sends at 7:42." aside="She can't pack food today. She wants lunch arranged on the campus." glow="20% 100%">
      <div className="grid h-full grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-[1.4%]">
        <article className="flex h-full min-h-0 flex-col bg-[#ffffff] text-[#202124]">
          <div className="flex items-center justify-between border-b border-[#e4e6ea] px-[5%] py-[3%]">
            <div>
              <p className="text-[clamp(19px,1.32cqw,22px)] font-semibold leading-none">Ms. Rhea · Daycare</p>
              <p className="mt-[2%] text-[clamp(15px,1.08cqw,18px)] text-[#5f6368]">Aanya Shah · Room 2</p>
            </div>
            <p className="font-mono text-[clamp(15px,1.03cqw,18px)] text-[#5f6368]">MONDAY 7:42</p>
          </div>
          <div className="flex min-h-0 flex-1 flex-col justify-center gap-[3.5%] px-[5%] py-[4%]">
            <Bubble side="out" text="Hi Ms. Rhea. I can't pack food for Aanya today. Can the campus arrange lunch for her?" />
            <div className="ml-auto flex gap-[2%]">
              {["Today only", "Campus meal", "Veg"].map((chip) => (
                <span key={chip} className="bg-[#d3e3fd] px-[0.7em] py-[0.35em] text-[clamp(15px,1.03cqw,18px)] font-semibold text-[#174ea6]">{chip}</span>
              ))}
            </div>
            <Bubble side="in" text="Done, Meera. Campus lunch is on for Aanya today. Veg meal. I will mark it when she eats. No tiffin needed." />
          </div>
        </article>
        <article className="flex h-full min-h-0 flex-col bg-[#ffffff] px-[7%] py-[5%] text-[#202124]">
          <p className="font-mono text-[clamp(14px,0.92cqw,15px)] tracking-[0.14em] text-[#1a73e8]">THE SAME MORNING</p>
          {[
            ["7:42", "Meera", "Can't pack. Asks for campus lunch."],
            ["7:51", "Ms. Rhea", "Arranged. Veg meal. No tiffin."],
            ["8:06", "Gate", "Aanya arrived. Room 2."],
            ["12:18", "Kitchen", "She ate the campus meal."],
          ].map(([time, who, line]) => (
            <div key={time} className="grid flex-1 grid-cols-[4.2rem_1fr] items-center gap-[4%] border-t border-[#e4e6ea]">
              <p className="font-mono text-[clamp(17px,1.16cqw,20px)] text-[#1a73e8]">{time}</p>
              <div>
                <p className="text-[clamp(18px,1.26cqw,22px)] font-semibold leading-none">{who}</p>
                <p className="mt-[2%] text-[clamp(15px,1.14cqw,19px)] leading-snug text-[#3c4043]">{line}</p>
              </div>
            </div>
          ))}
        </article>
      </div>
    </SlideFrame>
  );
}

function Desk({ kicker, title, lines }: { kicker: string; title: string; lines: string[] }) {
  return (
    <article className="flex min-h-0 flex-col justify-between border border-blue-300/25 bg-[#0d1219] px-[7%] py-[6%]">
      <p className="font-mono text-[clamp(14px,0.92cqw,15px)] tracking-[0.16em] text-blue-300">{kicker}</p>
      <div>
        <h3 className="font-body text-[clamp(22px,1.83cqw,31px)] font-semibold leading-tight">{title}</h3>
        {lines.map((line) => (
          <p key={line} className="mt-[3%] text-[clamp(17px,1.16cqw,20px)] font-medium leading-snug text-white/75">{line}</p>
        ))}
      </div>
    </article>
  );
}

const HUNT_NOW = [
  ["10:12", "Toy shop", "Blue card was in the window.", true],
  ["10:31", "Park", "The clue was on the bench.", true],
  ["10:48", "Cafe", "Ask for the menu. Kabir found it.", true],
  ["Next", "Bookshop", "Ask for the envelope with the campus name.", false],
  ["Locked", "The gate", "The one minute film plays only here.", false],
] as const;

function PlayExample() {
  return (
    <SlideFrame kicker="04 · GUERRILLA MARKETING" title="What Kabir's phone shows at the cafe." aside="His mother is watching the same screen. The gate is still locked.">
      <div className="grid h-full grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-[1.4%]">
        <article className="flex h-full min-h-0 flex-col justify-between bg-[#ffffff] px-[8%] py-[7%] text-[#202124]">
          <div>
            <p className="font-mono text-[clamp(14px,0.92cqw,15px)] tracking-[0.14em] text-[#1a73e8]">KABIR MENON · 8</p>
            <h3 className="mt-[5%] font-body text-[clamp(26px,2.16cqw,36px)] font-semibold leading-[1.02]">Three clues in. Two still to go.</h3>
          </div>
          <p className="text-[clamp(19px,1.32cqw,22px)] leading-snug text-[#3c4043]">His mother wrote under the cafe stop: I will meet you at the gate. Do not skip the bookshop.</p>
          <p className="bg-[#eef3fd] px-[5%] py-[4%] text-[clamp(18px,1.16cqw,20px)] font-semibold text-[#174ea6]">Score 3. The film is waiting at the campus.</p>
        </article>
        <article className="flex h-full min-h-0 flex-col bg-[#ffffff] px-[5%] py-[4%] text-[#202124]">
          <div className="flex items-center justify-between px-[1%] pb-[2%]">
            <p className="text-[clamp(20px,1.45cqw,22px)] font-semibold">Saturday hunt</p>
            <p className="font-mono text-[clamp(15px,1.03cqw,18px)] text-[#1a73e8]">NOW 10:48</p>
          </div>
          <ol className="flex min-h-0 flex-1 flex-col">
            {HUNT_NOW.map(([time, name, clue, done]) => (
              <li key={name} className="grid flex-1 grid-cols-[4.6rem_1fr_auto] items-center gap-[3%] border-t border-[#e4e6ea]">
                <span className="font-mono text-[clamp(15px,1.12cqw,19px)] text-[#5f6368]">{time}</span>
                <span>
                  <span className={`block text-[clamp(18px,1.32cqw,22px)] font-semibold leading-none ${done ? "" : "text-[#5f6368]"}`}>{name}</span>
                  <span className="mt-[1.5%] block text-[clamp(15px,1.08cqw,18px)] leading-snug text-[#3c4043]">{clue}</span>
                </span>
                <span className={`font-mono text-[clamp(14px,0.9cqw,15px)] tracking-[0.12em] ${done ? "text-[#188038]" : "text-[#5f6368]"}`}>{done ? "DONE" : "AHEAD"}</span>
              </li>
            ))}
          </ol>
        </article>
      </div>
    </SlideFrame>
  );
}

function Month({ name }: { name: string }) {
  return (
    <div className="border border-[#7eb6e0] bg-[#cfe6f8] px-[8%] py-[12%]">
      <p className="font-body text-[clamp(19px,1.83cqw,29px)] font-semibold leading-none text-white">{name}</p>
      <p className="mt-[8%] font-mono text-[clamp(11px,0.9cqw,15px)] tracking-[0.14em] text-blue-200">HEAVIER FOOTFALL</p>
    </div>
  );
}
