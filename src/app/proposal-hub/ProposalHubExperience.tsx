"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { ProposalDeck } from "@/data/proposal-decks";
import {
  INDUSTRY_PAGE,
  IndustryChannelTitle,
  IndustryEyebrow,
  IndustryGlow,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTintSection,
} from "@/app/industries/IndustryUI";

export default function ProposalHubExperience({ decks }: { decks: ProposalDeck[] }) {
  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-10 pt-12 sm:pt-16`}>
        <IndustryChannelTitle channel="CHANNEL · STUDIO" title="Proposal Hub" />
        <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
          YAIL client decks — GenAI strategy, PR systems, and campaign plans ready to present.
        </p>
      </section>

      <IndustryTintSection>
        <IndustryEyebrow>DECKS</IndustryEyebrow>
        <IndustrySectionTitle>
          Open a proposal.{" "}
          <span className="font-light text-white/55">Present slide by slide.</span>
        </IndustrySectionTitle>

        {decks.length === 0 ? (
          <p className="mt-10 text-sm font-light text-white/45">No decks published yet.</p>
        ) : (
          <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {decks.map((deck, index) => {
              const ep = String(index + 1).padStart(2, "0");
              return (
                <li key={deck.slug}>
                  <Link
                    href={`/proposal-hub/${deck.slug}`}
                    className="group flex h-full flex-col border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-950/80 via-black to-zinc-900">
                      <div
                        className="pointer-events-none absolute inset-0 opacity-60"
                        style={{
                          background:
                            "radial-gradient(ellipse 60% 50% at 30% 20%, rgba(59,130,246,0.35), transparent 55%)",
                        }}
                        aria-hidden
                      />
                      <p className="absolute bottom-3 left-4 font-mono text-[10px] tracking-[0.28em] text-blue-300">
                        DECK · {ep}
                      </p>
                      <p className="absolute right-4 top-4 font-mono text-[9px] tracking-[0.2em] text-white/35">
                        {deck.slides.length} SLIDES
                      </p>
                    </div>
                    <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                      <p className="font-mono text-[10px] tracking-[0.22em] text-white/40">{deck.tag}</p>
                      <h2 className="mt-2 font-body text-[clamp(1.15rem,2vw,1.45rem)] font-semibold leading-tight tracking-tight text-white transition group-hover:text-blue-100">
                        {deck.client}
                      </h2>
                      <p className="mt-1 text-sm font-light text-blue-300/90">{deck.title}</p>
                      <p className="mt-2 line-clamp-2 text-[13px] font-light leading-relaxed text-white/50">
                        {deck.subtitle}
                      </p>
                      <p className="mt-auto pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                        Open deck
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </IndustryTintSection>
    </IndustryShell>
  );
}
