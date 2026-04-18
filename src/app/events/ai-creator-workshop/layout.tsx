import Link from "next/link";
import Navbar from "@/components/Navbar";

/** Fresh seat counts + gallery assets from Supabase */
export const dynamic = "force-dynamic";
import WorkshopInstagramRow from "@/components/events/WorkshopInstagramRow";
import WorkshopMediaBento from "@/components/events/WorkshopMediaBento";
import WorkshopPromoStrip from "@/components/events/WorkshopPromoStrip";
import WorkshopVisualHero from "@/components/events/WorkshopVisualHero";
import { getWorkshopVisualAssets } from "@/lib/events/load-workshop-assets";
import { getWorkshopPublicSnapshot } from "@/lib/events/workshop-snapshot";
import {
  WORKSHOP_SUBTITLE,
  WORKSHOP_TITLE,
  workshopDateRangeLabel,
  workshopSessionTimeLabel,
} from "@/lib/events/workshop-config";
import WorkshopNav from "./WorkshopNav";

export default async function AiCreatorWorkshopLayout({ children }: { children: React.ReactNode }) {
  const [assets, snapshot] = await Promise.all([getWorkshopVisualAssets(), getWorkshopPublicSnapshot()]);
  const heroFilm = assets.films[0] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/90 via-white to-sky-50/50 text-slate-900 antialiased">
      <Navbar />
      <section className="relative min-h-[min(52vh,560px)] overflow-hidden border-b border-blue-900/20">
        <WorkshopVisualHero heroFilm={heroFilm} />
        <div className="relative z-10 flex min-h-[min(52vh,560px)] flex-col justify-end px-4 pb-10 pt-24 text-center sm:px-6 sm:pb-12 sm:pt-28">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-blue-200/90">Events</p>
          <h1
            className="mt-3 font-heading text-[clamp(1.75rem,4vw,2.85rem)] font-black tracking-tight text-white drop-shadow-lg"
            style={{ letterSpacing: "-0.03em" }}
          >
            {WORKSHOP_TITLE}
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-medium text-blue-100/95 sm:text-base">{WORKSHOP_SUBTITLE}</p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-2 text-[13px] font-semibold text-white">
            <span className="rounded-full bg-white/15 px-4 py-1.5 ring-1 ring-white/20 backdrop-blur-sm">
              {workshopDateRangeLabel()}
            </span>
            <span className="rounded-full bg-emerald-500/25 px-3 py-1.5 text-emerald-100 ring-1 ring-emerald-400/30">
              {workshopSessionTimeLabel()}
            </span>
          </p>
          <p className="mt-6">
            <Link
              href="/events"
              className="text-[12px] font-semibold text-blue-200 underline-offset-4 transition hover:text-white hover:underline"
            >
              ← All events
            </Link>
          </p>
        </div>
      </section>

      <WorkshopPromoStrip snapshot={snapshot} />
      <WorkshopNav seatsLeft={snapshot.seatsLeft} soldOut={snapshot.soldOut} />
      <WorkshopMediaBento images={assets.images} films={assets.films} />
      <WorkshopInstagramRow links={assets.instagram} />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">{children}</div>
    </div>
  );
}
