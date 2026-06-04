"use client";

import Link from "next/link";
import Image from "next/image";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import type { SampleBrandWithMedia } from "@/data/sample-brands";
import { resolveMediaType } from "@/lib/sample-brands/media";
import { plainCopy } from "./industry-copy";
import { IndustryEyebrow, IndustrySectionTitle, IndustryTintSection } from "./IndustryUI";

function BrandCard({
  industrySlug,
  brand,
  showIndustry,
}: {
  industrySlug: string;
  brand: SampleBrandWithMedia;
  showIndustry?: boolean;
}) {
  const coverUrl = brand.cover_image_url ?? brand.hero_image_url;
  const coverType = resolveMediaType(
    brand.cover_image_url ? brand.cover_media_type : brand.hero_media_type,
    coverUrl
  );
  const imageCount = brand.media.filter((m) => m.published && m.media_type === "image").length;
  const videoCount = brand.media.filter((m) => m.published && m.media_type === "video").length;
  const tagline = plainCopy(brand.tagline);

  return (
    <Link
      href={`/industries/${industrySlug}/brands/${brand.slug}`}
      className="group overflow-hidden rounded-2xl border border-blue-100/90 bg-white shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] bg-slate-100">
        {coverUrl ? (
          coverType === "video" ? (
            <DeferredVideo
              src={coverUrl}
              poster={brand.cover_poster_url ?? brand.hero_poster_url}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <Image
              src={coverUrl}
              alt={brand.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 33vw"
              unoptimized
            />
          )
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-sky-50 to-blue-50/60">
            <span className="text-xs text-slate-400">World building in progress</span>
          </div>
        )}
      </div>
      <div className="p-4">
        {showIndustry && brand.industry_name ? (
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{brand.industry_name}</p>
        ) : null}
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600/85">Sample brand</p>
        <h3
          className="mt-1 font-body text-lg font-black text-slate-900 transition group-hover:text-blue-700"
          style={{ letterSpacing: "-0.02em" }}
        >
          {brand.name}
        </h3>
        {tagline ? (
          <p className="mt-1 line-clamp-2 text-sm font-light text-slate-500">{tagline}</p>
        ) : null}
        <p className="mt-3 text-xs font-semibold text-blue-600">
          Explore the world →
          {(imageCount > 0 || videoCount > 0) && (
            <span className="ml-2 font-normal text-slate-400">
              {imageCount > 0 ? `${imageCount} stills` : ""}
              {imageCount > 0 && videoCount > 0 ? ", " : ""}
              {videoCount > 0 ? `${videoCount} films` : ""}
            </span>
          )}
        </p>
      </div>
    </Link>
  );
}

type SampleBrandsSectionProps =
  | {
      variant: "hub";
      brands: SampleBrandWithMedia[];
    }
  | {
      variant?: "industry";
      industrySlug: string;
      industryName: string;
      brands: SampleBrandWithMedia[];
    };

export function SampleBrandsSection(props: SampleBrandsSectionProps) {
  const published = props.brands.filter((b) => b.published);
  if (published.length === 0) return null;

  const isHub = props.variant === "hub";

  return (
    <IndustryTintSection>
      <IndustryEyebrow>Sample brands</IndustryEyebrow>
      {isHub ? (
        <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">we built</span>}>
          Worlds
        </IndustrySectionTitle>
      ) : (
        <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">{props.industryName}</span>}>
          worlds we built
        </IndustrySectionTitle>
      )}
      <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-slate-600">
        Fictional brands with full creative systems: posters, motion, social, product, and ambience. Minimal copy,
        mostly the work.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {published.map((b) => {
          const slug = isHub ? (b.industry_slug ?? "") : props.industrySlug;
          if (!slug) return null;
          return (
            <BrandCard
              key={b.id}
              industrySlug={slug}
              brand={b}
              showIndustry={isHub}
            />
          );
        })}
      </div>
    </IndustryTintSection>
  );
}
