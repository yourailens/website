"use client";

import Link from "next/link";
import { useState } from "react";
import GlossyPlayCard from "./GlossyPlayCard";
import type { MobileClip, MobileHomeData } from "./types";

export default function MobileHomeApp({ data }: { data: MobileHomeData }) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const pause = () => setPlayingId(null);

  return (
    <div className="relative min-h-[100svh] bg-black font-body text-white">
      <main className="space-y-10 px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-[calc(4.5rem+env(safe-area-inset-top))]">
        {/* Same order as laptop: Opening film → Ads → Films → Community → Call sheet */}
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
          <Rail
            scene="NEW"
            title="Just landed"
            clips={data.landed}
            playingId={playingId}
            onPlay={setPlayingId}
            onPause={pause}
          />
          <div className="mt-8">
            <Rail
              scene="FORMAT"
              title="Any format"
              clips={data.formats}
              playingId={playingId}
              onPlay={setPlayingId}
              onPause={pause}
            />
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
              />
            </div>
          ) : null}

          <Rail
            scene="NEW"
            title="On the lot"
            clips={data.lot}
            playingId={playingId}
            onPlay={setPlayingId}
            onPause={pause}
          />
        </section>

        <section id="community">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">SC. 4 · COMMUNITY</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight">AI community</h2>
              <p className="mt-1.5 text-sm font-light text-white/45">Cuts from the studio and the feed.</p>
            </div>
            <Link href="/ai-verse" className="text-xs text-white/45">
              All community
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {data.community.map((clip) => (
              <div key={clip.id} className="w-[42vw] max-w-[11rem] shrink-0">
                <GlossyPlayCard
                  clip={clip}
                  playingId={playingId}
                  onPlay={setPlayingId}
                  onPause={pause}
                />
              </div>
            ))}
          </div>
        </section>

        <section id="callsheet">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">SC. 5 · COMMISSION</p>
              <h2 className="mt-1.5 text-xl font-semibold tracking-tight">Call sheet</h2>
              <p className="mt-1.5 text-sm font-light text-white/45">Brief. Budget. Date. Then we build.</p>
            </div>
            <Link href="/pricing" className="text-xs text-white/45">
              Pricing
            </Link>
          </div>
          <ul className="space-y-2">
            {data.pricing.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="flex items-center justify-between rounded-[1.25rem] border border-white/15 bg-white/[0.06] px-4 py-4 backdrop-blur-xl"
                >
                  <span>
                    <span className="block text-base font-semibold">{p.title}</span>
                    <span className="mt-1 block text-xs text-white/45">{p.tag}</span>
                  </span>
                  <span className="text-white/35">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
            <span className="h-2 w-2 rounded-full bg-blue-400" aria-hidden />
            Commission a world
          </Link>
        </section>
      </main>
    </div>
  );
}

function Rail({
  scene,
  title,
  clips,
  playingId,
  onPlay,
  onPause,
}: {
  scene: string;
  title: string;
  clips: MobileClip[];
  playingId: string | null;
  onPlay: (id: string) => void;
  onPause: () => void;
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
            playingId={playingId}
            onPlay={onPlay}
            onPause={onPause}
          />
        ))}
      </div>
    </div>
  );
}
