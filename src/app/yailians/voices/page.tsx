import type { Metadata } from "next";
import Link from "next/link";
import YailiansShell from "@/components/yailians/YailiansShell";
import { getPublishedVoices, getYailiansSite } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getYailiansSite();
  return {
    title: `Voices · ${site.title}`,
    description: `What people think about ${site.title}.`,
  };
}

export default async function YailiansVoicesPage() {
  const voices = await getPublishedVoices();

  return (
    <YailiansShell activeHref="/yailians/voices">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/yailians"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
        >
          ← YAILIANS
        </Link>
        <p className="mt-6 font-mono text-[10px] tracking-[0.28em] text-emerald-400/90">VOICES</p>
        <h1 className="mt-3 font-body text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-tight">
          What people think
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/50">
          A gallery of reactions and conversations around the film.
        </p>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {voices.map((v) => (
            <li key={v.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              {v.portrait_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={v.portrait_url}
                  alt=""
                  className="mb-4 h-14 w-14 rounded-full object-cover"
                />
              ) : null}
              <p className="text-[15px] leading-relaxed text-white/80">“{v.quote}”</p>
              <p className="mt-4 text-sm font-semibold text-white">{v.name}</p>
              {v.role ? <p className="text-xs text-white/40">{v.role}</p> : null}
              {v.video_url ? (
                <a
                  href={v.video_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-semibold text-sky-300/90 hover:text-sky-200"
                >
                  Watch clip →
                </a>
              ) : null}
            </li>
          ))}
        </ul>
        {!voices.length ? (
          <p className="mt-10 text-sm text-white/40">No voices published yet.</p>
        ) : null}
      </div>
    </YailiansShell>
  );
}
