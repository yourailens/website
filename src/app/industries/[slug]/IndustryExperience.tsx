"use client";

import Navbar from "@/components/Navbar";
import type { IndustryWithPlaybooks } from "@/data/industries";
import type { SampleBrandWithMedia } from "@/data/sample-brands";
import { resolveIndustryHeroMedia } from "@/lib/industries/resolve-hero-media";
import { clientHeadline, industryEyebrow, plainCopy } from "../industry-copy";
import { PlaybookShowcase } from "../PlaybookShowcase";
import { toPlaybookListItems } from "../playbook-list-items";
import {
  IndustryBreadcrumb,
  IndustryEyebrow,
  IndustryHeroBand,
  IndustrySectionTitle,
  IndustryShell,
  IndustryTintSection,
  IndustryTopBar,
} from "../IndustryUI";
import { SampleBrandsSection } from "../SampleBrandsSection";
import { IndustryCTABlock, QAHeroSection } from "../QAComponents";

export default function IndustryExperience({
  industry,
  sampleBrands = [],
}: {
  industry: IndustryWithPlaybooks;
  sampleBrands?: SampleBrandWithMedia[];
}) {
  const playbooks = industry.playbooks.filter((p) => p.published).sort((a, b) => a.sort_order - b.sort_order);
  const playbookItems = toPlaybookListItems(playbooks);
  const hero = resolveIndustryHeroMedia(industry);

  const headline = clientHeadline(
    industry.question,
    `AI creatives for ${industry.name}`
  );
  const body =
    industry.answer ??
    industry.description ??
    `YourAI Lens Studio produces films, stills, and campaign assets for ${industry.name} teams, with the speed of AI and the finish of a full production house. Browse the playbooks below and open any topic.`;

  return (
    <IndustryShell>
      <Navbar />

      <IndustryTopBar>
        <IndustryBreadcrumb
          items={[
            { label: "Solutions", href: "/industries" },
            { label: industry.name, current: true },
          ]}
        />
      </IndustryTopBar>

      <IndustryHeroBand>
        <QAHeroSection
          eyebrow={industryEyebrow("AI production", industry.name)}
          headline={headline}
          body={body}
          mediaUrl={hero?.url}
          mediaType={hero?.mediaType}
          aspectRatio={hero?.aspectRatio}
          posterUrl={hero?.posterUrl}
          mediaCaption={hero?.caption}
        >
          {industry.tagline ? (
            <p className="rounded-xl border border-blue-100/80 bg-blue-50/40 px-4 py-3 text-sm font-medium text-blue-900/90">
              {plainCopy(industry.tagline)}
            </p>
          ) : null}
        </QAHeroSection>
      </IndustryHeroBand>

      <SampleBrandsSection
        variant="industry"
        industrySlug={industry.slug}
        industryName={industry.name}
        brands={sampleBrands}
      />

      {playbookItems.length > 0 ? (
        <PlaybookShowcase playbooks={playbookItems} industrySlug={industry.slug} industryName={industry.name} />
      ) : (
        <IndustryTintSection>
          <p className="rounded-2xl border border-dashed border-blue-200/80 bg-white/70 py-12 text-center text-sm font-light text-slate-500">
            New playbooks for this industry are on the way. Contact us to discuss your project.
          </p>
        </IndustryTintSection>
      )}

      <IndustryTintSection className="!py-14">
        <div className="text-center">
          <IndustryEyebrow>Work with us</IndustryEyebrow>
          <IndustrySectionTitle>
            Start your <span className="font-semibold text-blue-700">{industry.name}</span> project
          </IndustrySectionTitle>
          <p className="mx-auto mt-3 max-w-md text-sm font-light text-slate-600">
            Fixed packages, clear timelines, and unlimited revisions on every deliverable.
          </p>
          <div className="mt-8 flex justify-center">
            <IndustryCTABlock industryName={industry.name} />
          </div>
        </div>
      </IndustryTintSection>
    </IndustryShell>
  );
}
