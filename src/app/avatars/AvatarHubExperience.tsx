"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { AvatarSlug } from "@/lib/avatars/config";

type Summary = {
  slug: AvatarSlug;
  displayName: string;
  headline: string;
  heroImageUrl: string | null;
};

export default function AvatarHubExperience({ avatars }: { avatars: Summary[] }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40 text-slate-900">
      <Navbar />
      <section className="border-b border-slate-100 bg-gradient-to-b from-blue-50/90 to-white py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <span className="mb-4 inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-blue-600">Avatars</span>
          <h1
            className="font-heading text-[clamp(2rem,5vw,3.25rem)] font-black text-slate-900"
            style={{ letterSpacing: "-0.03em" }}
          >
            Meet the characters
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Four voices behind the work, each with a distinct role in how we build campaigns and films.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14 lg:px-10">
        <ul className="grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {avatars.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/avatars/${a.slug}`}
                className="group block h-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/80"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-slate-200 to-slate-100">
                  {a.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.heroImageUrl}
                      alt=""
                      className="h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-heading text-4xl font-black text-slate-300">
                      {a.displayName.slice(0, 1)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="font-heading text-xl font-black text-slate-900">{a.displayName}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{a.headline || "Character profile"}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                    View profile
                    <span className="transition-transform group-hover:translate-x-0.5" aria-hidden>
                      →
                    </span>
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-10 lg:px-10">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/70 lg:p-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-blue-600">
            Why characters matter
          </span>
          <h2 className="mt-3 font-heading text-[clamp(1.6rem,3vw,2.4rem)] font-black text-slate-900">
            A consistent face builds trust faster than any ad script.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-600">
            These avatars are not just visuals. They are narrative anchors that make every reel, campaign, and brand
            message feel human, memorable, and emotionally connected across platforms.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <h3 className="font-heading text-lg font-black text-slate-900">Consistency at scale</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                One recognizable persona keeps your content identity stable across shorts, stories, and long-form.
              </p>
            </article>
            <article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <h3 className="font-heading text-lg font-black text-slate-900">Faster audience recall</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Repeating a character voice and look helps people remember your message after a single scroll.
              </p>
            </article>
            <article className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
              <h3 className="font-heading text-lg font-black text-slate-900">Stronger storytelling</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Each character brings a different tone, so your brand can speak to different moods without losing
                authenticity.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 lg:px-10">
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-8 text-white shadow-2xl shadow-blue-500/30 lg:p-10">
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.22em] text-blue-100">
            Coming soon
          </span>
          <h2 className="mt-3 font-heading text-[clamp(1.7rem,3vw,2.5rem)] font-black">
            This is just the first drop.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-blue-100">
            We are expanding the cast with more personalities, new voice styles, male characters, and fully animated
            avatars designed for high-impact campaign storytelling.
          </p>
          <p className="mt-4 text-sm font-semibold tracking-wide text-blue-50">
            New characters. New formats. Same cinematic brand quality.
          </p>
        </div>
      </section>
    </div>
  );
}
