import Link from "next/link";
import {
  formatInr,
  workshopDiscountPercentOff,
  workshopEarlyBirdDeadlineLabel,
  WORKSHOP_LIST_PRICE_INR,
  WORKSHOP_PRICE_INR,
  WORKSHOP_SEATS_LEFT_DISPLAY,
  WORKSHOP_SEATS_TOTAL,
} from "@/lib/events/workshop-config";
import type { WorkshopPublicSnapshot } from "@/lib/events/workshop-snapshot";
import WorkshopEarlyBirdTimer from "./WorkshopEarlyBirdTimer";

export default function WorkshopPromoStrip({ snapshot }: { snapshot: WorkshopPublicSnapshot }) {
  const pct = workshopDiscountPercentOff();
  const showDeal = snapshot.earlyBirdActive;

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-5 py-12 text-white sm:px-8 sm:py-14 lg:px-12 lg:py-16">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-30%,rgba(56,189,248,0.18),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.04),transparent_35%,rgba(15,23,42,0.5))]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(220px,40vh)] max-w-6xl flex-col justify-center gap-10 lg:min-h-0 lg:flex-row lg:items-stretch lg:gap-0 lg:py-2">
        <div className="flex min-w-0 flex-1 flex-col justify-center text-center lg:max-w-md lg:pr-10 lg:text-left">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.35em] text-sky-300/90 sm:text-[11px]">Pricing &amp; cohort</p>
          {snapshot.soldOut ? (
            <p className="mt-4 text-base font-medium leading-relaxed text-blue-100/90 sm:text-lg">This cohort is full.</p>
          ) : (
            <>
              <p className="mt-4 text-base font-medium leading-relaxed text-white/95 sm:text-lg">
                Small cohort, capped at {WORKSHOP_SEATS_TOTAL} so everyone gets real attention.
              </p>
              <p className="mt-4 inline-flex max-w-full flex-wrap items-center justify-center gap-x-2 rounded-xl border border-white/25 bg-white/[0.12] px-4 py-2.5 text-left shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] sm:justify-start">
                <span className="text-xs font-medium text-sky-200/90">Availability</span>
                <span className="text-sm font-semibold tabular-nums tracking-tight text-sky-100 sm:text-base">
                  about {WORKSHOP_SEATS_LEFT_DISPLAY} spots left
                </span>
              </p>
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3 border-t border-white/15 pt-10 text-center sm:gap-4 lg:border-l lg:border-t-0 lg:pl-10 lg:pr-8 lg:pt-0 lg:text-left lg:items-start">
          {showDeal ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-start">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{pct}% off</span>
                <div className="flex flex-wrap items-baseline justify-center gap-2 gap-y-1">
                  <span className="text-2xl font-black tabular-nums text-white sm:text-3xl">
                    <span className="mr-2 text-xl font-semibold text-blue-200/85 line-through decoration-white/45 sm:text-2xl">
                      {formatInr(WORKSHOP_LIST_PRICE_INR)}
                    </span>
                    {formatInr(WORKSHOP_PRICE_INR)}
                  </span>
                  <span className="text-sm text-blue-100/90">per seat</span>
                </div>
                {snapshot.soldOut ? (
                  <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white ring-1 ring-white/20">
                    Sold out
                  </span>
                ) : null}
              </div>
              {!snapshot.soldOut ? (
                <p className="max-w-lg text-sm leading-relaxed text-blue-100/85 sm:text-[15px]">
                  Early bird rate: {workshopEarlyBirdDeadlineLabel()}. <WorkshopEarlyBirdTimer />
                </p>
              ) : (
                <p className="max-w-lg text-sm text-blue-100/80">Early bird window was active. Cohort full.</p>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-baseline justify-center gap-2 gap-y-1 lg:justify-start">
              <span className="text-3xl font-black tabular-nums text-white">{formatInr(WORKSHOP_LIST_PRICE_INR)}</span>
              <span className="text-sm text-blue-100/90">per seat, standard rate</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center border-t border-white/15 pt-10 lg:max-w-[240px] lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0 lg:items-end">
          <Link
            href="/events/ai-creator-workshop#register"
            className="inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-3.5 text-sm font-black uppercase tracking-[0.15em] text-blue-950 shadow-lg shadow-blue-950/30 transition hover:bg-sky-50 hover:shadow-xl lg:w-auto lg:min-w-[11rem]"
          >
            {snapshot.soldOut ? "Join waitlist" : "Register"}
          </Link>
        </div>
      </div>
    </div>
  );
}
