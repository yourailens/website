import type { Metadata } from "next";
import Link from "next/link";
import YailiansShell from "@/components/yailians/YailiansShell";
import { getPublishedScreenings, getYailiansSite } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getYailiansSite();
  return {
    title: `Screenings · ${site.title}`,
    description: `Upcoming and finished screenings of ${site.title}.`,
  };
}

function formatWhen(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ScreeningCard({
  s,
}: {
  s: Awaited<ReturnType<typeof getPublishedScreenings>>[number];
}) {
  return (
    <li className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      {s.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={s.cover_url} alt="" className="aspect-[16/9] w-full object-cover" />
      ) : (
        <div className="aspect-[16/9] bg-zinc-950" />
      )}
      <div className="p-5">
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-emerald-300/80">
          {s.status}
          {formatWhen(s.starts_at) ? ` · ${formatWhen(s.starts_at)}` : ""}
        </p>
        <h3 className="mt-2 font-semibold text-white">{s.title}</h3>
        <p className="mt-1 text-sm text-white/50">
          {[s.venue, s.city].filter(Boolean).join(" · ") || "—"}
        </p>
        {s.notes ? <p className="mt-3 text-sm leading-relaxed text-white/55">{s.notes}</p> : null}
        {s.ticket_url ? (
          <a
            href={s.ticket_url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-black"
          >
            Tickets →
          </a>
        ) : null}
      </div>
    </li>
  );
}

export default async function YailiansScreeningsPage() {
  const [upcoming, past] = await Promise.all([
    getPublishedScreenings({ status: "upcoming" }),
    getPublishedScreenings({ status: "past" }),
  ]);

  return (
    <YailiansShell activeHref="/yailians/screenings">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/yailians"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
        >
          ← YAILIANS
        </Link>
        <p className="mt-6 font-mono text-[10px] tracking-[0.28em] text-emerald-400/90">SCREENINGS</p>
        <h1 className="mt-3 font-body text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-tight">
          On the screen
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/50">
          Upcoming dates and the shows already finished.
        </p>

        <section className="mt-12">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">Upcoming</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {upcoming.map((s) => (
              <ScreeningCard key={s.id} s={s} />
            ))}
          </ul>
          {!upcoming.length ? (
            <p className="mt-4 text-sm text-white/40">No upcoming screenings yet.</p>
          ) : null}
        </section>

        <section className="mt-14">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.24em] text-white/40">Finished</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {past.map((s) => (
              <ScreeningCard key={s.id} s={s} />
            ))}
          </ul>
          {!past.length ? (
            <p className="mt-4 text-sm text-white/40">No finished screenings logged yet.</p>
          ) : null}
        </section>
      </div>
    </YailiansShell>
  );
}
