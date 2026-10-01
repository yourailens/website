"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SLIDES = 6;
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
        className="pointer-events-none absolute left-1/2 top-1/2 w-[36%] -translate-x-1/2 -translate-y-1/2 select-none opacity-[0.06] mix-blend-screen"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/yail-wordmark.png"
        alt="YourAILens Studios"
        className="pointer-events-none absolute left-[4.6%] top-[8.6%] w-[12%] select-none"
      />
    </>
  );
}

function Head({ kicker, title, lead }: { kicker: string; title: string; lead: string }) {
  return (
    <div className="shrink-0">
      <p className="font-mono text-[clamp(8px,0.78cqw,12px)] tracking-[0.28em] text-blue-300">{kicker}</p>
      <h2 className="mt-[0.5%] max-w-[36ch] font-body text-[clamp(1.15rem,2.05cqw,1.95rem)] font-semibold leading-[1.08] tracking-tight">
        {title}
      </h2>
      <p className="mt-[0.7%] max-w-[92ch] text-[clamp(12px,0.92cqw,15px)] font-light leading-snug text-white/68">{lead}</p>
    </div>
  );
}

function Table({ columns, rows }: { columns: { label: string; width: string }[]; rows: string[][] }) {
  return (
    <div className="h-full min-h-0 overflow-hidden border border-blue-300/25">
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
            className="flex items-center border-b border-blue-300/20 bg-blue-400/10 px-[1.2%] py-[0.55%] font-mono text-[clamp(8px,0.64cqw,11px)] tracking-[0.12em] text-blue-200"
          >
            {c.label}
          </div>
        ))}
        {rows.map((row, ri) =>
          row.map((cell, ci) => (
            <div
              key={`${ri}-${ci}`}
              className={`flex items-center border-b border-white/10 px-[1.2%] py-[0.45%] text-[clamp(11px,0.78cqw,14px)] leading-snug ${
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
    <div className="flex h-full min-h-0 flex-col border border-blue-300/30 bg-white/[0.03] px-[5.5%] py-[4.5%]">
      <p className="font-mono text-[clamp(8px,0.66cqw,11px)] tracking-[0.2em] text-blue-300">{label}</p>
      <ul className="mt-[5%] flex min-h-0 flex-1 flex-col justify-between gap-[2%]">
        {items.map((item) => (
          <li key={item} className="flex gap-[0.65cqw] text-[clamp(11px,0.82cqw,14px)] font-light leading-snug text-white/80">
            <span className="mt-[0.45em] h-[0.36em] w-[0.36em] shrink-0 bg-blue-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SlideStage({ index }: { index: number }) {
  return (
    <div data-pdf-slide className="relative h-full w-full overflow-hidden bg-[#07090e]" style={{ containerType: "inline-size" }}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(ellipse 48% 36% at 8% 0%, rgba(37,99,235,0.22), transparent 58%)" }}
        aria-hidden
      />
      <Marks />
      <div className="relative z-10 flex h-full min-h-0 flex-col px-[4.8%] pb-[3.6%] pt-[15.6%]">
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
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="PREPARED FOR NALAPAD ACADEMY"
        title="More seats. Same school. Seen better."
        lead="A GenAI film plan so Bangalore parents meet Nalapad on their phone, then book the campus tour. This page is the brief behind that plan."
      />
      <div className="mt-[2%] grid min-h-0 flex-1 grid-cols-[minmax(0,1.45fr)_minmax(0,0.7fr)] gap-[2%]">
        <Table
          columns={[
            { label: "ITEM", width: "0.7fr" },
            { label: "DETAIL", width: "1.5fr" },
          ]}
          rows={[
            ["School", "Nalapad Academy, Indiranagar, Bengaluru"],
            ["Board", "Cambridge"],
            ["Already strong", "STEM, mentors, Apple smart rooms"],
            ["Window", "Admissions 2026 / 27"],
            ["What is thin", "The weekly story parents see before they walk in"],
            ["What we add", "Eight GenAI films a month"],
            ["Where they live", "Instagram, YouTube Shorts, parent WhatsApp"],
            ["Tone", "Warm, clear, never pushy"],
          ]}
        />
        <Notes
          label="THE POINT OF THE WORK"
          items={[
            "Parents decide on the phone, then they visit.",
            "The campus does not need a new story. It needs to be seen.",
            "One film a week is enough to stay in that decision.",
            "Success is more visits, more tour forms, more seats.",
            "We start small, then keep only what parents save.",
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
        kicker="01 · THE GAP"
        title="Parents decide on the phone. Then they visit."
        lead="The campus is already strong. What is thin is the weekly story a parent can watch, save, and send to a partner before the tour."
      />
      <div className="mt-[2%] grid min-h-0 flex-1 grid-cols-[minmax(0,1.55fr)_minmax(0,0.62fr)] gap-[2%]">
        <Table
          columns={[
            { label: "MOMENT", width: "0.7fr" },
            { label: "WHAT HAPPENS NOW", width: "1.15fr" },
            { label: "WHAT A FILM ADDS", width: "1.15fr" },
          ]}
          rows={[
            ["First look", "They search the school on the phone", "A face and a classroom, not a poster"],
            ["The hook", "3 to 7 seconds, then they scroll", "One clear reason to stay"],
            ["Compare", "Two or three schools, side by side", "Proof, not a brochure line"],
            ["Share", "They send something to a partner", "A film worth forwarding"],
            ["The visit", "The tour is still the real decision", "A date they already want to book"],
          ]}
        />
        <Notes
          label="READ THIS AS FACT"
          items={[
            "70% and more look online before they visit.",
            "Cambridge, STEM, mentors, and smart rooms are already true.",
            "A quiet week online looks like a quiet school.",
            "One film in the week is the difference.",
            "We do not ask them to apply in the first second.",
          ]}
        />
      </div>
    </div>
  );
}

function SlidePlan() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="02 · THE PLAN"
        title="Show the school like a film. Every week."
        lead="Four pillars, in rotation. Every film does one job. The ask at the end is soft: visit, call, or apply."
      />
      <div className="mt-[2%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "PILLAR", width: "0.55fr" },
            { label: "WHAT WE SHOW", width: "1.2fr" },
            { label: "A FILM LOOKS LIKE", width: "1.05fr" },
            { label: "THE PARENT LEAVES WITH", width: "1.15fr" },
          ]}
          rows={[
            ["Proof", "Cambridge and STEM, in a real class", "30 to 45 sec, one room, one task", "This school is serious"],
            ["People", "Teachers and children they can recognise", "15 to 25 sec, a mentor and a child", "I know who is in the room"],
            ["Place", "The Indiranagar campus, close and real", "A short walk through the day", "I can picture the morning"],
            ["Next step", "Visit, call, or apply", "A soft end card with a real date", "I know what to do next"],
          ]}
        />
      </div>
      <div className="mt-[1.8%] shrink-0">
        <Table
          columns={[
            { label: "WHEN", width: "0.55fr" },
            { label: "WHAT GOES OUT", width: "1.4fr" },
            { label: "WHO IT IS FOR", width: "1.1fr" },
          ]}
          rows={[
            ["Monday", "The new film, on Instagram and YouTube Shorts", "Parents still comparing schools"],
            ["Midweek", "Stills from the same film, for stories", "Parents who missed the full film"],
            ["Weekend", "A short cut on parent WhatsApp", "Families already in the conversation"],
          ]}
        />
      </div>
    </div>
  );
}

function SlideMake() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="03 · WHAT WE MAKE"
        title="Eight films a month. Built with GenAI."
        lead="They look like proper films. Warm, safe for children, clearly Nalapad. Not a cartoon AI look. Nothing goes out before the school approves it."
      />
      <div className="mt-[1.8%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "NO", width: "0.32fr" },
            { label: "FILM", width: "1.15fr" },
            { label: "LENGTH", width: "0.7fr" },
            { label: "CHANNEL", width: "1fr" },
            { label: "IT PROVES", width: "1.15fr" },
          ]}
          rows={[
            ["01", "Campus, the place", "30 to 45 sec", "Instagram, YouTube", "The school is real"],
            ["02", "Campus, the day", "30 to 45 sec", "Instagram, YouTube", "The day has a rhythm"],
            ["03", "A day at school, care", "15 to 25 sec", "Reels, WhatsApp", "Children are looked after"],
            ["04", "A day at school, class", "15 to 25 sec", "Reels, WhatsApp", "Teachers are present"],
            ["05", "STEM in class", "20 to 35 sec", "Reels, Shorts", "Cambridge work is visible"],
            ["06", "Robotics in use", "20 to 35 sec", "Reels, Shorts", "The lab is not a set"],
            ["07", "Parent trust", "15 to 25 sec", "WhatsApp, Stories", "Safety and routine"],
            ["08", "Tour dates", "15 to 25 sec", "WhatsApp, Stories", "How to book a visit"],
          ]}
        />
      </div>
    </div>
  );
}

function SlideNinety() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <Head
        kicker="04 · 90 DAYS"
        title="From the first film to a full admissions push."
        lead="Month one locks the look. Month two finds the rhythm. Month three spends attention on the films parents actually save."
      />
      <div className="mt-[1.8%] min-h-0">
        <Table
          columns={[
            { label: "WINDOW", width: "0.7fr" },
            { label: "PHASE", width: "0.55fr" },
            { label: "OUTPUT", width: "0.75fr" },
            { label: "WE LOCK", width: "1.25fr" },
            { label: "YOU DO", width: "1.15fr" },
          ]}
          rows={[
            ["Days 1 to 30", "Start", "6 films live", "Brand rules, faces, campus look", "One kickoff, approvals in 2 days"],
            ["Days 31 to 60", "Rhythm", "1 film a week", "Robotics, languages, mentors, open day", "Share on parent groups"],
            ["Days 61 to 90", "Admissions", "Push the winners", "Seat dates and tour invites", "Boost the films parents save"],
          ]}
        />
      </div>
      <div className="mt-[1.8%] min-h-0 flex-1">
        <Table
          columns={[
            { label: "SIGNAL", width: "0.8fr" },
            { label: "WHERE WE LOOK", width: "1.1fr" },
            { label: "GOOD BY DAY 90", width: "1.5fr" },
          ]}
          rows={[
            ["Films shipped", "The library", "22 in total. 6 in month one, then about 8 a month."],
            ["Profile visits", "Instagram and the site", "Higher than the month before the work began."],
            ["Tour forms", "The admissions desk", "More booked dates, with a film still in the last two weeks."],
            ["Seats", "Admissions 2026 / 27", "More conversations that started from a film, not only from a flyer."],
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
        kicker="05 · NEXT STEP"
        title="A small start. Then we scale what works."
        lead="Ninety minutes to begin. Three weeks to see the films. Day 30 to keep or drop. Day 90 to continue only if the numbers hold."
      />
      <div className="mt-[1.6%] min-h-0">
        <Table
          columns={[
            { label: "WHEN", width: "0.5fr" },
            { label: "STEP", width: "0.55fr" },
            { label: "YOU BRING", width: "1.2fr" },
            { label: "WE LEAVE YOU WITH", width: "1.35fr" },
          ]}
          rows={[
            ["90 min", "Kickoff", "Voice, heroes, what to avoid", "The first three films, named"],
            ["3 weeks", "Pilot", "Fast approvals on faces and lines", "6 films, stills, a posting guide"],
            ["Day 30", "Review", "Which films parents saved", "A keep list and a drop list"],
            ["Day 90", "Continue", "Visits, tours, and seats", "A monthly plan, if the numbers hold"],
          ]}
        />
      </div>
      <div className="mt-[1.6%] grid min-h-0 flex-1 grid-cols-2 gap-[2%]">
        <Notes
          label="WE NEED FROM THE SCHOOL"
          items={[
            "One person who can approve a film.",
            "Faces you are happy to show.",
            "Lines we must not say.",
            "Tour dates and seat dates, only when they are real.",
          ]}
        />
        <Notes
          label="WHAT WE WILL NOT DO"
          items={[
            "Invent results or fake a full classroom.",
            "Use a cartoon AI look.",
            "Push a parent to apply in the first second.",
            "Post anything before you have approved it.",
          ]}
        />
      </div>
      <div className="mt-[1.4%] flex shrink-0 items-end justify-between">
        <div>
          <p className="font-mono text-[clamp(8px,0.66cqw,11px)] tracking-[0.2em] text-white/40">FIND US</p>
          <p className="text-[clamp(12px,0.9cqw,15px)] text-white/85">yourailensstudios.com</p>
          <p className="text-[clamp(12px,0.9cqw,15px)] text-white/70">Instagram · @yourailens</p>
        </div>
        <p className="max-w-[36ch] text-right text-[clamp(11px,0.82cqw,14px)] font-light text-white/45">
          Prepared for Nalapad Academy by YourAILens Studios, Bangalore.
        </p>
      </div>
    </div>
  );
}

export default function NalapadFullDeck() {
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
          const url = await domToJpeg(nodes[n], { scale: 2, quality: 1, backgroundColor: "#07090e" });
          if (n > 0) pdf.addPage();
          pdf.addImage(url, "JPEG", 0, 0, PDF_W, PDF_H);
        }
        pdf.save("Nalapad-Academy-Admissions-Plan-Full-4K.pdf");
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
          <button type="button" aria-label="Previous slide" onClick={() => go(i - 1)} disabled={i === 0} className="absolute inset-y-0 left-0 z-20 w-[6%] disabled:cursor-default" />
          <button type="button" aria-label="Next slide" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="absolute inset-y-0 right-0 z-20 w-[6%] disabled:cursor-default" />
        </div>
      </div>
      <DeckBar
        i={i}
        go={go}
        saving={saving}
        accent="text-blue-300"
        dot="bg-blue-400"
        onSave={() => {
          setSaveError("");
          setSaving(true);
        }}
      />
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

function DeckBar({
  i,
  go,
  saving,
  onSave,
  accent,
  dot,
}: {
  i: number;
  go: (n: number) => void;
  saving: boolean;
  onSave: () => void;
  accent: string;
  dot: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 pb-4">
      <a href="/decks/nalapad-academy" className="font-mono text-[10px] tracking-[0.2em] text-white/45">
        VISUAL
      </a>
      <a href="/decks/nalapad-academy/phone" className="font-mono text-[10px] tracking-[0.2em] text-white/45">
        PHONE
      </a>
      <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">
        PREV
      </button>
      <div className="flex items-center gap-2">
        {Array.from({ length: SLIDES }, (_, n) => (
          <button key={n} type="button" aria-label={`Slide ${n + 1}`} onClick={() => go(n)} className={`h-1.5 transition-all ${n === i ? `w-8 ${dot}` : "w-1.5 bg-white/30"}`} />
        ))}
      </div>
      <p className="font-mono text-[10px] tabular-nums tracking-[0.2em] text-white/40">{String(i + 1).padStart(2, "0")} / 06</p>
      <button type="button" onClick={() => go(i + 1)} disabled={i === SLIDES - 1} className="font-mono text-[10px] tracking-[0.2em] text-white/45 disabled:opacity-25">
        NEXT
      </button>
      <button type="button" onClick={onSave} disabled={saving} className={`font-mono text-[10px] tracking-[0.2em] disabled:opacity-40 ${accent}`}>
        {saving ? "SAVING" : "DOWNLOAD PDF"}
      </button>
    </div>
  );
}
