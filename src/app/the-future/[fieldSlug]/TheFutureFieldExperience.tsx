"use client";

import Link from "next/link";
import FutureMediaBlock from "@/components/the-future/FutureMediaBlock";
import FutureModuleListCard from "@/components/the-future/FutureModuleListCard";
import { FUTURE_COPY } from "@/data/the-future-copy";
import type { FutureFieldWithModules } from "@/data/the-future";

export default function TheFutureFieldExperience({ field }: { field: FutureFieldWithModules }) {
  return (
    <>
      <section className="border-b border-blue-100/80 bg-gradient-to-b from-white via-[#f8fbff] to-[#eef4ff]">
        <div className="mx-auto w-[92%] max-w-5xl py-12 md:py-16">
          <Link
            href="/the-future"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-blue-600 transition hover:text-blue-800"
          >
            ← The Future
          </Link>
          <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_min(300px,38%)] lg:items-start">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">Field</p>
              <h1 className="mt-2 font-heading text-[clamp(2rem,5vw,3rem)] font-black leading-tight tracking-tight text-slate-900">
                {field.title}
              </h1>
              {field.tagline ? <p className="mt-3 text-lg font-medium text-slate-600">{field.tagline}</p> : null}
              {field.description ? (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{field.description}</p>
              ) : null}
            </div>
            {(field.cover_image_url || field.cover_video_url) && (
              <FutureMediaBlock
                className="shadow-lg ring-1 ring-slate-200/80"
                mediaType={field.cover_media_type}
                imageUrl={field.cover_image_url}
                videoUrl={field.cover_video_url}
                aspectRatio={field.cover_aspect}
                alt={field.title}
              />
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto w-[92%] max-w-5xl py-12 md:py-16">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.35em] text-slate-400">
            {FUTURE_COPY.exploreSection}
          </p>
          <p className="text-sm font-semibold text-slate-500">
            {field.modules.length} {field.modules.length === 1 ? FUTURE_COPY.moduleOne : FUTURE_COPY.moduleMany}
          </p>
        </div>

        {field.modules.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center text-slate-500">
            {FUTURE_COPY.moduleTitleCasePlural} for this field are on the way.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {field.modules.map((mod, i) => (
              <li key={mod.id}>
                <FutureModuleListCard
                  mod={mod}
                  href={`/the-future/${field.slug}/${mod.slug}`}
                  index={i}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
