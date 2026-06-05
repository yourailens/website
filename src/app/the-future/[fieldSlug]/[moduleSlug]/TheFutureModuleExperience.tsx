"use client";

import Link from "next/link";
import FutureMediaBlock from "@/components/the-future/FutureMediaBlock";
import { FUTURE_COPY } from "@/data/the-future-copy";
import type { FutureField, FutureModuleWithFrames } from "@/data/the-future";

type Props = {
  field: FutureField;
  mod: FutureModuleWithFrames;
};

export default function TheFutureModuleExperience({ field, mod }: Props) {
  const visibleFrames = mod.frames.filter((f) => {
    const url = f.media_type === "video" ? f.video_url : f.image_url;
    return Boolean(url?.trim());
  });

  return (
    <article>
      <section className="border-b border-blue-100/80 bg-gradient-to-b from-white to-[#f4f7fc]">
        <div className="mx-auto w-[92%] max-w-3xl py-10 md:py-12">
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
            <Link href="/the-future" className="text-blue-600 hover:text-blue-800">
              The Future
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/the-future/${field.slug}`} className="hover:text-slate-700">
              {field.title}
            </Link>
          </nav>
          <h1 className="mt-5 font-heading text-[clamp(1.75rem,4vw,2.65rem)] font-black leading-tight text-slate-900">
            {mod.title}
          </h1>
          {mod.tagline ? <p className="mt-2 text-lg font-medium text-slate-600">{mod.tagline}</p> : null}
          {mod.intro ? <p className="mt-4 text-base leading-relaxed text-slate-600">{mod.intro}</p> : null}
          {visibleFrames.length > 0 ? (
            <p className="mt-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-blue-700">
              {visibleFrames.length} {visibleFrames.length === 1 ? FUTURE_COPY.momentOne : FUTURE_COPY.moments}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto w-[92%] max-w-3xl py-12 pb-20 md:py-16">
        {visibleFrames.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 text-center text-slate-500">
            This possibility is still taking shape.
          </p>
        ) : (
          <ol className="relative space-y-12 md:space-y-14">
            <div
              className="absolute left-[1.15rem] top-3 bottom-3 hidden w-0.5 bg-gradient-to-b from-blue-400 via-blue-200 to-transparent md:block"
              aria-hidden
            />
            {visibleFrames.map((frame, i) => (
              <li key={frame.id} className="relative md:pl-14">
                <span
                  className="absolute left-0 top-0 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-600 bg-white font-mono text-[11px] font-black text-blue-700 shadow-sm md:left-0"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm ring-1 ring-slate-100/80 md:ml-0">
                  <FutureMediaBlock
                    mediaType={frame.media_type}
                    imageUrl={frame.image_url}
                    videoUrl={frame.video_url}
                    posterUrl={frame.poster_url}
                    aspectRatio={frame.aspect_ratio}
                    alt={frame.label || `Step ${i + 1}`}
                    priority={i === 0}
                    className="shadow-inner"
                  />
                  <div className="mt-4 border-t border-slate-100 pt-4">
                    {frame.label ? (
                      <p className="font-heading text-lg font-bold text-slate-900">{frame.label}</p>
                    ) : (
                      <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {FUTURE_COPY.momentOne} {i + 1}
                      </p>
                    )}
                    {frame.caption ? (
                      <p className="mt-2 text-base leading-relaxed text-slate-600">{frame.caption}</p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-14 flex flex-wrap gap-4 border-t border-slate-200 pt-10">
          <Link
            href={`/the-future/${field.slug}`}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-800 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
          >
            ← All {FUTURE_COPY.moduleMany} in {field.title}
          </Link>
          <Link
            href="/the-future"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Browse all fields
          </Link>
        </div>
      </div>
    </article>
  );
}
