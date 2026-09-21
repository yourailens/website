import Link from "next/link";
import { RailCard, type OttCard } from "@/components/home/OttRail";

const NOTES = [
  { code: "BUDGET", title: "Limited budget", body: "A small fare. Youll be shocked to know the figure." },
  { code: "PACE", title: "Faster production", body: "Pre, shoot, finish. A compressed clock." },
] as const;

export default function FilmFeature({ card }: { card: OttCard }) {
  return (
    <div>
      <div className="px-5 sm:px-8 lg:px-16 xl:pl-52 xl:pr-10">
        <p className="font-mono text-[10px] tracking-[0.32em] text-blue-400">FEATURE</p>
        <h3 className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-0 font-heading leading-none">
          <span className="pb-[0.35em] text-[clamp(1.25rem,2.5vw,1.9rem)]">Our first</span>
          <span className="relative text-[clamp(3.6rem,9vw,7rem)] leading-[0.75] text-blue-400 drop-shadow-[0_0_28px_rgba(59,130,246,0.85)]">
            45
            <span className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-[70%] -translate-y-1/2 bg-blue-500/20 blur-2xl" aria-hidden />
          </span>
          <span className="pb-[0.35em] text-[clamp(1.25rem,2.5vw,1.9rem)]">min AI film</span>
        </h3>
      </div>

      <div className="mt-6 grid items-stretch gap-3 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(17rem,0.8fr)] lg:px-16 xl:pl-52 xl:pr-10">
        <RailCard card={card} aspect="wide" fill />

        <aside className="flex flex-col justify-between border border-white/12 bg-white/[0.03] px-5 py-6 sm:px-6 sm:py-7">
          <div>
            <p className="font-mono text-[10px] tracking-[0.28em] text-blue-400">FEATURE 01  45 MIN</p>
            <p className="mt-3 font-heading text-[clamp(1.8rem,3.4vw,2.7rem)] leading-none">A film on a limited clock.</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              Not a commercial that ran long. A picture made lean, made fast, finished like cinema.
            </p>
          </div>

          <ul className="mt-8 space-y-5 border-t border-white/10 pt-5">
            {NOTES.map((note) => (
              <li key={note.code}>
                <p className="font-mono text-[9px] tracking-[0.22em] text-blue-300">{note.code}</p>
                <p className="mt-1 font-heading text-xl leading-none sm:text-2xl">{note.title}</p>
                <p className="mt-2 text-sm text-white/50">{note.body}</p>
              </li>
            ))}
          </ul>

          <Link
            href={card.href}
            className="mt-8 inline-flex w-fit text-[11px] uppercase tracking-[0.2em] text-white/55 hover:text-white"
          >
            Open the picture
          </Link>
        </aside>
      </div>
    </div>
  );
}
