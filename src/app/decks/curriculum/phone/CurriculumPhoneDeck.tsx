"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

const SLIDES = 10;
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

function Marks() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[46%] w-[58%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.06] mix-blend-screen"
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
  return <p className="font-mono text-[3.1cqw] tracking-[0.18em] text-emerald-200">{children}</p>;
}

function Title({ children }: { children: ReactNode }) {
  return <h2 className="mt-[2.2%] font-body text-[6.6cqw] font-bold leading-[1.06] tracking-tight text-white">{children}</h2>;
}

function Speak({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[4.2cqw] italic leading-[1.35] text-emerald-100 ${className}`} style={SPEAK}>
      {children}
    </p>
  );
}

function SlideStage({ index }: { index: number }) {
  return (
    <div data-pdf-slide className="relative h-full w-full overflow-hidden bg-[#07140f]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 90% 30% at 80% 0%, rgba(16,185,129,0.24), transparent 60%)" }}
        aria-hidden
      />
      <Marks />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[7.2%] pb-[5.2%] pt-[17%]">
        {index === 0 ? <SlideOpportunity /> : null}
        {index === 1 ? <SlideGap /> : null}
        {index === 2 ? <SlideChapter /> : null}
        {index === 3 ? <SlideFilms /> : null}
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

function SlideOpportunity() {
  return (
    <div className="flex h-full flex-col">
      <Kicker>01 · THE OPPORTUNITY</Kicker>
      <Title>What if the curriculum could teach beyond the classroom?</Title>
      <Speak className="mt-[4%]">Keep the lessons you already wrote. Let a student meet them again, at home.</Speak>
      <div className="mt-[6%] flex flex-1 flex-col justify-center gap-[5%]">
        <div className="border border-white/14 px-[6%] py-[6%]">
          <p className="font-mono text-[2.8cqw] tracking-[0.18em] text-white/55">TODAY</p>
          <p className="mt-[3%] text-[4.6cqw] font-semibold leading-[1.35] text-white">Teacher. Classroom. Textbook. Homework.</p>
        </div>
        <div className="border border-emerald-300/40 bg-emerald-400/10 px-[6%] py-[6%]">
          <p className="font-mono text-[2.8cqw] tracking-[0.18em] text-emerald-200">THE ADDITION</p>
          <p className="mt-[3%] text-[4.6cqw] font-bold leading-[1.35] text-white">The same curriculum. A lesson film. The student, again.</p>
        </div>
      </div>
      <p className="mt-[5%] text-[4cqw] font-normal leading-[1.35] text-white/92">
        The film does not replace the teacher. <strong className="font-bold">It lets the lesson travel.</strong>
      </p>
    </div>
  );
}

function SlideGap() {
  const beats = [
    ["Sunlight", "Light arrives on the leaf."],
    ["Water", "It rises from the root."],
    ["Air", "It enters through the leaf."],
    ["The change", "Food is made."],
    ["The plant", "The child sees why the sentence matters."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>02 · THE GAP</Kicker>
      <Title>A book tells. A film shows.</Title>
      <Speak className="mt-[4%]">“Plants need sunlight, water and carbon dioxide to produce food.”</Speak>
      <div className="mt-[5%] flex flex-1 flex-col justify-between">
        {beats.map(([title, line], n) => (
          <div key={title} className="flex items-baseline gap-[4%] border-t border-white/12 pt-[2.4%]">
            <p className="w-[1.6em] shrink-0 font-mono text-[3.2cqw] text-emerald-300">{String(n + 1).padStart(2, "0")}</p>
            <div>
              <p className="text-[4.5cqw] font-bold leading-none text-white">{title}</p>
              <p className="mt-[1%] text-[3.8cqw] font-normal leading-snug text-white/88">{line}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-[4%] text-[3.7cqw] font-normal leading-[1.35] text-white/85">
        Same sentence. Nothing rewritten for drama. About <strong className="font-bold text-white">3 minutes</strong>. A teacher can pause on any beat.
      </p>
    </div>
  );
}

function SlideChapter() {
  const rows = [
    ["12 pages", "Still 12 pages. The book stays the source."],
    ["One explanation", "Still the teacher. Plus a film before class."],
    ["One exercise", "The same written work, after they have seen it."],
    ["At home", "They can watch it again, with a parent beside them."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>03 · ONE REAL CHAPTER</Kicker>
      <p className="mt-[3%] font-mono text-[3cqw] tracking-[0.16em] text-white/55">GRADE 3 · SCIENCE</p>
      <Title>The Water Cycle.</Title>
      <Speak className="mt-[3%]">The chapter does not change. The way a child meets it does.</Speak>
      <div className="mt-[5%] flex flex-1 flex-col justify-between">
        {rows.map(([title, body]) => (
          <div key={title} className="border-t border-emerald-300/30 pt-[3%]">
            <p className="text-[4.8cqw] font-bold leading-none text-white">{title}</p>
            <p className="mt-[1.6%] text-[3.9cqw] font-normal leading-[1.32] text-white/90">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideFilms() {
  const films = [
    ["01", "Meet the water cycle", "3 min", "Before the chapter opens."],
    ["02", "Evaporation", "4 min", "During the lesson."],
    ["03", "Condensation", "4 min", "During the lesson."],
    ["04", "Precipitation", "3 min", "During the lesson."],
    ["05", "The complete journey", "5 min", "When the chapter ends."],
    ["06", "Revision", "3 min", "Before a test, or at home."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>04 · SIX FILMS</Kicker>
      <Title>One chapter. A full lesson on screen.</Title>
      <Speak className="mt-[3%]">About 22 minutes. Play one. Skip one. Send the recap home.</Speak>
      <div className="mt-[4%] flex flex-1 flex-col justify-between">
        {films.map(([n, name, time, when]) => (
          <div key={n} className="flex items-start gap-[4%]">
            <p className="w-[1.5em] shrink-0 pt-[0.15em] font-mono text-[3.2cqw] text-emerald-300">{n}</p>
            <div>
              <p className="text-[4.15cqw] font-bold leading-tight text-white">
                {name}
                <span className="ml-[0.4em] font-mono text-[3cqw] font-medium text-emerald-200">{time}</span>
              </p>
              <p className="text-[3.5cqw] font-normal leading-snug text-white/80">{when}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideSample() {
  const beats = [
    ["Sun", "0:00 to 0:40", "Light arrives.", "Is the source correct?"],
    ["Root", "0:40 to 1:20", "Water rises.", "Is the path correct?"],
    ["Leaf", "1:20 to 2:05", "Air enters.", "Is the word used right?"],
    ["Change", "2:05 to 3:00", "Food is made.", "Does it match the line?"],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>05 · THE SAMPLE</Kicker>
      <Title>One sentence becomes a lesson.</Title>
      <p className="mt-[3%] text-[4.1cqw] font-normal leading-[1.35] text-white/92">
        <strong className="font-bold text-white">Photosynthesis.</strong> About 3 minutes. This is the look of the film, built from the line already in the book. It is not a finished player.
      </p>
      <div className="mt-[4%] flex flex-1 flex-col justify-between">
        {beats.map(([name, time, seen, check]) => (
          <div key={name} className="border-l-[3px] border-emerald-400 pl-[4%]">
            <p className="text-[4.6cqw] font-bold leading-none text-white">
              {name}
              <span className="ml-[0.45em] font-mono text-[2.8cqw] font-medium text-emerald-200">{time}</span>
            </p>
            <p className="mt-[1.3%] text-[3.8cqw] font-normal text-white/90">{seen}</p>
            <p className="mt-[0.6%] text-[3.6cqw] italic text-emerald-100" style={SPEAK}>{check}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideSubjects() {
  const subjects = [
    ["Mathematics", "Fractions as objects that split and come back. Shapes that turn. Groups that multiply in front of them."],
    ["Science", "A journey through the body. A sky the child can move through. Weather they already know."],
    ["English", "A day in Noun City. Rahul. Bruno. A house. An apple."],
    ["The world", "Habitats, markets, festivals. Ananya, not a generic name."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>06 · MORE THAN ONE SUBJECT</Kicker>
      <Title>Hard ideas, shown.</Title>
      <Speak className="mt-[3%]">The same method, past one science chapter. The child and the names stay specific.</Speak>
      <div className="mt-[5%] flex flex-1 flex-col justify-between">
        {subjects.map(([name, body]) => (
          <div key={name} className="bg-[linear-gradient(90deg,rgba(16,185,129,0.16),transparent_70%)] px-[5%] py-[4%]">
            <p className="text-[5cqw] font-bold leading-none text-white">{name}</p>
            <p className="mt-[2%] text-[3.85cqw] font-normal leading-[1.35] text-white/90">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidePipeline() {
  const moves = [
    ["You say what must be taught", "We map the chapter and write the lines. Same facts as the book. Nothing extra for drama."],
    ["We show an engaging way", "Pictures, a film, and a voice in the language you choose. Safe for that age."],
    ["A teacher approves it", "No film reaches a classroom before that yes. AI is the studio. Your teachers keep the lesson correct."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>07 · HOW A LESSON IS MADE</Kicker>
      <Title>AI is the studio. Your teachers approve the lesson.</Title>
      <div className="mt-[5%] flex flex-1 flex-col justify-between">
        {moves.map(([title, body], n) => (
          <div key={title}>
            <p className="font-mono text-[3cqw] text-emerald-300">{String(n + 1).padStart(2, "0")}</p>
            <p className="mt-[1.5%] text-[4.7cqw] font-bold leading-[1.15] text-white">{title}</p>
            <p className="mt-[2%] text-[3.9cqw] font-normal leading-[1.35] text-white/90">{body}</p>
          </div>
        ))}
      </div>
      <p className="mt-[5%] text-[3.5cqw] font-medium leading-[1.4] text-emerald-100">
        Map. Script. Teacher check. Pictures. Film. Voice. Edit. Approved.
      </p>
    </div>
  );
}

function SlideLibrary() {
  const uses = ["Before class", "After class", "At home", "Revision", "Before exams", "Holidays"];
  return (
    <div className="flex h-full flex-col">
      <Kicker>08 · WHAT THE ACADEMY KEEPS</Kicker>
      <Title>Your method. Your films. Your name on them.</Title>
      <p className="mt-[4%] text-[4.1cqw] font-normal leading-[1.38] text-white/92">
        Not random videos from the internet. <strong className="font-bold text-white">One approved explanation</strong>, in every classroom, for every batch. Teachers still teach. The film is another tool.
      </p>
      <div className="mt-[6%] flex flex-col gap-[2.4%]">
        {uses.map((use) => (
          <p key={use} className="border-b border-white/12 pb-[2%] text-[4.4cqw] font-semibold text-white">{use}</p>
        ))}
      </div>
      <div className="mt-auto pt-[6%]">
        <p className="text-[5.2cqw] font-bold leading-tight text-white">English. Kannada. Hindi. Telugu.</p>
        <Speak className="mt-[2%]">Same lesson. A voice the child already speaks.</Speak>
      </div>
    </div>
  );
}

function SlidePilot() {
  const measures = [
    ["Did they press play", "The class"],
    ["Did they finish", "The film"],
    ["Could they say it back", "The teacher"],
    ["Did home feel clearer", "A parent"],
    ["Did the exercise improve", "The test you already use"],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>09 · START SMALL</Kicker>
      <Title>One grade. Then the rest, if it works.</Title>
      <div className="mt-[5%] grid grid-cols-3 gap-[3%]">
        {[
          ["1", "Grade"],
          ["1 or 2", "Subjects"],
          ["5 to 10", "Chapters"],
        ].map(([n, label]) => (
          <div key={label}>
            <p className="font-body text-[6.2cqw] font-bold leading-none text-emerald-200">{n}</p>
            <p className="mt-[8%] text-[3.3cqw] font-semibold leading-tight text-white">{label}</p>
          </div>
        ))}
      </div>
      <Speak className="mt-[5%]">One section first. Not the whole school on day one.</Speak>
      <div className="mt-[5%] flex flex-1 flex-col justify-between">
        {measures.map(([q, who]) => (
          <p key={q} className="text-[3.9cqw] font-normal leading-snug text-white/92">
            <strong className="font-bold text-white">{q}.</strong>{" "}
            <span className="italic text-emerald-100" style={SPEAK}>{who}.</span>
          </p>
        ))}
      </div>
    </div>
  );
}

function SlideClose() {
  const phases = [
    ["Films", "The chapter on screen. This comes first."],
    ["Worksheets", "Practice that matches the film, after the pilot."],
    ["Tests", "The checks you already use, aligned when you ask."],
    ["Later", "Who watched, a helper inside your lessons, and a home for the library."],
  ];
  return (
    <div className="flex h-full flex-col">
      <Kicker>10 · THE ASK</Kicker>
      <Title>You already have the curriculum.</Title>
      <Speak className="mt-[4%]">Teachers. Method. Students. What is missing is a way for that knowledge to travel.</Speak>
      <div className="mt-[5%] flex flex-1 flex-col justify-between">
        {phases.map(([name, body]) => (
          <div key={name}>
            <p className="text-[4.8cqw] font-bold text-white">{name}</p>
            <p className="mt-[1%] text-[3.8cqw] font-normal leading-[1.32] text-white/88">{body}</p>
          </div>
        ))}
      </div>
      <div className="mt-[5%] border-t border-white/15 pt-[4%]">
        <p className="font-mono text-[2.8cqw] tracking-[0.2em] text-emerald-300">FIND US</p>
        <p className="mt-[2%] text-[4.8cqw] font-bold text-white">yourailensstudios.com</p>
        <p className="text-[4.2cqw] font-semibold text-white/90">Instagram · @yourailens</p>
        <p className="mt-[3%] text-[3.4cqw] leading-snug text-white/70">A curriculum film idea from YourAILens Studios, Bangalore.</p>
      </div>
    </div>
  );
}

export default function CurriculumPhoneDeck() {
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
          const url = await domToJpeg(nodes[n], { scale: 2, quality: 1, backgroundColor: "#07140f" });
          if (n > 0) pdf.addPage();
          pdf.addImage(url, "JPEG", 0, 0, PDF_W, PDF_H);
        }
        pdf.save("Curriculum-on-screen-Phone.pdf");
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
        <div className="relative aspect-[9/16] h-[min(100%,calc(100svh-5.5rem))] overflow-hidden bg-[#07140f] shadow-[0_30px_80px_rgba(0,0,0,0.55)]">
          <SlideStage index={i} />
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="absolute inset-y-0 left-0 z-20 w-[14%] disabled:cursor-default" />
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="absolute inset-y-0 right-0 z-20 w-[14%] disabled:cursor-default" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 pb-4">
        <a href="/decks/curriculum" className="font-mono text-[10px] tracking-[0.2em] text-white/45">VISUAL</a>
        <a href="/decks/curriculum/full" className="font-mono text-[10px] tracking-[0.2em] text-white/45">FULL</a>
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">PREV</button>
        <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/40">{String(i + 1).padStart(2, "0")} / 10</p>
        <button type="button" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">NEXT</button>
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
            <div key={n} className="h-[1920px] w-[1080px]">
              <SlideStage index={n} />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
