"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import type { PlaybookPageData } from "@/data/industries";
import {
  resolvePlaybookCoverExample,
  resolvePlaybookHeroMedia,
} from "@/lib/industries/resolve-hero-media";
import { clientHeadline, industryEyebrow } from "../../industry-copy";
import {
  IndustryBreadcrumb,
  IndustryCard,
  IndustryEyebrow,
  IndustryHeroBand,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTextLink,
  IndustryTintSection,
  IndustryTopBar,
} from "../../IndustryUI";
import { PlaybookNavPair } from "../../PlaybookShowcase";
import {
  AnswerBody,
  IndustryCTABlock,
  QAHeroSection,
  QAExampleGallery,
} from "../../QAComponents";

export default function PlaybookMagazineExperience({ data }: { data: PlaybookPageData }) {
  const { industry, playbook, siblings, playbookIndex } = data;
  const headline = clientHeadline(playbook.question, playbook.name);
  const body =
    playbook.answer ??
    playbook.description ??
    `YourAI Lens Studio creates production-grade visuals for ${industry.name} brands. Below is sample work from recent projects in this category.`;
  const hero = resolvePlaybookHeroMedia(industry, playbook.examples);
  const heroExample = resolvePlaybookCoverExample(playbook.examples);
  const galleryExamples = heroExample
    ? playbook.examples.filter((e) => e.id !== heroExample.id)
    : playbook.examples;
  const topicName = playbook.name;

  const prev = siblings[playbookIndex - 1];
  const next = siblings[playbookIndex + 1];

  return (
    <IndustryShell>
      <Navbar />

      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "Solutions", href: "/industries" },
            { label: industry.name, href: `/industries/${industry.slug}` },
            { label: topicName, current: true },
          ]}
        />
      </IndustryTopBar>

      <IndustryHeroBand>
        <QAHeroSection
          eyebrow={industryEyebrow("Playbook", industry.name)}
          headline={headline}
          body={body}
          mediaUrl={hero?.url}
          mediaType={hero?.mediaType}
          aspectRatio={hero?.aspectRatio}
          posterUrl={hero?.posterUrl}
          mediaCaption={hero?.caption}
        />
      </IndustryHeroBand>

      {galleryExamples.some((e) => e.published) ? (
        <IndustryTintSection>
          <IndustryEyebrow>This playbook</IndustryEyebrow>
          <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">inside</span>}>
            Sample work
          </IndustrySectionTitle>
          <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-slate-600">
            Examples from this playbook: films, stills, and campaign assets we produce for {industry.name} clients.
          </p>
          <div className="mt-10">
            <QAExampleGallery examples={galleryExamples} />
          </div>
        </IndustryTintSection>
      ) : null}

      {playbook.description && playbook.description !== body ? (
        <IndustryTintSection>
          <IndustryCard className="p-6 lg:p-8">
            <IndustryEyebrow>How we work</IndustryEyebrow>
            <AnswerBody text={playbook.description} className="mt-4" />
          </IndustryCard>
        </IndustryTintSection>
      ) : null}

      {(prev || next) && (
        <IndustryTintSection>
          <IndustryEyebrow>More playbooks</IndustryEyebrow>
          <IndustrySectionTitle accent={<span className="font-semibold text-blue-700">{industry.name}</span>}>
            Keep exploring
          </IndustrySectionTitle>
          <div className="mt-8">
            <PlaybookNavPair
              industrySlug={industry.slug}
              prev={
                prev
                  ? {
                      slug: prev.slug,
                      name: prev.name,
                      tagline: prev.tagline,
                      index: playbookIndex - 1,
                      examples: prev.examples,
                    }
                  : undefined
              }
              next={
                next
                  ? {
                      slug: next.slug,
                      name: next.name,
                      tagline: next.tagline,
                      index: playbookIndex + 1,
                      examples: next.examples,
                    }
                  : undefined
              }
            />
          </div>
        </IndustryTintSection>
      )}

      <IndustryTintSection className="!pb-16">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <IndustryTextLink href={`/industries/${industry.slug}`}>
            All {industry.name} playbooks
          </IndustryTextLink>
          <Link href="/pricing" className="text-sm font-semibold text-blue-600 transition hover:text-blue-700">
            Packages & pricing →
          </Link>
        </div>

        <div className="mt-12 flex justify-center">
          <IndustryCTABlock industryName={industry.name} />
        </div>
      </IndustryTintSection>
    </IndustryShell>
  );
}
