"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { AvatarSlug } from "@/lib/avatars/config";
import {
  INDUSTRY_PAGE,
  IndustryChannelTitle,
  IndustryEyebrow,
  IndustryGlow,
  IndustryPrimaryLink,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTintSection,
} from "@/app/industries/IndustryUI";

type Summary = {
  slug: AvatarSlug;
  displayName: string;
  headline: string;
  heroImageUrl: string | null;
};

export default function AvatarHubExperience({ avatars }: { avatars: Summary[] }) {
  return (
    <IndustryShell>
      <Navbar />
      <IndustryGlow />

      <section className={`relative ${INDUSTRY_PAGE} pb-10 pt-12 sm:pt-16`}>
        <IndustryChannelTitle channel="CHANNEL · STUDIO" title="Avatars" />
        <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-white/65 sm:text-lg">
          Four voices behind the work — each with a distinct role in how we brief, craft, and deliver
          AI campaigns and films.
        </p>
        <div className="mt-8">
          <IndustryPrimaryLink href="/contact">Commission a character</IndustryPrimaryLink>
        </div>
      </section>

      <IndustryTintSection>
        <IndustryEyebrow>THE CAST</IndustryEyebrow>
        <IndustrySectionTitle>
          Meet the characters.{" "}
          <span className="font-light text-white/55">One desk, many faces.</span>
        </IndustrySectionTitle>
        <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-white/55">
          Open a profile for story, stills, and how each avatar shows up across the studio.
        </p>

        <ul className="mt-10 grid list-none gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {avatars.map((a, index) => {
            const ep = String(index + 1).padStart(2, "0");
            return (
              <li key={a.slug}>
                <Link
                  href={`/avatars/${a.slug}`}
                  className="group flex h-full flex-col border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-black">
                    {a.heroImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={a.heroImageUrl}
                        alt=""
                        className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-body text-5xl font-semibold text-blue-500/40">
                          {a.displayName.slice(0, 1)}
                        </span>
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <p className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.28em] text-blue-300">
                      CH. {ep}
                    </p>
                  </div>
                  <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                    <h2 className="font-body text-[clamp(1.15rem,2vw,1.4rem)] font-semibold leading-tight tracking-tight text-white transition group-hover:text-blue-100">
                      {a.displayName}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-[13px] font-light leading-relaxed text-white/50">
                      {a.headline || "Character profile"}
                    </p>
                    <p className="mt-auto pt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                      Open profile
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </IndustryTintSection>

      <IndustryTintSection>
        <IndustryEyebrow>WHY CHARACTERS</IndustryEyebrow>
        <IndustrySectionTitle>
          A consistent face builds trust{" "}
          <span className="font-light text-white/55">faster than any ad script.</span>
        </IndustrySectionTitle>
        <p className="mt-3 max-w-2xl text-sm font-light leading-relaxed text-white/55">
          These avatars are narrative anchors — so every reel, campaign, and brand message feels human
          across platforms.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Consistency at scale",
              body: "One recognizable persona keeps identity stable across shorts, stories, and long-form.",
            },
            {
              title: "Faster audience recall",
              body: "Repeating a character voice and look helps people remember the message after one scroll.",
            },
            {
              title: "Stronger storytelling",
              body: "Each character brings a different tone without losing authenticity.",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="border border-white/12 bg-white/[0.03] px-5 py-6"
            >
              <h3 className="font-body text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-white/50">{item.body}</p>
            </article>
          ))}
        </div>
      </IndustryTintSection>

      <IndustryTintSection className="!py-16">
        <div className="text-center">
          <IndustryEyebrow>COMING SOON</IndustryEyebrow>
          <IndustrySectionTitle>This is just the first drop.</IndustrySectionTitle>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-white/55">
            More personalities, voice styles, and animated avatars for high-impact campaign storytelling.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <IndustryPrimaryLink href="/contact">Talk to the studio</IndustryPrimaryLink>
            <Link
              href="/"
              className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-blue-300"
            >
              Back home
            </Link>
          </div>
        </div>
      </IndustryTintSection>
    </IndustryShell>
  );
}
