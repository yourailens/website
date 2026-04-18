import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
import Navbar from "@/components/Navbar";
import WorkshopInstagramRow from "@/components/events/WorkshopInstagramRow";
import WorkshopMediaBento from "@/components/events/WorkshopMediaBento";
import { getWorkshopVisualAssets } from "@/lib/events/load-workshop-assets";
import {
  WORKSHOP_SUBTITLE,
  WORKSHOP_TITLE,
  formatInr,
  workshopDiscountPercentOff,
  workshopDateRangeLabel,
  WORKSHOP_LIST_PRICE_INR,
  WORKSHOP_PRICE_INR,
  isWorkshopEarlyBirdActive,
} from "@/lib/events/workshop-config";

export const metadata: Metadata = {
  title: "Events | YourAILens Studios",
  description: "Workshops and live sessions from YourAILens Studios: AI filmmaking, workflows, and creative technology.",
};

export default async function EventsPage() {
  const assets = await getWorkshopVisualAssets();
  const early = isWorkshopEarlyBirdActive();
  const pct = workshopDiscountPercentOff();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/80 to-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600">Events</span>
          <h1
            className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-black text-slate-900"
            style={{ letterSpacing: "-0.03em" }}
          >
            Learn with us: live.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-700">
            Hands-on workshops built for creators, marketers, and filmmakers who want AI workflows that hold up in production.
          </p>
        </div>
      </section>

      <WorkshopMediaBento images={assets.images} films={assets.films} />
      <WorkshopInstagramRow links={assets.instagram} />

      <section className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Upcoming</h2>
        <ul className="mt-6 space-y-6">
          <li>
            <Link
              href="/events/ai-creator-workshop"
              className="group block rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/90 p-8 shadow-lg shadow-blue-100/40 transition hover:border-blue-200 hover:shadow-xl"
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Workshop · 2 days · Live online</p>
              <h3 className="mt-2 font-heading text-2xl font-black text-slate-900 group-hover:text-blue-800">{WORKSHOP_TITLE}</h3>
              <p className="mt-2 text-slate-700">{WORKSHOP_SUBTITLE}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
                  {workshopDateRangeLabel()}
                </span>
                {early ? (
                  <span className="text-sm font-bold text-slate-800">
                    <span className="text-slate-400 line-through">{formatInr(WORKSHOP_LIST_PRICE_INR)}</span>{" "}
                    <span className="text-emerald-600">{formatInr(WORKSHOP_PRICE_INR)}</span>
                    <span className="ml-2 text-xs font-semibold text-emerald-700">({pct}% off)</span>
                  </span>
                ) : (
                  <span className="text-sm font-bold text-slate-800">{formatInr(WORKSHOP_LIST_PRICE_INR)}</span>
                )}
              </div>
              <p className="mt-6 text-sm font-bold text-blue-600 group-hover:underline">View details, trailers &amp; register →</p>
            </Link>
          </li>
        </ul>
      </section>

    </div>
  );
}
