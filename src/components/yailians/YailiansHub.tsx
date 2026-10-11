import Link from "next/link";
import YailiansHero from "@/components/yailians/YailiansHero";
import YailiansShell from "@/components/yailians/YailiansShell";
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

      {/* Voices promo */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-sky-400/90">01 · VOICES</p>
            <h2 className="mt-3 font-body text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-none tracking-tight">
              What people think
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/50">
              Reactions, notes, and conversations around the film.
            </p>
            <Link
              href="/yailians/voices"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-sky-100"
            >
              Open voices →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {(voices.length ? voices : []).slice(0, 4).map((v) => (
              <blockquote
                key={v.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
              >
                <p className="text-sm leading-relaxed text-white/75">“{v.quote}”</p>
                <footer className="mt-3">
                  <p className="text-sm font-semibold text-white">{v.name}</p>
                  {v.role ? <p className="text-xs text-white/40">{v.role}</p> : null}
                </footer>
              </blockquote>
            ))}
            {!voices.length ? (
              <p className="text-sm text-white/40 sm:col-span-2">Voices will land here once published.</p>
            ) : null}
          </div>
        </div>
      </section>

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
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {screenings.slice(0, 3).map((s) => (
              <li key={s.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
                {s.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.cover_url} alt="" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="aspect-[16/9] bg-zinc-950" />
                )}
                <div className="p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/80">
                    {s.status}
                    {formatWhen(s.starts_at) ? ` · ${formatWhen(s.starts_at)}` : ""}
                  </p>
                  <p className="mt-2 font-semibold text-white">{s.title}</p>
                  <p className="mt-1 text-sm text-white/45">
                    {[s.venue, s.city].filter(Boolean).join(" · ") || "—"}
                  </p>
                </div>
              </li>
            ))}
            {!screenings.length ? (
              <li className="text-sm text-white/40">Screenings will appear once published.</li>
            ) : null}
          </ul>
        </div>
      </section>

      {/* World promo */}
      <section>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
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
          <div className="mt-8 columns-2 gap-2 sm:columns-3 lg:columns-4">
            {world.slice(0, 8).map((item) => (
              <Link
                key={item.id}
                href="/yailians/world"
                className="mb-2 block break-inside-avoid overflow-hidden rounded-md bg-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.poster_url || item.media_url}
                  alt={item.title}
                  className="w-full object-cover"
                />
                <div className="px-2.5 py-2">
                  <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-sky-300/80">
                    {yailiansWorldKindLabel(item.kind)}
                  </p>
                  <p className="mt-0.5 text-[12px] font-medium text-white">{item.title}</p>
                </div>
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
