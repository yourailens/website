"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = 10;
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

function Marks() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo_yail.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 w-[34%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.05] mix-blend-screen"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/yail-wordmark.png"
        alt="YourAILens Studios"
        className="pointer-events-none absolute left-[4.6%] top-[8.2%] w-[12%] select-none"
      />
    </>
  );
}

function Head({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <div className="shrink-0">
      <p className="font-mono text-[clamp(8px,0.76cqw,12px)] tracking-[0.28em] text-emerald-300">{kicker}</p>
      <h2 className="mt-[0.45%] max-w-[42ch] font-body text-[clamp(1.1rem,1.95cqw,1.85rem)] font-semibold leading-[1.08] tracking-tight">
        {title}
      </h2>
      <p className="mt-[0.55%] max-w-[96ch] text-[clamp(12px,0.88cqw,15px)] font-light leading-snug text-white/68">{lead}</p>
    </div>
  );
}

function Table({ columns, rows }: { columns: { label: string; width: string }[]; rows: string[][] }) {
  return (
    <div className="h-full min-h-0 overflow-hidden border border-emerald-300/25">
      <div
        className="grid h-full"
        style={{
          gridTemplateColumns: columns.map((c) => c.width).join(" "),
          gridTemplateRows: `auto repeat(${rows.length}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((c) => (
          <div
            key={c.label}
            className="flex items-center border-b border-emerald-300/20 bg-emerald-400/10 px-[1.1%] py-[0.5%] font-mono text-[clamp(8px,0.62cqw,11px)] tracking-[0.12em] text-emerald-200"
          >
            {c.label}
          </div>
        ))}
        {rows.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`flex items-center border-b border-white/10 px-[1.1%] py-[0.4%] text-[clamp(11px,0.76cqw,14px)] leading-snug ${
                ci === 0 ? "font-semibold text-white" : "font-light text-white/78"
              } ${ri % 2 === 1 ? "bg-white/[0.03]" : ""}`}
            >
              {cell}
            </div>
          )),
        )}
      </div>
    </div>
  );
}

function Notes({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="flex h-full min-h-0 flex-col border border-emerald-300/30 bg-white/[0.03] px-[5.5%] py-[4%]">
      <p className="font-mono text-[clamp(8px,0.64cqw,11px)] tracking-[0.2em] text-emerald-300">{label}</p>
      <ul className="mt-[5%] flex min-h-0 flex-1 flex-col justify-between gap-[2%]">
        {items.map((item) => (
          <li key={item} className="flex gap-[0.6cqw] text-[clamp(11px,0.8cqw,14px)] font-light leading-snug text-white/80">
            <span className="mt-[0.45em] h-[0.36em] w-[0.36em] shrink-0 bg-emerald-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlideStage({ index }: { index: number }) {
  return (
    <div data-pdf-slide className="relative h-full w-full overflow-hidden bg-[#07110e]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 46% 34% at 92% 0%, rgba(16,185,129,0.2), transparent 58%)" }}
        aria-hidden
      />
      <Marks />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[4.6%] pb-[3.2%] pt-[15.2%]">
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
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="01 · THE OPPORTUNITY"
        title="What if the curriculum could teach beyond the classroom?"
        lead="Keep the lessons you already wrote. Add a film library students can open before class, after class, and at home."
      />
      <div className="mt-[1.8%] grid min-h-0 flex-1 grid-cols-[minmax(0,1.5fr)_minmax(0,0.62fr)] gap-[2%]">
        <Table
          columns={[
            { label: "STEP", width: "0.38fr" },
            { label: "TODAY", width: "1.15fr" },
            { label: "WITH LESSON FILMS", width: "1.25fr" },
          ]}
          rows={[
            ["1", "The teacher opens the chapter", "Same teacher, same chapter"],
            ["2", "One explanation in the room", "A film the student can watch first"],
            ["3", "A line in the textbook", "The same line, now visible"],
            ["4", "Homework from the page", "Watch again, then the written work"],
            ["5", "Revision from notes", "A short film, then the notes"],
          ]}
        />
        <Notes
          label="WHAT DOES NOT CHANGE"
          items={[
            "Your curriculum stays the source.",
            "Your method stays the method.",
            "Your teachers still teach the room.",
            "The exercises you already set stay.",
            "The film is another tool, not a replacement.",
          ]}
        />
      </div>
    </div>
  );
}

function SlideGap() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="02 · THE GAP"
        title="A book tells. A film shows."
        lead="Plants need sunlight, water and carbon dioxide to produce food. Same sentence. The film lets the student see each part happen."
      />
      <div className="mt-[1.8%] grid min-h-0 flex-1 grid-cols-[minmax(0,1.55fr)_minmax(0,0.58fr)] gap-[2%]">
        <Table
          columns={[
            { label: "BEAT", width: "0.55fr" },
            { label: "IN THE BOOK", width: "0.9fr" },
            { label: "ON SCREEN", width: "1fr" },
            { label: "THE CHILD SEES", width: "1.05fr" },
          ]}
          rows={[
            ["Sunlight", "Named in the sentence", "Light arrives on the leaf", "Where the energy comes from"],
            ["Water", "Named in the sentence", "Water rises from the root", "The path through the plant"],
            ["Air", "Carbon dioxide, one phrase", "Air enters the leaf", "The ingredient they cannot see"],
            ["The change", "The words produce food", "The leaf makes food", "The process, not only the word"],
            ["The plant", "The end of the line", "The plant is fed", "Why the sentence matters"],
          ]}
        />
        <Notes
          label="THE RULE FOR EVERY FILM"
          items={[
            "Nothing is rewritten for drama.",
            "One idea per beat.",
            "A teacher can pause on any beat.",
            "The grade does not meet science it has not reached.",
            "About 3 minutes for this sentence.",
          ]}
        />
      </div>
    </div>
  );
}

function SlideChapter() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="03 · ONE REAL CHAPTER"
        title="Grade 3 science. The Water Cycle."
        lead="The chapter does not change. The way a child meets it does. Twelve pages stay twelve pages."
      />
      <div className="mt-[1.8%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "PIECE", width: "0.85fr" },
            { label: "TODAY", width: "0.7fr" },
            { label: "WITH FILMS", width: "1.45fr" },
            { label: "WHAT STAYS TRUE", width: "1.2fr" },
          ]}
          rows={[
            ["Pages", "12", "The same 12", "The book is still the source"],
            ["Teacher explanation", "1", "1, plus a film before class", "The teacher still teaches"],
            ["Written exercise", "1", "The same exercise, after they have seen it", "The task is not made easier"],
            ["At home", "Reread the pages", "Watch the chapter again", "A parent can follow along"],
            ["Revision", "Notes and memory", "A short recap film, then the notes", "The facts do not change"],
            ["Every batch", "Depends on the period", "One approved explanation", "The same lesson, every section"],
          ]}
        />
      </div>
    </div>
  );
}

function SlideFilms() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="04 · SIX FILMS"
        title="One chapter. A full lesson on screen."
        lead="About 22 minutes across six films. A teacher can play one, skip one, or send the recap home."
      />
      <div className="mt-[1.8%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "NO", width: "0.32fr" },
            { label: "FILM", width: "1.15fr" },
            { label: "LENGTH", width: "0.5fr" },
            { label: "BEST MOMENT", width: "1fr" },
            { label: "WHAT IT COVERS", width: "1.25fr" },
          ]}
          rows={[
            ["01", "Meet the water cycle", "3 min", "Before the chapter", "The whole idea, once"],
            ["02", "Evaporation", "4 min", "During the lesson", "Water leaving the surface"],
            ["03", "Condensation", "4 min", "During the lesson", "Water becoming cloud"],
            ["04", "Precipitation", "3 min", "During the lesson", "Rain, and where it goes"],
            ["05", "The complete journey", "5 min", "End of the chapter", "All four beats, in order"],
            ["06", "Revision", "3 min", "Before a test, or at home", "The facts, again, with nothing new"],
          ]}
        />
      </div>
    </div>
  );
}

function SlideSample() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="05 · THE SAMPLE"
        title="One sentence becomes a lesson."
        lead="Photosynthesis. About 3 minutes. This is the sample look of a lesson film, built from the line already in the book. It is not a finished player."
      />
      <div className="mt-[1.8%] grid min-h-0 flex-1 grid-cols-[minmax(0,1.55fr)_minmax(0,0.55fr)] gap-[2%]">
        <Table
          columns={[
            { label: "BEAT", width: "0.5fr" },
            { label: "TIME", width: "0.7fr" },
            { label: "ON SCREEN", width: "0.9fr" },
            { label: "FROM THE BOOK", width: "0.85fr" },
            { label: "TEACHER CHECK", width: "1fr" },
          ]}
          rows={[
            ["Sun", "0:00 to 0:40", "Light arrives", "Sunlight", "Is the source correct"],
            ["Root", "0:40 to 1:20", "Water rises", "Water", "Is the path correct"],
            ["Leaf", "1:20 to 2:05", "Air enters", "Carbon dioxide", "Is the word used right"],
            ["Change", "2:05 to 3:00", "Food is made", "Produce food", "Does it match the line"],
          ]}
        />
        <Notes
          label="SAMPLE, NOT A FAKE FILM"
          items={[
            "Four beats. One idea each.",
            "No extra science for this grade.",
            "A teacher can stop it on any beat.",
            "A real cut can replace this frame later.",
          ]}
        />
      </div>
    </div>
  );
}

function SlideSubjects() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="06 · MORE THAN ONE SUBJECT"
        title="Hard ideas, shown."
        lead="The same method works past one science chapter. The child, the place, and the names stay specific."
      />
      <div className="mt-[1.6%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "SUBJECT", width: "0.7fr" },
            { label: "A HARD IDEA", width: "0.85fr" },
            { label: "HOW THE FILM SHOWS IT", width: "1.45fr" },
            { label: "WHO IS IN IT", width: "1.15fr" },
          ]}
          rows={[
            ["Mathematics", "Fractions", "Objects that split, then come back together", "A share between friends"],
            ["Mathematics", "Shapes", "Shapes that turn, fit, and build a room", "A room the child can walk"],
            ["Mathematics", "Groups", "Groups that multiply in front of them", "Counters, not only digits"],
            ["Science", "The body", "A journey through what they cannot see", "The child's own day"],
            ["Science", "The sky", "A sky they can move through", "Weather they already know"],
            ["English", "Nouns", "A day in Noun City", "Rahul, Bruno, a house, an apple"],
            ["The world", "Habitats", "A place, then the life in it", "The animals of that place"],
            ["The world", "People", "Markets and festivals, not a stock scene", "Ananya, not a generic name"],
          ]}
        />
      </div>
    </div>
  );
}

function SlidePipeline() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="07 · HOW A LESSON IS MADE"
        title="AI is the studio. Your teachers approve the lesson."
        lead="You say what must be taught. We show an engaging way to present it. An academic check keeps it correct."
      />
      <div className="mt-[1.6%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "STEP", width: "0.7fr" },
            { label: "WHO", width: "0.7fr" },
            { label: "WHAT COMES OUT", width: "1.35fr" },
            { label: "THE RULE", width: "1.25fr" },
          ]}
          rows={[
            ["01 Map", "School and studio", "The chapter, and the lines that must be taught", "Nothing extra"],
            ["02 Script", "Studio", "A spoken lesson in simple lines", "Same facts as the book"],
            ["03 Teacher check", "Your teacher", "Yes, or notes to fix", "No film before this"],
            ["04 Pictures", "Studio", "The look of each beat", "Safe for the age"],
            ["05 Film", "Studio", "Moving pictures", "GenAI is the studio, not the author"],
            ["06 Voice", "Studio", "A clear voice in the chosen language", "No slang that confuses the grade"],
            ["07 Edit", "Studio", "One film, with places to pause", "A teacher can stop it"],
            ["08 Approved", "School", "The lesson is allowed in class", "Your name, your method"],
          ]}
        />
      </div>
    </div>
  );
}

function SlideLibrary() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="08 · WHAT THE ACADEMY KEEPS"
        title="Your method. Your films. Your name on them."
        lead="Not random videos from the internet. One approved explanation, in every classroom, for every batch."
      />
      <div className="mt-[1.6%] grid min-h-0 flex-1 grid-cols-[minmax(0,1.45fr)_minmax(0,0.62fr)] gap-[2%]">
        <Table
          columns={[
            { label: "USE", width: "0.7fr" },
            { label: "WHEN", width: "1.05fr" },
            { label: "WHAT THE STUDENT DOES", width: "1.3fr" },
          ]}
          rows={[
            ["Before class", "The evening before, or the morning", "Watches the chapter once"],
            ["After class", "The same day", "Watches the beat they missed"],
            ["At home", "With a parent", "Pauses, then explains it back"],
            ["Revision", "The week before a test", "The short recap only"],
            ["Before exams", "A planned set of chapters", "One film per chapter, not a new syllabus"],
            ["Holidays", "A light week", "Watch again. No new teaching."],
          ]}
        />
        <Notes
          label="LANGUAGES AND OWNERSHIP"
          items={[
            "English, Kannada, Hindi, Telugu.",
            "Same lesson. A voice the child already speaks.",
            "Teachers still teach. The film supports them.",
            "Later, a Grade 3 package families outside the academy can use.",
          ]}
        />
      </div>
    </div>
  );
}

function SlidePilot() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="09 · START SMALL"
        title="One grade. Then the rest, if it works."
        lead="A pilot is small enough to judge, and clear enough that a teacher can say yes or no."
      />
      <div className="mt-[1.6%] min-h-0">
        <Table
          columns={[
            { label: "SCOPE", width: "0.7fr" },
            { label: "THE PILOT", width: "1fr" },
            { label: "LATER, ONLY IF IT WORKS", width: "1.35fr" },
          ]}
          rows={[
            ["Grades", "1", "The next grades, one at a time"],
            ["Subjects", "1 or 2", "The rest of that year"],
            ["Chapters", "5 to 10", "The full book"],
            ["Languages", "The one you teach in", "Then Kannada, Hindi, Telugu"],
            ["Who sees it", "One section", "Every section of that grade"],
          ]}
        />
      </div>
      <div className="mt-[1.6%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "SIGNAL", width: "0.7fr" },
            { label: "THE QUESTION", width: "1.35fr" },
            { label: "WHO TELLS US", width: "0.9fr" },
          ]}
          rows={[
            ["Engagement", "Did they press play", "The class"],
            ["Who finishes", "Did they reach the end", "The film"],
            ["Students", "Could they say it back", "The teacher"],
            ["Teachers", "Did it save time, or confuse the room", "The teacher"],
            ["Parents", "Did home feel clearer", "A short note"],
            ["Understanding", "Did the existing exercise improve", "The test you already use"],
          ]}
        />
      </div>
    </div>
  );
}

function SlideClose() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="10 · THE ASK"
        title="You already have the curriculum."
        lead="Teachers. Method. Students. What is missing is a way for that knowledge to travel. That is what we build with you."
      />
      <div className="mt-[1.5%] min-h-0">
        <Table
          columns={[
            { label: "PHASE", width: "0.6fr" },
            { label: "WHAT IT IS", width: "1.5fr" },
            { label: "WHEN", width: "1.1fr" },
          ]}
          rows={[
            ["Films", "The chapter on screen", "First"],
            ["Worksheets", "Practice that matches the film", "After the pilot"],
            ["Tests", "The checks you already use, aligned to the film", "When you ask"],
            ["Progress", "Who watched, and who finished", "When the library is in use"],
            ["Assistant", "A helper that stays inside your lessons", "Later"],
            ["Platform", "The home for the whole library", "When the library is large enough"],
          ]}
        />
      </div>
      <div className="mt-[1.5%] grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)] gap-[2%]">
        <Notes
          label="YOU ALREADY HAVE"
          items={["The curriculum.", "The teachers.", "The method.", "The students."]}
        />
        <Notes
          label="WE BUILD WITH YOU"
          items={["The films.", "The teacher check.", "The library.", "The way it travels home."]}
        />
        <div className="flex h-full flex-col justify-end border border-white/12 px-[6%] py-[6%]">
          <p className="font-mono text-[clamp(8px,0.64cqw,11px)] tracking-[0.2em] text-white/40">FIND US</p>
          <p className="mt-[6%] text-[clamp(12px,0.86cqw,15px)]">yourailensstudios.com</p>
          <p className="text-[clamp(12px,0.86cqw,15px)] text-white/75">Instagram · @yourailens</p>
          <p className="mt-[8%] text-[clamp(11px,0.76cqw,13px)] font-light leading-snug text-white/45">
            A curriculum film idea from YourAILens Studios, Bangalore.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CurriculumFullDeck() {
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
          const url = await domToJpeg(nodes[n], { scale: 2, quality: 1, backgroundColor: "#07110e" });
          if (n > 0) pdf.addPage();
          pdf.addImage(url, "JPEG", 0, 0, PDF_W, PDF_H);
        }
        pdf.save("Curriculum-on-screen-Full-4K.pdf");
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
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="absolute inset-y-0 left-0 z-20 w-[6%] disabled:cursor-default" />
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="absolute inset-y-0 right-0 z-20 w-[6%] disabled:cursor-default" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 pb-4">
        <a href="/decks/curriculum" className="font-mono text-[10px] tracking-[0.2em] text-white/45">
          VISUAL
        </a>
        <a href="/decks/curriculum/phone" className="font-mono text-[10px] tracking-[0.2em] text-white/45">
          PHONE
        </a>
        <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">
          PREV
        </button>
        <div className="flex items-center gap-2">
          {Array.from({ length: SLIDES }, (_, n) => (
            <button key={n} type="button" aria-label={`Slide ${n + 1}`} onClick={() => go(n)} className={`h-1.5 transition-all ${n === i ? "w-8 bg-emerald-400" : "w-1.5 bg-white/30"}`} />
          ))}
        </div>
        <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/40">{String(i + 1).padStart(2, "0")} / 10</p>
        <button type="button" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">
          NEXT
        </button>
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
