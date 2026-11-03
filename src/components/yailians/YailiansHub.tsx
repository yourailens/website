import Link from "next/link";
import YailiansTrailer from "@/components/home/YailiansTrailer";
import CinemaFrame from "@/components/yailians/CinemaFrame";
import WorldThumb from "@/components/yailians/WorldThumb";
import VoiceInterviewCard from "@/components/yailians/VoiceInterviewCard";
import VoicesBay from "@/components/yailians/VoicesBay";
import YailiansHero from "@/components/yailians/YailiansHero";
import YailiansShell from "@/components/yailians/YailiansShell";
import { ottCutYoutubeId } from "@/data/ott-cuts";
import {
  yailiansWorldKindLabel,
  type YailiansScreening,
  type YailiansSite,
  type YailiansVoice,
  type YailiansWorldItem,
} from "@/data/yailians";

function formatWhen(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function TrailerBelowHero({ site }: { site: YailiansSite }) {
  const url = site.trailer_url?.trim() || "";
  if (!url) return null;
  const youtubeId = ottCutYoutubeId(url) || undefined;
  const poster =
    site.trailer_poster?.trim() ||
    (youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined);

  const runtime = site.runtime_label || "45 min";

  return (
    <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#03060c]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/gc1.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-[right_center]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block"
        style={{
          background:
            "linear-gradient(90deg, rgba(3,6,12,0.88) 0%, rgba(3,6,12,0.55) 32%, rgba(3,6,12,0.12) 52%, transparent 68%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%] bg-gradient-to-t from-[#03060c] via-[#03060c]/88 to-transparent md:hidden"
      />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/50 to-transparent" />

      {/* Mobile: leave the core visible before the screen. */}
      <div className="h-[34svh] md:hidden" aria-hidden />

      <div className="relative flex items-center px-5 pb-12 sm:px-8 md:min-h-[34rem] md:px-10 md:py-16 lg:min-h-[38rem] lg:px-14">
        <div className="w-full md:max-w-[50%]">
          <p className="font-mono text-[10px] tracking-[0.42em] text-white/45">OFFICIAL TRAILER</p>
          <h2 className="mt-3 max-w-[12ch] font-heading text-[clamp(2.4rem,5vw,4.4rem)] leading-[0.92] tracking-[0.06em] text-white">
            ATTACK ON BANGALORE
          </h2>
          <p className="mt-3 font-mono text-[10px] tracking-[0.32em] text-white/40">{runtime}</p>

          <div className="mt-7 sm:mt-8">
            <CinemaFrame>
              <div className="relative aspect-video bg-black">
                <YailiansTrailer
                  title="Attack on Bangalore"
                  tag={runtime}
                  poster={poster}
                  youtubeId={youtubeId}
                  video={youtubeId ? undefined : url}
                  bare
                />
              </div>
            </CinemaFrame>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function YailiansHub({
  site,
  voices,
  screenings,
  world,
}: {
  site: YailiansSite;
  voices: YailiansVoice[];
  screenings: YailiansScreening[];
  world: YailiansWorldItem[];
}) {
  return (
    <YailiansShell activeHref="/yailians" overHero>
      <YailiansHero site={site} />
      <TrailerBelowHero site={site} />

      <VoicesBay
        action={
          <Link
            href="/yailians/voices"
            className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/75 transition hover:text-white"
          >
            All interviews →
          </Link>
        }
      >
        <ul className="grid grid-cols-2 items-start gap-4 sm:gap-6">
          {voices.slice(0, 4).map((voice) => (
            <li key={voice.id} className="min-w-0">
              <VoiceInterviewCard voice={voice} />
            </li>
          ))}
          {!voices.length ? (
            <li className="text-sm text-white/40 sm:col-span-2">Interviews will land here once published.</li>
          ) : null}
        </ul>
      </VoicesBay>

      {/* Screenings promo */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-sky-400/90">02 · SCREENINGS</p>
              <h2 className="mt-3 font-body text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-none tracking-tight">
                On the screen
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/50">
                Finished shows and what’s coming next.
              </p>
            </div>
            <Link
              href="/yailians/screenings"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              All screenings →
            </Link>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {screenings.slice(0, 3).map((s) => (
              <li key={s.id}>
                <CinemaFrame
                  footer={
                    <>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/40">
                        {s.status}
                        {formatWhen(s.starts_at) ? ` · ${formatWhen(s.starts_at)}` : ""}
                      </p>
                      <p className="mt-1.5 font-medium text-white">{s.title}</p>
                      <p className="mt-1 text-sm text-white/50">
                        {[s.venue, s.city].filter(Boolean).join(" · ") || "—"}
                      </p>
                    </>
                  }
                >
                  {s.cover_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.cover_url} alt="" className="aspect-[16/9] w-full object-cover" />
                  ) : (
                    <div className="aspect-[16/9] bg-zinc-950" />
                  )}
                </CinemaFrame>
              </li>
            ))}
            {!screenings.length ? (
              <li className="text-sm text-white/40">Screenings will appear once published.</li>
            ) : null}
          </ul>
        </div>
      </section>

      <section className="relative isolate overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden bg-[#070910]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/gc.png"
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover object-center opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/55 to-black" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/25 to-black/70" />
        </div>
        <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] tracking-[0.28em] text-sky-400/90">03 · WORLD</p>
              <h2 className="mt-3 font-body text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-none tracking-tight">
                Inside YAILIANS
              </h2>
              <p className="mt-3 max-w-md text-sm text-white/50">
                Worlds, creatures, characters, and craft from the film.
              </p>
            </div>
            <Link
              href="/yailians/world"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Enter the world →
            </Link>
          </div>
          <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-3">
            {world.slice(0, 8).map((item) => (
              <Link key={item.id} href={`/yailians/world/${item.id}`} className="mb-5 block break-inside-avoid">
                <CinemaFrame
                  footer={
                    <>
                      <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-white/40">
                        {yailiansWorldKindLabel(item.kind)}
                      </p>
                      <p className="mt-1 text-[15px] font-medium text-white">{item.title}</p>
                    </>
                  }
                >
                  <WorldThumb
                    src={item.media_url}
                    poster={item.poster_url}
                    video={item.media_type === "video"}
                    alt={item.title}
                  />
                </CinemaFrame>
              </Link>
            ))}
          </div>
          {!world.length ? (
            <p className="mt-6 text-sm text-white/40">World pieces will appear once published.</p>
          ) : null}
        </div>
      </section>
    </YailiansShell>
  );
}
