import Link from "next/link";
import { RailCard, type OttCard } from "@/components/home/OttRail";

const NOTES = [
  { code: "BUDGET", title: "Limited budget", body: "A small fare. You’ll be shocked to know the figure." },
  { code: "PACE", title: "Faster production", body: "Pre, shoot, finish. A compressed clock." },
] as const;

export default function FilmFeature({ card }: { card: OttCard }) {
  return (
    <div className="relative">
      {/* Emphasized YAILIANS billboard */}
      <div className="px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/25 bg-zinc-950 shadow-[0_40px_100px_-40px_rgba(16,185,129,0.45)] sm:rounded-3xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,_rgba(52,211,153,0.22),_transparent_55%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl"
          />

          <div className="relative grid lg:grid-cols-[minmax(0,1.35fr)_minmax(16rem,0.85fr)]">
            <div className="relative min-h-[14rem] sm:min-h-[18rem] lg:min-h-[22rem]">
              <div className="absolute inset-0">
                <RailCard card={{ ...card, href: "/yailians" }} aspect="wide" fill />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-black/50" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:hidden">
                <p className="font-mono text-[9px] tracking-[0.34em] text-emerald-300">YAIL ORIGINAL · 45 MIN</p>
                <p className="mt-2 font-heading text-[clamp(2.4rem,12vw,3.5rem)] leading-none tracking-[0.12em] text-white">
                  YAILIANS
                </p>
              </div>
            </div>

            <div className="relative flex flex-col justify-between border-t border-white/10 px-5 py-7 sm:px-7 sm:py-8 lg:border-l lg:border-t-0">
              <div>
                <p className="hidden font-mono text-[10px] tracking-[0.34em] text-emerald-300 lg:block">
                  YAIL ORIGINAL · 45 MIN
                </p>
                <h3 className="mt-0 hidden font-heading text-[clamp(2.8rem,5vw,4.2rem)] leading-[0.9] tracking-[0.14em] text-white lg:mt-3 lg:block">
                  YAILIANS
                </h3>
                <p className="mt-3 max-w-sm font-body text-[clamp(1.35rem,2.8vw,1.85rem)] font-semibold leading-none tracking-tight text-white">
                  Our first 45 min AI film.
                </p>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
                  Not a commercial that ran long. A picture made lean, made fast — finished like cinema.
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <Link
                  href="/yailians"
                  className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-emerald-400 px-6 py-4 text-center shadow-[0_0_0_1px_rgba(52,211,153,0.5),0_20px_50px_-12px_rgba(52,211,153,0.75)] transition hover:bg-emerald-300 hover:shadow-[0_0_0_1px_rgba(110,231,183,0.7),0_24px_60px_-10px_rgba(52,211,153,0.9)]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_48%,transparent_62%)] bg-[length:200%_100%] transition-[background-position] duration-700 group-hover:bg-[position:100%_0]"
                  />
                  <span className="relative font-heading text-[1.35rem] tracking-[0.16em] text-black sm:text-[1.5rem]">
                    YAILIANS
                  </span>
                  <span className="relative font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-black/70">
                    Enter →
                  </span>
                </Link>
                <p className="text-center font-mono text-[9px] uppercase tracking-[0.28em] text-white/35">
                  Trailer · voices · world
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supporting notes under the billboard */}
      <ul className="mt-6 grid gap-3 px-5 sm:mt-8 sm:grid-cols-2 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
        {NOTES.map((note) => (
          <li
            key={note.code}
            className="border border-white/10 bg-white/[0.03] px-5 py-5 sm:px-6"
          >
            <p className="font-mono text-[9px] tracking-[0.22em] text-emerald-300/80">{note.code}</p>
            <p className="mt-1.5 font-body text-xl font-semibold leading-none tracking-tight sm:text-2xl">
              {note.title}
            </p>
            <p className="mt-2 text-sm text-white/50">{note.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
