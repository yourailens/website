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
  index,
}: {
  industrySlug: string;
  brand: SampleBrandWithMedia;
  showIndustry?: boolean;
  index: number;
}) {
  const coverUrl = brand.cover_image_url ?? brand.hero_image_url;
  const coverType = resolveMediaType(
    brand.cover_image_url ? brand.cover_media_type : brand.hero_media_type,
    coverUrl
  );
  const imageCount = brand.media.filter((m) => m.published && m.media_type === "image").length;
  const videoCount = brand.media.filter((m) => m.published && m.media_type === "video").length;
  const tagline = plainCopy(brand.tagline);
  const ep = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/industries/${industrySlug}/brands/${brand.slug}`}
      className="group overflow-hidden border border-white/12 bg-white/[0.02] transition hover:border-white/25 hover:bg-white/[0.04]"
    >
      <div className="relative aspect-[16/10] bg-black">
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
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-white/35">World building in progress</span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <p className="absolute bottom-3 left-3 font-mono text-[10px] tracking-[0.28em] text-blue-300">
          WORLD {ep}
        </p>
      </div>
      <div className="p-4">
        {showIndustry && brand.industry_name ? (
          <p className="font-mono text-[9px] tracking-[0.2em] text-white/35">{brand.industry_name}</p>
        ) : null}
        <p className="mt-1 font-mono text-[10px] tracking-[0.22em] text-blue-400">SAMPLE BRAND</p>
        <h3 className="mt-1 font-body text-lg font-semibold tracking-tight text-white transition group-hover:text-blue-100">
          {brand.name}
        </h3>
        {tagline ? (
          <p className="mt-1 line-clamp-2 text-sm font-light text-white/50">{tagline}</p>
        ) : null}
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-blue-300">
          Explore the world
          {(imageCount > 0 || videoCount > 0) && (
            <span className="ml-2 font-normal normal-case tracking-normal text-white/35">
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
      <IndustryEyebrow>SAMPLE BRANDS</IndustryEyebrow>
      {isHub ? (
        <IndustrySectionTitle>
          Worlds <span className="font-light text-white/55">we built</span>
        </IndustrySectionTitle>
      ) : (
        <IndustrySectionTitle>
          Worlds for <span className="text-blue-300">{props.industryName}</span>
        </IndustrySectionTitle>
      )}
      <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-white/55">
        Fictional brands with full creative systems: posters, motion, social, product, and ambience.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {published.map((b, i) => {
          const slug = isHub ? (b.industry_slug ?? "") : props.industrySlug;
          if (!slug) return null;
          return (
            <BrandCard
              key={b.id}
              industrySlug={slug}
              brand={b}
              showIndustry={isHub}
              index={i}
            />
          );
        })}
      </div>
    </IndustryTintSection>
  );
}
