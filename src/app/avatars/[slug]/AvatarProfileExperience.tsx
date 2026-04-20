"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { AvatarCharacterPublic } from "@/lib/avatars/load";

export default function AvatarProfileExperience({ avatar }: { avatar: AvatarCharacterPublic }) {
  const paragraphs = avatar.story
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fafbff] text-slate-900">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(#cbd5e1_0.5px,transparent_0.5px)] opacity-[0.35] [background-size:20px_20px]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 bg-gradient-to-b from-blue-50/90 via-transparent to-sky-50/40"
        aria-hidden
      />

      <Navbar />

      <article className="relative">
        {/* Hero band — same language as homepage / films */}
        <section className="relative border-b border-slate-100/80 bg-gradient-to-b from-white via-blue-50/30 to-transparent pb-12 pt-10 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <Link
              href="/avatars"
              className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-blue-600 transition hover:text-blue-800"
            >
              <span aria-hidden className="text-lg leading-none">
                ←
              </span>
              All avatars
            </Link>

            <div className="mt-10 grid items-end gap-10 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-blue-600">YourAILens character</p>
                <h1
                  className="mt-4 font-heading text-[clamp(2.25rem,6vw,4rem)] font-black leading-[0.95] tracking-tight text-slate-900"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  {avatar.displayName}
                </h1>
                {avatar.headline ? (
                  <p className="mt-5 max-w-md text-lg font-medium leading-relaxed text-slate-600 sm:text-xl">{avatar.headline}</p>
                ) : null}
                <div className="mt-8 h-px max-w-xs bg-gradient-to-r from-blue-500/80 via-blue-300/40 to-transparent" />
                <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-500">
                  A studio avatar — the personality behind how we brief, craft, and deliver AI powered campaigns and films.
                </p>
              </div>

              <div className="relative lg:col-span-7">
                <div className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-400/15 via-transparent to-violet-400/10 blur-2xl" aria-hidden />
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/80 bg-white shadow-[0_32px_80px_-28px_rgba(30,58,138,0.35)] ring-1 ring-blue-100/90">
                  {avatar.heroImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatar.heroImageUrl}
                      alt=""
                      className="mx-auto block h-auto w-full max-h-[min(72vh,680px)] object-contain"
                    />
                  ) : (
                    <div className="flex min-h-[min(50vh,420px)] w-full items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
                      <span className="font-heading text-[clamp(4rem,15vw,8rem)] font-black text-slate-200">
                        {avatar.displayName.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="relative mx-auto max-w-3xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="mb-10 text-center">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">About</span>
            <h2 className="mt-3 font-heading text-2xl font-black text-slate-900 sm:text-3xl">The story</h2>
          </div>
          <div className="space-y-6 text-[17px] leading-[1.75] text-slate-700">
            {paragraphs.length ? (
              paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))
            ) : (
              <p className="text-center text-slate-500">Story coming soon — add copy in Admin → Avatars.</p>
            )}
          </div>
        </section>

        {/* Gallery — intrinsic ratios from your cropped uploads */}
        {avatar.gallery.length ? (
          <section className="relative border-t border-slate-100 bg-gradient-to-b from-transparent to-white pb-20 pt-12 lg:pb-28 lg:pt-16">
            <div className="mx-auto max-w-6xl px-6 lg:px-10">
              <div className="mb-10 flex flex-col items-center text-center sm:mb-14">
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">Visuals</span>
                <h2 className="mt-3 font-heading text-[clamp(1.5rem,3vw,2rem)] font-black text-slate-900">Gallery</h2>
                <p className="mt-2 max-w-lg text-sm text-slate-600">Frames and stills — cropped and uploaded from the studio dashboard.</p>
              </div>
              <ul className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>li]:mb-5">
                {avatar.gallery.map((g) => (
                  <li key={g.id} className="break-inside-avoid">
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={g.publicUrl} alt="" className="w-full object-cover" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        <section className="border-t border-slate-100 bg-white py-14">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <p className="text-sm text-slate-600">
              Explore the rest of the cast or head back to the studio site.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/avatars"
                className="inline-flex rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
              >
                All avatars
              </Link>
              <Link
                href="/"
                className="inline-flex rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-200/50 transition hover:bg-blue-700"
              >
                Home
              </Link>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
