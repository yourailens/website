"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const SLIDES = 6;
const PDF_W = 7.5;
const PDF_H = 13.333;
const SPEAK: CSSProperties = { fontFamily: 'Georgia, "Iowan Old Style", Palatino, "Palatino Linotype", serif' };

type PdfDoc = {
  addPage: () => void;
  addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void;
  save: (name: string) => void;
};

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
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

function Marks() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] w-[62%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.07] mix-blend-screen"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/yail-wordmark.png"
        alt="YourAILens Studios"
        className="pointer-events-none absolute left-[7%] top-[3.2%] w-[32%] select-none"
      />
    </>
  );
}

function Kicker({ children }: { children: string }) {
  return <p className="font-mono text-[3.1cqw] tracking-[0.18em] text-blue-200">{children}</p>;
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className="mt-[2.4%] font-body text-[7cqw] font-bold leading-[1.05] tracking-tight text-white">{children}</h2>;
}

function Speak({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[4.35cqw] italic leading-[1.35] text-blue-100 ${className}`} style={SPEAK}>
      {children}
    </p>
  );
}

function SlideStage({ index }: { index: number }) {
  return (
    <div data-pdf-slide className="relative h-full w-full overflow-hidden bg-[#070b14]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 32% at 20% 0%, rgba(37,99,235,0.28), transparent 62%)" }}
        aria-hidden
      />
      <Marks />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[7.2%] pb-[5.5%] pt-[17%]">
        {index === 0 ? <SlideCover /> : null}
        {index === 1 ? <SlideGap /> : null}
        {index === 2 ? <SlidePlan /> : null}
        {index === 3 ? <SlideMake /> : null}
        {index === 4 ? <SlideNinety /> : null}
        {index === 5 ? <SlideClose /> : null}
      </div>
    </div>
  );
}

function SlideCover() {
  const facts = [
    ["When", "Admissions 2026 / 27"],
    ["Where", "Indiranagar, Cambridge"],
    ["What we add", "Eight GenAI films a month"],
    ["Where they live", "Instagram, YouTube Shorts, parent WhatsApp"],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>PREPARED FOR NALAPAD ACADEMY</Kicker>
      <h1 className="mt-[4%] font-body text-[8.4cqw] font-bold leading-[1.02] tracking-tight text-white">
        More seats.
        <span className="mt-[1%] block font-medium text-white/90">Same school.</span>
        <span className="block text-blue-100">Seen better.</span>
      </h1>
      <Speak className="mt-[5%]">
        A film plan for parents who decide on the phone, and then book the campus tour.
      </Speak>
      <div className="mt-auto flex flex-col">
        {facts.map(([label, value]) => (
          <div key={label} className="border-t border-white/15 py-[3.2%]">
            <p className="font-mono text-[2.7cqw] tracking-[0.16em] text-blue-300">{label.toUpperCase()}</p>
            <p className="mt-[1%] text-[4.5cqw] font-semibold leading-snug text-white">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideGap() {
  const moments = [
    ["01", "They search", "Most parents look online before they visit. About 70% and more."],
    ["02", "They decide fast", "You have 3 to 7 seconds. A poster does not survive that."],
    ["03", "They send it on", "A film is easier to forward to a partner than a brochure."],
    ["04", "Then they visit", "The tour is still the real decision. The film only earns the date."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>01 · THE GAP</Kicker>
      <Title>They meet the school on a phone.</Title>
      <p className="mt-[3%] text-[4.15cqw] font-normal leading-[1.38] text-white/92">
        The campus is already strong. <strong className="font-bold text-white">Cambridge, STEM, mentors, Apple smart rooms.</strong> What is thin is the story a parent can watch before they walk in.
      </p>
      <div className="mt-[4%] flex flex-1 flex-col justify-between">
        {moments.map(([n, title, body]) => (
          <div key={n} className="border-t border-white/14 pt-[2.5%]">
            <p className="text-[4.5cqw] font-bold leading-none text-white">
              <span className="mr-[0.45em] font-mono text-[3cqw] font-medium text-blue-300">{n}</span>
              {title}
            </p>
            <p className="mt-[1.4%] text-[3.9cqw] font-normal leading-[1.35] text-white/88">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePlan() {
  const pillars = [
    ["Proof", "Show Cambridge and STEM as a real class, not a line in a brochure.", "The parent thinks: this school is serious."],
    ["People", "Teachers and children they start to recognise, week after week.", "The parent thinks: I know who is in the room."],
    ["Place", "The Indiranagar campus, close enough to picture the morning.", "The parent thinks: I can see the day."],
    ["Next step", "Visit, call, or apply. Soft. Never a push in the first second.", "The parent thinks: I know what to do."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>02 · THE PLAN</Kicker>
      <Title>One film. Four jobs. Every week.</Title>
      <div className="mt-[3.5%] flex flex-1 flex-col justify-between">
        {pillars.map(([title, body, thought]) => (
          <div key={title}>
            <p className="text-[5cqw] font-bold leading-none text-white">{title}</p>
            <p className="mt-[1.6%] text-[3.85cqw] font-normal leading-[1.32] text-white/90">{body}</p>
            <p className="mt-[1%] text-[3.7cqw] italic leading-[1.3] text-blue-100" style={SPEAK}>
              {thought}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideMake() {
  const groups = [
    ["Campus", "Two films · 30 to 45 sec", "The place, and the rhythm of a real day."],
    ["A day at school", "Two films · 15 to 25 sec", "Care in the morning. A teacher in the room."],
    ["STEM and robotics", "Two films · class proof", "The work is visible. The lab is not a set."],
    ["Parent trust", "Two films · tour dates", "Safety, routine, and how to book a visit."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>03 · WHAT WE MAKE</Kicker>
      <Title>Eight films a month.</Title>
      <Speak className="mt-[3%]">Warm, safe, clearly Nalapad. Not a cartoon AI look. Nothing goes out before you approve it.</Speak>
      <div className="mt-[4%] flex flex-1 flex-col justify-between">
        {groups.map(([title, meta, body]) => (
          <div key={title} className="border-l-[3px] border-blue-400 pl-[4%]">
            <p className="text-[4.8cqw] font-bold leading-none text-white">{title}</p>
            <p className="mt-[1.2%] font-mono text-[2.9cqw] tracking-[0.08em] text-blue-200">{meta}</p>
            <p className="mt-[1.2%] text-[3.85cqw] font-normal leading-[1.32] text-white/90">{body}</p>
          </div>
        ))}
      </div>
      <p className="mt-[4%] text-[3.6cqw] font-semibold leading-snug text-white">Instagram. YouTube Shorts. Parent WhatsApp.</p>
    </div>
  );
}

function SlideNinety() {
  const phases = [
    ["Days 1 to 30", "Start", "Six films go live. We lock the look, the faces, and the campus. You give us one kickoff, and a yes or a no within two days."],
    ["Days 31 to 60", "Rhythm", "One film a week. Robotics, languages, mentors, the open day. You share them where parents already are."],
    ["Days 61 to 90", "Admissions", "We push only the films people saved. Seat dates. Tour invites. You spend attention on what already worked."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>04 · 90 DAYS</Kicker>
      <Title>From the first film to a full admissions push.</Title>
      <div className="mt-[4%] flex flex-1 flex-col justify-between gap-[2%]">
        {phases.map(([when, name, body]) => (
          <div key={when} className="bg-white/[0.04] px-[5%] py-[4%]">
            <p className="font-mono text-[2.8cqw] tracking-[0.14em] text-blue-300">{when.toUpperCase()}</p>
            <p className="mt-[1.5%] text-[5.4cqw] font-bold leading-none text-white">{name}</p>
            <p className="mt-[2.2%] text-[3.8cqw] font-normal leading-[1.35] text-white/90">{body}</p>
          </div>
        ))}
      </div>
      <Speak className="mt-[4%]">By day 90, about 22 films. Six first, then about eight a month.</Speak>
    </div>
  );
}

function SlideClose() {
  const steps = [
    ["90 min", "We name the voice, the heroes, and what we will not say."],
    ["3 weeks", "Six films, stills, and a posting guide."],
    ["Day 30", "Keep what parents saved. Drop the rest."],
    ["Day 90", "A monthly plan, only if the numbers hold."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>05 · NEXT STEP</Kicker>
      <Title>A small start. Then we keep what works.</Title>
      <div className="mt-[4%] flex flex-col gap-[3.2%]">
        {steps.map(([when, body]) => (
          <p key={when} className="text-[4cqw] font-normal leading-[1.32] text-white/92">
            <strong className="font-bold text-white">{when}. </strong>
            {body}
          </p>
        ))}
      </div>
      <Speak className="mt-[5%]">
        We will not invent a result, use a cartoon look, push a parent, or post before you say yes.
      </Speak>
      <div className="mt-auto pt-[6%]">
        <p className="font-mono text-[2.8cqw] tracking-[0.2em] text-blue-300">FIND US</p>
        <p className="mt-[2%] text-[5cqw] font-bold leading-tight text-white">yourailensstudios.com</p>
        <p className="text-[4.4cqw] font-semibold text-white/90">Instagram · @yourailens</p>
        <p className="mt-[4%] text-[3.4cqw] font-normal leading-snug text-white/70">
          Prepared for Nalapad Academy by YourAILens Studios, Bangalore.
        </p>
      </div>
    </div>
  );
}

export default function NalapadPhoneDeck() {
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
        const pdf = new JsPDF({ unit: "in", format: [PDF_W, PDF_H], orientation: "portrait", compress: true });
        for (let n = 0; n < nodes.length; n += 1) {
          const url = await domToJpeg(nodes[n], { scale: 2, quality: 1, backgroundColor: "#070b14" });
          if (n > 0) pdf.addPage();
          pdf.addImage(url, "JPEG", 0, 0, PDF_W, PDF_H);
        }
        pdf.save("Nalapad-Academy-Admissions-Plan-Phone.pdf");
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
      <div className="flex min-h-0 flex-1 items-center justify-center px-3 py-3">
        <div className="relative aspect-[9/16] h-[min(100%,calc(100svh-5.5rem))] overflow-hidden bg-[#070b14] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <SlideStage index={i} />
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="absolute inset-y-0 left-0 z-20 w-[14%] disabled:cursor-default" />
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="absolute inset-y-0 right-0 z-20 w-[14%] disabled:cursor-default" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-4">
        <a href="/decks/nalapad-academy" className="font-mono text-[10px] tracking-[0.2em] text-white/45">VISUAL</a>
        <a href="/decks/nalapad-academy/full" className="font-mono text-[10px] tracking-[0.2em] text-white/45">FULL</a>
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">PREV</button>
        <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/40">{String(i + 1).padStart(2, "0")} / 06</p>
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
          {Array.from({ length: SLIDES }, (_, n) => (
            <div key={n} className="h-[1920px] w-[1080px]">
              <SlideStage index={n} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
