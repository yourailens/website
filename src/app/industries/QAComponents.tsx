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
  IndustryTextLink,
} from "./IndustryUI";

export function displayQuestion(q: string | null | undefined, fallback: string) {
  const text = (q?.trim() || fallback).trim();
  return text.endsWith("?") ? text : `${text}?`;
}

export function AnswerBody({ text, className = "" }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  return (
    <div className={`space-y-4 text-base font-light leading-relaxed text-white/60 ${className}`.trim()}>
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
    `relative w-full overflow-hidden border border-white/12 bg-black ${aspectRatioClass(aspectRatio)}`;
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

/** Main hero block — OTT channel landing */
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
  const hasMedia = Boolean(mediaUrl?.trim());

  return (
    <div
      className={
        hasMedia
          ? "grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14"
          : "max-w-3xl"
      }
    >
      <div>
        <IndustryEyebrow>{plainCopy(eyebrow)}</IndustryEyebrow>
        <h1 className="mt-4 font-body text-[clamp(1.85rem,4.5vw,3rem)] font-semibold leading-[1.1] tracking-tight text-white">
          {plainCopy(headline)}
        </h1>
        <div className="mt-6">
          <AnswerBody text={plainCopy(body)} />
        </div>
        {children ? <div className="mt-6">{children}</div> : null}
      </div>

      {hasMedia ? (
        <div>
          <IndustryCard className="p-2">
            <figure>
              <QAMedia
                url={mediaUrl!}
                mediaType={mediaType}
                aspectRatio={aspectRatio}
                posterUrl={posterUrl}
                alt={mediaCaption ?? headline}
                className={`relative w-full overflow-hidden bg-black ${aspectRatioClass(aspectRatio)}`}
                priority
                sizes="(max-width:1024px) 100vw, 50vw"
              />
              {mediaCaption?.trim() ? (
                <figcaption className="px-3 pb-2 pt-3 text-sm font-light leading-relaxed text-white/50">
                  {mediaCaption.trim()}
                </figcaption>
              ) : null}
            </figure>
          </IndustryCard>
        </div>
      ) : null}
    </div>
  );
}

function QAExampleMasonryCard({ ex }: { ex: IndustryPlaybookExample }) {
  const alt = (ex.caption ?? ex.title)?.trim() || "Sample work";
  const type = resolveMediaType(ex.media_type, ex.media_url);
  const hasCaption = Boolean(ex.title?.trim() || ex.caption?.trim() || ex.service_slug);

  return (
    <figure className="mb-4 break-inside-avoid overflow-hidden border border-white/12 bg-white/[0.02]">
      {type === "video" ? (
        <div className={`relative w-full overflow-hidden bg-black ${aspectRatioClass(ex.aspect_ratio)}`}>
          <DeferredVideo
            src={ex.media_url}
            poster={ex.poster_url}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ex.media_url} alt={alt} className="block h-auto w-full bg-black" loading="lazy" decoding="async" />
      )}
      {hasCaption ? (
        <figcaption className="space-y-1.5 border-t border-white/10 px-5 py-4">
          {ex.title ? (
            <p className="font-mono text-[10px] tracking-[0.2em] text-blue-400">{ex.title}</p>
          ) : null}
          {ex.caption?.trim() ? (
            <p className="text-sm font-light leading-relaxed text-white/55">{ex.caption.trim()}</p>
          ) : null}
          {ex.service_slug ? (
            <Link
              href={`/pricing/${ex.service_slug}`}
              className="inline-flex text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300 hover:text-blue-200"
            >
              View package
            </Link>
          ) : null}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function QAExampleGallery({ examples }: { examples: IndustryPlaybookExample[] }) {
  const published = examples.filter((e) => e.published);
  if (published.length === 0) {
    return (
      <div className="border border-dashed border-white/20 bg-white/[0.02] px-6 py-16 text-center">
        <p className="text-sm font-light text-white/45">New samples for this section are on the way.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 gap-x-4 sm:columns-2 lg:columns-3">
      {published.map((ex) => (
        <QAExampleMasonryCard key={ex.id} ex={ex} />
      ))}
    </div>
  );
}

export function IndustryCTABlock({ industryName }: { industryName?: string }) {
  return (
    <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-center sm:text-left">
      <IndustryPrimaryLink href="/pricing">
        {industryName ? `Packages for ${industryName}` : "View packages & pricing"}
      </IndustryPrimaryLink>
      <IndustryTextLink href="/contact">Talk to our team</IndustryTextLink>
    </div>
  );
}
