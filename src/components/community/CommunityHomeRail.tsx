"use client";

import Link from "next/link";
import CommunityStill from "@/components/community/CommunityStill";
import type { CommunityRailCard, CommunitySite } from "@/data/community";

export type { CommunityRailCard };

export default function CommunityHomeRail({
  site,
  cards,
  compact = false,
}: {
  site: Pick<CommunitySite, "title" | "member_count" | "member_label">;
  cards: CommunityRailCard[];
  compact?: boolean;
}) {
  if (!cards.length) return null;
  const pad = compact ? "" : "px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10";

  return (
    <section id="community">
      <div className={`flex items-end justify-between gap-4 ${pad}`}>
        <div>
          <p className="font-mono text-[10px] tracking-[0.32em] text-sky-300">SC. 4 · COMMUNITY</p>
          <h2 className="mt-2 font-heading text-[clamp(1.8rem,3.6vw,3rem)] leading-none tracking-tight">
            {site.title}
          </h2>
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-white/45">
            <span className="text-white">{site.member_count}</span> {site.member_label}
          </p>
        </div>
        <Link
          href="/ai-verse"
          className="mb-1 shrink-0 rounded-full border border-white/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 transition hover:border-white/45 hover:text-white"
        >
          Enter
        </Link>
      </div>
      <div className={`flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${compact ? "-mx-4 mt-5 px-4" : `mt-8 ${pad}`}`}>
        {cards.map((card) => (
          <Link
            key={card.id}
            href={card.href}
            className={compact ? "w-[78vw] shrink-0" : "w-[82vw] shrink-0 sm:w-[46vw] lg:w-[32vw]"}
          >
            <span className="block overflow-hidden rounded-2xl bg-[#10131a] ring-1 ring-white/10">
              <span className="block aspect-video overflow-hidden">
                <CommunityStill
                  src={card.mediaUrl}
                  poster={card.posterUrl}
                  video={card.mediaType === "video"}
                  alt={card.title}
                  grade={card.mediaType === "video"}
                />
              </span>
              <span className="block px-4 py-3.5">
                <span className="block text-[15px] font-medium text-white">{card.title}</span>
                {card.description ? (
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-white/50">
                    {card.description}
                  </span>
                ) : null}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
