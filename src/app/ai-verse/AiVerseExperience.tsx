"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  ottCutAspectLabel,
  ottCutFrameClass,
  ottCutYoutubeId,
  type OttCut,
} from "@/data/ott-cuts";
import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";

const PILLARS = [
  {
    title: "Learn in public",
    body: "Share takes, prompts, and process with people who actually ship AI film and ads — not theory threads.",
  },
  {
    title: "Build together",
    body: "Workshops, studio nights, and collab threads so you leave with footage, not just slides.",
  },
  {
    title: "Get seen",
    body: "Strong community cuts surface on this channel and across YAIL — the desk is watching for craft.",
  },
] as const;

const FOR_WHO = [
  "AI filmmakers and editors",
  "Brand and performance creative teams",
  "Founders shipping with generative media",
  "Students and mid-career switches into AI production",
] as const;

function CutThumb({ cut }: { cut: OttCut }) {
  const yt = ottCutYoutubeId(cut.media_url);
  if (yt) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" className="h-full w-full object-cover" />;
  }
  if (cut.media_type === "video") {
    return (
      <video
        src={cut.media_url}
        poster={cut.poster_url ?? undefined}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cut.media_url} alt="" className="h-full w-full object-cover" />;
}

function ShowcaseCard({ cut, onOpen }: { cut: OttCut; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group text-left"
    >
      <div className={`relative overflow-hidden bg-zinc-900 ${ottCutFrameClass(cut.aspect_ratio)}`}>
        <CutThumb cut={cut} />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
        <span className="absolute bottom-2 left-2 right-2">
          <span className="font-mono text-[8px] uppercase tracking-[0.18em] text-sky-300/80">
            {ottCutAspectLabel(cut.aspect_ratio)}
          </span>
          <span className="mt-0.5 block truncate text-sm font-medium text-white">{cut.caption}</span>
        </span>
        {cut.media_type === "video" ? (
          <span className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#fafafa] text-black opacity-0 shadow-lg transition group-hover:opacity-100">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <path d="M3 1.5v11l9-5.5L3 1.5z" />
            </svg>
          </span>
        ) : null}
      </div>
    </button>
  );
}

function Lightbox({ cut, onClose }: { cut: OttCut; onClose: () => void }) {
  const yt = ottCutYoutubeId(cut.media_url);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal>
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-xl border border-white/15 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="truncate pr-4 text-sm font-medium text-white">{cut.caption}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs text-white/70 hover:text-white"
          >
            Close
          </button>
        </div>
        <div className="relative aspect-video bg-black">
          {yt ? (
            <iframe
              title={cut.caption}
              src={`https://www.youtube.com/embed/${yt}?rel=0&modestbranding=1`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : cut.media_type === "video" ? (
            <video
              src={cut.media_url}
              poster={cut.poster_url ?? undefined}
              controls
              playsInline
              controlsList="nodownload noplaybackrate noremoteplayback"
              className="absolute inset-0 h-full w-full object-contain"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cut.media_url} alt="" className="absolute inset-0 h-full w-full object-contain" />
          )}
        </div>
        {cut.description ? (
          <p className="border-t border-white/10 px-4 py-3 text-sm text-white/55">{cut.description}</p>
        ) : null}
      </div>
    </div>
  );
}

export default function AiVerseExperience({
  cuts,
  miscCuts = [],
}: {
  cuts: OttCut[];
  miscCuts?: OttCut[];
}) {
  const [active, setActive] = useState<OttCut | null>(null);
  const featured = useMemo(() => cuts.slice(0, 12), [cuts]);
  const allCuts = useMemo(() => [...cuts, ...miscCuts], [cuts, miscCuts]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const slug = window.location.hash.replace(/^#/, "");
    if (!slug) return;
    if (slug === "misc") {
      document.getElementById("misc")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const found = allCuts.find((c) => c.slug === slug);
    if (found) setActive(found);
  }, [allCuts]);

  return (
    <div className="ott-home min-h-screen bg-black font-body text-white">
      <Navbar />

      {/* Hero — one composition */}
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 20% 0%, rgba(14,165,233,0.18), transparent 55%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(255,255,255,0.06), transparent 50%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-5 pb-20 pt-28 sm:px-8 sm:pb-28 sm:pt-36">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-sky-400/90">YAIL · Community</p>
          <h1 className="mt-4 max-w-3xl font-body text-[clamp(2.6rem,7vw,5rem)] font-semibold leading-[0.95] tracking-tight">
            The AI production community for people who ship.
          </h1>
          <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
            A professional home for filmmakers, advertisers, and builders working with generative media —
            process, critique, workshops, and work that belongs on a real desk.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-sky-100"
            >
              Request to join
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center rounded-md border border-white/25 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-white/50 hover:text-white"
            >
              See events
            </Link>
          </div>
        </div>
      </section>

      {/* Trust / positioning */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-3 md:gap-8">
          {[
            { k: "Studio-led", v: "Curated by YourAILens — the same team shipping ads and films." },
            { k: "Craft first", v: "Taste, pipelines, and delivery — not hype demos." },
            { k: "Bangalore + remote", v: "Meetups and workshops on the ground; async for everywhere else." },
          ].map((item) => (
            <div key={item.k}>
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-sky-400/80">{item.k}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{item.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section className="border-b border-white/10">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">Membership</p>
          <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.75rem,3.5vw,2.6rem)] font-semibold leading-tight tracking-tight">
            Built for practitioners.
          </h2>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {FOR_WHO.map((line) => (
              <li
                key={line}
                className="flex items-start gap-3 border-t border-white/10 pt-4 text-[15px] text-white/75"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pillars */}
      <section className="border-b border-white/10 bg-[#080808]">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">What you get</p>
          <h2 className="mt-3 max-w-2xl font-body text-[clamp(1.75rem,3.5vw,2.6rem)] font-semibold leading-tight tracking-tight">
            How the community runs.
          </h2>
          <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8">
            {PILLARS.map((p, i) => (
              <div key={p.title}>
                <p className="font-mono text-[10px] tracking-[0.22em] text-sky-400/70">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 font-body text-xl font-semibold tracking-tight">{p.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase */}
      <section id="showcase" className="border-b border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">From the floor</p>
              <h2 className="mt-3 font-body text-[clamp(1.75rem,3.5vw,2.6rem)] font-semibold leading-tight tracking-tight">
                Community cuts
              </h2>
            </div>
            <div className="flex flex-col items-end gap-3">
              <p className="max-w-xs text-right text-sm text-white/45">
                Work shared by the lot — published from the studio desk.
              </p>
              {miscCuts.length ? (
                <a
                  href="#misc"
                  className="rounded-md border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-sky-200 transition hover:border-sky-300/60 hover:bg-sky-500/16"
                >
                  Misc →
                </a>
              ) : null}
            </div>
          </div>

          {featured.length ? (
            <div className="mt-10 columns-1 gap-3 sm:columns-2 lg:columns-3 sm:gap-4">
              {featured.map((cut) => (
                <div key={cut.id} className="mb-3 break-inside-avoid sm:mb-4">
                  <ShowcaseCard cut={cut} onOpen={() => setActive(cut)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 border border-dashed border-white/15 px-6 py-16 text-center">
              <p className="font-body text-lg font-semibold">Cuts are landing soon</p>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/50">
                Community shares from the desk will show here. Until then, join the list and come to the next
                workshop.
              </p>
              <Link
                href="/contact"
                className="mt-6 inline-flex rounded-md bg-[#fafafa] px-4 py-2.5 text-sm font-semibold text-black hover:bg-sky-100"
              >
                Get on the list
              </Link>
            </div>
          )}

          {miscCuts.length ? (
            <div id="misc" className="mt-16 scroll-mt-24 border-t border-white/10 pt-14">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-400/80">Misc</p>
                  <h3 className="mt-3 font-body text-[clamp(1.5rem,3vw,2.1rem)] font-semibold leading-tight tracking-tight">
                    Misc
                  </h3>
                  <p className="mt-2 max-w-md text-sm text-white/45">
                    Floor clips from the homepage community rail.
                  </p>
                </div>
              </div>
              <div className="mt-8 columns-1 gap-3 sm:columns-2 lg:columns-3 sm:gap-4">
                {miscCuts.map((cut) => (
                  <div key={cut.id} className="mb-3 break-inside-avoid sm:mb-4">
                    <ShowcaseCard cut={cut} onOpen={() => setActive(cut)} />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Channels + CTA */}
      <section className="border-b border-white/10">
        <div className="mx-auto grid max-w-5xl gap-12 px-5 py-16 sm:px-8 sm:py-20 md:grid-cols-2 md:gap-16">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/40">Stay close</p>
            <h2 className="mt-3 font-body text-[clamp(1.75rem,3.5vw,2.4rem)] font-semibold leading-tight tracking-tight">
              Follow the work where it ships.
            </h2>
            <ul className="mt-8 space-y-4">
              <li>
                <Link href="/instagram" className="group flex items-baseline justify-between border-b border-white/10 pb-4">
                  <span className="text-lg font-medium text-white group-hover:text-sky-200">Instagram</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Reels & BTS</span>
                </Link>
              </li>
              <li>
                <Link href="/youtube" className="group flex items-baseline justify-between border-b border-white/10 pb-4">
                  <span className="text-lg font-medium text-white group-hover:text-sky-200">YouTube</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Films & breakdowns</span>
                </Link>
              </li>
              <li>
                <Link href="/events" className="group flex items-baseline justify-between border-b border-white/10 pb-4">
                  <span className="text-lg font-medium text-white group-hover:text-sky-200">Events</span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">Workshops & nights</span>
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-white/12 bg-white/[0.03] p-8 sm:p-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sky-400/80">Join</p>
            <h2 className="mt-3 font-body text-2xl font-semibold tracking-tight sm:text-3xl">
              Request access to the YAIL community.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Tell us what you make. We’ll point you to the right room — workshops, critique, or a studio
              intro call.
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex w-fit items-center rounded-md bg-[#fafafa] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-sky-100"
            >
              Request to join
            </Link>
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}?subject=YAIL%20Community%20access`}
              className="mt-4 text-sm text-white/45 underline-offset-4 hover:text-white/70 hover:underline"
            >
              {SITE_CONTACT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      {active ? <Lightbox cut={active} onClose={() => setActive(null)} /> : null}
    </div>
  );
}
