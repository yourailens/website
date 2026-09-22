"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import type {
  ProposalBar,
  ProposalDeck,
  ProposalFunnelStep,
  ProposalMindNode,
  ProposalSlide,
  ProposalStat,
  ProposalTimelineItem,
} from "@/data/proposal-decks";
import {
  INDUSTRY_PAGE,
  IndustryBreadcrumb,
  IndustryShell,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";

function StatGrid({ stats }: { stats: ProposalStat[] }) {
  return (
    <div
      className={`mt-8 grid gap-3 ${
        stats.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
      }`}
    >
      {stats.map((s) => (
        <div
          key={s.label}
          className="border border-white/15 bg-white/[0.06] px-4 py-5 sm:px-5"
        >
          <p className="font-body text-[clamp(1.75rem,4vw,2.35rem)] font-semibold leading-none tracking-tight text-white">
            {s.value}
          </p>
          <p className="mt-2 text-sm font-medium text-blue-200">{s.label}</p>
          {s.hint ? <p className="mt-1 text-xs leading-snug text-white/55">{s.hint}</p> : null}
        </div>
      ))}
    </div>
  );
}

function BarChart({ bars }: { bars: ProposalBar[] }) {
  return (
    <div className="mt-8 space-y-4">
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <p className="text-sm font-medium text-white/90">{bar.label}</p>
            <p className="shrink-0 font-mono text-[11px] tracking-wide text-blue-300">{bar.display}</p>
          </div>
          <div className="h-2.5 overflow-hidden border border-white/10 bg-white/[0.06]">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-[width] duration-700"
              style={{ width: `${Math.max(4, Math.min(100, bar.value))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MindMap({
  center,
  nodes,
}: {
  center: string;
  nodes: ProposalMindNode[];
}) {
  return (
    <div className="mt-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center">
        <div className="relative z-10 border border-blue-400/50 bg-blue-500/15 px-6 py-5 text-center shadow-[0_0_40px_rgba(59,130,246,0.25)]">
          <p className="whitespace-pre-line font-body text-lg font-semibold tracking-tight text-white sm:text-xl">
            {center}
          </p>
        </div>
        <div className="h-6 w-px bg-blue-400/40" aria-hidden />
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {nodes.map((node, i) => (
            <div
              key={node.label}
              className={`border border-white/15 bg-white/[0.06] px-4 py-4 ${
                i % 2 === 0 ? "sm:translate-y-0" : "sm:translate-y-0"
              }`}
            >
              <p className="font-mono text-[11px] tracking-[0.24em] text-blue-300">{node.label}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/80">{node.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Funnel({ steps }: { steps: ProposalFunnelStep[] }) {
  return (
    <div className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((s, i) => (
        <div key={s.step} className="relative border border-white/15 bg-white/[0.06] px-4 py-5">
          <p className="font-mono text-[10px] tracking-[0.28em] text-blue-300">
            {s.step}
            {i < steps.length - 1 ? " →" : ""}
          </p>
          <p className="mt-2 text-base font-semibold text-white">{s.label}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-white/70">{s.detail}</p>
        </div>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: ProposalTimelineItem[] }) {
  return (
    <div className="mt-8 space-y-0">
      {items.map((item, i) => (
        <div key={item.phase} className="grid gap-4 border-t border-white/12 py-6 sm:grid-cols-[7rem_1fr] lg:grid-cols-[8rem_1fr]">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-blue-300">PHASE {item.phase}</p>
            <p className="mt-1 text-sm font-semibold text-white">{item.range}</p>
            {item.metric ? (
              <p className="mt-2 inline-block border border-blue-400/40 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] tracking-wide text-blue-200">
                {item.metric}
              </p>
            ) : null}
            {i < items.length - 1 ? (
              <div className="mt-4 hidden h-full w-px bg-white/10 sm:block" aria-hidden />
            ) : null}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <ul className="mt-3 space-y-2">
              {item.points.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm leading-relaxed text-white/80">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

function SlideBody({ slide }: { slide: ProposalSlide }) {
  return (
    <>
      <p className="font-mono text-[11px] font-medium tracking-[0.28em] text-blue-300">{slide.kicker}</p>
      <h2 className="mt-3 max-w-4xl font-body text-[clamp(1.55rem,3.6vw,2.55rem)] font-semibold leading-[1.15] tracking-tight text-white">
        {slide.title}
      </h2>

      {slide.body ? (
        <p className="mt-5 max-w-3xl text-[15px] font-normal leading-[1.65] text-white/85 sm:text-base md:text-lg">
          {slide.body}
        </p>
      ) : null}

      {slide.stats?.length ? <StatGrid stats={slide.stats} /> : null}
      {slide.mindmap ? <MindMap center={slide.mindmap.center} nodes={slide.mindmap.nodes} /> : null}
      {slide.funnel?.length ? <Funnel steps={slide.funnel} /> : null}
      {slide.timeline?.length ? <Timeline items={slide.timeline} /> : null}
      {slide.bars?.length ? <BarChart bars={slide.bars} /> : null}

      {slide.columns?.length ? (
        <div
          className={`mt-8 grid gap-3 sm:grid-cols-2 ${
            slide.columns.length === 3
              ? "lg:grid-cols-3"
              : slide.columns.length >= 4
                ? "lg:grid-cols-4"
                : ""
          }`}
        >
          {slide.columns.map((col) => (
            <div key={col.label} className="border border-white/15 bg-white/[0.06] px-4 py-5">
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-mono text-[11px] tracking-[0.24em] text-blue-300">{col.label}</p>
                {col.metric ? (
                  <p className="font-mono text-[11px] font-semibold text-white">{col.metric}</p>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/80">{col.text}</p>
            </div>
          ))}
        </div>
      ) : null}

      {slide.bullets?.length ? (
        <ul className="mt-8 max-w-3xl space-y-3">
          {slide.bullets.map((b) => (
            <li key={b} className="flex gap-3 text-[15px] leading-relaxed text-white/85 sm:text-base">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" aria-hidden />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {slide.note ? (
        <p className="mt-10 border-t border-white/10 pt-5 text-xs leading-relaxed text-white/50 sm:text-[13px]">
          {slide.note}
        </p>
      ) : null}
    </>
  );
}

export default function ProposalDeckExperience({ deck }: { deck: ProposalDeck }) {
  const [index, setIndex] = useState(0);
  const total = deck.slides.length;
  const slide = deck.slides[index]!;

  const go = useCallback(
    (next: number) => {
      setIndex(Math.max(0, Math.min(total - 1, next)));
    },
    [total]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, index, total]);

  const downloadPdf = () => {
    const prev = document.title;
    document.title = `${deck.client} — ${deck.title} | YAIL Proposal Hub`;
    // Let the browser paint the print-only slides, then open Save as PDF.
    requestAnimationFrame(() => {
      window.print();
      setTimeout(() => {
        document.title = prev;
      }, 500);
    });
  };

  return (
    <IndustryShell>
      <div className="proposal-deck-screen print:hidden">
        <Navbar />
        <IndustryTopBar>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <IndustryBreadcrumb
              items={[
                { label: "PROPOSAL HUB", href: "/proposal-hub" },
                { label: deck.client.toUpperCase(), current: true },
              ]}
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={downloadPdf}
                className="inline-flex items-center gap-2 border border-blue-400/55 bg-blue-500/10 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-200 transition hover:border-blue-300 hover:text-blue-100"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download PDF
              </button>
              <p className="font-mono text-[11px] tracking-[0.22em] text-white/55">
                {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
            </div>
          </div>
        </IndustryTopBar>

        <div className={`${INDUSTRY_PAGE} flex min-h-[calc(100svh-8rem)] flex-col py-6 lg:py-10`}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-white/15 pb-5">
            <div>
              <p className="font-mono text-[11px] tracking-[0.28em] text-blue-300">{deck.tag}</p>
              <h1 className="mt-2 font-body text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {deck.client}
                <span className="font-normal text-white/60"> · {deck.title}</span>
              </h1>
              {deck.clientUrl ? (
                <a
                  href={deck.clientUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:text-blue-300"
                >
                  {deck.clientUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
                </a>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-2">
              <p className="font-mono text-[11px] tracking-[0.2em] text-white/45">{deck.dateLabel}</p>
            </div>
          </div>

          <article className="relative flex flex-1 flex-col border border-white/15 bg-[#0a0c12]">
            <div
              className="pointer-events-none absolute inset-0 opacity-50"
              style={{
                background:
                  "radial-gradient(ellipse 55% 45% at 8% 0%, rgba(37,99,235,0.22), transparent 55%)",
              }}
              aria-hidden
            />
            <div className="relative flex flex-1 flex-col px-5 py-7 sm:px-9 sm:py-10 lg:px-12 lg:py-12">
              <SlideBody slide={slide} />
            </div>
          </article>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {deck.slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 transition-all ${
                    i === index ? "w-9 bg-blue-400" : "w-2 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <p className="hidden font-mono text-[10px] tracking-[0.2em] text-white/40 sm:block">
                ← → TO NAVIGATE
              </p>
              <button
                type="button"
                onClick={() => go(index - 1)}
                disabled={index === 0}
                className="border border-white/20 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 transition hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                disabled={index === total - 1}
                className="border border-blue-400/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-200 transition hover:border-blue-300 hover:text-blue-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-[12px] text-white/40">
            <Link href="/proposal-hub" className="transition hover:text-blue-300">
              ← All decks
            </Link>
          </p>
        </div>
      </div>

      {/* Print / PDF: every slide as its own page */}
      <div className="proposal-deck-print hidden print:block" aria-hidden>
        <header className="mb-6 border-b border-white/20 pb-4">
          <p className="font-mono text-[10px] tracking-[0.28em] text-blue-300">YAIL PROPOSAL HUB</p>
          <h1 className="mt-2 font-body text-2xl font-semibold text-white">
            {deck.client} · {deck.title}
          </h1>
          <p className="mt-1 text-sm text-white/60">
            {deck.tag} · {deck.dateLabel}
            {deck.clientUrl ? ` · ${deck.clientUrl}` : ""}
          </p>
        </header>
        {deck.slides.map((s, i) => (
          <section
            key={s.kicker}
            className="proposal-print-slide break-after-page border border-white/15 bg-[#0a0c12] px-8 py-10"
          >
            <p className="mb-4 font-mono text-[10px] tracking-[0.22em] text-white/45">
              SLIDE {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </p>
            <SlideBody slide={s} />
          </section>
        ))}
      </div>
    </IndustryShell>
  );
}
