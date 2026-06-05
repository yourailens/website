"use client";

import Link from "next/link";
import FutureMediaBlock from "@/components/the-future/FutureMediaBlock";
import { FUTURE_COPY } from "@/data/the-future-copy";
import type { FutureFieldSummary } from "@/data/the-future";

const FIELD_RING = [
  "ring-blue-200/80 group-hover:ring-blue-300",
  "ring-violet-200/80 group-hover:ring-violet-300",
  "ring-amber-200/80 group-hover:ring-amber-300",
] as const;

export default function TheFutureHubExperience({ fields }: { fields: FutureFieldSummary[] }) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-blue-100/80 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4ff]">
        <div
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-blue-200/30 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto w-[92%] max-w-6xl py-14 md:py-20">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">Creations</p>
          <h1 className="mt-3 max-w-3xl font-heading text-4xl font-black tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem]">
            The Future
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">{FUTURE_COPY.hubIntro}</p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-blue-200/90 bg-blue-50/80 px-4 py-2 text-xs font-bold text-blue-800 shadow-sm">
            <span className="text-blue-500" aria-hidden>
              ✦
            </span>
            {FUTURE_COPY.hubCta}
          </div>
        </div>
      </section>

      <div className="mx-auto w-[92%] max-w-6xl py-12 md:py-16">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Fields</p>

        {fields.length === 0 ? (
          <p className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-slate-500">
            Fields coming soon. Check back after our team publishes the first collection.
          </p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field, i) => (
              <Link
                key={field.id}
                href={`/the-future/${field.slug}`}
                className={`group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm ring-2 ring-transparent transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg ${FIELD_RING[i % 3]}`}
              >
                <div className="p-4 pb-0">
                  <FutureMediaBlock
                    mediaType={field.cover_media_type}
                    imageUrl={field.cover_image_url}
                    videoUrl={field.cover_video_url}
                    aspectRatio={field.cover_aspect}
                    alt={field.title}
                    className="shadow-md"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5 pt-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-blue-600">
                    Field {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-2 font-heading text-xl font-black leading-snug text-slate-900 group-hover:text-blue-800">
                    {field.title}
                  </h2>
                  {field.tagline ? (
                    <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">{field.tagline}</p>
                  ) : (
                    <span className="flex-1" />
                  )}
                  <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-blue-600">
                    {field.module_count}{" "}
                    {field.module_count === 1 ? FUTURE_COPY.moduleOne : FUTURE_COPY.moduleMany} →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
