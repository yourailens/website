import type { Metadata } from "next";
import Link from "next/link";
import YailiansShell from "@/components/yailians/YailiansShell";
import {
  YAILIANS_WORLD_KINDS,
  yailiansWorldKindLabel,
  type YailiansWorldKind,
} from "@/data/yailians";
import { getPublishedWorld, getYailiansSite } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getYailiansSite();
  return {
    title: `World · ${site.title}`,
    description: `Worlds, creatures, and characters from ${site.title}.`,
  };
}

export default async function YailiansWorldPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const sp = await searchParams;
  const kindFilter = YAILIANS_WORLD_KINDS.includes(sp.kind as YailiansWorldKind)
    ? (sp.kind as YailiansWorldKind)
    : null;
  const items = await getPublishedWorld(kindFilter ? { kind: kindFilter } : undefined);

  return (
    <YailiansShell activeHref="/yailians/world">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/yailians"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
        >
          ← YAILIANS
        </Link>
        <p className="mt-6 font-mono text-[10px] tracking-[0.28em] text-emerald-400/90">WORLD</p>
        <h1 className="mt-3 font-body text-[clamp(2rem,5vw,3.5rem)] font-semibold leading-none tracking-tight">
          Inside YAILIANS
        </h1>
        <p className="mt-4 max-w-xl text-sm text-white/50">
          Dive into the worlds, creatures, characters, and craft of the film.
        </p>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href="/yailians/world"
            className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${
              !kindFilter ? "bg-white text-black" : "border border-white/15 text-white/60 hover:text-white"
            }`}
          >
            All
          </Link>
          {YAILIANS_WORLD_KINDS.map((k) => (
            <Link
              key={k}
              href={`/yailians/world?kind=${k}`}
              className={`rounded-full px-3.5 py-2 text-[12px] font-semibold transition ${
                kindFilter === k
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/60 hover:text-white"
              }`}
            >
              {yailiansWorldKindLabel(k)}
            </Link>
          ))}
        </div>

        <div className="mt-8 columns-2 gap-2 sm:columns-3 lg:columns-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="mb-2 break-inside-avoid overflow-hidden rounded-md bg-zinc-900"
            >
              {item.media_type === "video" && !item.poster_url ? (
                <video
                  src={item.media_url}
                  className="w-full object-cover"
                  muted
                  playsInline
                  preload="metadata"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.poster_url || item.media_url}
                  alt={item.title}
                  className="w-full object-cover"
                />
              )}
              <div className="px-2.5 py-2.5">
                <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-sky-300/80">
                  {yailiansWorldKindLabel(item.kind)}
                </p>
                <p className="mt-0.5 text-[13px] font-medium text-white">{item.title}</p>
                {item.caption ? (
                  <p className="mt-1 text-[11px] leading-relaxed text-white/45">{item.caption}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
        {!items.length ? (
          <p className="mt-10 text-sm text-white/40">No world pieces in this view yet.</p>
        ) : null}
      </div>
    </YailiansShell>
  );
}
