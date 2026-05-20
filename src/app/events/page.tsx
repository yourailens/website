import type { Metadata } from "next";
import Link from "next/link";

export const dynamic = "force-dynamic";
import Navbar from "@/components/Navbar";
import {
  WORKSHOP_SUBTITLE,
  WORKSHOP_TITLE,
  formatInr,
  workshopDiscountPercentOff,
  workshopDateRangeLabel,
  WORKSHOP_LIST_PRICE_INR,
  WORKSHOP_PRICE_INR,
  isWorkshopEarlyBirdActive,
  isWorkshopEventOver,
} from "@/lib/events/workshop-config";

export const metadata: Metadata = {
  title: "Events | YourAILens Studios",
  description: "Workshops and live sessions from YourAILens Studios: AI filmmaking, workflows, and creative technology.",
};

export default async function EventsPage() {
  const early = isWorkshopEarlyBirdActive();
  const pct = workshopDiscountPercentOff();
  const eventOver = isWorkshopEventOver();

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

      <section className="mx-auto max-w-4xl px-6 py-14 lg:px-10">
        <h2 className="font-heading text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
          {eventOver ? "Past events" : "Upcoming"}
        </h2>
        <ul className="mt-6 space-y-6">
          <li>
            <Link
              href="/events/ai-creator-workshop"
              className={`group block rounded-2xl border p-8 shadow-lg transition hover:shadow-xl ${
                eventOver
                  ? "border-slate-200 bg-gradient-to-br from-slate-50 to-white opacity-95 hover:border-slate-300"
                  : "border-blue-100 bg-gradient-to-br from-white to-blue-50/90 shadow-blue-100/40 hover:border-blue-200"
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                  Workshop · 2 days · Live online
                </p>
                {eventOver ? (
                  <span className="rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600">
                    Ended
                  </span>
                ) : null}
              </div>
              <h3
                className={`mt-2 font-heading text-2xl font-black ${
                  eventOver ? "text-slate-700 group-hover:text-slate-900" : "text-slate-900 group-hover:text-blue-800"
                }`}
              >
                {WORKSHOP_TITLE}
              </h3>
              <p className="mt-2 text-slate-700">{WORKSHOP_SUBTITLE}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                    eventOver ? "bg-slate-600 text-white" : "bg-blue-600 text-white"
                  }`}
                >
                  {workshopDateRangeLabel()}
                </span>
                {!eventOver && early ? (
                  <span className="text-sm font-bold text-slate-800">
                    <span className="text-slate-400 line-through">{formatInr(WORKSHOP_LIST_PRICE_INR)}</span>{" "}
                    <span className="text-emerald-600">{formatInr(WORKSHOP_PRICE_INR)}</span>
                    <span className="ml-2 text-xs font-semibold text-emerald-700">({pct}% off)</span>
                  </span>
                ) : !eventOver ? (
                  <span className="text-sm font-bold text-slate-800">{formatInr(WORKSHOP_LIST_PRICE_INR)}</span>
                ) : null}
              </div>
              <p
                className={`mt-6 text-sm font-bold ${eventOver ? "text-slate-500 group-hover:text-slate-700" : "text-blue-600 group-hover:underline"}`}
              >
                {eventOver ? "View workshop details →" : "View details, trailers & register →"}
              </p>
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
