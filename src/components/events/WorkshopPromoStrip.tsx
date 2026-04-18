import Link from "next/link";
import {
  formatInr,
  workshopDiscountPercentOff,
  workshopEarlyBirdDeadlineLabel,
  WORKSHOP_LIST_PRICE_INR,
  WORKSHOP_PRICE_INR,
} from "@/lib/events/workshop-config";
import type { WorkshopPublicSnapshot } from "@/lib/events/workshop-snapshot";
import WorkshopEarlyBirdTimer from "./WorkshopEarlyBirdTimer";

export default function WorkshopPromoStrip({ snapshot }: { snapshot: WorkshopPublicSnapshot }) {
  const pct = workshopDiscountPercentOff();
  const showDeal = snapshot.earlyBirdActive;

  return (
    <div className="border-b border-blue-200/40 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-4 py-4 text-center text-[13px] text-white sm:py-5">
      <div className="mx-auto flex max-w-5xl flex-col flex-wrap items-center justify-center gap-3 sm:flex-row sm:gap-8">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-rose-500/90 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-sm">
            {snapshot.soldOut ? "Sold out" : `${snapshot.seatsLeft} seats left`}
          </span>
          <span className="text-blue-100/80">·</span>
          <span className="font-semibold text-white/95">20 seats only</span>
        </div>

        <div className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />

        <div className="flex flex-col items-center gap-1 sm:items-start">
          {showDeal ? (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-300/95">{pct}% off</span>
                <span className="text-lg font-black text-white">
                  <span className="mr-2 text-base font-semibold text-blue-200/80 line-through decoration-white/50">
                    {formatInr(WORKSHOP_LIST_PRICE_INR)}
                  </span>
                  {formatInr(WORKSHOP_PRICE_INR)}
                </span>
                <span className="text-[11px] text-blue-100/85">per seat</span>
                {snapshot.soldOut ? (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white">
                    Sold out
                  </span>
                ) : null}
              </div>
              {!snapshot.soldOut ? (
                <p className="max-w-md text-[11px] leading-snug text-blue-100/80">
                  Early bird rate: {workshopEarlyBirdDeadlineLabel()}. <WorkshopEarlyBirdTimer />
                </p>
              ) : (
                <p className="max-w-md text-[11px] text-blue-100/75">Early bird window was active. Cohort full.</p>
              )}
            </>
          ) : (
            <div className="flex flex-wrap items-baseline justify-center gap-2 gap-y-1">
              <span className="text-lg font-black text-white">{formatInr(WORKSHOP_LIST_PRICE_INR)}</span>
              <span className="text-[11px] text-blue-100/85">per seat · standard rate</span>
            </div>
          )}
        </div>

        <div className="hidden h-8 w-px bg-white/15 sm:block" aria-hidden />

        <Link
          href="/events/ai-creator-workshop#register"
          className="rounded-full bg-white px-5 py-2 text-xs font-black uppercase tracking-wide text-blue-900 shadow-md transition hover:bg-blue-50"
        >
          {snapshot.soldOut ? "Join waitlist" : "Register"}
        </Link>
      </div>
    </div>
  );
}
