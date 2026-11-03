"use client";

import Link from "next/link";
import { useState } from "react";
import HeroSoundBanner from "@/components/home/HeroSoundBanner";
import GlossyPlayCard from "./GlossyPlayCard";
import type { MobileClip, MobileHomeData } from "./types";

export default function MobileHomeApp({ data }: { data: MobileHomeData }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [leadMuted, setLeadMuted] = useState(true);
  const pause = () => setPlayingId(null);
  const toggleLeadSound = () => setLeadMuted((muted) => !muted);
  const lead = data.heroes[0] ?? data.hero;
  const followingHeroes = data.heroes[0] ? data.heroes.slice(1) : [];

  return (
    <div className="relative min-h-[100svh] bg-black font-body text-white">
      <main className="space-y-10 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        <div className="relative -mx-4">
          <HeroSoundBanner muted={leadMuted} onToggle={toggleLeadSound} />
          <section id={lead.id === data.hero.id ? "lens" : undefined} aria-label={lead.section} className="px-4">
            {lead.id === data.hero.id ? <h1 className="sr-only">YourAILens Studios</h1> : null}
            <GlossyPlayCard
              clip={lead}
              playingId={playingId}
              onPlay={setPlayingId}
              onPause={pause}
              large
              autoPlay
              soundMuted={leadMuted}
              hideSoundButton
              onPictureClick={toggleLeadSound}
            />
            {lead.id === data.hero.id ? (
              <a href="#ads" className="mt-4 flex flex-col items-center gap-1 text-white/70">
                <span className="text-[10px] font-medium uppercase tracking-[0.32em]">Explore</span>
                <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce" fill="none" aria-hidden>
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            ) : null}
          </section>
        </div>
        {followingHeroes.map((clip) => (
          <section key={clip.id} aria-label={clip.section}>
            <p className="mb-3 font-mono text-[10px] tracking-[0.28em] text-white/45">{clip.section.toUpperCase()}</p>
            <GlossyPlayCard clip={clip} playingId={playingId} onPlay={setPlayingId} onPause={pause} large />
          </section>
        ))}
        {data.heroes[0] ? (
        <section id="lens" aria-label="Opening film">
          <h1 className="sr-only">YourAILens Studios</h1>
          <GlossyPlayCard
            clip={data.hero}
            playingId={playingId}
            onPlay={setPlayingId}
            onPause={pause}
            large
          />
          <a
            href="#ads"
            className="mt-4 flex flex-col items-center gap-1 text-white/70"
          >
            <span className="text-[10px] font-medium uppercase tracking-[0.32em]">Explore</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5 animate-bounce" fill="none" aria-hidden>
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </section>
        ) : null}

        <section id="ads">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">SC. 2 · AI ADS</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight">AI ads</h2>
            </div>
            <Link href="/ai-ads" className="text-xs text-white/45">
              All ads
            </Link>
          </div>
          <Rail scene="NEW" title="Just landed" clips={data.landed} />
          <div className="mt-8">
            <Rail scene="FORMAT" title="Any format" clips={data.formats} />
          </div>
        </section>

        <section id="films">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">SC. 3 · AI FILMS</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight">AI films</h2>
              <p className="mt-1.5 text-sm font-light text-white/45">Our first 45 min AI film. Then the cuts from the desk.</p>
            </div>
            <Link href="/ai-filmmaking" className="shrink-0 text-xs text-white/45">
              All films
            </Link>
          </div>

          {data.feature ? (
            <div className="mb-8">
              <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">FEATURE</p>
              <h3 className="mt-2 mb-4 font-body text-lg font-semibold tracking-tight">
                Our first <span className="text-blue-400">45</span> min AI film
              </h3>
              <GlossyPlayCard
                clip={data.feature}
                playingId={playingId}
                onPlay={setPlayingId}
                onPause={pause}
                large
                thumbnailOnly
              />
            </div>
          ) : null}

          <Rail scene="NEW" title="On the lot" clips={data.lot} />
        </section>
      </main>
    </div>
  );
}

function Rail({
  scene,
  title,
  clips,
}: {
  scene: string;
  title: string;
  clips: MobileClip[];
}) {
  if (!clips.length) return null;
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">{scene}</p>
      <h3 className="mt-1.5 mb-3 text-base font-semibold tracking-tight">{title}</h3>
      <div className="space-y-3">
        {clips.map((clip) => (
          <GlossyPlayCard
            key={clip.id}
            clip={clip}
            playingId={null}
            onPlay={() => {}}
            onPause={() => {}}
            thumbnailOnly
          />
        ))}
      </div>
    </div>
  );
}
