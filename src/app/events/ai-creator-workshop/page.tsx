import type { Metadata } from "next";
import Link from "next/link";
import WorkshopRegisterForm from "./WorkshopRegisterForm";
import {
  WORKSHOP_SUBTITLE,
  formatInr,
  workshopDateRangeLabel,
  workshopSessionTimeLabel,
  workshopUpiId,
  workshopUpiPayeeName,
  WORKSHOP_LIST_PRICE_INR,
  WORKSHOP_PRICE_INR,
} from "@/lib/events/workshop-config";
import { getWorkshopVisualAssets } from "@/lib/events/load-workshop-assets";
import { getWorkshopPublicSnapshot } from "@/lib/events/workshop-snapshot";
import { pickFilmOgImage } from "@/lib/seo/og-image";

function siteUrl() {
  return (process.env.PUBLIC_SITE_URL?.trim() || "https://yourailens.studio").replace(/\/+$/, "");
}

const WORKSHOP_PAGE_TITLE = "AI Creator Workshop | YourAILens Studios";
const WORKSHOP_PAGE_DESCRIPTION = `Two day intensive: AI film workflows, prompts, tools, audio, shot lists, lip sync, plus YourAILens prompts and stock assets. Early bird ${formatInr(WORKSHOP_PRICE_INR)} (list ${formatInr(WORKSHOP_LIST_PRICE_INR)}). April 29 and 30, 2026 · 7 to 11 PM IST.`;

/** Same poster as hero video (first gallery film) — matches film page `pickFilmOgImage` behavior. */
export async function generateMetadata(): Promise<Metadata> {
  const assets = await getWorkshopVisualAssets();
  const heroFilm = assets.films[0] ?? null;
  const og = pickFilmOgImage(siteUrl(), heroFilm?.posterUrl);
  const pageUrl = `${siteUrl()}/events/ai-creator-workshop`;

  return {
    metadataBase: process.env.PUBLIC_SITE_URL ? new URL(process.env.PUBLIC_SITE_URL) : undefined,
    title: WORKSHOP_PAGE_TITLE,
    description: WORKSHOP_PAGE_DESCRIPTION,
    alternates: { canonical: pageUrl },
    openGraph: {
      title: WORKSHOP_PAGE_TITLE,
      description: WORKSHOP_SUBTITLE,
      url: pageUrl,
      siteName: "YourAILens Studios",
      type: "website",
      locale: "en_US",
      images: [
        {
          url: og.url,
          alt: `${WORKSHOP_PAGE_TITLE} — preview`,
          type: og.type,
          ...(og.width != null && og.height != null ? { width: og.width, height: og.height } : {}),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: WORKSHOP_PAGE_TITLE,
      description: WORKSHOP_SUBTITLE,
      images: [{ url: og.url, alt: WORKSHOP_PAGE_TITLE }],
    },
    other: {
      "og:image:secure_url": og.url,
      "og:image:type": og.type,
      ...(og.width != null && og.height != null
        ? { "og:image:width": String(og.width), "og:image:height": String(og.height) }
        : {}),
    },
  };
}

export default async function AiCreatorWorkshopPage() {
  const snapshot = await getWorkshopPublicSnapshot();

  return (
    <>
      <section className="text-center">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
          <div
            className="inline-flex items-center gap-3 rounded-2xl border border-blue-200 bg-gradient-to-b from-white to-blue-50/80 px-5 py-3.5 shadow-md shadow-blue-900/5 ring-1 ring-blue-100"
            role="status"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/25">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Format</p>
              <p className="font-heading text-lg font-black leading-tight text-slate-900">Google Meet</p>
              <p className="mt-0.5 text-xs font-medium text-slate-600">Live online. Join link in your confirmation email</p>
            </div>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {snapshot.soldOut ? <span className="font-bold text-amber-700">Waitlist open · </span> : null}
            {workshopDateRangeLabel()}
          </p>
          <p className="text-sm font-semibold text-slate-700">{workshopSessionTimeLabel()}</p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-700">
          A hands on immersion into modern AI filmmaking, from first prompts to advanced pipelines. We go from{" "}
          <strong className="text-slate-900">zero to advanced</strong> across two full days so you leave with repeatable workflows, not
          just theory.
        </p>
      </section>

      <section className="mt-14 grid gap-6 sm:grid-cols-2">
        <Link
          href="/events/ai-creator-workshop/day-1"
          className="group relative block overflow-hidden rounded-3xl text-left shadow-xl shadow-slate-900/25 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/30"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.4] mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 30%, rgba(56,189,248,0.35) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(99,102,241,0.25) 0%, transparent 40%)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-1 top-2 select-none font-heading text-[clamp(5rem,18vw,7.5rem)] font-black leading-none text-white/[0.06] transition duration-500 group-hover:text-white/[0.09]"
            aria-hidden
          >
            01
          </span>
          <div className="relative flex min-h-[280px] flex-col justify-between p-7 sm:min-h-[300px] sm:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-sky-400/30 bg-sky-500/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-sky-200">
                  Day 1
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-100/80">
                  Wed · Apr 29
                </span>
              </div>
              <h2 className="mt-5 font-heading text-[clamp(1.35rem,3.5vw,1.65rem)] font-black leading-tight tracking-tight text-white">
                Story world &amp; toolchain
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-blue-100/85">
                Microfilm walkthrough, character sheets, locations, outfits, props, prompt structure, tools landscape &amp; 1:1 model fit.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              <span className="text-[11px] font-medium text-blue-200/70">Worldbuilding · prompts · stack</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-slate-900 shadow-lg transition group-hover:bg-sky-100">
                Open day
                <span className="inline-block transition-transform group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </div>
        </Link>

        <Link
          href="/events/ai-creator-workshop/day-2"
          className="group relative block overflow-hidden rounded-3xl text-left shadow-xl shadow-violet-950/30 ring-1 ring-white/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-900/35"
        >
          <div
            className="absolute inset-0 bg-gradient-to-br from-violet-950 via-purple-900 to-fuchsia-950"
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-50 mix-blend-soft-light"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 80% 50% at 10% 90%, rgba(244,114,182,0.35) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 90% 10%, rgba(167,139,250,0.4) 0%, transparent 45%)",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40' stroke='%23ffffff' stroke-opacity='0.15' fill='none'/%3E%3C/svg%3E")`,
            }}
            aria-hidden
          />
          <span
            className="pointer-events-none absolute -right-1 top-2 select-none font-heading text-[clamp(5rem,18vw,7.5rem)] font-black leading-none text-white/[0.06] transition duration-500 group-hover:text-white/[0.09]"
            aria-hidden
          >
            02
          </span>
          <div className="relative flex min-h-[280px] flex-col justify-between p-7 sm:min-h-[300px] sm:p-8">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg border border-fuchsia-400/35 bg-fuchsia-500/20 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-fuchsia-100">
                  Day 2
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-100/90">
                  Thu · Apr 30
                </span>
              </div>
              <h2 className="mt-5 font-heading text-[clamp(1.35rem,3.5vw,1.65rem)] font-black leading-tight tracking-tight text-white">
                Audio, shots &amp; advanced visuals
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-violet-100/90">
                Dialogues, shot lists for long form AI video, lip sync, action, expressions, and complex prompts under control.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
              <span className="text-[11px] font-medium text-fuchsia-200/75">Sound · shots · performance</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black uppercase tracking-wide text-violet-950 shadow-lg transition group-hover:bg-fuchsia-100">
                Open day
                <span className="inline-block transition-transform group-hover:translate-x-0.5" aria-hidden>
                  →
                </span>
              </span>
            </div>
          </div>
        </Link>
      </section>

      <section className="mt-16" aria-labelledby="why-workshop-heading">
        <div className="text-center">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Why this workshop</p>
          <h2 id="why-workshop-heading" className="mt-2 font-heading text-2xl font-black text-slate-900 sm:text-[1.65rem]">
            Clarity beats burning credits
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
            Most spend isn’t “AI is expensive”: it’s <strong className="text-slate-800">unclear intent</strong>, unstable references, and
            retries that should never have started. Here’s the split.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/90 to-white p-7 shadow-lg shadow-emerald-900/5 sm:p-8">
            <h3 className="flex items-center gap-2 font-heading text-lg font-black text-slate-900">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-700/25"
                aria-hidden
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              Why it matters
            </h3>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">End to end pipeline</strong>: story, references, shots, and finish live in one
                  workflow instead of scattered experiments.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">Fewer blind retries</strong>: you learn what to lock first (characters, locations,
                  audio intent) so generations aren’t guesswork.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">Tool choices that fit you</strong>: shortlist platforms by budget, timeline, and
                  look, not hype charts or default “best model” lists.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200/80"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">Repeatable habits</strong>: prompts, shot thinking, and iteration discipline you can
                  reuse on the next project, not one off tricks.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-rose-200/90 bg-gradient-to-b from-rose-50/90 to-white p-7 shadow-lg shadow-rose-900/5 sm:p-8">
            <h3 className="flex items-center gap-2 font-heading text-lg font-black text-slate-900">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white shadow-sm shadow-rose-800/25"
                aria-hidden
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </span>
              Where credits get wasted
            </h3>
            <ul className="mt-5 space-y-4 text-sm leading-relaxed text-slate-700">
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 ring-1 ring-rose-200/90"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">No spine</strong>: generating scenes before the story, shot list, or references are
                  settled. Every new clip fights the last one.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 ring-1 ring-rose-200/90"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">Model hopping</strong>: switching tools after every failed render instead of fixing
                  intent, prompts, or references.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 ring-1 ring-rose-200/90"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">Pretty frames, wrong problem</strong>: burning runs on lighting or scenery when
                  character consistency or dialogue timing is what’s broken.
                </span>
              </li>
              <li className="flex gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700 ring-1 ring-rose-200/90"
                  aria-hidden
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </span>
                <span>
                  <strong className="text-slate-900">Long generations too early</strong>: expensive clips before audio, performance, and
                  edit rhythm are even roughly locked.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 sm:p-10">
        <h2 className="font-heading text-2xl font-black text-slate-900">What you get</h2>
        <ul className="mt-6 space-y-4 text-slate-700">
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">✓</span>
            <span>
              <strong className="text-slate-900">Complete prompt library access</strong>: production ready structures we use on real
              campaigns.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">✓</span>
            <span>
              <strong className="text-slate-900">Stock images &amp; video from YourAILens Studios</strong>: cleared for your workshop
              projects and experiments during and after the program.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">✓</span>
            <span>
              <strong className="text-slate-900">Direct time with our team</strong>: office hour style blocks to match models and stacks
              to your goals.
            </span>
          </li>
        </ul>
      </section>

      <section className="mt-14">
        <h2 className="font-heading text-xl font-black text-slate-900">FAQ</h2>
        <dl className="mt-6 space-y-5 text-sm text-slate-700">
          <div>
            <dt className="font-bold text-slate-900">When exactly is it?</dt>
            <dd className="mt-1">
              {workshopDateRangeLabel()}. {workshopSessionTimeLabel()}. Same schedule both evenings. Calendar details come in your
              confirmation email.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-900">How do I join?</dt>
            <dd className="mt-1">
              We’ll send a <strong>Google Meet</strong> link before the event. If you need a different format, reply to the confirmation
              email or message us on Instagram.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-900">What if I’m a complete beginner?</dt>
            <dd className="mt-1">
              That’s the point: we start from foundations and ramp to advanced techniques. Bring curiosity; we’ll meet you where you are.
            </dd>
          </div>
          <div>
            <dt className="font-bold text-slate-900">Pricing?</dt>
            <dd className="mt-1">
              Early bird is <strong>{formatInr(WORKSHOP_PRICE_INR)}</strong> (list{" "}
              <span className="line-through">{formatInr(WORKSHOP_LIST_PRICE_INR)}</span>) for a limited window: see the banner
              above. After that, standard list pricing applies.
            </dd>
          </div>
        </dl>
      </section>

      <section id="register" className="mt-16 scroll-mt-28 rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/80 to-white p-8 shadow-inner shadow-blue-100 sm:p-10">
        <h2 className="text-center font-heading text-2xl font-black text-slate-900">Save your seat</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-slate-600">
          Add your details, pay via UPI, then upload your payment screenshot. Confirmation is sent after we receive payment proof. Meet link
          before {workshopDateRangeLabel().split("·")[0]?.trim() ?? "the workshop"}.
        </p>
        <div className="mx-auto mt-8 max-w-lg">
          <WorkshopRegisterForm
            soldOut={snapshot.soldOut}
            earlyBirdActive={snapshot.earlyBirdActive}
            upiId={workshopUpiId()}
            upiPayeeName={workshopUpiPayeeName()}
          />
        </div>
      </section>
    </>
  );
}
