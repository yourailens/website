"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { AvatarCharacterPublic } from "@/lib/avatars/load";
import {
  IndustryBreadcrumb,
  IndustryEyebrow,
  IndustryHeroBand,
  IndustryPrimaryLink,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTintSection,
  IndustryTopBar,
} from "@/app/industries/IndustryUI";

export default function AvatarProfileExperience({ avatar }: { avatar: AvatarCharacterPublic }) {
  const paragraphs = avatar.story
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <IndustryShell>
      <Navbar />
      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "AVATARS", href: "/avatars" },
            { label: avatar.displayName.toUpperCase(), current: true },
          ]}
        />
      </IndustryTopBar>

      <IndustryHeroBand>
        <div className="grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <IndustryEyebrow>YOUR AILENS CHARACTER</IndustryEyebrow>
            <h1 className="mt-4 font-body text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[0.95] tracking-tight text-white">
              {avatar.displayName}
            </h1>
            {avatar.headline ? (
              <p className="mt-5 max-w-md text-lg font-light leading-relaxed text-white/65 sm:text-xl">
                {avatar.headline}
              </p>
            ) : null}
            <div className="mt-8 h-px max-w-xs bg-gradient-to-r from-blue-400/80 via-blue-400/30 to-transparent" />
            <p className="mt-6 max-w-sm text-sm font-light leading-relaxed text-white/45">
              A studio avatar — the personality behind how we brief, craft, and deliver AI-powered
              campaigns and films.
            </p>
          </div>

          <div className="relative lg:col-span-7">
            <div className="relative overflow-hidden border border-white/12 bg-black">
              {avatar.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar.heroImageUrl}
                  alt=""
                  className="mx-auto block h-auto w-full max-h-[min(72vh,680px)] object-contain"
                />
              ) : (
                <div className="flex min-h-[min(50vh,420px)] w-full items-center justify-center bg-zinc-900">
                  <span className="font-body text-[clamp(4rem,15vw,8rem)] font-semibold text-blue-500/30">
                    {avatar.displayName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </IndustryHeroBand>

      <IndustryTintSection>
        <div className="mx-auto max-w-3xl text-center">
          <IndustryEyebrow>ABOUT</IndustryEyebrow>
          <IndustrySectionTitle>The story</IndustrySectionTitle>
          <div className="mt-8 space-y-6 text-left text-base font-light leading-[1.75] text-white/65">
            {paragraphs.length ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="text-center text-white/45">
                Story coming soon — add copy in Admin → Avatars.
              </p>
            )}
          </div>
        </div>
      </IndustryTintSection>

      {avatar.gallery.length ? (
        <IndustryTintSection>
          <div className="mb-10 text-center">
            <IndustryEyebrow>VISUALS</IndustryEyebrow>
            <IndustrySectionTitle>Gallery</IndustrySectionTitle>
            <p className="mx-auto mt-3 max-w-lg text-sm font-light text-white/50">
              Frames and stills — cropped and uploaded from the studio dashboard.
            </p>
          </div>
          <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
            {avatar.gallery.map((g) => (
              <li key={g.id} className="break-inside-avoid">
                <div className="overflow-hidden border border-white/12 bg-white/[0.03]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.publicUrl} alt="" className="w-full object-cover" />
                </div>
              </li>
            ))}
          </ul>
        </IndustryTintSection>
      ) : null}

      <IndustryTintSection className="!py-16">
        <div className="text-center">
          <IndustryEyebrow>KEEP WATCHING</IndustryEyebrow>
          <IndustrySectionTitle>Explore the rest of the cast</IndustrySectionTitle>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <IndustryPrimaryLink href="/avatars">All avatars</IndustryPrimaryLink>
            <Link
              href="/"
              className="inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55 transition hover:text-blue-300"
            >
              Home
            </Link>
          </div>
        </div>
      </IndustryTintSection>
    </IndustryShell>
  );
}
