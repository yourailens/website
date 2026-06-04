"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import { DeferredVideo } from "@/components/media/DeferredVideo";
import HomeBlueTint from "@/components/home/HomeBlueTint";
import type { IndustryWithPlaybooks } from "@/data/industries";
import type { SampleBrandWithMedia } from "@/data/sample-brands";
import { SampleBrandsSection } from "./SampleBrandsSection";
import { resolveMediaType } from "@/lib/industries/media";
import { plainCopy } from "./industry-copy";
import { IndustryCTABlock } from "./QAComponents";
import {
  INDUSTRY_PAGE,
  IndustryBadge,
  IndustryEyebrow,
  IndustryHeroBand,
  IndustryPrimaryLink,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTintSection,
} from "./IndustryUI";
import { INDUSTRIES_HUB_PAGE_SIZE, IndustryPagination } from "./IndustryPagination";

function IndustryHubCard({ ind }: { ind: IndustryWithPlaybooks }) {
  const previewUrl = ind.hero_image_url ?? ind.cover_image_url;
  const isVideo = previewUrl && resolveMediaType(null, previewUrl) === "video";
  const playbookCount = ind.playbooks.filter((p) => p.published).length;
  const tagline = plainCopy(ind.tagline);
  const description =
    plainCopy(ind.description) ||
    "Campaign films, product visuals, and brand assets, delivered fast and built for your category.";
  const playbookLabel =
    playbookCount > 0
      ? `${playbookCount} ${playbookCount === 1 ? "playbook" : "playbooks"}`
      : "Coming soon";

  const titleId = `industry-card-title-${ind.slug}`;

  return (
    <Link
      href={`/industries/${ind.slug}`}
      aria-labelledby={titleId}
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100/90 bg-white shadow-sm shadow-blue-100/20"
    >
      <div className="p-3 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-sky-50 to-blue-50/80 ring-1 ring-blue-100/60">
          {previewUrl ? (
            isVideo ? (
              <DeferredVideo
                src={previewUrl}
                poster={ind.hero_poster_url ?? ind.cover_poster_url}
                className="h-full w-full object-cover"
              />
            ) : (
              <Image
                src={previewUrl}
                alt=""
                aria-hidden
                fill
                className="object-cover"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                unoptimized
              />
            )
          ) : (
            <div className="flex h-full items-center justify-center">
              <span
                className="font-body text-4xl font-black text-blue-200/90"
                style={{ letterSpacing: "-0.04em" }}
                aria-hidden
              >
                {ind.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        <div className="mb-2.5 flex items-center gap-2">
          <div className="h-px w-5 shrink-0 bg-blue-400/80" aria-hidden />
          <span className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-blue-600/85">
            {playbookLabel}
          </span>
        </div>

        <h2
          id={titleId}
          className="font-body text-[clamp(1.2rem,2.2vw,1.5rem)] font-black leading-[1.12] text-slate-900"
          style={{ letterSpacing: "-0.03em", textWrap: "balance" }}
        >
          {ind.name}
        </h2>

        {tagline ? (
          <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-blue-800/90">{tagline}</p>
        ) : null}

        <p
          className={`line-clamp-2 text-[13px] font-light leading-relaxed text-slate-500 ${tagline ? "mt-2" : "mt-2.5"}`}
        >
          {description}
        </p>

        <div className="mt-auto flex items-center justify-end border-t border-blue-50 pt-4">
          <span className="text-xs font-semibold text-blue-600">Explore →</span>
        </div>
      </div>
    </Link>
  );
}

export default function IndustriesHubExperience({
  industries,
  sampleBrands = [],
}: {
  industries: IndustryWithPlaybooks[];
  sampleBrands?: SampleBrandWithMedia[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(industries.length / INDUSTRIES_HUB_PAGE_SIZE));

  const pageFromUrl = useMemo(() => {
    const raw = Number(searchParams.get("page") ?? "1");
    if (!Number.isFinite(raw) || raw < 1) return 1;
    return Math.min(Math.floor(raw), totalPages);
  }, [searchParams, totalPages]);

  const [page, setPage] = useState(pageFromUrl);

  useEffect(() => {
    setPage(pageFromUrl);
  }, [pageFromUrl]);

  const paginatedIndustries = useMemo(() => {
    const start = (page - 1) * INDUSTRIES_HUB_PAGE_SIZE;
    return industries.slice(start, start + INDUSTRIES_HUB_PAGE_SIZE);
  }, [industries, page]);

  const goToPage = useCallback(
    (next: number) => {
      const clamped = Math.max(1, Math.min(next, totalPages));
      setPage(clamped);
      const params = new URLSearchParams(searchParams.toString());
      if (clamped === 1) params.delete("page");
      else params.set("page", String(clamped));
      const q = params.toString();
      router.push(q ? `${pathname}?${q}` : pathname, { scroll: false });
      requestAnimationFrame(() => {
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [pathname, router, searchParams, totalPages]
  );

  return (
    <IndustryShell>
      <Navbar />

      <IndustryHeroBand>
        <IndustryBadge>YourAI Lens Studio</IndustryBadge>
        <h1
          className="mt-5 max-w-3xl text-[clamp(2rem,5vw,3.25rem)] font-light leading-[1.2] text-slate-900"
          style={{ letterSpacing: "-0.02em" }}
        >
          AI production built for{" "}
          <span className="font-semibold text-blue-700">your industry</span>
        </h1>
        <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-slate-600">
          We deliver campaign-grade films, product visuals, and brand content for real estate, ecommerce, SaaS, and
          more, on the timelines modern teams expect.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <IndustryPrimaryLink href="/pricing">View packages</IndustryPrimaryLink>
        </div>
      </IndustryHeroBand>

      <IndustryTintSection>
        <div ref={gridRef} className="scroll-mt-28">
          <IndustryEyebrow>Who we work with</IndustryEyebrow>
          <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">we serve</span>}>
            Industries
          </IndustrySectionTitle>
          <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-slate-600">
            Explore how we approach creative production in your space, with real examples and clear deliverables.
          </p>

          {industries.length > 0 ? (
            <>
              <div className="mt-10 grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
                {paginatedIndustries.map((ind) => (
                  <IndustryHubCard key={ind.id} ind={ind} />
                ))}
              </div>
              <IndustryPagination
                page={page}
                totalPages={totalPages}
                totalItems={industries.length}
                pageSize={INDUSTRIES_HUB_PAGE_SIZE}
                onPageChange={goToPage}
                className="mt-8"
              />
            </>
          ) : (
            <p className="mt-10 text-center text-sm font-light text-slate-500">
              Content is being published. Check back soon.
            </p>
          )}
        </div>
      </IndustryTintSection>

      <SampleBrandsSection variant="hub" brands={sampleBrands} />

      <HomeBlueTint className="border-t border-blue-100/60 py-14 lg:py-20">
        <div className={`${INDUSTRY_PAGE} text-center`}>
          <IndustryEyebrow>Get started</IndustryEyebrow>
          <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">your next project</span>}>
            Ready to start
          </IndustrySectionTitle>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            Tell us what you are launching. We will scope packages, timelines, and deliverables for your brand.
          </p>
          <div className="mt-8 flex justify-center">
            <IndustryCTABlock />
          </div>
        </div>
      </HomeBlueTint>
    </IndustryShell>
  );
}
