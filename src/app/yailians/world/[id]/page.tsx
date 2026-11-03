import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CinemaFrame from "@/components/yailians/CinemaFrame";
import WorldPlayer from "@/components/yailians/WorldPlayer";
import YailiansShell from "@/components/yailians/YailiansShell";
import { yailiansWorldKindLabel } from "@/data/yailians";
import { getPublishedWorldItem, getYailiansSite } from "@/lib/yailians/load";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Ctx): Promise<Metadata> {
  const { id } = await params;
  const [site, item] = await Promise.all([getYailiansSite(), getPublishedWorldItem(id)]);
  if (!item) return { title: `World · ${site.title}` };
  return {
    title: `${item.title} · ${site.title}`,
    description: item.caption || `${yailiansWorldKindLabel(item.kind)} from ${site.title}.`,
  };
}

export default async function YailiansWorldPiecePage({ params }: Ctx) {
  const { id } = await params;
  const item = await getPublishedWorldItem(id);
  if (!item) notFound();

  const video = item.media_type === "video";

  return (
    <YailiansShell activeHref="/yailians/world">
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/yailians/world"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-300/80 transition hover:text-sky-200"
        >
          ← World
        </Link>
        <p className="mt-6 font-mono text-[10px] tracking-[0.28em] text-emerald-400/90">
          {yailiansWorldKindLabel(item.kind)}
        </p>
        <h1 className="mt-3 font-body text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-none tracking-tight">
          {item.title}
        </h1>
        {item.caption ? <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/55">{item.caption}</p> : null}

        <div className="mt-8">
          <CinemaFrame>
            {video ? (
              <WorldPlayer src={item.media_url} poster={item.poster_url} title={item.title} />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.media_url} alt={item.title} className="block w-full bg-black object-contain" />
            )}
          </CinemaFrame>
        </div>
      </div>
    </YailiansShell>
  );
}
