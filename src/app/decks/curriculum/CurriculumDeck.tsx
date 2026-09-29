"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const SLIDES = 10;

function Marks() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 w-[38%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.06] mix-blend-screen"
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
  return <p className="font-mono text-[clamp(9px,1.05cqw,13px)] tracking-[0.32em] text-emerald-300">{children}</p>;
}

function Title({ children }: { children: ReactNode }) {
  return (
    <h2 className="mt-[1.2%] max-w-[20ch] font-body text-[clamp(1.45rem,3.2cqw,2.9rem)] font-semibold leading-[1.08] tracking-tight text-white">
      {children}
    </h2>
  );
}

const PDF_W = 13.333;
const PDF_H = 7.5;

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

function SlideStage({ index }: { index: number }) {
  return (
    <div data-pdf-slide className="relative h-full w-full overflow-hidden bg-[#07110e]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 50% 42% at 88% 8%, rgba(16,185,129,0.22), transparent 60%)" }}
        aria-hidden
      />
      <Marks />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[6%] pb-[4.5%] pt-[18.2%]">
        {index === 0 ? <SlideOpportunity /> : null}
        {index === 1 ? <SlideProblem /> : null}
        {index === 2 ? <SlideChapter /> : null}
        {index === 3 ? <SlideBreak /> : null}
        {index === 4 ? <SlideSample /> : null}
        {index === 5 ? <SlideSubjects /> : null}
        {index === 6 ? <SlidePipeline /> : null}
        {index === 7 ? <SlideLibrary /> : null}
        {index === 8 ? <SlidePilot /> : null}
        {index === 9 ? <SlideClose /> : null}
      </div>
    </div>
  );
}

export default function CurriculumDeck() {
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
            quality: 0.95,
            backgroundColor: "#07110e",
          });
          if (n > 0) pdf.addPage();
          pdf.addImage(url, "JPEG", 0, 0, PDF_W, PDF_H);
        }
        pdf.save("Curriculum-on-screen-4K.pdf");
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
        <div className="relative aspect-video w-full max-w-[min(100%,calc((100svh-5.5rem)*16/9))] overflow-hidden bg-[#07110e] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <SlideStage index={i} />
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="absolute inset-y-0 left-0 z-20 w-[8%] disabled:cursor-default" />
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="absolute inset-y-0 right-0 z-20 w-[8%] disabled:cursor-default" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pb-4">
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">PREV</button>
        <div className="flex items-center gap-2">
          {Array.from({ length: SLIDES }, (_, n) => (
            <button key={n} type="button" aria-label={`Slide ${n + 1}`} onClick={() => go(n)} className={`h-1.5 transition-all ${n === i ? "w-8 bg-emerald-400" : "w-1.5 bg-white/30"}`} />
          ))}
        </div>
        <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/40">{String(i + 1).padStart(2, "0")} / 10</p>
        <button type="button" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">NEXT</button>
        <a href="/decks/curriculum/full" className="font-mono text-[10px] tracking-[0.2em] text-white/45">FULL</a>
        <a href="/decks/curriculum/phone" className="font-mono text-[10px] tracking-[0.2em] text-white/45">PHONE</a>
        <button
          type="button"
          onClick={() => {
            setSaveError("");
            setSaving(true);
          }}
          disabled={saving}
          className="font-mono text-[10px] tracking-[0.2em] text-emerald-300 disabled:opacity-40"
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

function Path({ label, steps, hot }: { label: string; steps: string[]; hot?: boolean }) {
  return (
    <div className={`flex h-full min-h-0 flex-col border px-[7%] py-[5%] ${hot ? "border-emerald-300/40 bg-emerald-400/10" : "border-white/12 bg-white/[0.03]"}`}>
      <p className="font-mono text-[clamp(8px,0.75cqw,11px)] tracking-[0.26em] text-emerald-300">{label}</p>
      <div className="mt-[6%] flex min-h-0 flex-1 flex-col justify-center gap-[3%]">
        {steps.map((step, n) => (
          <div key={step}>
            <p className="font-body text-[clamp(14px,1.45cqw,20px)] font-semibold leading-none">{step}</p>
            {n < steps.length - 1 ? <p className="mt-1 font-mono text-[9px] tracking-[0.14em] text-white/30">THEN</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideOpportunity() {
  return (
    <div className="grid h-full min-h-0 grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] gap-[4%]">
      <div className="flex min-h-0 flex-col justify-center">
        <Kicker>01 · THE OPPORTUNITY</Kicker>
        <h1 className="mt-[2%] max-w-[16ch] font-body text-[clamp(1.45rem,2.8cqw,2.7rem)] font-semibold leading-[1.02] tracking-tight">
          What if the curriculum could teach beyond the classroom?
        </h1>
        <p className="mt-[4%] max-w-[34ch] text-[clamp(13px,1.2cqw,17px)] font-light leading-relaxed text-white/70">
          Keep the lessons you already wrote. Add a film library students can open before class, after class, and at home.
        </p>
      </div>
      <div className="grid min-h-0 grid-cols-2 gap-[4%]">
        <Path label="TODAY" steps={["Teacher", "Classroom", "Textbook", "Homework"]} />
        <Path label="THE ADDITION" steps={["Curriculum", "Lesson films", "The student"]} hot />
      </div>
    </div>
  );
}

function Frame({ title, note, mark }: { title: string; note: string; mark: ReactNode }) {
  return (
    <div className="flex h-full flex-col border border-white/12 bg-black/30">
      <div className="flex flex-1 items-center justify-center bg-emerald-400/10">{mark}</div>
      <div className="px-[8%] py-[8%]">
        <p className="text-[clamp(11px,1.05cqw,14px)] font-semibold">{title}</p>
        <p className="mt-0.5 text-[clamp(10px,0.85cqw,12px)] text-white/45">{note}</p>
      </div>
    </div>
  );
}

function SlideProblem() {
  return (
    <>
      <Kicker>02 · THE GAP</Kicker>
      <Title>A book tells. A film shows.</Title>
      <p className="mt-[1.5%] max-w-[62ch] text-[clamp(12px,1.15cqw,16px)] font-light text-white/60">
        Plants need sunlight, water and carbon dioxide to produce food. Same line. Now the student can see it happen.
      </p>
      <div className="mt-[3%] grid min-h-0 flex-1 grid-cols-5 gap-[1.4%]">
        <Frame title="Sunlight" note="Enters the scene" mark={<Sun />} />
        <Frame title="Water" note="Through the roots" mark={<Drop />} />
        <Frame title="Air" note="Through the leaves" mark={<Air />} />
        <Frame title="The change" note="Food is made" mark={<Flask />} />
        <Frame title="The plant" note="Lesson stays the same" mark={<Leaf />} />
      </div>
    </>
  );
}

function SlideChapter() {
  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-[5%]">
      <div className="flex flex-col justify-center">
        <Kicker>03 · ONE REAL CHAPTER</Kicker>
        <p className="mt-[2%] font-mono text-[clamp(10px,0.9cqw,13px)] tracking-[0.2em] text-white/45">GRADE 3 · SCIENCE</p>
        <Title>The Water Cycle.</Title>
        <p className="mt-[3%] max-w-[36ch] text-[clamp(13px,1.2cqw,17px)] font-light leading-relaxed text-white/65">
          The chapter does not change. The way a child meets it does.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-[4%]">
        {[
          ["12", "Pages in the book"],
          ["1", "Teacher explanation"],
          ["1", "Written exercise"],
        ].map(([n, label]) => (
          <div key={label} className="flex items-center gap-4 border-t border-white/15 pt-[3%]">
            <p className="w-[3ch] font-body text-[clamp(1.6rem,3cqw,2.6rem)] font-semibold text-emerald-300">{n}</p>
            <p className="text-[clamp(14px,1.4cqw,20px)]">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideBreak() {
  const films = [
    ["01", "Meet the water cycle", "3 min"],
    ["02", "Evaporation", "4 min"],
    ["03", "Condensation", "4 min"],
    ["04", "Precipitation", "3 min"],
    ["05", "The complete journey", "5 min"],
    ["06", "Revision", "3 min"],
  ];
  return (
    <>
      <Kicker>04 · SIX FILMS</Kicker>
      <Title>One chapter. A full lesson on screen.</Title>
      <div className="mt-[4%] grid min-h-0 flex-1 grid-cols-6 gap-[1.5%]">
        {films.map(([n, name, time]) => (
          <div key={n} className="flex flex-col border border-white/12 bg-white/[0.03] px-[8%] py-[8%]">
            <p className="font-mono text-[clamp(9px,0.8cqw,12px)] text-emerald-300">{n}</p>
            <p className="mt-3 flex-1 text-[clamp(13px,1.25cqw,18px)] font-semibold leading-snug">{name}</p>
            <p className="mt-3 font-mono text-[clamp(10px,0.9cqw,13px)] text-white/50">{time}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SlideSample() {
  const beats = [
    ["Sun", "Light arrives"],
    ["Root", "Water rises"],
    ["Leaf", "Air enters"],
    ["Change", "Food is made"],
  ];
  return (
    <div className="grid h-full grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] gap-[4%]">
      <div className="flex flex-col justify-center">
        <Kicker>05 · THE SAMPLE</Kicker>
        <Title>One sentence becomes a lesson.</Title>
        <p className="mt-[4%] text-[clamp(13px,1.2cqw,17px)] font-light leading-relaxed text-white/65">
          Photosynthesis. About 3 minutes. This is the look of the film, built from the line already in the book.
        </p>
      </div>
      <div className="flex min-h-0 flex-col border border-emerald-300/30 bg-black/40 p-[3%]">
        <div className="flex items-center justify-between font-mono text-[clamp(8px,0.75cqw,11px)] tracking-[0.2em] text-emerald-300">
          <span>SAMPLE LESSON</span>
          <span>03:00</span>
        </div>
        <div className="mt-[3%] grid min-h-0 flex-1 grid-cols-4 gap-[2%]">
          {beats.map(([name, note], n) => (
            <div key={name} className="flex flex-col bg-emerald-400/10">
              <div className="flex flex-1 items-center justify-center">
                <p className="font-body text-[clamp(1.4rem,2.4cqw,2.2rem)] font-semibold text-emerald-200">{n + 1}</p>
              </div>
              <div className="bg-black/40 px-[8%] py-[10%]">
                <p className="text-[clamp(12px,1.1cqw,15px)] font-semibold">{name}</p>
                <p className="text-[clamp(10px,0.85cqw,12px)] text-white/50">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SlideSubjects() {
  const tiles = [
    ["Mathematics", "Fractions as objects. Shapes that move. Groups that multiply."],
    ["Science", "A journey through the body. A sky you can fly through."],
    ["English", "A day in Noun City. Rahul, Bruno, a house, an apple."],
    ["The world", "Habitats, markets, festivals. Ananya, not a generic name."],
  ];
  return (
    <>
      <Kicker>06 · MORE THAN ONE SUBJECT</Kicker>
      <Title>Hard ideas, shown.</Title>
      <div className="mt-[3.5%] grid min-h-0 flex-1 grid-cols-4 gap-[2%]">
        {tiles.map(([name, body]) => (
          <div key={name} className="flex flex-col justify-end border border-white/12 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),transparent_55%)] px-[8%] py-[8%]">
            <p className="font-body text-[clamp(16px,1.7cqw,24px)] font-semibold">{name}</p>
            <p className="mt-3 text-[clamp(12px,1.05cqw,15px)] font-light leading-snug text-white/65">{body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function SlidePipeline() {
  const steps = ["Map", "Script", "Teacher check", "Pictures", "Film", "Voice", "Edit", "Approved"];
  return (
    <>
      <Kicker>07 · HOW A LESSON IS MADE</Kicker>
      <Title>AI is the studio. Your teachers approve the lesson.</Title>
      <div className="mt-[5%] grid grid-cols-8 gap-[1.2%]">
        {steps.map((step, n) => (
          <div key={step} className="border border-white/12 px-[6%] py-[12%]">
            <p className="font-mono text-[clamp(8px,0.7cqw,11px)] text-emerald-300">{String(n + 1).padStart(2, "0")}</p>
            <p className="mt-2 text-[clamp(12px,1.05cqw,15px)] font-semibold leading-snug">{step}</p>
          </div>
        ))}
      </div>
      <div className="mt-[4%] grid grid-cols-3 gap-[2%] text-[clamp(12px,1.1cqw,15px)] font-light text-white/70">
        <p className="border-t border-emerald-300/40 pt-3">You say what must be taught.</p>
        <p className="border-t border-white/15 pt-3">We show an engaging way to present it.</p>
        <p className="border-t border-white/15 pt-3">An academic check keeps it correct.</p>
      </div>
    </>
  );
}

function SlideLibrary() {
  const uses = ["Before class", "After class", "At home", "Revision", "Before exams", "Holidays"];
  return (
    <div className="grid h-full grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] gap-[4%]">
      <div className="flex min-h-0 flex-col">
        <Kicker>08 · WHAT THE ACADEMY KEEPS</Kicker>
        <Title>Your method. Your films. Your name on them.</Title>
        <p className="mt-[3%] max-w-[40ch] text-[clamp(13px,1.15cqw,16px)] font-light leading-relaxed text-white/65">
          Not random videos from the internet. One approved explanation, in every classroom, for every batch. Teachers still teach. The film is another tool.
        </p>
        <div className="mt-[4%] flex flex-wrap gap-2">
          {uses.map((use) => (
            <span key={use} className="border border-white/15 px-3 py-1.5 font-mono text-[clamp(9px,0.8cqw,12px)] tracking-[0.12em] text-white/70">
              {use}
            </span>
          ))}
        </div>
      </div>
      <div className="flex min-h-0 flex-col justify-center gap-[4%]">
        <div className="border border-emerald-300/35 bg-emerald-400/10 px-[7%] py-[7%]">
          <p className="font-mono text-[clamp(8px,0.75cqw,11px)] tracking-[0.22em] text-emerald-300">LANGUAGES</p>
          <p className="mt-2 text-[clamp(15px,1.5cqw,22px)] font-semibold">English. Kannada. Hindi. Telugu.</p>
          <p className="mt-2 text-[clamp(12px,1.05cqw,14px)] font-light text-white/60">Same lesson. A voice the child already speaks.</p>
        </div>
        <div className="border border-white/12 px-[7%] py-[7%]">
          <p className="font-mono text-[clamp(8px,0.75cqw,11px)] tracking-[0.22em] text-white/40">LATER, IF YOU WANT</p>
          <p className="mt-2 text-[clamp(14px,1.35cqw,18px)] font-semibold">A Grade 3 package families outside the academy can use.</p>
          <p className="mt-2 text-[clamp(12px,1.05cqw,14px)] font-light text-white/55">Films, recaps, and practice. A product, not only a teaching aid.</p>
        </div>
      </div>
    </div>
  );
}

function SlidePilot() {
  const measures = ["Engagement", "Who finishes", "Students", "Teachers", "Parents", "Understanding"];
  return (
    <>
      <Kicker>09 · START SMALL</Kicker>
      <Title>One grade. Then the rest, if it works.</Title>
      <div className="mt-[4%] grid grid-cols-3 gap-[2%]">
        {[
          ["1", "Grade"],
          ["1 or 2", "Subjects"],
          ["5 to 10", "Chapters"],
        ].map(([n, label]) => (
          <div key={label} className="border border-white/12 px-[6%] py-[7%]">
            <p className="font-body text-[clamp(1.5rem,2.8cqw,2.5rem)] font-semibold text-emerald-300">{n}</p>
            <p className="mt-1 text-[clamp(13px,1.2cqw,16px)]">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-[4%] flex flex-wrap gap-2">
        {measures.map((item) => (
          <span key={item} className="bg-white/[0.04] px-3 py-1.5 text-[clamp(11px,1cqw,14px)] text-white/75">{item}</span>
        ))}
      </div>
    </>
  );
}

function SlideClose() {
  const phases = ["Films", "Worksheets", "Tests", "Progress", "Assistant", "Platform"];
  return (
    <div className="flex h-full flex-col">
      <Kicker>10 · THE ASK</Kicker>
      <h2 className="mt-[1.5%] max-w-[18ch] font-body text-[clamp(1.55rem,3.3cqw,3rem)] font-semibold leading-[1.05]">
        You already have the curriculum.
      </h2>
      <p className="mt-[2%] max-w-[46ch] text-[clamp(14px,1.3cqw,18px)] font-light text-white/70">
        Teachers. Method. Students. What is missing is a way for that knowledge to travel. That is what we build with you.
      </p>
      <div className="mt-[4%] flex items-center gap-[1.5%]">
        {phases.map((phase, n) => (
          <div key={phase} className="flex min-w-0 flex-1 items-center gap-[8%]">
            <p className={`truncate text-[clamp(11px,1cqw,14px)] ${n === 0 ? "font-semibold text-emerald-200" : "text-white/55"}`}>{phase}</p>
            {n < phases.length - 1 ? <span className="text-white/25">·</span> : null}
          </div>
        ))}
      </div>
      <div className="mt-auto flex items-end justify-between pt-[3%]">
        <div>
          <p className="font-mono text-[clamp(9px,0.8cqw,11px)] tracking-[0.22em] text-white/40">FIND US</p>
          <p className="mt-1 text-[clamp(13px,1.15cqw,16px)]">yourailensstudios.com</p>
          <p className="text-[clamp(13px,1.15cqw,16px)] text-white/75">Instagram · @yourailens</p>
        </div>
        <p className="max-w-[28ch] text-right text-[clamp(12px,1.05cqw,14px)] font-light text-white/45">
          A curriculum film idea from YourAILens Studios, Bangalore.
        </p>
      </div>
    </div>
  );
}

function Sun() {
  return (
    <svg viewBox="0 0 64 64" className="h-[42%] w-[42%]" aria-hidden>
      <circle cx="32" cy="32" r="10" fill="#fde68a" />
      {Array.from({ length: 8 }, (_, n) => (
        <line key={n} x1="32" y1="8" x2="32" y2="16" stroke="#fde68a" strokeWidth="2" transform={`rotate(${n * 45} 32 32)`} />
      ))}
    </svg>
  );
}

function Drop() {
  return (
    <svg viewBox="0 0 64 64" className="h-[42%] w-[42%]" aria-hidden>
      <path d="M32 10 C32 10 16 30 16 40 a16 16 0 0 0 32 0 C48 30 32 10 32 10Z" fill="#67e8f9" />
    </svg>
  );
}

function Air() {
  return (
    <svg viewBox="0 0 64 64" className="h-[42%] w-[42%]" aria-hidden>
      <path d="M10 24 H40 a6 6 0 1 0 -2 -11" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 36 H48 a6 6 0 1 0 -2 -11" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
      <path d="M14 48 H36 a5 5 0 1 0 -1 -9" fill="none" stroke="#a7f3d0" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function Flask() {
  return (
    <svg viewBox="0 0 64 64" className="h-[42%] w-[42%]" aria-hidden>
      <path d="M26 8 H38 V22 L50 50 a10 8 0 0 1 -36 0 L26 22Z" fill="none" stroke="#86efac" strokeWidth="2.4" />
      <path d="M20 42 H44 L48 50 a8 6 0 0 1 -32 0Z" fill="#34d399" opacity="0.85" />
    </svg>
  );
}

function Leaf() {
  return (
    <svg viewBox="0 0 64 64" className="h-[42%] w-[42%]" aria-hidden>
      <path d="M12 40 C12 18 34 10 54 12 C52 36 34 52 12 40Z" fill="#34d399" />
      <path d="M18 38 C28 32 38 24 48 16" fill="none" stroke="#064e3b" strokeWidth="2" />
    </svg>
  );
}
