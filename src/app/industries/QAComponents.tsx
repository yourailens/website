"use client";

import Link from "next/link";
import Image from "next/image";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import type { IndustryAspectRatio, IndustryMediaType, IndustryPlaybookExample } from "@/data/industries";
import { aspectRatioClass, resolveMediaType } from "@/lib/industries/media";
import { plainCopy } from "./industry-copy";
import {
  IndustryCard,
  IndustryEyebrow,
  IndustryPrimaryLink,
  IndustrySectionTitle,
  IndustryTextLink,
} from "./IndustryUI";

export function displayQuestion(q: string | null | undefined, fallback: string) {
  const text = (q?.trim() || fallback).trim();
  return text.endsWith("?") ? text : `${text}?`;
}

export function AnswerBody({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className={`space-y-4 text-base font-light leading-relaxed text-slate-600 ${className}`.trim()}>
      {paragraphs.map((p, i) => (
        <p key={i}>{plainCopy(p)}</p>
      ))}
    </div>
  );
}

export function QAMedia({
  url,
  mediaType,
  aspectRatio = "landscape",
  posterUrl,
  alt,
  className,
  priority,
  sizes = "100vw",
}: {
  url: string;
  mediaType?: IndustryMediaType;
  aspectRatio?: IndustryAspectRatio;
  posterUrl?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const boxClass =
    className ??
    `relative w-full overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-blue-100/60 ${aspectRatioClass(aspectRatio)}`;
  const type = resolveMediaType(mediaType, url);

  if (type === "video") {
    return (
      <div className={boxClass}>
        <DeferredVideo
          src={url}
          poster={posterUrl}
          className="h-full w-full object-cover"
          eager={priority}
        />
      </div>
    );
  }
  return (
    <div className={boxClass}>
      <Image src={url} alt={alt} fill className="object-cover" sizes={sizes} priority={priority} unoptimized />
    </div>
  );
}

/** Main hero block — reads like a client landing page, not internal Q&A */
export function QAHeroSection({
  eyebrow,
  headline,
  body,
  mediaUrl,
  mediaType,
  aspectRatio = "landscape",
  posterUrl,
  mediaCaption,
  children,
}: {
  eyebrow: string;
  headline: string;
  body: string;
  mediaUrl?: string | null;
  mediaType?: IndustryMediaType;
  aspectRatio?: IndustryAspectRatio;
  posterUrl?: string | null;
  mediaCaption?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
      <div>
        <IndustryEyebrow>{plainCopy(eyebrow)}</IndustryEyebrow>
        <h1
          className="mt-3 text-[clamp(1.75rem,4.5vw,2.85rem)] font-light leading-[1.15] text-slate-900"
          style={{ letterSpacing: "-0.02em" }}
        >
          {plainCopy(headline)}
        </h1>
        <div className="mt-6">
          <AnswerBody text={plainCopy(body)} />
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>

      <div>
        {mediaUrl ? (
          <IndustryCard className="p-2">
            <figure>
              <QAMedia
                url={mediaUrl}
                mediaType={mediaType}
                aspectRatio={aspectRatio}
                posterUrl={posterUrl}
                alt={mediaCaption ?? headline}
                className={`relative w-full ${aspectRatioClass(aspectRatio)}`}
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              {mediaCaption?.trim() ? (
                <figcaption className="px-3 pb-2 pt-3 text-sm font-light leading-relaxed text-slate-600">
                  {mediaCaption.trim()}
                </figcaption>
              ) : null}
            </figure>
          </IndustryCard>
        ) : (
          <div
            className={`flex items-center justify-center rounded-2xl border border-dashed border-blue-200/80 bg-white/60 px-6 text-center ${aspectRatioClass(aspectRatio)}`}
          >
            <p className="text-sm font-light text-slate-500">Sample work for this page is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function QAExampleGallery({ examples }: { examples: IndustryPlaybookExample[] }) {
  const published = examples.filter((e) => e.published);
  if (published.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-blue-200/80 bg-white/70 px-6 py-16 text-center">
        <p className="text-sm font-light text-slate-500">New samples for this section are on the way.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {published.map((ex, i) => (
        <IndustryCard key={ex.id} className={i % 3 === 1 ? "sm:col-span-2" : ""}>
          <QAMedia
            url={ex.media_url}
            mediaType={ex.media_type}
            aspectRatio={ex.aspect_ratio}
            posterUrl={ex.poster_url}
            alt={ex.caption ?? ex.title}
            className={`relative w-full rounded-b-none rounded-t-2xl ring-0 ${aspectRatioClass(ex.aspect_ratio)}`}
            sizes="(max-width:768px) 100vw, 50vw"
          />
          <figcaption className="space-y-1.5 border-t border-blue-50 px-5 py-4">
            {ex.title ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600/90">{ex.title}</p>
            ) : null}
            {ex.caption?.trim() ? (
              <p className="text-sm font-light leading-relaxed text-slate-600">{ex.caption.trim()}</p>
            ) : null}
            {ex.service_slug ? (
              <Link
                href={`/pricing/${ex.service_slug}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View package <span aria-hidden>→</span>
              </Link>
            ) : null}
          </figcaption>
        </IndustryCard>
      ))}
    </div>
  );
}

export function IndustryCTABlock({ industryName }: { industryName?: string }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-center sm:text-left">
      <IndustryPrimaryLink href="/pricing">
        {industryName ? `Packages for ${industryName}` : "View packages & pricing"}
      </IndustryPrimaryLink>
      <IndustryTextLink href="/contact">Talk to our team</IndustryTextLink>
    </div>
  );
}

